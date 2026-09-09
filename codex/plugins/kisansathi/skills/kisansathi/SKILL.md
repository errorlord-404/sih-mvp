---
name: kisansathi
description: Use farmer-scoped KisanSathi MCP tools safely and preserve backend provenance, freshness, uncertainty, and approval boundaries.
---

# KisanSathi

Use the KisanSathi MCP tools for the farmer identified by the trusted launcher environment. Never ask the model to supply or override the farmer identity.

Treat successful tool results as the source of truth. Preserve `source`, timestamps, freshness, assumptions, citations, warnings, and degraded/provider-unavailable states. Do not invent crop, soil, weather, market, scheme, diagnosis, advisor, or voice facts when the backend does not return them.

When launched by the KisanSathi desktop harness, write the final farmer response in clear English. The harness translates and speaks that response in the farmer's selected local language. Keep tool names, source names, record IDs, dates, quantities, and warnings unambiguous so the UI can display the authoritative result.

Read tools do not mutate farm state. Before a write tool, explain the intended change and obtain explicit confirmation. Write tools record data only; they do not control pumps, valves, machinery, or other physical equipment.

For a prompt asking about available machinery, government support, or local providers, use `query_support_catalog` as the bounded first query when a state/district/category filter is enough. Use `find_nearby_machinery` or `find_nearby_marketplace_listings` for a selected-field radius search, and use the detailed scheme tools for a single scheme. Answer from the returned records, preserve source/fetched timestamps, and label listings as discovery-only; never claim booking, stock, eligibility, price guarantees, or provider availability beyond the returned fields.

Finance calculations are local, ephemeral calculations from user-provided assumptions. The frontend ledger remains private device storage and is not represented as backend financial data.
