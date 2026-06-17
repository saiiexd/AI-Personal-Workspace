import uuid
from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.models import Workspace
from app.repositories.base import BaseRepository

class WorkspaceRepository(BaseRepository[Workspace]):
    def __init__(self):
        super().__init__(Workspace)

    async def get_by_owner(self, db: AsyncSession, owner_id: uuid.UUID) -> List[Workspace]:
        """Get all workspaces belonging to an owner (excluding soft deleted)."""
        stmt = select(Workspace).where(
            Workspace.owner_id == owner_id,
            Workspace.deleted_at.is_(None)
        )
        result = await db.execute(stmt)
        return list(result.scalars().all())

    async def get_by_slug(self, db: AsyncSession, owner_id: uuid.UUID, slug: str) -> Optional[Workspace]:
        """Fetch workspace by slug for tenant verification."""
        stmt = select(Workspace).where(
            Workspace.owner_id == owner_id,
            Workspace.slug == slug,
            Workspace.deleted_at.is_(None)
        )
        result = await db.execute(stmt)
        return result.scalars().first()

    async def verify_ownership(self, db: AsyncSession, workspace_id: uuid.UUID, user_id: uuid.UUID) -> bool:
        """Verify that a user is the owner of a workspace."""
        workspace = await self.get(db, workspace_id)
        if not workspace or workspace.deleted_at is not None:
            return False
        return workspace.owner_id == user_id

    async def soft_delete(self, db: AsyncSession, id: uuid.UUID) -> Optional[Workspace]:
        """Soft delete a workspace."""
        workspace = await self.get(db, id)
        if workspace:
            workspace.delete()
            db.add(workspace)
            await db.flush()
        return workspace

workspace_repo = WorkspaceRepository()
