import pytest
import uuid
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import status
from app.repositories.user import user_repo

@pytest.fixture
async def auth_headers(async_client: AsyncClient, db_session: AsyncSession):
    # Setup test user and get authentication token
    user = await user_repo.create_user_with_profile(
        db_session,
        email="ai_tester@example.com",
        hashed_password="hashed_pw_123",
        first_name="AI",
        last_name="Tester"
    )
    # Perform login
    login_payload = {
        "username": "ai_tester@example.com",
        "password": "hashed_pw_123"
    }
    response = await async_client.post("/api/v1/auth/login", data=login_payload)
    token_data = response.json()
    return {"Authorization": f"Bearer {token_data['access_token']}"}

@pytest.fixture
async def test_workspace(async_client: AsyncClient, auth_headers: dict):
    response = await async_client.get("/api/v1/workspaces/", headers=auth_headers)
    workspaces = response.json()
    return workspaces[0]

@pytest.fixture
async def test_conversation(async_client: AsyncClient, auth_headers: dict, test_workspace: dict):
    response = await async_client.post(
        f"/api/v1/workspaces/{test_workspace['id']}/ai/conversations",
        headers=auth_headers,
        json={"title": "Test AI Chat"}
    )
    return response.json()

@pytest.mark.asyncio
async def test_create_conversation(
    async_client: AsyncClient,
    db_session: AsyncSession,
    auth_headers: dict,
    test_workspace: dict
):
    response = await async_client.post(
        f"/api/v1/workspaces/{test_workspace['id']}/ai/conversations",
        headers=auth_headers,
        json={"title": "New Conversation"}
    )
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["title"] == "New Conversation"
    assert "id" in data

@pytest.mark.asyncio
async def test_list_conversations(
    async_client: AsyncClient,
    db_session: AsyncSession,
    auth_headers: dict,
    test_workspace: dict,
    test_conversation: dict
):
    response = await async_client.get(
        f"/api/v1/workspaces/{test_workspace['id']}/ai/conversations",
        headers=auth_headers
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["total"] >= 1
    titles = [item["title"] for item in data["items"]]
    assert test_conversation["title"] in titles

@pytest.mark.asyncio
async def test_add_message_and_rag(
    async_client: AsyncClient,
    db_session: AsyncSession,
    auth_headers: dict,
    test_workspace: dict,
    test_conversation: dict
):
    response = await async_client.post(
        f"/api/v1/workspaces/{test_workspace['id']}/ai/conversations/{test_conversation['id']}/messages",
        headers=auth_headers,
        json={"content": "What is my task list?", "role": "user"}
    )
    assert response.status_code == status.HTTP_200_OK
    messages = response.json()
    assert len(messages) == 2
    
    user_msg, assistant_msg = messages
    assert user_msg["role"] == "user"
    assert user_msg["content"] == "What is my task list?"
    
    assert assistant_msg["role"] == "assistant"
    assert "mocked RAG response" in assistant_msg["content"]

@pytest.mark.asyncio
async def test_semantic_search(
    async_client: AsyncClient,
    db_session: AsyncSession,
    auth_headers: dict,
    test_workspace: dict
):
    response = await async_client.post(
        f"/api/v1/workspaces/{test_workspace['id']}/ai/search",
        headers=auth_headers,
        json={"query": "find notes about meeting", "limit": 5}
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "results" in data
    assert data["query"] == "find notes about meeting"
    
@pytest.mark.asyncio
async def test_summarize(
    async_client: AsyncClient,
    db_session: AsyncSession,
    auth_headers: dict,
    test_workspace: dict
):
    # Pass a random uuid since we don't have a document fixture here
    dummy_doc_id = str(uuid.uuid4())
    
    response = await async_client.post(
        f"/api/v1/workspaces/{test_workspace['id']}/ai/summarize",
        headers=auth_headers,
        json={"document_id": dummy_doc_id}
    )
    # It should return 404 because the document doesn't actually exist
    assert response.status_code == status.HTTP_404_NOT_FOUND
