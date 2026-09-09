from __future__ import annotations

import asyncio
import json
import re
from collections import defaultdict
from datetime import datetime, timezone
from typing import Any, Iterable

from pymongo import UpdateOne

from app.core.config import settings
from app.models.crop import Crop
from app.models.ingestion_run import IngestionRun
from app.models.market_price import MarketPrice
from app.models.msp import MSP
from app.models.marketplace_listing import MarketplaceListing
from app.scraping.sources import MARKET_DATASET_URL, SourceFetchError, fetch_market_records, fetch_msp_records, stable_source_id
from app.scraping.marketplace import ALLOWED_LISTING_TYPES, fetch_apeda_exporter_records, fetch_marketplace_records


SUPPORTED_SOURCES = {"market_prices", "msp", "crops", "marketplace"}


def _chunks(items: list[Any], size: int = 1000) -> Iterable[list[Any]]:
    for index in range(0, len(items), size):
        yield items[index:index + size]


async def _bulk_upsert(model: type, records: list[dict[str, Any]]) -> dict[str, int]:
    matched = modified = upserted = 0
    collection = model.get_pymongo_collection()
    for batch in _chunks(records):
        operations = [
            UpdateOne({"source_record_id": record["source_record_id"]}, {"$set": record}, upsert=True)
            for record in batch
        ]
        if not operations:
            continue
        result = await collection.bulk_write(operations, ordered=False)
        matched += result.matched_count
        modified += result.modified_count
        upserted += result.upserted_count
    return {"matched": matched, "modified": modified, "inserted": upserted, "total": len(records)}


def _normalize_crop(value: str) -> str:
    value = re.sub(r"\([^)]*\)", "", value).casefold()
    return re.sub(r"[^a-z0-9]+", "", value)


def _crop_records(market_records: list[dict[str, Any]], msp_records: list[dict[str, Any]]) -> list[dict[str, Any]]:
    prices: dict[str, list[float]] = defaultdict(list)
    display_names: dict[str, str] = {}
    for record in market_records:
        key = _normalize_crop(record["crop_name"])
        if not key:
            continue
        display_names.setdefault(key, record["crop_name"])
        prices[key].append(record["price_per_quintal"])
    seasons: dict[str, str] = {}
    for record in msp_records:
        seasons.setdefault(_normalize_crop(record["crop_name"]), record["season"])
    fetched_at = datetime.now(timezone.utc)
    return [
        {
            "source_record_id": stable_source_id("agmarknet-commodity", key),
            "name": display_names[key],
            "season": seasons.get(key),
            "avg_price_per_quintal": round(sum(values) / len(values), 2),
            "source": "Derived from current AGMARKNET modal prices via data.gov.in",
            "source_url": MARKET_DATASET_URL,
            "fetched_at": fetched_at,
        }
        for key, values in prices.items()
    ]


def _run_response(run: IngestionRun) -> dict[str, Any]:
    return {
        "id": str(run.id),
        "trigger": run.trigger,
        "sources": run.sources,
        "status": run.status,
        "started_at": run.started_at,
        "completed_at": run.completed_at,
        "stats": run.stats,
        "errors": run.errors,
        "source_urls": run.source_urls,
    }


def _marketplace_sources() -> list[dict[str, str]]:
    raw = settings.MARKETPLACE_DIRECTORY_SOURCES_JSON.strip()
    if not raw:
        return []
    try:
        value = json.loads(raw)
    except json.JSONDecodeError as exc:
        raise ValueError("MARKETPLACE_DIRECTORY_SOURCES_JSON must be valid JSON") from exc
    if not isinstance(value, list):
        raise ValueError("MARKETPLACE_DIRECTORY_SOURCES_JSON must be a JSON list")
    sources: list[dict[str, str]] = []
    for item in value:
        if not isinstance(item, dict):
            raise ValueError("Each marketplace source must be an object")
        url = str(item.get("url") or "").strip()
        name = str(item.get("name") or "").strip()
        listing_type = str(item.get("listing_type") or "").strip().casefold()
        adapter = str(item.get("adapter") or "jsonld").strip().casefold()
        if not url.startswith("https://") or not name or listing_type not in ALLOWED_LISTING_TYPES or adapter not in {"jsonld", "apeda_exporters"}:
            raise ValueError("Each marketplace source needs an HTTPS url, name, and a supported listing_type")
        if adapter == "apeda_exporters" and listing_type != "exporter":
            raise ValueError("The apeda_exporters adapter only supports listing_type=exporter")
        sources.append({"url": url, "name": name, "listing_type": listing_type, "adapter": adapter})
    return sources


