import uuid
from typing import List, Optional
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status

from app.database.models import Task, TaskCategory, TaskStatus, TaskPriority, Workspace
from app.repositories.task import task_repo
from app.repositories.workspace import workspace_repo
from app.schemas.task import TaskCreate, TaskUpdate, TaskCategoryCreate, TaskCategoryUpdate

class TaskService:
    async def get_workspace(self, db: AsyncSession, workspace_id: uuid.UUID, user_id: uuid.UUID) -> Workspace:
        """Validate workspace access and return workspace."""
        workspace = await workspace_repo.get(db, workspace_id)
        if not workspace:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Workspace not found")
        # In a real app we'd verify user is a member of the workspace.
        return workspace

    async def create_task(self, db: AsyncSession, *, workspace_id: uuid.UUID, user_id: uuid.UUID, task_in: TaskCreate) -> Task:
        await self.get_workspace(db, workspace_id, user_id)
        
        # Verify category belongs to workspace if provided
        if task_in.category_id:
            category = await db.get(TaskCategory, task_in.category_id)
            if not category or category.workspace_id != workspace_id:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid category ID")
                
        # Basic task creation (assignee left as-is, could validate if in workspace)
        task = await task_repo.create(db, obj_in={**task_in.model_dump(), "workspace_id": workspace_id})
        await db.commit()
        await db.refresh(task)
        return task

    async def get_task(self, db: AsyncSession, *, task_id: uuid.UUID, workspace_id: uuid.UUID, user_id: uuid.UUID) -> Task:
        await self.get_workspace(db, workspace_id, user_id)
        task = await task_repo.get(db, id=task_id)
        if not task or task.workspace_id != workspace_id or task.deleted_at is not None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
        return task

    async def get_tasks(
        self, db: AsyncSession, *, workspace_id: uuid.UUID, user_id: uuid.UUID,
        status: Optional[TaskStatus] = None,
        priority: Optional[TaskPriority] = None,
        category_id: Optional[uuid.UUID] = None,
        skip: int = 0, limit: int = 100
    ) -> List[Task]:
        await self.get_workspace(db, workspace_id, user_id)
        return await task_repo.get_by_workspace(
            db, workspace_id=workspace_id, status=status, priority=priority,
            category_id=category_id, skip=skip, limit=limit
        )

    async def update_task(self, db: AsyncSession, *, task_id: uuid.UUID, workspace_id: uuid.UUID, user_id: uuid.UUID, task_in: TaskUpdate) -> Task:
        task = await self.get_task(db, task_id=task_id, workspace_id=workspace_id, user_id=user_id)
        
        if task_in.category_id is not None:
            category = await db.get(TaskCategory, task_in.category_id)
            if not category or category.workspace_id != workspace_id:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid category ID")
                
        update_data = task_in.model_dump(exclude_unset=True)
        task = await task_repo.update(db, db_obj=task, obj_in=update_data)
        await db.commit()
        await db.refresh(task)
        return task

    async def delete_task(self, db: AsyncSession, *, task_id: uuid.UUID, workspace_id: uuid.UUID, user_id: uuid.UUID) -> Task:
        task = await self.get_task(db, task_id=task_id, workspace_id=workspace_id, user_id=user_id)
        task = await task_repo.soft_delete(db, id=task_id)
        await db.commit()
        return task

    # Task Category operations
    async def create_category(self, db: AsyncSession, *, workspace_id: uuid.UUID, user_id: uuid.UUID, category_in: TaskCategoryCreate) -> TaskCategory:
        await self.get_workspace(db, workspace_id, user_id)
        category = await task_repo.create_category(db, workspace_id=workspace_id, name=category_in.name, color=category_in.color)
        await db.commit()
        await db.refresh(category)
        return category

    async def get_categories(self, db: AsyncSession, *, workspace_id: uuid.UUID, user_id: uuid.UUID) -> List[TaskCategory]:
        await self.get_workspace(db, workspace_id, user_id)
        return await task_repo.get_categories(db, workspace_id=workspace_id)

    async def get_due_tasks_in_window(self, db: AsyncSession, *, workspace_id: uuid.UUID, user_id: uuid.UUID, start_time: datetime, end_time: datetime) -> List[Task]:
        await self.get_workspace(db, workspace_id, user_id)
        return await task_repo.get_due_tasks(db, workspace_id=workspace_id, start_time=start_time, end_time=end_time)

task_service = TaskService()
