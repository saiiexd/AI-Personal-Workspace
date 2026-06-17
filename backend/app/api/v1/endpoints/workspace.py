from typing import List
import uuid
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db, get_current_user
from app.api.workspace_deps import get_current_workspace
from app.database.models import User, Workspace
from app.schemas.workspace import WorkspaceCreate, WorkspaceUpdate, WorkspaceResponse
from app.services.workspace import workspace_service
from app.repositories.workspace import workspace_repo

router = APIRouter()

@router.post("/", response_model=WorkspaceResponse, status_code=status.HTTP_201_CREATED)
async def create_workspace(
    workspace_in: WorkspaceCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> Workspace:
    """Create a new workspace for the authenticated user."""
    return await workspace_service.create_workspace(
        db, owner_id=current_user.id, workspace_in=workspace_in
    )

@router.get("/", response_model=List[WorkspaceResponse])
async def list_workspaces(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> List[Workspace]:
    """Retrieve all workspaces belonging to the authenticated user."""
    return await workspace_repo.get_by_owner(db, owner_id=current_user.id)

@router.get("/{workspace_id}", response_model=WorkspaceResponse)
async def get_workspace(
    workspace: Workspace = Depends(get_current_workspace)
) -> Workspace:
    """Retrieve detailed information of a specific workspace."""
    return workspace

@router.put("/{workspace_id}", response_model=WorkspaceResponse)
async def update_workspace(
    workspace_in: WorkspaceUpdate,
    workspace: Workspace = Depends(get_current_workspace),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> Workspace:
    """Update workspace information (title, slug, metadata)."""
    return await workspace_service.update_workspace(
        db, workspace_id=workspace.id, user_id=current_user.id, workspace_in=workspace_in
    )

@router.delete("/{workspace_id}", response_model=WorkspaceResponse)
async def delete_workspace(
    workspace: Workspace = Depends(get_current_workspace),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> Workspace:
    """Soft delete a workspace and prevent access to its resources."""
    return await workspace_service.soft_delete_workspace(
        db, workspace_id=workspace.id, user_id=current_user.id
    )

@router.post("/{workspace_id}/restore", response_model=WorkspaceResponse)
async def restore_workspace(
    workspace_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> Workspace:
    """Restore a previously archived/deleted workspace."""
    return await workspace_service.restore_workspace(
        db, workspace_id=workspace_id, user_id=current_user.id
    )
