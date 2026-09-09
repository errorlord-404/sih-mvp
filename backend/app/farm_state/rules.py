from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from typing import Any


@dataclass(frozen=True)
class MoistureRuleResult:
    status: str
    target_moisture_percent: float
    what: str
    why: str
    when: str
    expected_benefit: str
    alternatives: list[str]
    confidence: float


@dataclass(frozen=True)
class CropStageActionProposal:
    """A reviewable, non-prescriptive task suggestion for a canonical stage."""

    title: str
    why: str
    due_hint: str
    source: str = "crop_stage_rule_v1"


def crop_stage_action_proposals(stage: str, crop_name: str) -> list[CropStageActionProposal]:
    """Return generic lifecycle actions without creating work or prescribing inputs.

    Crop-specific chemical, seed, or nutrient actions must come from a reviewed
    crop pack.  These proposals only help the farmer keep a verifiable farm
    record and observe the stage at the right time.
    """
    crop = crop_name.strip() or "crop"
    templates = {
        "land_preparation": [("Review soil-test baseline", "A recorded laboratory/Soil Health Card baseline is needed before a nutrient plan.", "Before seed/input selection")],
        "seed_treatment": [("Record seed lot and treatment label", "Traceability helps investigate a poor stand without inventing a treatment recommendation.", "Before sowing")],
        "sowing": [(f"Record {crop} sowing details", "Planting date and variety are required for a useful crop calendar and harvest-readiness review.", "Today")],
        "germination": [("Inspect emergence and capture a field note", "An early emergence check can identify gaps or poor establishment for review.", "Within the next few days")],
        "vegetative": [("Walk the field and record visible pest, weed, or stress signs", "Photo and observation history are more useful than a generic treatment instruction.", "This week")],
        "flowering": [("Check crop health and moisture at flowering", "This is a stage-sensitive period; confirm conditions before any input decision.", "Today or after the next sensor reading")],
        "fruiting": [("Capture representative crop-health photos", "A consistent photo record supports review of visible disease or pest symptoms.", "This week")],
        "grain_filling": [("Review moisture and weather before grain filling", "Stage and location-matched conditions should be reviewed before irrigation changes.", "After the next fresh reading")],
        "maturity": [("Plan harvest and logistics requirements", "Harvest readiness, labor, machinery, storage, and market checks need farmer confirmation.", "Before harvest")],
        "harvest": [("Record harvested quantity and quality notes", "A dated farmer record supports ledger and market-realisation review.", "At harvest")],
    }
    return [CropStageActionProposal(title=title, why=why, due_hint=due) for title, why, due in templates.get(stage, [])]


