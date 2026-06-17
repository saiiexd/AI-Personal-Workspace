import asyncio
import pytest
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from app.main import app
from app.core.config import settings
from app.database.base import Base
from app.database.session import get_db

# Configure test database URL. We append _test to database name.
db_url = str(settings.DATABASE_URL)
if db_url.endswith("/ai_workspace"):
    test_db_url = db_url.replace("/ai_workspace", "/ai_workspace_test")
else:
    test_db_url = db_url + "_test"

if test_db_url.startswith("postgresql://"):
    test_db_url = test_db_url.replace("postgresql://", "postgresql+asyncpg://", 1)
elif test_db_url.startswith("postgresql+psycopg2://"):
    test_db_url = test_db_url.replace("postgresql+psycopg2://", "postgresql+asyncpg://", 1)

# Create test engine
test_engine = create_async_engine(
    test_db_url,
    echo=False,
    future=True,
    pool_pre_ping=True
)

TestAsyncSessionLocal = async_sessionmaker(
    bind=test_engine,
    autocommit=False,
    autoflush=False,
    expire_on_commit=False,
    class_=AsyncSession
)

@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for each test case."""
    policy = asyncio.get_event_loop_policy()
    loop = policy.new_event_loop()
    yield loop
    loop.close()

@pytest.fixture(scope="session", autouse=True)
async def setup_test_database():
    """Initialize test database: enable extensions, drop and recreate all tables."""
    async with test_engine.begin() as conn:
        # Enable vector extension
        await conn.execute(Base.metadata.schema.default_schema if hasattr(Base.metadata.schema, "default_schema") else "CREATE EXTENSION IF NOT EXISTS vector;")
        # Drop and recreate tables
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
        
        # Manually create hnsw index if needed
        try:
            await conn.execute("CREATE INDEX IF NOT EXISTS idx_doc_chunks_embedding_hnsw ON document_chunks USING hnsw (embedding vector_cosine_ops);")
        except Exception:
            pass # HNSW may fail if pgvector < 0.5.0, fallback to default index
            
    yield
    
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await test_engine.dispose()

@pytest.fixture
async def db_session() -> AsyncSession:
    """Provide a transactional database session that rolls back all operations after the test."""
    connection = await test_engine.connect()
    transaction = await connection.begin()
    session = AsyncSession(bind=connection, expire_on_commit=False)

    yield session

    await session.close()
    await transaction.rollback()
    await connection.close()

@pytest.fixture
async def async_client(db_session: AsyncSession):
    """Provide an AsyncClient configured to use the test database session."""
    # Override get_db dependency
    async def _get_test_db():
        yield db_session

    app.dependency_overrides[get_db] = _get_test_db
    
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        yield client
        
    app.dependency_overrides.clear()
