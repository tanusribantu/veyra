import os
import sys
from logging.config import fileConfig
from pathlib import Path
from sqlalchemy import engine_from_config, pool, create_engine
from alembic import context

# Ensure project root is in sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from dotenv import load_dotenv
load_dotenv(PROJECT_ROOT / ".env")

from backend.app.config import config_by_name
from backend.app.models.base import db
import backend.app.models  # noqa: F401 - register all models

config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = db.metadata

env_name = os.getenv("FLASK_ENV", "development")
app_config = config_by_name.get(env_name, config_by_name["development"])
db_uri = app_config.SQLALCHEMY_DATABASE_URI or "sqlite:///instance/veyra.db"


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode."""
    context.configure(
        url=db_uri,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        render_as_batch=True if db_uri.startswith("sqlite") else False,
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode."""
    connectable = create_engine(
        db_uri,
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            render_as_batch=True if db_uri.startswith("sqlite") else False,
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
