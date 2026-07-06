"""Application settings, loaded from environment / .env."""
from __future__ import annotations

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # Points at the Docker Postgres published on host :5433 by default.
    database_url: str = "postgresql+psycopg://brimz:brimz@localhost:5433/brimz"

    # Fitbit — only needed live in Milestone 4.
    fitbit_client_id: str = ""
    fitbit_client_secret: str = ""

    # How many detailed attendee rows the seeder generates.
    seed_attendees: int = 500

    # --- API (Milestone 2) ---
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    # CORS origins allowed to call the API (the dashboard dev server). Comma-separated.
    api_cors_origins: str = "http://localhost:5173,http://localhost:4173"

    # --- Auth (Milestone 3) ---
    # HS256 signing key for JWTs. The default is fine for local dev/demo; set a
    # long random value in production (.env).
    auth_secret_key: str = "brimz-dev-secret-change-me-not-for-production"
    auth_access_ttl_minutes: int = 30
    auth_refresh_ttl_days: int = 7
    # Passwords given to the three seeded demo users (printed by `brimz seed`).
    seed_admin_password: str = "brimz-admin"
    seed_manager_password: str = "brimz-manager"
    seed_viewer_password: str = "brimz-viewer"

    # --- Playback / simulation engine (Milestone 2) ---
    # Wall-clock seconds for one full replay of an event window (compresses a
    # multi-hour event into a demo-friendly loop). 300s => a 5h event loops every 5 min.
    playback_loop_seconds: float = 300.0
    # How often the live WebSocket pushes a tick, in wall-clock seconds.
    playback_tick_seconds: float = 2.0
    # Which event the playback engine drives by default (the fully-simulated demo event).
    playback_default_event_id: int = 1

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.api_cors_origins.split(",") if o.strip()]

    # Look for .env at repo root as well as backend/.
    model_config = SettingsConfigDict(
        env_file=(".env", "../.env"), env_file_encoding="utf-8", extra="ignore"
    )


settings = Settings()
