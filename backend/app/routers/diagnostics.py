from __future__ import annotations

from fastapi import APIRouter, Depends, Request

from app.core.config import settings
from app.farm_state.dependencies import get_farm_store
from app.farm_state.store import FarmStateStore
from app.models.gov_scheme import GovScheme
from app.models.machinery_rental import MachineryRental
from app.models.marketplace_listing import MarketplaceListing


router = APIRouter(prefix="/v1", tags=["diagnostics"])


def _count(store: FarmStateStore, table: str, where: str = "") -> int:
    row = store.one(f"SELECT COUNT(*) AS total FROM {table}{where}")
    return int(row["total"] if row else 0)


@router.get("/diagnostics")
async def diagnostics(request: Request, store: FarmStateStore = Depends(get_farm_store)):
    """Return safe, farmer-scoped readiness information for the demo shell.

    This endpoint intentionally omits filesystem paths, secrets, and provider
    credentials. Counts are operational hints, not a claim that records are
    live or verified.
    """
    reference_available = bool(getattr(request.app.state, "reference_db_available", False))
    counts = {
        "fields": _count(store, "fields", " WHERE active = 1"),
        "open_tasks": _count(store, "field_tasks", " WHERE status = 'open'"),
        "open_alerts": _count(store, "alerts", " WHERE status = 'open'"),
        "soil_tests": _count(store, "soil_tests"),
        "sensor_readings": _count(store, "sensor_readings"),
        "device_packets": _count(store, "device_telemetry_packets"),
    }

    reference_counts = {"schemes": 0, "machinery": 0, "marketplace": 0}
    reference_error = None
    if reference_available:
        try:
            reference_counts = {
                "schemes": await GovScheme.count(),
                "machinery": await MachineryRental.count(),
                "marketplace": await MarketplaceListing.count(),
            }
        except Exception as exc:  # pragma: no cover - depends on Mongo availability
            reference_available = False
            reference_error = str(exc)

    components = {
        "farm_state": {"status": "available", "mode": "server_local_sqlite"},
        "reference_database": {
            "status": "available" if reference_available else "unavailable",
            "counts": reference_counts,
            "error": reference_error,
        },
        "codex": {"status": "desktop_managed", "message": "Codex status is reported by the Electron harness."},
        "sarvam": {
            "status": "configured" if settings.SARVAM_API_KEY.strip() else "unconfigured",
            "message": "Speech and translation routes are ready." if settings.SARVAM_API_KEY.strip() else "Set SARVAM_API_KEY to enable voice services.",
        },
        "optional_providers": {
            "weather": settings.WEATHER_PROVIDER,
            "diagnosis": settings.DIAGNOSIS_PROVIDER,
        },
    }
    degraded = []
    if not reference_available:
        degraded.append("reference_database")
    if not settings.SARVAM_API_KEY.strip():
        degraded.append("sarvam")
    return {
        "status": "ready" if not degraded else "degraded",
        "farmer_state": counts,
        "components": components,
        "degraded_components": degraded,
        "demo_data_policy": "Counts may include local_demo records; verify source and freshness before acting.",
    }
