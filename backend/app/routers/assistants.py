from __future__ import annotations

import asyncio
import hashlib
import json
import re
from datetime import datetime, timezone
from pathlib import Path
from typing import AsyncIterator
from uuid import uuid4

from fastapi import APIRouter, Depends, Header, HTTPException, Query, Request, status
from fastapi.responses import StreamingResponse

from app.core.config import settings
from app.farm_state.dependencies import get_farm_store
from app.farm_state.store import (
    FarmStateStore,
    get_idempotent_response,
    iso_now,
    json_text,
    json_value,
    save_idempotent_response,
)
from app.services.sarvam import SarvamProviderError, configured as sarvam_configured, synthesize_speech, transcribe_audio
from app.services.crop_health import diagnose_image
from app.schemas.farm_state import (
    AdvisorMessageCreate,
    AdvisorMessageResponse,
    AdvisorSessionCreate,
    AdvisorSessionResponse,
    DiagnosisFeedbackCreate,
    DiagnosisFeedbackResponse,
    DiagnosisResponse,
    TranslationRequest,
    TranslationResponse,
    SarvamRuntimeConfigResponse,
    SarvamRuntimeConfigUpdate,
    VoiceTurnResponse,
    VoiceSynthesisRequest,
    VoiceSynthesisResponse,
    VoiceTranscriptionResponse,
)

router = APIRouter(prefix="/v1", tags=["assistant-workflows"])
ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp"}


def _sarvam_runtime_config() -> SarvamRuntimeConfigResponse:
    """Expose only safe runtime options; never expose the configured key."""
    return SarvamRuntimeConfigResponse(
        configured=sarvam_configured(), voice_provider=settings.VOICE_PROVIDER,
        stt_model=settings.SARVAM_STT_MODEL, stt_language_code=settings.SARVAM_STT_LANGUAGE_CODE,
        tts_model=settings.SARVAM_TTS_MODEL, tts_speaker=settings.SARVAM_TTS_SPEAKER,
        tts_pace=settings.SARVAM_TTS_PACE, translate_model=settings.SARVAM_TRANSLATE_MODEL,
    )


@router.get("/sarvam/runtime-config", response_model=SarvamRuntimeConfigResponse)
def get_sarvam_runtime_config() -> SarvamRuntimeConfigResponse:
    return _sarvam_runtime_config()


@router.put("/sarvam/runtime-config", response_model=SarvamRuntimeConfigResponse)
def update_sarvam_runtime_config(payload: SarvamRuntimeConfigUpdate) -> SarvamRuntimeConfigResponse:
    """Apply local runtime settings without persisting or echoing a provider key."""
    if payload.clear_api_key:
        settings.SARVAM_API_KEY = ""
        settings.VOICE_PROVIDER = "unconfigured"
    elif payload.api_key is not None:
        api_key = payload.api_key.get_secret_value().strip()
        if not api_key:
            raise HTTPException(status_code=422, detail="Sarvam API key cannot be empty.")
        settings.SARVAM_API_KEY = api_key
        settings.VOICE_PROVIDER = "sarvam"
    for input_name, setting_name in {
        "stt_model": "SARVAM_STT_MODEL", "stt_language_code": "SARVAM_STT_LANGUAGE_CODE",
        "tts_model": "SARVAM_TTS_MODEL", "tts_speaker": "SARVAM_TTS_SPEAKER",
        "tts_pace": "SARVAM_TTS_PACE", "translate_model": "SARVAM_TRANSLATE_MODEL",
    }.items():
        value = getattr(payload, input_name)
        if value is not None:
            setattr(settings, setting_name, value)
    return _sarvam_runtime_config()


def _parse_datetime(value: str) -> datetime:
    return datetime.fromisoformat(value.replace("Z", "+00:00"))


def _session_response(row) -> AdvisorSessionResponse:
    return AdvisorSessionResponse(id=row["id"], field_id=row["field_id"], language=row["language"], status=row["status"],
                                  created_at=_parse_datetime(row["created_at"]), updated_at=_parse_datetime(row["updated_at"]))


