from __future__ import annotations

from datetime import datetime, timedelta, timezone
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.core.config import settings
from app.farm_state.dependencies import get_farm_store
from app.farm_state.store import FarmStateStore, iso_now, json_text, json_value
from app.schemas.farm_state import Provenance, WeatherAlertResponse, WeatherData
from app.services.weather import WeatherProviderError, fetch_weather

router = APIRouter(prefix="/v1/weather", tags=["weather"])


def _weather_response(payload: dict) -> WeatherData:
    return WeatherData(**payload)


def _fresh_cached_weather(store: FarmStateStore, lat: float, lon: float) -> dict | None:
    row = store.one(
        """SELECT * FROM weather_snapshots
        WHERE ABS(latitude - ?) < 0.01 AND ABS(longitude - ?) < 0.01
        ORDER BY fetched_at DESC LIMIT 1""",
        (lat, lon),
    )
    if not row:
        return None
    payload = json_value(row["payload"], {})
    fetched_at = datetime.fromisoformat(payload["fetched_at"].replace("Z", "+00:00"))
    age = max(0, int((datetime.now(timezone.utc) - fetched_at).total_seconds()))
    if age > settings.WEATHER_CACHE_SECONDS:
        return None
    payload["freshness_seconds"] = age
    return payload


@router.get("", response_model=WeatherData)
async def get_weather(
    lat: float = Query(..., ge=-90, le=90),
    lon: float = Query(..., ge=-180, le=180),
    store: FarmStateStore = Depends(get_farm_store),
):
    cached = _fresh_cached_weather(store, lat, lon)
    if cached:
        return _weather_response(cached)
    try:
        payload = await fetch_weather(lat, lon)
    except WeatherProviderError as exc:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail={"code": "weather_provider_unavailable", "message": str(exc)}) from exc
    store.execute(
        "INSERT INTO weather_snapshots(id, latitude, longitude, provider, observed_at, fetched_at, payload, freshness_seconds) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        (str(uuid4()), lat, lon, payload["provider"], payload["observed_at"], payload["fetched_at"], json_text(payload), payload["freshness_seconds"]),
    )
    return _weather_response(payload)


@router.get("/alerts", response_model=list[WeatherAlertResponse])
async def get_weather_alerts(
    field_id: str,
    store: FarmStateStore = Depends(get_farm_store),
):
    field = store.one("SELECT * FROM fields WHERE id = ? AND active = 1", (field_id,))
    if not field:
        raise HTTPException(status_code=404, detail="Field not found")
    snapshot = store.one(
        """SELECT * FROM weather_snapshots
        WHERE ABS(latitude - ?) < 0.01 AND ABS(longitude - ?) < 0.01
        ORDER BY fetched_at DESC LIMIT 1""",
        (field["centroid_lat"], field["centroid_lon"]),
    ) if field["centroid_lat"] is not None and field["centroid_lon"] is not None else None
    if not snapshot:
        if field["centroid_lat"] is None or field["centroid_lon"] is None:
            return []
        try:
            payload = await fetch_weather(field["centroid_lat"], field["centroid_lon"])
        except WeatherProviderError as exc:
            raise HTTPException(status_code=503, detail={"code": "weather_provider_unavailable", "message": str(exc)}) from exc
        store.execute(
            "INSERT INTO weather_snapshots(id, latitude, longitude, provider, observed_at, fetched_at, payload, freshness_seconds) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            (str(uuid4()), field["centroid_lat"], field["centroid_lon"], payload["provider"], payload["observed_at"], payload["fetched_at"], json_text(payload), payload["freshness_seconds"]),
        )
    else:
        payload = json_value(snapshot["payload"], {})
    fetched_at = datetime.fromisoformat(payload["fetched_at"].replace("Z", "+00:00"))
    observed_at = datetime.fromisoformat(payload["observed_at"].replace("Z", "+00:00"))
    provenance = Provenance(source=payload["provider"], observed_at=observed_at, fetched_at=fetched_at,
                            freshness_seconds=payload.get("freshness_seconds", 0))
    results = []
    for item in payload.get("daily", []):
        probability = item.get("precipitation_probability")
        if probability is not None and probability >= 70:
            results.append(WeatherAlertResponse(
                id=f"weather-rain-{field_id}-{item.get('observed_at')}", field_id=field_id,
                alert_type="heavy_rain_probability", title="Rain likely in forecast window",
                description=f"Forecast precipitation probability is {probability:.0f}% for {item.get('observed_at')}.",
                severity="warning", provenance=provenance,
            ))
    return results
