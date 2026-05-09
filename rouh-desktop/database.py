from __future__ import annotations

from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import DeclarativeBase, scoped_session, sessionmaker

from config import config


class Base(DeclarativeBase):
    pass


engine = create_engine(
    config.sqlalchemy_database_uri,
    pool_pre_ping=True,
    pool_recycle=280,
    future=True,
)
SessionLocal = scoped_session(
    sessionmaker(bind=engine, autoflush=False, autocommit=False, expire_on_commit=False)
)


def init_db() -> None:
    from models.db_models import BaseModelImport  # noqa: F401

    Base.metadata.create_all(bind=engine)
    run_lightweight_migrations()


def run_lightweight_migrations() -> None:
    """Ajoute les petites colonnes manquantes quand une base Vercel/Neon existe deja."""
    inspector = inspect(engine)
    if "users" not in inspector.get_table_names():
        return
    existing = {column["name"] for column in inspector.get_columns("users")}
    missing_columns = {
        "reset_token_hash": "VARCHAR(255) DEFAULT ''",
        "reset_token_expires_at": "TIMESTAMP NULL",
    }
    with engine.begin() as connection:
        for name, ddl_type in missing_columns.items():
            if name in existing:
                continue
            if engine.dialect.name == "postgresql":
                connection.execute(text(f"ALTER TABLE users ADD COLUMN IF NOT EXISTS {name} {ddl_type}"))
            else:
                connection.execute(text(f"ALTER TABLE users ADD COLUMN {name} {ddl_type}"))


def get_session():
    return SessionLocal()


def remove_session(exception: BaseException | None = None) -> None:
    SessionLocal.remove()
