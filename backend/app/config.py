import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent


def normalize_database_url(url: str | None) -> str | None:
    """Normalize database connection string for SQLAlchemy 2.0+ and PostgreSQL drivers."""
    if not url:
        return url
    # SQLAlchemy requires postgresql:// instead of postgres://
    if url.startswith("postgres://"):
        return url.replace("postgres://", "postgresql+psycopg2://", 1)
    if url.startswith("postgresql://") and not url.startswith("postgresql+"):
        return url.replace("postgresql://", "postgresql+psycopg2://", 1)
    return url


class Config:
    """Base application configuration."""
    SECRET_KEY = os.getenv("SECRET_KEY", "veyra-insecure-dev-secret-key-replace-in-prod")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    API_PREFIX = "/api/v1"
    CORS_ORIGINS = [
        origin.strip()
        for origin in os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000").split(",")
        if origin.strip()
    ]

    # Supabase Configuration
    SUPABASE_URL = os.getenv("SUPABASE_URL", "").rstrip("/")
    SUPABASE_PUBLISHABLE_KEY = os.getenv("SUPABASE_PUBLISHABLE_KEY", "")
    SUPABASE_SECRET_KEY = os.getenv("SUPABASE_SECRET_KEY", "")
    ALLOW_DEV_AUTH_OVERRIDE = False


class DevelopmentConfig(Config):
    """Development configuration using SQLite by default, or Supabase Postgres if DATABASE_URL is set."""
    DEBUG = True
    INSTANCE_DIR = BASE_DIR / "instance"
    INSTANCE_DIR.mkdir(parents=True, exist_ok=True)
    raw_url = os.getenv("DATABASE_URL")
    if raw_url:
        SQLALCHEMY_DATABASE_URI = normalize_database_url(raw_url)
    else:
        SQLALCHEMY_DATABASE_URI = f"sqlite:///{INSTANCE_DIR / 'veyra.db'}"

    # Explicit flag to allow X-User-ID header strictly during local testing/dev
    ALLOW_DEV_AUTH_OVERRIDE = os.getenv("ALLOW_DEV_AUTH_OVERRIDE", "false").lower() in ("true", "1", "yes")


class TestingConfig(Config):
    """Testing configuration using in-memory SQLite."""
    TESTING = True
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"
    ALLOW_DEV_AUTH_OVERRIDE = True


class ProductionConfig(Config):
    """Production configuration with strict security."""
    DEBUG = False
    raw_url = os.getenv("DATABASE_URL", "sqlite:///instance/veyra.db")
    SQLALCHEMY_DATABASE_URI = normalize_database_url(raw_url)
    # Strictly disallow dev auth bypass in production under all circumstances
    ALLOW_DEV_AUTH_OVERRIDE = False


config_by_name = {
    "development": DevelopmentConfig,
    "testing": TestingConfig,
    "production": ProductionConfig,
}
