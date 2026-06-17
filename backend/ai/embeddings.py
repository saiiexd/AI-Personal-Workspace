import os
from typing import List
from openai import AsyncOpenAI

# Assumes OPENAI_API_KEY is available in the environment variables
client = AsyncOpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

async def generate_embedding(text: str) -> List[float]:
    """Generates an embedding vector for a single text chunk using OpenAI's text-embedding-3-small."""
    response = await client.embeddings.create(
        input=text,
        model="text-embedding-3-small"
    )
    return response.data[0].embedding

async def generate_embeddings_batch(texts: List[str]) -> List[List[float]]:
    """Generates embeddings for a batch of chunks for efficient ingestion."""
    response = await client.embeddings.create(
        input=texts,
        model="text-embedding-3-small"
    )
    return [item.embedding for item in response.data]
