from sqlmodel import Session, SQLModel, create_engine

from app.config import settings

connect_args = (
    {"check_same_thread": False} if settings.database_url.startswith("sqlite") else {}
)
engine = create_engine(settings.database_url, connect_args=connect_args)


def create_db_and_tables() -> None:
    """Create all tables. Safe to call multiple times."""
    SQLModel.metadata.create_all(engine)


def get_session():
    """FastAPI dependency that yields a DB session per request."""
    with Session(engine) as session:
        yield session
