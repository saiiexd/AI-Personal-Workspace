from typing import Optional, List
import uuid
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field
from app.database.models import ProcessingStatus

class DocumentBase(BaseModel):
    title: str = Field(..., max_length=255)

class DocumentCreate(DocumentBase):
    pass

class DocumentUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=255)

class DocumentResponse(DocumentBase):
    id: uuid.UUID
    workspace_id: uuid.UUID
    file_type: str
    size_bytes: int
    processing_status: ProcessingStatus
    error_message: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class DocumentListResponse(BaseModel):
    items: List[DocumentResponse]
    total: int
    skip: int
    limit: int

class DocumentChunkResponse(BaseModel):
    id: uuid.UUID
    document_id: uuid.UUID
    chunk_index: int
    content: str
    
    model_config = ConfigDict(from_attributes=True)
