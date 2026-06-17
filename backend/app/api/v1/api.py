from fastapi import APIRouter
from app.api.v1.endpoints import auth, user, workspace, note, task, document, ai

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(user.router, prefix="/users", tags=["users"])
api_router.include_router(workspace.router, prefix="/workspaces", tags=["workspaces"])
api_router.include_router(note.router, prefix="/notes", tags=["notes"])
api_router.include_router(task.router, prefix="/workspaces", tags=["tasks"])
api_router.include_router(document.router, prefix="/workspaces", tags=["documents"])
api_router.include_router(ai.router, prefix="/workspaces", tags=["ai"])
