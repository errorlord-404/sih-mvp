from datetime import datetime, timezone

from app.farm_state.rules import irrigation_rule


def test_critical_dry_moisture_is_not_deferred_only_for_rain_probability():
    result = irrigation_rule(19, 95, None, now=datetime(2026, 9, 8, tzinfo=timezone.utc))
    assert result.status == "recommended"
    assert "not enough to defer" in result.why


def test_small_deficit_can_defer_for_location_matched_rain_signal():
    result = irrigation_rule(31, 95, None, now=datetime(2026, 9, 8, tzinfo=timezone.utc))
    assert result.status == "defer_for_rain"


def test_recent_irrigation_requires_reassessment_when_not_critical():
    result = irrigation_rule(31, None, None, recent_irrigation=True, now=datetime(2026, 9, 8, tzinfo=timezone.utc))
    assert result.status == "reassess_after_recent_irrigation"
