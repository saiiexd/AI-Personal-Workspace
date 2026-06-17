import uuid
from fastapi import Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_db, get_current_user
from app.database.models import User, Workspace
from app.repositories.workspace import workspace_repo

async def get_current_workspace(
    workspace_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> Workspace:
    """
    FastAPI dependency that resolves a workspace by ID,
    ensuring it exists, is not deleted, and belongs to the authenticated user.
    Enforces tenant boundaries at request boundary.
    """
    workspace = await workspace_repo.get(db, workspace_id)
    if not workspace or workspace.deleted_at is not None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workspace not found or has been deleted."
        )
        
    if workspace.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this workspace."
        )
        
    return workspace
