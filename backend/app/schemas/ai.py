from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field, UUID4
from app.database.models import MessageRole

class AIConversationBase(BaseModel):
    title: str = Field(..., max_length=255)

class AIConversationCreate(AIConversationBase):
    pass

class AIConversationUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=255)

class AIConversationResponse(AIConversationBase):
    id: UUID4
    workspace_id: UUID4
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
    id: UUID4
    conversation_id: UUID4
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
    id: UUID4
    content: str
    source_type: str
    source_id: UUID4
    title: Optional[str] = None
    score: float

class SearchResponse(BaseModel):
    results: List[SearchResultItem]
    query: str

class SummarizeRequest(BaseModel):
    document_id: Optional[UUID4] = None
    note_id: Optional[UUID4] = None

class SummarizeResponse(BaseModel):
    summary: str
    source_type: str
    source_id: UUID4
