from __future__ import annotations

from sqlalchemy import create_engine
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


def get_session():
    return SessionLocal()


def remove_session(exception: BaseException | None = None) -> None:
    SessionLocal.remove()
