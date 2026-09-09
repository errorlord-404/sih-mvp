# Marketplace directory ingestion

KisanSathi's marketplace is a **discovery directory**, not an e-commerce or
booking system. It exposes source-attributed public records for machinery,
seed, fertilizer, logistics, buyers and exporters through:

- `GET /marketplace/listings`
- frontend route `/marketplace`
- MCP tool `search_marketplace_listings`

## Source policy

The importer does not search Google, scrape login-protected sites, bypass rate
limits, or guess provider contacts/prices. It only reads JSON-LD structured
data published by an administrator-approved HTTPS source. Each resulting row
retains `source`, `source_url`, `listing_url` and `fetched_at`.

The APEDA public exporter directory is configured as the safe default. Override
the registry outside version control to add reviewed sources:

```env
MARKETPLACE_DIRECTORY_SOURCES_JSON=[
  {"url":"https://example.org/public-tractor-directory","name":"Example FPO directory","listing_type":"machinery"},
  {"url":"https://example.org/public-logistics-directory","name":"Example logistics directory","listing_type":"logistics"}
]
```

Allowed `listing_type` values are `machinery`, `seed`, `fertilizer`,
`logistics`, `buyer`, and `exporter`. The configured source must be public,
permitted for automated access, and reviewed by the team. A page without
publisher-provided JSON-LD creates no listings.

The approved APEDA adapter is an exception with an explicit bounded contract:

```env
MARKETPLACE_DIRECTORY_SOURCES_JSON=[
  {"url":"https://agriexchange.apeda.gov.in/AgriDirectory/Exporter/Exporters","name":"APEDA registered exporters","listing_type":"exporter","adapter":"apeda_exporters"}
]
```

It reads only the public first directory page and retains exporter name,
address, commodity category and state. It does not page through the directory,
use the contact button, decrypt identifiers, or retrieve protected contacts.

## Government refreshes

The universal-data service also supports two source-specific official adapters:

- `gov_schemes` follows the published agricultural links on the [MahaDBT
  Farmer Portal](https://mahadbt.maharashtra.gov.in/) and stores the detail
  page's eligibility/documents with a stable source ID.
- `machinery` reads the public [Government of India FARMS
  dashboard](https://agrimachinery.nic.in/Index/farmsapp). Its current public
  endpoints expose state-level custom-hiring provider and booking counts, not
  individual centres, rates or availability. Those rows are stored as
  `record_kind=network_status` and must never be described as a confirmed
  rental or booking.

Run both along with APEDA using:

```powershell
python -m app.scraping --sources gov_schemes,machinery,marketplace
```

`backend/scripts/refresh_live_reference_data.py` performs this refresh and
removes only local directory fixtures after all three sources succeed.

## Run and verify

1. Configure `SCRAPER_WEBHOOK_TOKEN` and the source registry.
2. Trigger `POST /internal/universal-data/sync?sources=marketplace` with
   `X-Ingestion-Token`.
3. Inspect the protected `/internal/universal-data/runs` result for accepted
   counts and per-source errors.
4. Open `/marketplace` or `/machinery`, filter by category/location, and
   inspect each source/fetched timestamp. Network-status rows are discovery
   evidence only; they do not contain a rental quote.

The endpoint and MCP tool only reveal listings. They do not place calls, make
purchases, submit export documents, book transport, or represent a provider's
availability as guaranteed.

## Candidate official sources requiring source-specific adapters

The JSON-LD importer intentionally does not attempt to infer records from a
generic page layout. Before adding a source-specific adapter, the team must
review its terms, robots/access policy, rate limit and field mapping. Current
research candidates are:

- APEDA's public [Agri Exchange registered-exporter directory](https://agriexchange.apeda.gov.in/AgriDirectory/Exporter/Exporters). It publishes exporter name, address, commodity and state in a public directory, but its HTML layout is not the JSON-LD contract used by this importer.
- The Ministry of Agriculture's [FARMS/custom-hiring information](https://agrimachinery.nic.in/Index/farmsapp). Its public dashboard endpoints are now supported for aggregate network status; obtaining individual live centres or availability still needs its documented integration or explicit permission, not screen scraping.

Do not add an individual commercial directory until its terms, source approval
and adapter test fixture have been committed.
