import uuid
from typing import Any, List
from fastapi import APIRouter, Depends, Query, Response, status

from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_db, get_current_user
from app.database.models import User
from app.schemas.ai import (
    AIConversationCreate, AIConversationResponse, AIConversationListResponse,
    AIMessageCreate, AIMessageResponse, SearchQuery, SearchResponse,
    SummarizeRequest, SummarizeResponse
)
from app.services.ai import ai_service

router = APIRouter()

# --- Semantic Search & Intelligence APIs ---

@router.post("/{workspace_id}/ai/search", response_model=SearchResponse)
async def semantic_search(
    workspace_id: uuid.UUID,
    search_query: SearchQuery,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Perform a semantic search across the workspace."""
    results = await ai_service.semantic_search(
        db, workspace_id=workspace_id, query=search_query.query, limit=search_query.limit
    )
    return SearchResponse(results=results, query=search_query.query)

@router.post("/{workspace_id}/ai/summarize", response_model=SummarizeResponse)
async def summarize(
    workspace_id: uuid.UUID,
    request: SummarizeRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Summarize a document or note."""
    if request.document_id:
        summary = await ai_service.summarize_document(
            db, document_id=request.document_id, workspace_id=workspace_id, user_id=current_user.id
        )
        return SummarizeResponse(summary=summary, source_type="document", source_id=request.document_id)
    # Add note summarization handling when needed
    return SummarizeResponse(summary="Not implemented for this type yet.", source_type="unknown", source_id=uuid.uuid4())

# --- Conversational AI APIs ---

@router.post("/{workspace_id}/ai/conversations", response_model=AIConversationResponse, status_code=status.HTTP_201_CREATED)
async def create_conversation(
    workspace_id: uuid.UUID,
    conv_in: AIConversationCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Create a new AI conversation."""
    return await ai_service.create_conversation(
        db, workspace_id=workspace_id, user_id=current_user.id, title=conv_in.title
    )

@router.get("/{workspace_id}/ai/conversations", response_model=AIConversationListResponse)
async def list_conversations(
    workspace_id: uuid.UUID,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """List all AI conversations for a workspace."""
    conversations, total = await ai_service.get_conversations(
        db, workspace_id=workspace_id, user_id=current_user.id, skip=skip, limit=limit
    )
    return AIConversationListResponse(items=conversations, total=total, skip=skip, limit=limit)

@router.get("/{workspace_id}/ai/conversations/{conversation_id}", response_model=AIConversationResponse)
async def get_conversation(
    workspace_id: uuid.UUID,
    conversation_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Get a specific AI conversation."""
    return await ai_service.get_conversation(
        db, conversation_id=conversation_id, workspace_id=workspace_id, user_id=current_user.id
    )

@router.delete("/{workspace_id}/ai/conversations/{conversation_id}", status_code=status.HTTP_204_NO_CONTENT, response_class=Response)
async def delete_conversation(
    workspace_id: uuid.UUID,
    conversation_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    """Delete an AI conversation."""
    await ai_service.delete_conversation(
        db, conversation_id=conversation_id, workspace_id=workspace_id, user_id=current_user.id
    )

@router.get("/{workspace_id}/ai/conversations/{conversation_id}/messages", response_model=List[AIMessageResponse])
async def list_messages(
    workspace_id: uuid.UUID,
    conversation_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """List messages for a conversation."""
    return await ai_service.get_messages(
        db, conversation_id=conversation_id, workspace_id=workspace_id, user_id=current_user.id
    )

@router.post("/{workspace_id}/ai/conversations/{conversation_id}/messages", response_model=List[AIMessageResponse])
async def add_message(
    workspace_id: uuid.UUID,
    conversation_id: uuid.UUID,
    message_in: AIMessageCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Add a message and trigger RAG completion. Returns both the user message and the assistant response."""
    user_msg, assistant_msg = await ai_service.add_message(
        db, conversation_id=conversation_id, workspace_id=workspace_id, user_id=current_user.id, message_in=message_in
    )
    return [user_msg, assistant_msg]
