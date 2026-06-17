from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.api import api_router
from app.core.config import settings
from app.core.logging import logger

def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.PROJECT_NAME,
        version=settings.VERSION,
        openapi_url=f"{settings.API_V1_STR}/openapi.json"
    )

    if settings.BACKEND_CORS_ORIGINS:
        app.add_middleware(
            CORSMiddleware,
            allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )

    app.include_router(api_router, prefix=settings.API_V1_STR)
    
    @app.on_event("startup")
    async def startup_event():
        logger.info("Starting up application")
        from app.database.session import verify_db_connection
        db_ok = await verify_db_connection()
        if not db_ok:
            logger.error("Failed to connect to the database on startup. Exiting...")
            raise RuntimeError("Database connection failure")
            
    @app.on_event("shutdown")
    async def shutdown_event():
        logger.info("Shutting down application")
        from app.database.session import close_db_connection
        await close_db_connection()
        
    return app

app = create_app()