def _message_response(row) -> AdvisorMessageResponse:
    return AdvisorMessageResponse(id=row["id"], session_id=row["session_id"], role=row["role"], content=row["content"],
                                  citations=json_value(row["citations"], []), provider=row["provider"], created_at=_parse_datetime(row["created_at"]))


def _diagnosis_response(request_row, diagnosis_row) -> DiagnosisResponse:
    output = json_value(diagnosis_row["provider_output"], {}) if diagnosis_row else {}
    return DiagnosisResponse(id=request_row["id"], field_id=request_row["field_id"], status=request_row["status"],
                             label=diagnosis_row["label"] if diagnosis_row else None,
                             confidence=diagnosis_row["confidence"] if diagnosis_row else None,
                             severity=diagnosis_row["severity"] if diagnosis_row else None,
                             treatment=diagnosis_row["treatment"] if diagnosis_row else None,
                             provider=request_row["provider"], error=request_row["error"],
                             crop=output.get("crop"), model_id=output.get("model_id"), model_version=output.get("model_version"),
                             inference_location=output.get("inference_location"),
                             candidates=output.get("disease_candidates", []), crop_candidates=output.get("crop_candidates", []),
                             limitations=output.get("limitations", []),
                             created_at=_parse_datetime(request_row["created_at"]))


def _diagnosis_feedback_response(row) -> DiagnosisFeedbackResponse:
    return DiagnosisFeedbackResponse(
        id=row["id"], diagnosis_id=row["request_id"], confirmed_crop=row["confirmed_crop"], label=row["label"],
        correctness=row["correctness"], share_for_model_improvement=bool(row["share_for_model_improvement"]),
        note=row["note"], reviewer_type="farmer", created_at=_parse_datetime(row["created_at"]),
    )


async def _multipart_parts(request: Request, max_bytes: int) -> dict[str, tuple[dict[str, str], bytes]]:
    content_type = request.headers.get("content-type", "")
    match = re.search(r"boundary=(?:\"([^\"]+)\"|([^;]+))", content_type)
    if not match:
        raise HTTPException(status_code=415, detail="Expected a multipart/form-data request")
    boundary = (match.group(1) or match.group(2)).encode()
    body = await request.body()
    if len(body) > max_bytes:
        raise HTTPException(status_code=413, detail="Uploaded payload is too large")
    parts: dict[str, tuple[dict[str, str], bytes]] = {}
    for raw_part in body.split(b"--" + boundary):
        raw_part = raw_part.strip(b"\r\n-")
        if not raw_part or b"\r\n\r\n" not in raw_part:
            continue
        raw_headers, content = raw_part.split(b"\r\n\r\n", 1)
        headers = {}
        for line in raw_headers.decode("utf-8", errors="replace").split("\r\n"):
            if ":" in line:
                key, value = line.split(":", 1)
                headers[key.lower().strip()] = value.strip()
        disposition = headers.get("content-disposition", "")
        name_match = re.search(r'name="([^"]+)"', disposition)
        if name_match:
            parts[name_match.group(1)] = (headers, content.rstrip(b"\r\n"))
    return parts


def _valid_image(mime_type: str, content: bytes) -> bool:
    if mime_type == "image/jpeg":
        return content.startswith(b"\xff\xd8\xff")
    if mime_type == "image/png":
        return content.startswith(b"\x89PNG\r\n\x1a\n")
    if mime_type == "image/webp":
        return content.startswith(b"RIFF") and content[8:12] == b"WEBP"
    return False


