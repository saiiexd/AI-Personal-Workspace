from typing import Optional, List, Dict, Any
import uuid
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field
from app.database.models import TaskStatus, TaskPriority

class TaskCategoryBase(BaseModel):
    name: str = Field(..., max_length=100)
    color: str = Field(default="#000000", max_length=20)

class TaskCategoryCreate(TaskCategoryBase):
    pass

class TaskCategoryUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=100)
    color: Optional[str] = Field(None, max_length=20)

class TaskCategoryResponse(TaskCategoryBase):
    id: uuid.UUID
    workspace_id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class TaskBase(BaseModel):
    title: str = Field(..., max_length=255)
    description: Optional[str] = None
    status: TaskStatus = TaskStatus.TODO
    priority: TaskPriority = TaskPriority.MEDIUM
    due_date: Optional[datetime] = None
    category_id: Optional[uuid.UUID] = None

class TaskCreate(TaskBase):
    pass

class TaskUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    status: Optional[TaskStatus] = None
    priority: Optional[TaskPriority] = None
    due_date: Optional[datetime] = None
    category_id: Optional[uuid.UUID] = None

class TaskResponse(TaskBase):
    id: uuid.UUID
    workspace_id: uuid.UUID
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class TaskListResponse(BaseModel):
    items: List[TaskResponse]
    total: int
    skip: int
    limit: int
