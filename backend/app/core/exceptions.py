from fastapi import Request
from fastapi.responses import JSONResponse
import logging

logger = logging.getLogger("app")

class NotFoundException(Exception):
    def __init__(self, name: str, item_id: str):
        self.name = name
        self.item_id = item_id

async def not_found_exception_handler(request: Request, exc: NotFoundException):
    logger.warning(f"{exc.name} with id {exc.item_id} not found.")
    return JSONResponse(
        status_code=404,
        content={"message": f"{exc.name} not found", "id": exc.item_id},
    )

class NotAuthorizedException(Exception):
    def __init__(self, message: str = "Not authorized"):
        self.message = message

async def not_authorized_exception_handler(request: Request, exc: NotAuthorizedException):
    logger.warning(f"Unauthorized access attempt: {exc.message}")
    return JSONResponse(
        status_code=403,
        content={"message": exc.message},
    )