@router.post("/diagnoses", response_model=DiagnosisResponse, status_code=status.HTTP_201_CREATED)
async def create_diagnosis(
    request: Request,
    idempotency_key: str | None = Header(default=None, alias="Idempotency-Key"),
    store: FarmStateStore = Depends(get_farm_store),
):
    parts = await _multipart_parts(request, settings.MAX_DIAGNOSIS_IMAGE_BYTES)
    file_part = parts.get("file") or parts.get("image")
    if not file_part:
        raise HTTPException(status_code=422, detail="Multipart field 'file' is required")
    headers, content = file_part
    mime_type = headers.get("content-type", "").split(";", 1)[0].lower()
    if mime_type not in ALLOWED_IMAGE_TYPES or not _valid_image(mime_type, content):
        raise HTTPException(status_code=415, detail="Only valid JPEG, PNG, or WebP images are accepted")
    field_id = None
    if "field_id" in parts:
        field_id = parts["field_id"][1].decode("utf-8", errors="strict").strip() or None
        if field_id and not store.one("SELECT id FROM fields WHERE id = ? AND active = 1", (field_id,)):
            raise HTTPException(status_code=404, detail="Field not found")
    confirmed_crop = None
    if "confirmed_crop" in parts:
        confirmed_crop = parts["confirmed_crop"][1].decode("utf-8", errors="strict").strip() or None
    request_id = str(uuid4())
    now = iso_now()
    checksum = hashlib.sha256(content).hexdigest()
    payload_data = {"field_id": field_id, "confirmed_crop": confirmed_crop, "mime_type": mime_type, "checksum": checksum}
    try:
        cached = get_idempotent_response(store, idempotency_key, payload_data)
    except ValueError as exc:
        raise HTTPException(status_code=409, detail={"code": "idempotency_key_conflict", "message": str(exc)}) from exc
    if cached is not None:
        return DiagnosisResponse.model_validate(cached)
    upload_dir = Path(settings.FARM_STATE_UPLOAD_DIR).expanduser()
    if not upload_dir.is_absolute():
        upload_dir = Path.cwd() / upload_dir
    upload_dir = upload_dir / store.farmer_key
    upload_dir.mkdir(parents=True, exist_ok=True)
    extension = {"image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp"}[mime_type]
    path = upload_dir / f"{request_id}{extension}"
    path.write_bytes(content)
    outcome = await asyncio.to_thread(diagnose_image, path, confirmed_crop)
    diagnosis_status = outcome["status"]
    store.execute("INSERT INTO diagnosis_requests(id, field_id, status, provider, error, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
                  (request_id, field_id, diagnosis_status, outcome.get("provider", settings.DIAGNOSIS_PROVIDER), outcome.get("error"), now, now))
    store.execute("INSERT INTO diagnosis_images(id, request_id, path, mime_type, size_bytes, checksum, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
                  (str(uuid4()), request_id, str(path), mime_type, len(content), checksum, now))
    store.execute("INSERT INTO diagnoses(id, request_id, label, status, confidence, severity, treatment, provider_output, created_at) VALUES (?, ?, ?, ?, ?, NULL, NULL, ?, ?)",
                  (str(uuid4()), request_id, outcome.get("label"), diagnosis_status, outcome.get("confidence"), json_text(outcome), now))
    result = _diagnosis_response(
        store.one("SELECT * FROM diagnosis_requests WHERE id = ?", (request_id,)),
        store.one("SELECT * FROM diagnoses WHERE request_id = ?", (request_id,)),
    )
    save_idempotent_response(store, idempotency_key, payload_data, result.model_dump(mode="json"), status.HTTP_201_CREATED)
    return result


@router.get("/diagnoses/{diagnosis_id}", response_model=DiagnosisResponse)
def get_diagnosis(diagnosis_id: str, store: FarmStateStore = Depends(get_farm_store)):
    request_row = store.one("SELECT * FROM diagnosis_requests WHERE id = ?", (diagnosis_id,))
    if not request_row:
        raise HTTPException(status_code=404, detail="Diagnosis request not found")
    return _diagnosis_response(request_row, store.one("SELECT * FROM diagnoses WHERE request_id = ?", (diagnosis_id,)))


