from typing import Optional, List, Dict, Any
import uuid
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field
from app.database.models import MessageRole

class AIConversationBase(BaseModel):
    title: str = Field(..., max_length=255)

class AIConversationCreate(AIConversationBase):
    pass

class AIConversationUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=255)

class AIConversationResponse(AIConversationBase):
    id: uuid.UUID
    workspace_id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class AIConversationListResponse(BaseModel):
    items: List[AIConversationResponse]
    total: int
    skip: int
    limit: int

class AIMessageBase(BaseModel):
    content: str
    role: MessageRole

class AIMessageCreate(AIMessageBase):
    pass

class AIMessageResponse(AIMessageBase):
    id: uuid.UUID
    conversation_id: uuid.UUID
    context_sources: Optional[Dict[str, Any]] = None
    token_count: Optional[int] = None
    model_used: Optional[str] = None
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class SearchQuery(BaseModel):
    query: str
    limit: int = 10
    filters: Optional[Dict[str, Any]] = None

class SearchResultItem(BaseModel):
    id: uuid.UUID
    content: str
    source_type: str
    source_id: uuid.UUID
    title: Optional[str] = None
    score: float

class SearchResponse(BaseModel):
    results: List[SearchResultItem]
    query: str

class SummarizeRequest(BaseModel):
    document_id: Optional[uuid.UUID] = None
    note_id: Optional[uuid.UUID] = None

class SummarizeResponse(BaseModel):
    summary: str
    source_type: str
    source_id: uuid.UUID
