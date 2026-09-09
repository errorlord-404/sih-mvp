from datetime import datetime, timezone

from app.scraping.government import parse_mahadbt_scheme_detail, parse_mahadbt_scheme_links


def test_mahadbt_index_parser_deduplicates_official_scheme_links():
    links = parse_mahadbt_scheme_links(
        '<li><a href="/Farmer/SchemeData/SchemeData?str=ABC">Farm tools</a></li>'
        '<li><a href="/Farmer/SchemeData/SchemeData?str=ABC">Farm tools</a></li>',
        index_url="https://mahadbt.maharashtra.gov.in/Farmer/SchemeData/SchemeData?str=ROOT",
    )
    assert links == [{"name": "Farm tools", "url": "https://mahadbt.maharashtra.gov.in/Farmer/SchemeData/SchemeData?str=ABC"}]


def test_mahadbt_detail_parser_keeps_source_and_does_not_invent_benefit_amount():
    record = parse_mahadbt_scheme_detail(
        """
        <h1>Sub-mission on Farm Mechanization</h1>
        <h3>Overview</h3><ul><li>Improve farm power.</li></ul>
        <h3>Benefit</h3><ul>Refer to official benefit document.</ul>
        <h3>Eligibility</h3><ul><li>Aadhaar Card</li><li>Small farmer</li></ul>
        <h3>Required Documents</h3><ul><li>Aadhaar Card</li></ul>
        """,
        source_url="https://mahadbt.example/scheme?str=ABC",
        fallback_name="Fallback",
        fetched_at=datetime(2026, 9, 9, tzinfo=timezone.utc),
    )
    assert record is not None
    assert record["name"] == "Sub-mission on Farm Mechanization"
    assert record["eligibility_criteria"] == ["Aadhaar Card", "Small farmer"]
    assert record["required_documents"] == ["Aadhaar Card"]
    assert record["source"] == "MahaDBT Farmer Portal"
    assert record["fetched_at"].year == 2026
    assert "₹" not in record["benefits"]
