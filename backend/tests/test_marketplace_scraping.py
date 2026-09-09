from datetime import datetime, timezone

from app.scraping.marketplace import parse_apeda_exporters, parse_jsonld_listings


def test_jsonld_marketplace_parser_keeps_source_and_contact_provenance() -> None:
    html = """
    <html><head><script type="application/ld+json">
    {"@context":"https://schema.org","@graph":[
      {"@type":"Product","name":"Tractor rental","category":"tractor","description":"42 HP tractor",
       "url":"https://directory.example/tractor-1","brand":"Demo FPO",
       "offers":{"price":"1400","priceCurrency":"INR","unitText":"per day"},
       "telephone":"+911234567890","address":{"addressLocality":"Wardha","addressRegion":"Maharashtra"}},
      {"@type":"BreadcrumbList","name":"ignore me"}
    ]}
    </script></head></html>
    """
    fetched_at = datetime(2026, 9, 6, tzinfo=timezone.utc)
    records = parse_jsonld_listings(
        html,
        source_url="https://directory.example/listings",
        source_name="Demo FPO directory",
        listing_type="machinery",
        fetched_at=fetched_at,
    )
    assert len(records) == 1
    record = records[0]
    assert record["listing_type"] == "machinery"
    assert record["title"] == "Tractor rental"
    assert record["price_amount"] == 1400.0
    assert record["price_unit"] == "per day"
    assert record["district"] == "Wardha"
    assert record["state"] == "Maharashtra"
    assert record["source_url"] == "https://directory.example/listings"
    assert record["fetched_at"] == fetched_at


def test_jsonld_marketplace_parser_rejects_unsupported_listing_type() -> None:
    try:
        parse_jsonld_listings("", source_url="https://example.test", source_name="test", listing_type="unknown")
    except ValueError as exc:
        assert "Unsupported" in str(exc)
    else:
        raise AssertionError("unsupported type must be rejected")


def test_apeda_exporter_parser_reads_only_public_directory_card_fields() -> None:
    records = parse_apeda_exporters('''<div class="box col-md-4"><p><span></span> A &amp; F ENTERPRISES </p><p>Address, Thane</p><p>FRESH FRUITS</p><p>Maharashtra</p><p>421301</p><div>contact</div></div><div class="pagination">''', source_url="https://agriexchange.apeda.gov.in/AgriDirectory/Exporter/Exporters")
    assert records[0]["title"] == "A & F ENTERPRISES"
    assert records[0]["category"] == "FRESH FRUITS"
    assert records[0]["state"] == "Maharashtra"
    assert records[0]["contact_phone"] is None
