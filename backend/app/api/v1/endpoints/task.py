import uuid
from typing import Any, List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, Query, Response, status

from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_db, get_current_user
from app.database.models import User, TaskStatus, TaskPriority
from app.schemas.task import (
    TaskCreate, TaskUpdate, TaskResponse, TaskListResponse,
    TaskCategoryCreate, TaskCategoryResponse
)
from app.services.task import task_service

router = APIRouter()

@router.post("/{workspace_id}/categories", response_model=TaskCategoryResponse, status_code=status.HTTP_201_CREATED)
async def create_category(
    workspace_id: uuid.UUID,
    category_in: TaskCategoryCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Create a new task category in the workspace."""
    return await task_service.create_category(
        db, workspace_id=workspace_id, user_id=current_user.id, category_in=category_in
    )

@router.get("/{workspace_id}/categories", response_model=List[TaskCategoryResponse])
async def list_categories(
    workspace_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """List all task categories for a workspace."""
    return await task_service.get_categories(db, workspace_id=workspace_id, user_id=current_user.id)

@router.post("/{workspace_id}/tasks", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
async def create_task(
    workspace_id: uuid.UUID,
    task_in: TaskCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Create a new task in the workspace."""
    return await task_service.create_task(
        db, workspace_id=workspace_id, user_id=current_user.id, task_in=task_in
    )

@router.get("/{workspace_id}/tasks", response_model=TaskListResponse)
async def list_tasks(
    workspace_id: uuid.UUID,
    task_status: Optional[TaskStatus] = Query(None, description="Filter by task status"),
    priority: Optional[TaskPriority] = Query(None, description="Filter by task priority"),
    category_id: Optional[uuid.UUID] = Query(None, description="Filter by category ID"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """List tasks in the workspace."""
    tasks = await task_service.get_tasks(
        db, workspace_id=workspace_id, user_id=current_user.id,
        status=task_status, priority=priority, category_id=category_id,
        skip=skip, limit=limit
    )
    return TaskListResponse(items=tasks, total=len(tasks), skip=skip, limit=limit)

@router.get("/{workspace_id}/tasks/due", response_model=List[TaskResponse])
async def list_due_tasks(
    workspace_id: uuid.UUID,
    start_time: datetime,
    end_time: datetime,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """List tasks due within a specific time window."""
    return await task_service.get_due_tasks_in_window(
        db, workspace_id=workspace_id, user_id=current_user.id,
        start_time=start_time, end_time=end_time
    )

@router.get("/{workspace_id}/tasks/{task_id}", response_model=TaskResponse)
async def get_task(
    workspace_id: uuid.UUID,
    task_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Get a specific task."""
    return await task_service.get_task(
        db, task_id=task_id, workspace_id=workspace_id, user_id=current_user.id
    )

@router.put("/{workspace_id}/tasks/{task_id}", response_model=TaskResponse)
async def update_task(
    workspace_id: uuid.UUID,
    task_id: uuid.UUID,
    task_in: TaskUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Update a specific task."""
    return await task_service.update_task(
        db, task_id=task_id, workspace_id=workspace_id, user_id=current_user.id, task_in=task_in
    )

@router.delete("/{workspace_id}/tasks/{task_id}", status_code=status.HTTP_204_NO_CONTENT, response_class=Response)
async def delete_task(
    workspace_id: uuid.UUID,
    task_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    """Delete a specific task."""
    await task_service.delete_task(
        db, task_id=task_id, workspace_id=workspace_id, user_id=current_user.id
    )
