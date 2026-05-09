from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parent
IS_VERCEL = os.getenv("VERCEL", "").lower() == "1" or os.getenv("VERCEL_ENV", "") != ""


def load_dotenv(path: Path | None = None) -> None:
    """Small .env loader so the app works even before python-dotenv is installed."""
    env_path = path or BASE_DIR / ".env"
    if not env_path.exists():
        return
    for raw_line in env_path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))


load_dotenv()


@dataclass(frozen=True)
class Config:
    SECRET_KEY: str = os.getenv("SECRET_KEY", "dev-change-me")
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:////tmp/rouh_local.db" if IS_VERCEL else f"sqlite:///{BASE_DIR / 'rouh_local.db'}")
    FLASK_ENV: str = os.getenv("FLASK_ENV", "development")
    IS_VERCEL: bool = IS_VERCEL
    SESSION_COOKIE_SECURE: bool = os.getenv("SESSION_COOKIE_SECURE", "false").lower() == "true"
    SESSION_COOKIE_HTTPONLY: bool = True
    SESSION_COOKIE_SAMESITE: str = os.getenv("SESSION_COOKIE_SAMESITE", "Lax")
    MAX_CONTENT_LENGTH: int = 5 * 1024 * 1024
    SMTP_HOST: str = os.getenv("SMTP_HOST", "smtp.gmail.com")
    SMTP_PORT: int = int(os.getenv("SMTP_PORT", "587"))
    SMTP_USER: str = os.getenv("SMTP_USER", "contact.rouh.ma@gmail.com")
    SMTP_PASSWORD: str = os.getenv("SMTP_PASSWORD", "")
    SMTP_FROM: str = os.getenv("SMTP_FROM", os.getenv("SMTP_USER", "contact.rouh.ma@gmail.com"))

    @property
    def sqlalchemy_database_uri(self) -> str:
        if self.DATABASE_URL.startswith("postgres://"):
            return self.DATABASE_URL.replace("postgres://", "postgresql+psycopg://", 1)
        if self.DATABASE_URL.startswith("postgresql://"):
            return self.DATABASE_URL.replace("postgresql://", "postgresql+psycopg://", 1)
        return self.DATABASE_URL


config = Config()
