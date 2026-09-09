from __future__ import annotations

import asyncio
import base64
import json

import httpx

from kisansathi_agent.backend_client import BackendClient
from kisansathi_agent.config import Settings
from kisansathi_agent.server import build_server
from kisansathi_agent.tools import KisanSathiTools
from kisansathi_agent.result import bound_data


def run(coro):
    return asyncio.run(coro)


def make_client(handler):
    return BackendClient(
        Settings(backend_url="http://backend.test", farmer_id="farmer-1"),
        transport=httpx.MockTransport(handler),
    )


def test_weather_uses_coordinates_from_the_selected_field() -> None:
    calls = []

    async def handler(request: httpx.Request) -> httpx.Response:
        calls.append(request)
        if request.url.path == "/v1/fields/field-1":
            return httpx.Response(200, json={"id": "field-1", "centroid_lat": 20.1, "centroid_lon": 78.2})
        if request.url.path == "/v1/weather":
            assert request.url.params["lat"] == "20.1"
            assert request.url.params["lon"] == "78.2"
            return httpx.Response(200, json={"provider": "test", "freshness_seconds": 4})
        return httpx.Response(404, json={"detail": "not found"})

    async def scenario() -> None:
        client = make_client(handler)
        result = await KisanSathiTools(client).get_weather_for_field("field-1")
        assert result["status"] == "ok"
        assert result["data"]["weather"]["provider"] == "test"
        assert [request.url.path for request in calls] == ["/v1/fields/field-1", "/v1/weather"]
        await client.aclose()

    run(scenario())


def test_weather_without_coordinates_is_explicitly_degraded() -> None:
    async def handler(request: httpx.Request) -> httpx.Response:
        return httpx.Response(200, json={"id": request.url.path.rsplit("/", 1)[-1], "centroid_lat": None, "centroid_lon": None})

    async def scenario() -> None:
        client = make_client(handler)
        result = await KisanSathiTools(client).get_weather_for_field("field-1")
        assert result["status"] == "degraded"
        assert result["warnings"]
        await client.aclose()

    run(scenario())


def test_server_exposes_only_farmer_safe_read_tools() -> None:
    async def handler(_: httpx.Request) -> httpx.Response:
        return httpx.Response(200, json={})

    client = make_client(handler)
    server = build_server(client)
    registered = server._tool_manager.list_tools()
    names = {tool.name for tool in registered}
    assert "get_profile" in names
    assert "get_component_health" in names
    assert "get_weather_for_field" in names
    assert "get_crop_stage_action_proposals" in names
    assert "get_crop_options" in names
    assert "list_device_health" in names
    assert "get_market_price" in names
    assert "compare_msp_with_market" in names
    assert "find_machinery" in names
    assert "get_marketplace_status" in names
    assert "calculate_logistics_cost" in names
    assert "list_field_tasks" in names
    assert "create_field_task" in names
    assert "get_ledger_summary" in names
    assert "record_ledger_entry" in names
    assert "record_irrigation_event" in names
    assert "list_irrigation_events" in names
    assert "update_profile" in names
    assert "farmer_id" not in json.dumps([tool.model_dump() for tool in registered], default=str)
    write_tool = next(tool for tool in registered if tool.name == "record_irrigation_event")
    assert write_tool.annotations.readOnlyHint is False
    assert write_tool.annotations.idempotentHint is True
    task_write_tool = next(tool for tool in registered if tool.name == "create_field_task")
    assert task_write_tool.annotations.readOnlyHint is False
    run(client.aclose())


def test_mutation_sends_deterministic_idempotency_key() -> None:
    seen = []

    async def handler(request: httpx.Request) -> httpx.Response:
        seen.append(request)
        return httpx.Response(201, json={"id": "event-1"})

    async def scenario() -> None:
        client = make_client(handler)
        tools = KisanSathiTools(client)
        first = await tools.record_irrigation_event("field-1", "2026-08-18T06:00:00Z", volume_liters=20)
        second = await tools.record_irrigation_event("field-1", "2026-08-18T06:00:00Z", volume_liters=20)
        assert first["status"] == "ok"
        assert second["status"] == "ok"
        assert first["action"]["resource_type"] == "irrigation_event"
        assert first["action"]["affected_ids"] == {"id": "event-1"}
        assert first["action"]["refresh"] == ["irrigation", "timeline", "dashboard"]
        assert first["action"]["timestamp"].endswith("+00:00")
        assert seen[0].headers["idempotency-key"] == seen[1].headers["idempotency-key"]
        await client.aclose()

    run(scenario())


def test_mutation_methods_use_the_backend_http_verb() -> None:
    seen = []

    async def handler(request: httpx.Request) -> httpx.Response:
        seen.append(request.method)
        return httpx.Response(200, json={"ok": True})

    async def scenario() -> None:
        client = make_client(handler)
        tools = KisanSathiTools(client)
        await tools.update_profile("Asha")
        await tools.update_alert_status("alert-1", "read")
        await tools.create_field_task("field-1", "Inspect leaves")
        await tools.update_field_task_status("task-1", "completed")
        await tools.record_ledger_entry("expense", "Seed", "Tomato seed", 820, "2026-09-07")
        await tools.update_ledger_entry_status("ledger-1", "void")
        assert seen == ["PUT", "PATCH", "POST", "PATCH", "POST", "PATCH"]
        await client.aclose()

    run(scenario())


