# Continuation prompt for a future AI

Copy the block below into a new task in this repository.

```text
Continue the KisanSathi SIH26180 project from the documented checkpoint. Do not restart discovery from scratch.

First read, in order:
1. docs/sih26180/README.md
2. docs/sih26180/SESSION_CHECKPOINT_2026_09_05.md
3. docs/sih26180/RESEARCH.md
4. docs/sih26180/PRD.md
5. docs/sih26180/IMPLEMENTATION_PLAN.md
6. docs/sih26180/SOURCE_LEDGER.md
7. docs/sih26180/report-source.md
8. git status --short
9. relevant AGENTS.md files before editing their scope.

The repository is intentionally dirty. Treat existing modified/untracked paths as user-owned. Do not reset, clean, checkout, rebase or stage unrelated changes. Work only on paths needed for the requested task.

Current planning recommendation:
- Deliver a focused field-deployable SIH demonstrator for one crop and one pilot region.
- Core: Android local crop-health inference, calibrated sensors, stage-aware FAO56-style root-zone water balance, bounded local irrigation controller with manual override and flow feedback, offline history/tasks and source-aware weather/alert context.
- Keep full lifecycle features as a staged roadmap.
- Do not make unverified claims about field accuracy, NPK probe accuracy, yield/profit, exact hyperlocal forecasts, MSP eligibility or winning SIH.

Before implementation, verify the official SIH statement and choose/confirm target crop, pilot location, Qualcomm target device/board, field partner, agronomy reviewer and hardware constraints. If those inputs are still unavailable, implement only reusable D0/Phase 1 corrections and clearly record assumptions.

Known current defects to address before expanding features:
1. Irrigation weather query is not scoped to requested field/coordinates.
2. Irrigation relies on fixed moisture thresholds and probability-only rain deferral; it must not actuate equipment.
3. Soil screening does not distinguish missing/unknown from healthy and does not enforce measurement unit/method context.
4. Market comparison needs latest comparable mandi/variety/grade selection and dated cost/route assumptions.
5. Scheme eligibility is discovery, not implemented eligibility.
6. X-Farmer-ID is not authentication; CORS and public mutators need hardening before network deployment.
7. Idempotency needs intent-specific keys and atomic persistence/outbox handling.
8. Diagnosis is upload/storage only: it returns inconclusive because no vision provider/local model exists.
9. No firmware, controller protocol, Android runtime or phone offline sync exists.

Use shared contracts and tests. Keep domain logic out of the Codex Rust fork; preserve the existing FastAPI + Python MCP adapter boundary. Do not give the language agent direct physical control; domain services and the local controller own calculations, authorization and actuation.

Run relevant tests, read back the diff, update the existing backend change-memory documents when changing backend scope, and commit only your own deliberate files. At the end, update docs/sih26180/SESSION_CHECKPOINT_2026_09_05.md or create a new dated checkpoint with:
- what changed;
- tests/commands and result;
- decision changes;
- remaining risks/blockers;
- exact next recommended task;
- commit hashes.
```

Start by reporting the verified official SIH statement status and a compact Phase 0 execution plan. Then proceed with the most valuable authorized implementation work.
