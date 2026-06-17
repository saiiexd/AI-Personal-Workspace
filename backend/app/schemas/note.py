import uuid
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field

class NoteBase(BaseModel):
    title: str = Field(..., max_length=255)
    content: str = Field(default="")

class NoteCreate(NoteBase):
    pass

class NoteUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=255)
    content: Optional[str] = None

class NoteVersionResponse(BaseModel):
    id: uuid.UUID
    note_id: uuid.UUID
    version_num: int
    title_snapshot: str
    content_snapshot: str
    created_by: Optional[uuid.UUID] = None
    created_at: datetime

    class Config:
        from_attributes = True

class NoteResponse(NoteBase):
    id: uuid.UUID
    workspace_id: uuid.UUID
    version: int
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class NoteSearchFilter(BaseModel):
    query: Optional[str] = None
    workspace_id: uuid.UUID
    skip: int = 0
    limit: int = 100
