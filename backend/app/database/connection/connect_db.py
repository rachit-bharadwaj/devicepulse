from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from app.config import settings

# Create engine with connection pool configurations
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,  # Automatically tests connection viability before checkout
    pool_size=5,         # Maintain a pool of up to 5 connections
    max_overflow=10,     # Allow up to 10 additional overflow connections
)

# Create session factory
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)


def connect_db() -> Generator[Session, None, None]:
    """
    FastAPI dependency that provides a transactional database session.
    Closes the session automatically after the request finishes.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