def test_large_list_results_are_bounded_for_model_context() -> None:
    bounded = bound_data([{"id": index, "value": "x" * 100} for index in range(500)], 1_024)
    assert bounded["truncated"] is True
    assert bounded["total_items"] == 500
    assert len(bounded["items"]) < 500


def test_specialized_tools_use_reference_and_farm_routes() -> None:
    calls = []

    async def handler(request: httpx.Request) -> httpx.Response:
        calls.append((request.method, request.url.path, request.url.params))
        if request.url.path == "/v1/fields/field-1":
            return httpx.Response(200, json={"id": "field-1", "centroid_lat": 18.5204, "centroid_lon": 73.8567})
        if request.url.path == "/v1/advisor/sessions":
            return httpx.Response(201, json={"id": "session-1"})
        if request.url.path.endswith("/messages"):
            return httpx.Response(200, json={"id": "message-1", "content": "provider unavailable"})
        return httpx.Response(200, json={"ok": True})

    async def scenario() -> None:
        client = make_client(handler)
        tools = KisanSathiTools(client)
        assert (await tools.get_farm_map())["status"] == "ok"
        assert (await tools.get_crop_stage_action_proposals("field-1"))["status"] == "ok"
        assert (await tools.list_device_health("field-1"))["status"] == "ok"
        assert (await tools.list_crops())["status"] == "ok"
        assert (await tools.recommend_seeds("wheat"))["status"] == "ok"
        assert (await tools.recommend_fertilizers("wheat"))["status"] == "ok"
        assert (await tools.list_machinery_rentals(state="Maharashtra"))["status"] == "ok"
        assert (await tools.find_machinery(state="Maharashtra"))["status"] == "ok"
        assert (await tools.find_nearby_machinery("field-1"))["status"] == "ok"
        assert (await tools.get_market_price("Wheat", state="Maharashtra"))["status"] == "ok"
        assert (await tools.get_nearby_mandi_prices("Wheat", "Pune", "Maharashtra"))["status"] == "ok"
        assert (await tools.compare_msp_with_market("Wheat"))["status"] == "ok"
        assert (await tools.get_scheme_details("scheme-1"))["status"] == "ok"
        marketplace = await tools.search_marketplace_listings("logistics", state="Maharashtra", query="cold storage")
        assert marketplace["status"] == "ok"
        assert (await tools.find_nearby_marketplace_listings("field-1"))["status"] == "ok"
        assert (await tools.get_marketplace_status())["status"] == "ok"
        assert (await tools.find_logistics_providers(state="Maharashtra"))["status"] == "ok"
        assert (await tools.compare_logistics_options([{"provider_name": "Carrier A", "title": "Pune run", "base_cost": 1000}]))["status"] == "ok"
        assert (await tools.calculate_logistics_cost({"provider_name": "Carrier A", "title": "Pune run", "base_cost": 1000}))["status"] == "ok"
        assert (await tools.ask_farm_advisor("What should I check?"))["status"] == "ok"
        assert (await tools.calculate_profit(1000, [{"title": "Seed", "amount": 200}]))["data"]["profit"] == 800
        assert any(method == "GET" and path == "/v1/fields/map" for method, path, _ in calls)
        assert any(method == "GET" and path == "/v1/fields/field-1/action-proposals" for method, path, _ in calls)
        assert any(method == "GET" and path == "/v1/device-ingestion/devices" for method, path, _ in calls)
        assert any(method == "GET" and path == "/crops" for method, path, _ in calls)
        assert any(path == "/seeds/recommend" for _, path, _ in calls)
        assert any(path == "/fertilizer/recommend" for _, path, _ in calls)
        assert any(path == "/marketplace/listings" for _, path, _ in calls)
        assert any(path == "/machinery-rentals/nearby" for _, path, _ in calls)
        assert any(path == "/marketplace/nearby" for _, path, _ in calls)
        assert any(path == "/marketplace/status" for _, path, _ in calls)
        assert any(path == "/marketplace/compare-quotes" for _, path, _ in calls)
        assert any(path == "/msp/compare-market" for _, path, _ in calls)
        assert any(path == "/gov-schemes/scheme-1" for _, path, _ in calls)
        await client.aclose()

    run(scenario())


def test_binary_tools_validate_and_forward_bounded_payloads() -> None:
    seen = []

    async def handler(request: httpx.Request) -> httpx.Response:
        seen.append(request)
        return httpx.Response(201, json={"status": "provider_unavailable", "message": "not configured"})

    async def scenario() -> None:
        client = make_client(handler)
        tools = KisanSathiTools(client)
        png = base64.b64encode(b"\x89PNG\r\n\x1a\nfixture").decode()
        diagnosis = await tools.diagnose_crop(png, mime_type="image/png", field_id="field-1")
        voice = await tools.send_voice_turn(base64.b64encode(b"audio").decode())
        assert diagnosis["status"] == voice["status"] == "ok"
        assert seen[0].headers["content-type"].startswith("multipart/form-data;")
        assert seen[1].headers["content-type"] == "audio/webm"
        assert (await tools.diagnose_crop("not-base64"))["status"] == "error"
        await client.aclose()

    run(scenario())
