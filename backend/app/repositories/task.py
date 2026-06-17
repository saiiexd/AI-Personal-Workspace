import uuid
from datetime import datetime
from typing import List, Optional
from sqlalchemy import select, and_, or_
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.models import Task, TaskCategory, TaskStatus, TaskPriority
from app.repositories.base import BaseRepository

class TaskRepository(BaseRepository[Task]):
    def __init__(self):
        super().__init__(Task)

    async def get_by_workspace(
        self,
        db: AsyncSession,
        workspace_id: uuid.UUID,
        *,
        status: Optional[TaskStatus] = None,
        priority: Optional[TaskPriority] = None,
        category_id: Optional[uuid.UUID] = None,
        skip: int = 0,
        limit: int = 100
    ) -> List[Task]:
        """Fetch tasks within a workspace with filter criteria (excluding soft deleted)."""
        conditions = [
            Task.workspace_id == workspace_id,
            Task.deleted_at.is_(None)
        ]
        
        if status:
            conditions.append(Task.status == status)
        if priority:
            conditions.append(Task.priority == priority)
        if category_id:
            conditions.append(Task.category_id == category_id)

        stmt = select(Task).where(and_(*conditions)).offset(skip).limit(limit)
        result = await db.execute(stmt)
        return list(result.scalars().all())

    async def get_due_tasks(
        self, db: AsyncSession, workspace_id: uuid.UUID, start_time: datetime, end_time: datetime
    ) -> List[Task]:
        """Fetch active tasks that have due dates falling inside a window."""
        stmt = select(Task).where(
            Task.workspace_id == workspace_id,
            Task.due_date >= start_time,
            Task.due_date <= end_time,
            Task.status != TaskStatus.DONE,
            Task.deleted_at.is_(None)
        )
        result = await db.execute(stmt)
        return list(result.scalars().all())

    async def create_category(
        self, db: AsyncSession, *, workspace_id: uuid.UUID, name: str, color: str = "#000000"
    ) -> TaskCategory:
        """Create a new TaskCategory in a workspace."""
        cat = TaskCategory(workspace_id=workspace_id, name=name, color=color)
        db.add(cat)
        await db.flush()
        return cat

    async def get_categories(self, db: AsyncSession, workspace_id: uuid.UUID) -> List[TaskCategory]:
        """Fetch all task categories in a workspace."""
        stmt = select(TaskCategory).where(TaskCategory.workspace_id == workspace_id)
        result = await db.execute(stmt)
        return list(result.scalars().all())

    async def soft_delete(self, db: AsyncSession, id: uuid.UUID) -> Optional[Task]:
        """Soft delete a task."""
        task = await self.get(db, id)
        if task:
            task.delete()
            db.add(task)
            await db.flush()
        return task

task_repo = TaskRepository()