async def sync_universal_data(*, sources: list[str], trigger: str = "manual") -> dict[str, Any]:
    requested = list(dict.fromkeys(source.strip() for source in sources if source.strip()))
    if not requested:
        raise ValueError("At least one universal data source is required")
    unsupported = sorted(set(requested) - SUPPORTED_SOURCES)
    if unsupported:
        raise ValueError(f"Unsupported universal data sources: {', '.join(unsupported)}")
    run = IngestionRun(trigger=trigger, sources=requested, started_at=datetime.now(timezone.utc))
    await run.insert()
    market_records: list[dict[str, Any]] = []
    msp_records: list[dict[str, Any]] = []
    marketplace_records: list[dict[str, Any]] = []
    errors: list[str] = []
    stats: dict[str, Any] = {}
    source_urls: list[str] = []

    try:
        return await _execute_sync(
            run=run,
            requested=requested,
            market_records=market_records,
            msp_records=msp_records,
            marketplace_records=marketplace_records,
            errors=errors,
            stats=stats,
            source_urls=source_urls,
        )
    except Exception as exc:
        run.completed_at = datetime.now(timezone.utc)
        run.status = "failed"
        run.stats = stats
        run.errors = errors + [f"internal: {type(exc).__name__}"]
        run.source_urls = list(dict.fromkeys(source_urls))
        try:
            await run.save()
        except Exception:
            pass
        raise


async def _execute_sync(
    *,
    run: IngestionRun,
    requested: list[str],
    market_records: list[dict[str, Any]],
    msp_records: list[dict[str, Any]],
    marketplace_records: list[dict[str, Any]],
    errors: list[str],
    stats: dict[str, Any],
    source_urls: list[str],
) -> dict[str, Any]:

    if {"market_prices", "crops"} & set(requested):
        try:
            market_records, fetched = await asyncio.to_thread(
                fetch_market_records,
                api_key=settings.DATA_GOV_IN_API_KEY,
                timeout=settings.UNIVERSAL_DATA_HTTP_TIMEOUT_SECONDS,
                page_size=settings.UNIVERSAL_DATA_PAGE_SIZE,
                max_records=settings.UNIVERSAL_DATA_MAX_MARKET_RECORDS,
            )
            stats["market_fetch"] = fetched
            source_urls.append(MARKET_DATASET_URL)
            if "market_prices" in requested:
                stats["market_prices"] = await _bulk_upsert(MarketPrice, market_records)
        except SourceFetchError as exc:
            errors.append(f"market_prices: {exc}")

    if {"msp", "crops"} & set(requested):
        try:
            msp_records, fetched = await asyncio.to_thread(
                fetch_msp_records,
                kharif_url=settings.MSP_KHARIF_URL,
                rabi_url=settings.MSP_RABI_URL,
                marketing_year=settings.MSP_MARKETING_YEAR,
                timeout=settings.UNIVERSAL_DATA_HTTP_TIMEOUT_SECONDS,
            )
            stats["msp_fetch"] = fetched
            source_urls.extend([settings.MSP_KHARIF_URL, settings.MSP_RABI_URL])
            if "msp" in requested:
                stats["msp"] = await _bulk_upsert(MSP, msp_records)
        except SourceFetchError as exc:
            errors.append(f"msp: {exc}")

    if "crops" in requested:
        if market_records:
            records = _crop_records(market_records, msp_records)
            stats["crops"] = await _bulk_upsert(Crop, records)
        else:
            errors.append("crops: skipped because the official market commodity feed was unavailable")

    if "marketplace" in requested:
        try:
            configured_sources = _marketplace_sources()
        except ValueError as exc:
            errors.append(f"marketplace: {exc}")
            configured_sources = []
        if not configured_sources:
            errors.append("marketplace: no approved public directory sources are configured")
        else:
            per_source_stats = []
            for source in configured_sources:
                try:
                    if source["adapter"] == "apeda_exporters":
                        records = await asyncio.to_thread(fetch_apeda_exporter_records, source_url=source["url"], timeout=settings.UNIVERSAL_DATA_HTTP_TIMEOUT_SECONDS)
                    else:
                        records = await asyncio.to_thread(fetch_marketplace_records, source_url=source["url"], source_name=source["name"], listing_type=source["listing_type"], timeout=settings.UNIVERSAL_DATA_HTTP_TIMEOUT_SECONDS)
                    marketplace_records.extend(records)
                    source_urls.append(source["url"])
                    per_source_stats.append({"url": source["url"], "accepted": len(records)})
                except SourceFetchError as exc:
                    errors.append(f"marketplace {source['url']}: {exc}")
            if marketplace_records:
                stats["marketplace"] = await _bulk_upsert(MarketplaceListing, marketplace_records)
            stats["marketplace_sources"] = per_source_stats

    run.completed_at = datetime.now(timezone.utc)
    run.stats = stats
    run.errors = errors
    run.source_urls = list(dict.fromkeys(source_urls))
    successful = sum(1 for source in requested if source in stats)
    run.status = "completed" if not errors else ("partial" if successful else "failed")
    await run.save()
    return _run_response(run)
