"""Bounded extraction for explicitly configured public directory pages.

This module deliberately does not search Google, bypass logins, or scrape an
unbounded third-party marketplace. Operators supply a vetted public URL and a
category. We ingest only JSON-LD records the publisher has made available.
"""

from __future__ import annotations

import json
import re
from html import unescape
from datetime import datetime, timezone
from html.parser import HTMLParser
from typing import Any

from app.scraping.sources import SourceFetchError, _fetch_text, stable_source_id


ALLOWED_LISTING_TYPES = {"machinery", "seed", "fertilizer", "logistics", "buyer", "exporter"}


def _html_text(value: str) -> str | None:
    return re.sub(r"\s+", " ", unescape(re.sub(r"<[^>]+>", " ", value))).strip() or None


def parse_apeda_exporters(html: str, *, source_url: str, fetched_at: datetime | None = None) -> list[dict[str, Any]]:
    """Parse APEDA's public first directory page; never follows protected contact flows."""
    timestamp = fetched_at or datetime.now(timezone.utc)
    cards = re.findall(r'<div class="box col-md-4">(.*?)(?=<div class="box col-md-4">|<div class="pagination|</section>)', html, flags=re.DOTALL)
    records: dict[str, dict[str, Any]] = {}
    for card in cards:
        paragraphs = [_html_text(value) for value in re.findall(r"<p[^>]*>(.*?)</p>", card, flags=re.DOTALL)]
        values = [value for value in paragraphs if value]
        if len(values) < 4:
            continue
        title, address, commodities, state = values[:4]
        record_id = stable_source_id("apeda-exporter", title, address, state)
        records[record_id] = {
            "source_record_id": record_id, "listing_type": "exporter", "title": title,
            "category": commodities, "provider_name": title, "description": "APEDA registered exporter directory record.",
            "location": address, "district": None, "state": state, "price_amount": None, "price_currency": "INR",
            "price_unit": None, "contact_phone": None, "contact_email": None, "listing_url": source_url,
            "source": "APEDA Agri Exchange registered exporter directory", "source_url": source_url,
            "observed_at": None, "fetched_at": timestamp,
        }
    return list(records.values())


class _JsonLdParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.blocks: list[str] = []
        self._capture = False
        self._parts: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attributes = dict(attrs)
        if tag == "script" and "ld+json" in (attributes.get("type") or "").casefold():
            self._capture = True
            self._parts = []

    def handle_data(self, data: str) -> None:
        if self._capture:
            self._parts.append(data)

    def handle_endtag(self, tag: str) -> None:
        if tag == "script" and self._capture:
            self.blocks.append("".join(self._parts))
            self._capture = False
            self._parts = []


def _objects(value: Any) -> list[dict[str, Any]]:
    if isinstance(value, dict):
        output = [value]
        for nested in value.get("@graph", []) if isinstance(value.get("@graph"), list) else []:
            output.extend(_objects(nested))
        return output
    if isinstance(value, list):
        return [item for value_item in value for item in _objects(value_item)]
    return []


def _text(value: Any) -> str | None:
    if isinstance(value, str):
        return re.sub(r"\s+", " ", value).strip() or None
    return None


def _address(value: Any) -> tuple[str | None, str | None, str | None]:
    if not isinstance(value, dict):
        return None, None, None
    location = ", ".join(filter(None, [_text(value.get("streetAddress")), _text(value.get("addressLocality"))])) or None
    return location, _text(value.get("addressLocality")), _text(value.get("addressRegion"))


def _offer(value: Any) -> tuple[float | None, str, str | None]:
    offers = value if isinstance(value, list) else [value]
    for offer in offers:
        if not isinstance(offer, dict):
            continue
        try:
            price = float(offer.get("price")) if offer.get("price") is not None else None
        except (TypeError, ValueError):
            price = None
        if price is not None and price >= 0:
            return price, _text(offer.get("priceCurrency")) or "INR", _text(offer.get("unitText"))
    return None, "INR", None


def parse_jsonld_listings(
    html: str, *, source_url: str, source_name: str, listing_type: str, fetched_at: datetime | None = None
) -> list[dict[str, Any]]:
    """Map publisher-provided Product/Service/Business JSON-LD into directory records."""
    normalized_type = listing_type.strip().casefold()
    if normalized_type not in ALLOWED_LISTING_TYPES:
        raise ValueError(f"Unsupported marketplace listing type: {listing_type}")
    parser = _JsonLdParser()
    parser.feed(html)
    timestamp = fetched_at or datetime.now(timezone.utc)
    records: dict[str, dict[str, Any]] = {}
    supported = {"product", "service", "localbusiness", "organization", "store"}
    for block in parser.blocks:
        try:
            values = _objects(json.loads(block))
        except json.JSONDecodeError:
            continue
        for item in values:
            item_types = item.get("@type")
            names = {str(value).casefold() for value in (item_types if isinstance(item_types, list) else [item_types]) if value}
            if not names.intersection(supported):
                continue
            title = _text(item.get("name"))
            if not title:
                continue
            location, district, state = _address(item.get("address"))
            price, currency, unit = _offer(item.get("offers"))
            listing_url = _text(item.get("url")) or source_url
            record_id = stable_source_id("marketplace", normalized_type, source_url, title, listing_url)
            records[record_id] = {
                "source_record_id": record_id,
                "listing_type": normalized_type,
                "title": title,
                "category": _text(item.get("category")),
                "provider_name": _text(item.get("brand")) or _text(item.get("legalName")) or source_name,
                "description": _text(item.get("description")),
                "location": location,
                "district": district,
                "state": state,
                "price_amount": price,
                "price_currency": currency,
                "price_unit": unit,
                "contact_phone": _text(item.get("telephone")),
                "contact_email": _text(item.get("email")),
                "listing_url": listing_url,
                "source": source_name,
                "source_url": source_url,
                "observed_at": None,
                "fetched_at": timestamp,
            }
    return list(records.values())


def fetch_marketplace_records(*, source_url: str, source_name: str, listing_type: str, timeout: float) -> list[dict[str, Any]]:
    try:
        html = _fetch_text(source_url, timeout)
    except SourceFetchError:
        raise
    return parse_jsonld_listings(html, source_url=source_url, source_name=source_name, listing_type=listing_type)


def fetch_apeda_exporter_records(*, source_url: str, timeout: float) -> list[dict[str, Any]]:
    """Fetch exactly the public first page; pagination expansion needs separate approval."""
    return parse_apeda_exporters(_fetch_text(source_url, timeout), source_url=source_url)
