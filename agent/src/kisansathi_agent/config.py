from __future__ import annotations

import os
import re
from dataclasses import dataclass


_FARMER_ID_PATTERN = re.compile(r"^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$")


@dataclass(frozen=True, slots=True)
class Settings:
    """Configuration supplied by the trusted MCP launcher, not by the model."""

    backend_url: str
    farmer_id: str
    timeout_seconds: float = 20.0
    max_response_bytes: int = 12_000

    def __post_init__(self) -> None:
        backend_url = self.backend_url.rstrip("/")
        if not backend_url.startswith(("http://", "https://")):
            raise ValueError("backend_url must use http:// or https://")
        if not _FARMER_ID_PATTERN.fullmatch(self.farmer_id):
            raise ValueError(
                "farmer_id must contain 1-64 letters, numbers, '.', '_', or '-' "
                "and must start with a letter or number"
            )
        if self.timeout_seconds <= 0:
            raise ValueError("timeout_seconds must be greater than zero")
        if self.max_response_bytes < 1_024:
            raise ValueError("max_response_bytes must be at least 1024")
        object.__setattr__(self, "backend_url", backend_url)

    @classmethod
    def from_env(cls) -> "Settings":
        backend_url = os.getenv("KISANSATHI_BACKEND_URL", "http://127.0.0.1:8000")
        farmer_id = os.getenv("KISANSATHI_FARMER_ID")
        if not farmer_id:
            raise ValueError("KISANSATHI_FARMER_ID must be set for the MCP server")
        timeout = float(os.getenv("KISANSATHI_TIMEOUT_SECONDS", "20"))
        max_response_bytes = int(os.getenv("KISANSATHI_MAX_RESPONSE_BYTES", "12000"))
        return cls(
            backend_url=backend_url,
            farmer_id=farmer_id,
            timeout_seconds=timeout,
            max_response_bytes=max_response_bytes,
        )