def irrigation_rule(
    moisture_percent: float | None,
    rain_probability: float | None,
    current_stage: str | None,
    recent_irrigation: bool = False,
    now: datetime | None = None,
) -> MoistureRuleResult:
    now = now or datetime.now(timezone.utc)
    target = 35.0
    if current_stage and current_stage.lower().replace(" ", "_") in {"flowering", "fruiting", "grain_filling"}:
        target = 40.0
    if moisture_percent is None:
        return MoistureRuleResult(
            status="insufficient_data",
            target_moisture_percent=target,
            what="Do not schedule irrigation yet",
            why="A current soil-moisture observation is required before calculating water need.",
            when="After a fresh moisture reading is available",
            expected_benefit="Avoids an unsupported irrigation decision",
            alternatives=["Record a sensor reading or field observation"],
            confidence=0.0,
        )
    # Probability alone is not enough to postpone irrigation for a critically
    # dry root zone. A crop/soil-specific water balance may later refine these
    # screening bounds once the required field parameters are recorded.
    critical = target - 15.0
    if moisture_percent < critical:
        return MoistureRuleResult(
            status="recommended",
            target_moisture_percent=target,
            what="Irrigate during the next suitable window",
            why=(f"Latest moisture is {moisture_percent:.1f}%, below the critical {critical:.1f}% screening bound. "
                 "Rain probability alone is not enough to defer a dry-field check."),
            when=(now + timedelta(hours=6)).isoformat().replace("+00:00", "Z"),
            expected_benefit="Reduces the risk of continued water stress while the forecast is monitored",
            alternatives=["Use a smaller split irrigation and recheck moisture", "Inspect drainage and sensor placement"],
            confidence=0.75 if rain_probability is not None else 0.65,
        )
    if moisture_percent >= target:
        return MoistureRuleResult(
            status="not_required",
            target_moisture_percent=target,
            what="Do not irrigate now",
            why=f"Latest moisture is {moisture_percent:.1f}%, at or above the {target:.1f}% target.",
            when="Recheck after the next observation",
            expected_benefit="Avoids unnecessary water use",
            alternatives=["Continue monitoring moisture"],
            confidence=0.9,
        )
    if recent_irrigation:
        return MoistureRuleResult(
            status="reassess_after_recent_irrigation",
            target_moisture_percent=target,
            what="Recheck moisture before another irrigation",
            why="A farmer-recorded irrigation event is recent, and the current moisture is not in the critical screening range.",
            when=(now + timedelta(hours=6)).isoformat().replace("+00:00", "Z"),
            expected_benefit="Avoids applying another irrigation before the previous application has been observed",
            alternatives=["Record a fresh moisture reading", "Inspect for runoff, leaks, or uneven wetting"],
            confidence=0.7,
        )
    # A small deficit may be deferred on a strong location-matched forecast;
    # the critical bound above prevents this probability-only path from
    # postponing water for a dry field.
    if rain_probability is not None and rain_probability >= 60:
        return MoistureRuleResult(
            status="defer_for_rain",
            target_moisture_percent=target,
            what="Defer irrigation and monitor the forecast",
            why=f"Moisture is {moisture_percent:.1f}%, but forecast rain probability is {rain_probability:.0f}%.",
            when="Recheck after the forecast rain window",
            expected_benefit="Reduces avoidable irrigation before expected rain",
            alternatives=["Irrigate only if the rain does not arrive and moisture remains below target"],
            confidence=0.8,
        )
    return MoistureRuleResult(
        status="recommended",
        target_moisture_percent=target,
        what="Irrigate during the next suitable window",
        why=f"Latest moisture is {moisture_percent:.1f}%, below the {target:.1f}% target, with no strong rain deferral signal.",
        when=(now + timedelta(hours=12)).isoformat().replace("+00:00", "Z"),
        expected_benefit="Moves root-zone moisture toward the crop-stage target",
        alternatives=["Use a smaller split irrigation and recheck moisture"],
        confidence=0.75 if rain_probability is not None else 0.6,
    )


def soil_interpretation(values: dict[str, Any]) -> tuple[str, list[dict[str, Any]]]:
    recommendations: list[dict[str, Any]] = []
    if values.get("ph") is not None and (values["ph"] < 5.5 or values["ph"] > 8.0):
        recommendations.append({
            "what": "Review soil pH correction with a local agronomist",
            "why": f"Recorded pH is {values['ph']:.2f}, outside the broad 5.5–8.0 screening range.",
            "when": "Before the next nutrient application",
            "cost_estimate": "Not estimated: product and local rates are not supplied",
            "expected_benefit": "Improves nutrient availability after validated correction",
            "alternatives": ["Repeat a calibrated soil test"],
            "confidence": 0.65,
        })
    if values.get("nitrogen") is not None and values["nitrogen"] < 280:
        recommendations.append({
            "what": "Investigate a nitrogen deficiency",
            "why": f"Recorded nitrogen is {values['nitrogen']:.1f}, below the configured screening threshold of 280.",
            "when": "Before selecting a fertilizer dose",
            "cost_estimate": "Not estimated: fertilizer product and area rate are not supplied",
            "expected_benefit": "Supports a targeted nutrient plan",
            "alternatives": ["Confirm with a laboratory test and crop-specific recommendation"],
            "confidence": 0.6,
        })
    status = "attention_required" if recommendations else "within_screening_ranges"
    return status, recommendations