@router.post("/diagnoses/{diagnosis_id}/feedback", response_model=DiagnosisFeedbackResponse, status_code=status.HTTP_201_CREATED)
def create_diagnosis_feedback(
    diagnosis_id: str,
    payload: DiagnosisFeedbackCreate,
    idempotency_key: str | None = Header(default=None, alias="Idempotency-Key"),
    store: FarmStateStore = Depends(get_farm_store),
):
    """Record consented farmer feedback without exporting or approving it as training data."""
    if not store.one("SELECT id FROM diagnosis_requests WHERE id = ?", (diagnosis_id,)):
        raise HTTPException(status_code=404, detail="Diagnosis request not found")
    payload_data = {"diagnosis_id": diagnosis_id, **payload.model_dump(mode="json")}
    try:
        cached = get_idempotent_response(store, idempotency_key, payload_data)
    except ValueError as exc:
        raise HTTPException(status_code=409, detail={"code": "idempotency_key_conflict", "message": str(exc)}) from exc
    if cached is not None:
        return DiagnosisFeedbackResponse.model_validate(cached)
    feedback_id, now = str(uuid4()), iso_now()
    store.execute(
        """INSERT INTO diagnosis_feedback(
            id, request_id, confirmed_crop, label, correctness, share_for_model_improvement, note, reviewer_type, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 'farmer', ?)""",
        (feedback_id, diagnosis_id, payload.confirmed_crop, payload.label, payload.correctness, int(payload.share_for_model_improvement), payload.note, now),
    )
    result = _diagnosis_feedback_response(store.one("SELECT * FROM diagnosis_feedback WHERE id = ?", (feedback_id,)))
    save_idempotent_response(store, idempotency_key, payload_data, result.model_dump(mode="json"), status.HTTP_201_CREATED)
    return result


@router.post("/advisor/sessions", response_model=AdvisorSessionResponse, status_code=status.HTTP_201_CREATED, deprecated=True)
def create_advisor_session(
    payload: AdvisorSessionCreate,
    idempotency_key: str | None = Header(default=None, alias="Idempotency-Key"),
    store: FarmStateStore = Depends(get_farm_store),
):
    if payload.field_id and not store.one("SELECT id FROM fields WHERE id = ? AND active = 1", (payload.field_id,)):
        raise HTTPException(status_code=404, detail="Field not found")
    payload_data = payload.model_dump(mode="json")
    try:
        cached = get_idempotent_response(store, idempotency_key, payload_data)
    except ValueError as exc:
        raise HTTPException(status_code=409, detail={"code": "idempotency_key_conflict", "message": str(exc)}) from exc
    if cached is not None:
        return AdvisorSessionResponse.model_validate(cached)
    session_id = str(uuid4())
    now = iso_now()
    store.execute("INSERT INTO advisor_sessions(id, field_id, language, status, created_at, updated_at) VALUES (?, ?, ?, 'active', ?, ?)",
                  (session_id, payload.field_id, payload.language, now, now))
    result = _session_response(store.one("SELECT * FROM advisor_sessions WHERE id = ?", (session_id,)))
    save_idempotent_response(store, idempotency_key, payload_data, result.model_dump(mode="json"), status.HTTP_201_CREATED)
    return result


