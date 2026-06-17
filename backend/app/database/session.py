import time
from typing import AsyncGenerator
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from app.core.config import settings
from app.core.logging import logger

# Convert standard postgresql/psycopg2 URL to asyncpg
db_url = str(settings.DATABASE_URL)
if db_url.startswith("postgresql://"):
    db_url = db_url.replace("postgresql://", "postgresql+asyncpg://", 1)
elif db_url.startswith("postgresql+psycopg2://"):
    db_url = db_url.replace("postgresql+psycopg2://", "postgresql+asyncpg://", 1)

logger.info(f"Initializing Async Database Engine with URL: {db_url.split('@')[-1]}")

# Create async engine with robust production settings
engine = create_async_engine(
    db_url,
    echo=False,
    future=True,
    pool_pre_ping=True,       # Check connections before using them
    pool_size=20,             # Keep up to 20 connections open
    max_overflow=10,          # Allow up to 10 additional connections
    pool_recycle=3600,        # Recycle connections older than 1 hour
    pool_timeout=30           # Seconds to wait before throwing a timeout
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    autocommit=False,
    autoflush=False,
    expire_on_commit=False,
    class_=AsyncSession
)

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Dependency injection helper for FastAPI endpoints to get an async database session."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception as e:
            await session.rollback()
            logger.error(f"Database transaction error: {str(e)}")
            raise
        finally:
            await session.close()

async def verify_db_connection() -> bool:
    """Verifies connection to the database by running a simple query (SELECT 1)."""
    start_time = time.time()
    max_retries = 5
    retry_delay = 2.0
    
    for attempt in range(1, max_retries + 1):
        try:
            async with AsyncSessionLocal() as session:
                result = await session.execute(text("SELECT 1"))
                val = result.scalar()
                if val == 1:
                    logger.info("Database connection verified successfully.")
                    return True
        except Exception as e:
            logger.warning(f"Database connection attempt {attempt}/{max_retries} failed: {str(e)}")
            if attempt < max_retries:
                time.sleep(retry_delay)
            else:
                logger.error("Database connection verification failed after all attempts.")
    return False

async def close_db_connection() -> None:
    """Gracefully disposes the database engine pool."""
    logger.info("Closing database engine connections...")
    await engine.dispose()
    logger.info("Database engine connections closed.")
