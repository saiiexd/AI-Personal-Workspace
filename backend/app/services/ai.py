import uuid
import logging
from typing import List, Optional, Tuple, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, text
from fastapi import HTTPException, status

from app.database.models import Workspace, AIConversation, AIConversationMessage, MessageRole, DocumentChunk, Document
from app.repositories.ai import ai_conversation_repo, ai_message_repo
from app.repositories.workspace import workspace_repo
from app.schemas.ai import AIConversationCreate, AIMessageCreate, SearchQuery, SearchResultItem

logger = logging.getLogger(__name__)

class AIService:
    async def get_workspace(self, db: AsyncSession, workspace_id: uuid.UUID, user_id: uuid.UUID) -> Workspace:
        workspace = await workspace_repo.get(db, workspace_id)
        if not workspace:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Workspace not found")
        # In a real app we'd verify user is a member of the workspace.
        return workspace

    # Search & RAG Operations
    async def semantic_search(self, db: AsyncSession, workspace_id: uuid.UUID, query: str, limit: int = 10) -> List[SearchResultItem]:
        """Perform semantic search using pgvector on document chunks."""
        # 1. Embed the query (Mock embedding generation)
        query_embedding = [0.0] * 1536
        embedding_str = "[" + ",".join(map(str, query_embedding)) + "]"
        
        # 2. Vector Search (Cosine similarity via pgvector operator <=>)
        # Using SQLAlchemy text to execute the vector query
        sql = text(f"""
            SELECT dc.id, dc.content, dc.document_id, d.title, 
                   1 - (dc.embedding <=> '{embedding_str}') AS score
            FROM document_chunks dc
            JOIN documents d ON dc.document_id = d.id
            WHERE dc.workspace_id = :workspace_id AND d.deleted_at IS NULL
            ORDER BY dc.embedding <=> '{embedding_str}'
            LIMIT :limit
        """)
        
        result = await db.execute(sql, {"workspace_id": workspace_id, "limit": limit})
        
        results = []
        for row in result.all():
            results.append(SearchResultItem(
                id=row.id,
                content=row.content,
                source_type="document",
                source_id=row.document_id,
                title=row.title,
                score=row.score
            ))
            
        return results

    async def generate_rag_response(self, db: AsyncSession, workspace_id: uuid.UUID, query: str) -> str:
        """Generate a response augmented by semantic search context."""
        search_results = await self.semantic_search(db, workspace_id, query, limit=3)
        
        context = "\n\n".join([f"Source: {res.title}\n{res.content}" for res in search_results])
        
        # In a real app, call OpenAI or LLM provider here
        # prompt = f"Context:\n{context}\n\nQuestion: {query}"
        # response = await llm_provider.generate(prompt)
        
        mock_response = f"This is a mocked RAG response for: '{query}'. Context provided from {len(search_results)} sources."
        return mock_response

    # Conversation Operations
    async def create_conversation(
        self, db: AsyncSession, *, workspace_id: uuid.UUID, user_id: uuid.UUID, title: str
    ) -> AIConversation:
        await self.get_workspace(db, workspace_id, user_id)
        conv = await ai_conversation_repo.create(db, obj_in={"workspace_id": workspace_id, "title": title})
        await db.commit()
        await db.refresh(conv)
        return conv

    async def get_conversations(
        self, db: AsyncSession, *, workspace_id: uuid.UUID, user_id: uuid.UUID, skip: int = 0, limit: int = 100
    ) -> Tuple[List[AIConversation], int]:
        await self.get_workspace(db, workspace_id, user_id)
        conversations = await ai_conversation_repo.get_by_workspace(db, workspace_id=workspace_id, skip=skip, limit=limit)
        total = await ai_conversation_repo.get_by_workspace_count(db, workspace_id=workspace_id)
        return conversations, total

    async def get_conversation(
        self, db: AsyncSession, *, conversation_id: uuid.UUID, workspace_id: uuid.UUID, user_id: uuid.UUID
    ) -> AIConversation:
        await self.get_workspace(db, workspace_id, user_id)
        conv = await ai_conversation_repo.get(db, id=conversation_id)
        if not conv or conv.workspace_id != workspace_id or conv.deleted_at is not None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found")
        return conv

    async def delete_conversation(
        self, db: AsyncSession, *, conversation_id: uuid.UUID, workspace_id: uuid.UUID, user_id: uuid.UUID
    ) -> AIConversation:
        conv = await self.get_conversation(db, conversation_id=conversation_id, workspace_id=workspace_id, user_id=user_id)
        conv = await ai_conversation_repo.soft_delete(db, id=conversation_id)
        await db.commit()
        return conv

    # Message Operations
    async def add_message(
        self, db: AsyncSession, *, conversation_id: uuid.UUID, workspace_id: uuid.UUID, user_id: uuid.UUID, message_in: AIMessageCreate
    ) -> Tuple[AIConversationMessage, AIConversationMessage]:
        conv = await self.get_conversation(db, conversation_id=conversation_id, workspace_id=workspace_id, user_id=user_id)
        
        # 1. Save User Message
        user_msg = await ai_message_repo.create(db, obj_in={
            "conversation_id": conversation_id,
            "role": MessageRole.USER,
            "content": message_in.content
        })
        
        # 2. Generate RAG Response
        assistant_content = await self.generate_rag_response(db, workspace_id, message_in.content)
        
        # 3. Save Assistant Message
        assistant_msg = await ai_message_repo.create(db, obj_in={
            "conversation_id": conversation_id,
            "role": MessageRole.ASSISTANT,
            "content": assistant_content,
            "model_used": "mock-llm-1.0",
            "token_count": 150
        })
        
        # 4. Auto-update conversation title if it's the first message
        messages = await ai_message_repo.get_by_conversation(db, conversation_id)
        if len(messages) <= 2 and conv.title == "New Conversation":
            conv.title = message_in.content[:50] + "..." if len(message_in.content) > 50 else message_in.content
            db.add(conv)
            
        await db.commit()
        await db.refresh(user_msg)
        await db.refresh(assistant_msg)
        return user_msg, assistant_msg

    async def get_messages(
        self, db: AsyncSession, *, conversation_id: uuid.UUID, workspace_id: uuid.UUID, user_id: uuid.UUID
    ) -> List[AIConversationMessage]:
        await self.get_conversation(db, conversation_id=conversation_id, workspace_id=workspace_id, user_id=user_id)
        return await ai_message_repo.get_by_conversation(db, conversation_id)

    # Summarization Operations
    async def summarize_document(self, db: AsyncSession, document_id: uuid.UUID, workspace_id: uuid.UUID, user_id: uuid.UUID) -> str:
        await self.get_workspace(db, workspace_id, user_id)
        doc = await db.get(Document, document_id)
        if not doc or doc.workspace_id != workspace_id or doc.deleted_at is not None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
        
        return f"Mock summary for document: {doc.title}"

ai_service = AIService()
