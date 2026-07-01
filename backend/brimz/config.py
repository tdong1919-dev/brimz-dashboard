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

    # Look for .env at repo root as well as backend/.
    model_config = SettingsConfigDict(
        env_file=(".env", "../.env"), env_file_encoding="utf-8", extra="ignore"
    )


settings = Settings()