@router.post("/advisor/sessions/{session_id}/messages", response_model=AdvisorMessageResponse, deprecated=True)
def send_advisor_message(
    session_id: str,
    payload: AdvisorMessageCreate,
    idempotency_key: str | None = Header(default=None, alias="Idempotency-Key"),
    store: FarmStateStore = Depends(get_farm_store),
):
    session = store.one("SELECT * FROM advisor_sessions WHERE id = ?", (session_id,))
    if not session:
        raise HTTPException(status_code=404, detail="Advisor session not found")
    payload_data = {"content": payload.content}
    effective_key = idempotency_key or payload.idempotency_key
    try:
        cached = get_idempotent_response(store, effective_key, payload_data)
    except ValueError as exc:
        raise HTTPException(status_code=409, detail={"code": "idempotency_key_conflict", "message": str(exc)}) from exc
    if cached is not None:
        return AdvisorMessageResponse.model_validate(cached)
    now = iso_now()
    store.execute("INSERT INTO advisor_messages(id, session_id, role, content, citations, provider, created_at) VALUES (?, ?, 'user', ?, '[]', NULL, ?)",
                  (str(uuid4()), session_id, payload.content, now))
    safe_response = "Advisor provider unavailable. No farm recommendation was generated. Please retry when the configured provider is available."
    assistant_id = str(uuid4())
    store.execute("INSERT INTO advisor_messages(id, session_id, role, content, citations, provider, created_at) VALUES (?, ?, 'assistant', ?, '[]', ?, ?)",
                  (assistant_id, session_id, safe_response, settings.ADVISOR_PROVIDER, now))
    store.execute("UPDATE advisor_sessions SET updated_at = ? WHERE id = ?", (now, session_id))
    result = _message_response(store.one("SELECT * FROM advisor_messages WHERE id = ?", (assistant_id,)))
    save_idempotent_response(store, effective_key, payload_data, result.model_dump(mode="json"))
    return result


@router.get("/advisor/sessions/{session_id}/stream", deprecated=True)
async def stream_advisor_session(session_id: str, store: FarmStateStore = Depends(get_farm_store)):
    if not store.one("SELECT id FROM advisor_sessions WHERE id = ?", (session_id,)):
        raise HTTPException(status_code=404, detail="Advisor session not found")
    messages = [_message_response(row).model_dump(mode="json") for row in store.all("SELECT * FROM advisor_messages WHERE session_id = ? ORDER BY created_at", (session_id,))]

    async def events() -> AsyncIterator[str]:
        for message in messages:
            yield f"data: {json.dumps(message, ensure_ascii=False)}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(events(), media_type="text/event-stream")


async def _voice_body(request: Request) -> tuple[bytes, str]:
    body = await request.body()
    if not body:
        raise HTTPException(status_code=422, detail="Audio payload is required")
    if len(body) > settings.MAX_VOICE_AUDIO_BYTES:
        raise HTTPException(status_code=413, detail="Audio payload is too large")
    return body, request.headers.get("content-type", "audio/webm").split(";", 1)[0]


def _sarvam_error_message(error: SarvamProviderError) -> str:
    if error.code == "sarvam_not_configured":
        return "Sarvam API is not configured. Set SARVAM_API_KEY on the backend."
    return "Sarvam voice service is temporarily unavailable."


@router.post("/voice/transcribe", response_model=VoiceTranscriptionResponse)
async def transcribe_voice(
    request: Request,
    x_language_code: str | None = Header(default=None, alias="X-Language-Code"),
    language_code: str | None = Query(default=None, min_length=2, max_length=20),
):
    body, mime_type = await _voice_body(request)
    if not sarvam_configured():
        return VoiceTranscriptionResponse(
            status="provider_unavailable", provider="sarvam", message="Sarvam API is not configured. Set SARVAM_API_KEY on the backend."
        )
    try:
        result = await asyncio.to_thread(
            transcribe_audio, body, mime_type=mime_type, language_code=x_language_code or language_code
        )
    except SarvamProviderError as exc:
        return VoiceTranscriptionResponse(status="inconclusive", provider="sarvam", message=_sarvam_error_message(exc))
    return VoiceTranscriptionResponse(
        status="completed", transcript=result.get("transcript"), language_code=result.get("language_code"),
        provider="sarvam", request_id=result.get("request_id"), message="Audio transcribed by Sarvam."
    )


