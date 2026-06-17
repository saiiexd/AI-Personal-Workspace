import uuid
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status
from app.database.models import Workspace, User
from app.repositories.workspace import workspace_repo
from app.repositories.audit import audit_repo
from app.schemas.workspace import WorkspaceCreate, WorkspaceUpdate

class WorkspaceService:
    async def create_workspace(
        self, db: AsyncSession, *, owner_id: uuid.UUID, workspace_in: WorkspaceCreate
    ) -> Workspace:
        """Create a new workspace for the user, validating uniqueness of slug for the owner."""
        # 1. Verify slug uniqueness for this user
        existing = await workspace_repo.get_by_slug(db, owner_id=owner_id, slug=workspace_in.slug)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Workspace with slug '{workspace_in.slug}' already exists for this account."
            )
            
        # 2. Create the workspace
        workspace_data = workspace_in.model_dump()
        workspace_data["owner_id"] = owner_id
        
        workspace = await workspace_repo.create(db, obj_in=workspace_data)
        
        # 3. Audit Logging
        await audit_repo.log_activity(
            db,
            workspace_id=workspace.id,
            user_id=owner_id,
            action="create",
            entity_type="workspace",
            entity_id=workspace.id,
            metadata_json={"slug": workspace.slug, "name": workspace.name}
        )
        
        return workspace

    async def update_workspace(
        self, db: AsyncSession, *, workspace_id: uuid.UUID, user_id: uuid.UUID, workspace_in: WorkspaceUpdate
    ) -> Workspace:
        """Update workspace details after checking uniqueness constraints on slug changes."""
        workspace = await workspace_repo.get(db, id=workspace_id)
        if not workspace or workspace.deleted_at is not None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Workspace not found."
            )
            
        if workspace.owner_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions to access this workspace."
            )

        # Handle slug uniqueness validation
        if workspace_in.slug and workspace_in.slug != workspace.slug:
            existing = await workspace_repo.get_by_slug(db, owner_id=user_id, slug=workspace_in.slug)
            if existing:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Workspace with slug '{workspace_in.slug}' already exists for this account."
                )

        updated_workspace = await workspace_repo.update(db, db_obj=workspace, obj_in=workspace_in)
        
        await audit_repo.log_activity(
            db,
            workspace_id=workspace.id,
            user_id=user_id,
            action="update",
            entity_type="workspace",
            entity_id=workspace.id,
            metadata_json={"updated_fields": list(workspace_in.model_dump(exclude_unset=True).keys())}
        )
        
        return updated_workspace

    async def soft_delete_workspace(
        self, db: AsyncSession, *, workspace_id: uuid.UUID, user_id: uuid.UUID
    ) -> Workspace:
        """Soft delete a workspace."""
        workspace = await workspace_repo.get(db, id=workspace_id)
        if not workspace or workspace.deleted_at is not None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Workspace not found."
            )
            
        if workspace.owner_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions to delete this workspace."
            )

        deleted_workspace = await workspace_repo.soft_delete(db, id=workspace_id)
        
        await audit_repo.log_activity(
            db,
            workspace_id=workspace_id,
            user_id=user_id,
            action="soft_delete",
            entity_type="workspace",
            entity_id=workspace_id
        )
        
        return deleted_workspace

    async def restore_workspace(
        self, db: AsyncSession, *, workspace_id: uuid.UUID, user_id: uuid.UUID
    ) -> Workspace:
        """Restore an archived / soft-deleted workspace."""
        workspace = await workspace_repo.get(db, id=workspace_id)
        if not workspace:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Workspace not found."
            )
            
        if workspace.owner_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions to access this workspace."
            )

        if workspace.deleted_at is None:
            return workspace
            
        workspace.restore()
        db.add(workspace)
        await db.flush()
        
        await audit_repo.log_activity(
            db,
            workspace_id=workspace_id,
            user_id=user_id,
            action="restore",
            entity_type="workspace",
            entity_id=workspace_id
        )
        
        return workspace

workspace_service = WorkspaceService()
