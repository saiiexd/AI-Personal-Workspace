from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field, UUID4
from app.database.models import ProcessingStatus

class DocumentBase(BaseModel):
    title: str = Field(..., max_length=255)

class DocumentCreate(DocumentBase):
    pass

class DocumentUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=255)

class DocumentResponse(DocumentBase):
    id: UUID4
    workspace_id: UUID4
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
    id: UUID4
    document_id: UUID4
    chunk_index: int
    content: str
    
    model_config = ConfigDict(from_attributes=True)
