import uuid
import os
from typing import List, AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from openai import AsyncOpenAI

from backend.database.models import DocumentChunk
from backend.ai.embeddings import generate_embedding
from backend.ai.prompts import RAG_SYSTEM_PROMPT

client = AsyncOpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

async def retrieve_relevant_chunks(
    db: AsyncSession, 
    workspace_id: uuid.UUID, 
    query_text: str, 
    limit: int = 5
) -> List[DocumentChunk]:
    """
    Performs a vector similarity search in pgvector.
    Filters by workspace_id to enforce tenant isolation BEFORE distance calculation.
    """
    query_embedding = await generate_embedding(query_text)
    
    # pgvector cosine distance operator is <=>
    # Requires an active AsyncSession to execute
    stmt = (
        select(DocumentChunk)
        .where(DocumentChunk.workspace_id == workspace_id)
        .order_by(DocumentChunk.embedding.cosine_distance(query_embedding))
        .limit(limit)
    )
    
    result = await db.execute(stmt)
    return list(result.scalars().all())

async def generate_rag_response(
    db: AsyncSession, 
    workspace_id: uuid.UUID, 
    query_text: str
) -> AsyncGenerator[str, None]:
    """
    Executes the full RAG pipeline and returns a streaming LLM response.
    """
    # 1. Retrieve Context
    chunks = await retrieve_relevant_chunks(db, workspace_id, query_text)
    
    # 2. Assemble Context Window
    context_parts = []
    for chunk in chunks:
        context_parts.append(f"<doc id=\"{chunk.document_id}\">\n{chunk.content}\n</doc>")
    
    assembled_context = "\n\n".join(context_parts)
    
    # 3. Format Prompt
    system_message = RAG_SYSTEM_PROMPT.format(context=assembled_context)
    
    # 4. Stream Response
    stream = await client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": system_message},
            {"role": "user", "content": query_text}
        ],
        stream=True,
        temperature=0.0
    )
    
    async for chunk in stream:
        if chunk.choices[0].delta.content is not None:
            yield chunk.choices[0].delta.content