@router.post("/voice/synthesize", response_model=VoiceSynthesisResponse)
async def synthesize_voice(payload: VoiceSynthesisRequest):
    if not sarvam_configured():
        return VoiceSynthesisResponse(
            status="provider_unavailable", provider="sarvam", language_code=payload.language_code,
            message="Sarvam API is not configured. Set SARVAM_API_KEY on the backend."
        )
    try:
        result = await asyncio.to_thread(
            synthesize_speech,
            payload.text,
            language_code=payload.language_code,
            speaker=payload.speaker,
            model=payload.model,
            pace=payload.pace,
            speech_sample_rate=payload.speech_sample_rate,
            output_audio_codec=payload.output_audio_codec,
        )
    except SarvamProviderError as exc:
        return VoiceSynthesisResponse(status="inconclusive", provider="sarvam", language_code=payload.language_code, message=_sarvam_error_message(exc))
    codec = payload.output_audio_codec or settings.SARVAM_TTS_CODEC
    return VoiceSynthesisResponse(
        status="completed", audio_base64=result["audio_base64"], audio_mime_type=f"audio/{codec}",
        language_code=payload.language_code, provider="sarvam", request_id=result.get("request_id"),
        message="Speech synthesized by Sarvam.",
    )


@router.post("/translate", response_model=TranslationResponse)
async def translate_text(payload: TranslationRequest):
    if not sarvam_configured():
        return TranslationResponse(
            status="provider_unavailable", provider="sarvam", target_language_code=payload.target_language_code,
            message="Sarvam API is not configured. Set SARVAM_API_KEY on the backend."
        )
    try:
        from app.services.sarvam import translate_text as sarvam_translate
        result = await asyncio.to_thread(
            sarvam_translate,
            payload.input,
            source_language_code=payload.source_language_code,
            target_language_code=payload.target_language_code,
            model=payload.model,
            mode=payload.mode,
            output_script=payload.output_script,
        )
    except SarvamProviderError as exc:
        return TranslationResponse(status="inconclusive", provider="sarvam", message=_sarvam_error_message(exc))
    return TranslationResponse(
        status="completed", translated_text=result.get("translated_text"),
        source_language_code=result.get("source_language_code") or payload.source_language_code,
        target_language_code=payload.target_language_code, provider="sarvam",
        request_id=result.get("request_id"), message="Text translated by Sarvam.",
    )


@router.post("/voice/turns", response_model=VoiceTurnResponse)
async def voice_turn(request: Request, x_language_code: str | None = Header(default=None, alias="X-Language-Code")):
    body, mime_type = await _voice_body(request)
    if settings.VOICE_PROVIDER.strip().lower() == "unconfigured":
        return VoiceTurnResponse(status="provider_unavailable", provider=settings.VOICE_PROVIDER,
                                 message="Voice provider unavailable. Audio was received but no transcript or spoken response was generated.")
    if settings.VOICE_PROVIDER.strip().lower() != "sarvam":
        return VoiceTurnResponse(status="provider_unavailable", provider=settings.VOICE_PROVIDER,
                                 message="The configured voice provider is not implemented by this backend adapter.")
    if not sarvam_configured():
        return VoiceTurnResponse(status="provider_unavailable", provider="sarvam",
                                 message="Sarvam API is not configured. Set SARVAM_API_KEY on the backend.")
    try:
        transcription = await asyncio.to_thread(
            transcribe_audio, body, mime_type=mime_type, language_code=x_language_code
        )
        transcript = (transcription.get("transcript") or "").strip()
        language_code = transcription.get("language_code") or settings.SARVAM_STT_LANGUAGE_CODE
        if not transcript:
            return VoiceTurnResponse(status="inconclusive", provider="sarvam", language=language_code,
                                     message="Sarvam did not detect speech in the audio.")
        response_text = "Speech transcribed by Sarvam. Farm advisor responses are not configured yet."
        audio = await asyncio.to_thread(
            synthesize_speech, response_text, language_code=language_code if language_code != "unknown" else "en-IN"
        )
    except SarvamProviderError as exc:
        return VoiceTurnResponse(status="inconclusive", provider="sarvam", message=_sarvam_error_message(exc))
    return VoiceTurnResponse(
        status="completed", transcript=transcript, language=language_code,
        audio_base64=audio.get("audio_base64"), audio_mime_type=f"audio/{settings.SARVAM_TTS_CODEC}",
        provider="sarvam", message=response_text,
    )

