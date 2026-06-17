import pytest
import uuid
import io
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import status
from app.repositories.user import user_repo

@pytest.fixture
async def auth_headers(async_client: AsyncClient, db_session: AsyncSession):
    # Setup test user and get authentication token
    user = await user_repo.create_user_with_profile(
        db_session,
        email="doc_tester@example.com",
        hashed_password="hashed_pw_123",
        first_name="Doc",
        last_name="Tester"
    )
    # Perform login
    login_payload = {
        "username": "doc_tester@example.com",
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
async def test_document(async_client: AsyncClient, auth_headers: dict, test_workspace: dict):
    file_content = b"This is a test document."
    files = {"file": ("test.txt", file_content, "text/plain")}
    data = {"title": "Test Document"}
    
    response = await async_client.post(
        f"/api/v1/workspaces/{test_workspace['id']}/documents",
        headers=auth_headers,
        data=data,
        files=files
    )
    return response.json()

@pytest.mark.asyncio
async def test_upload_document(
    async_client: AsyncClient,
    db_session: AsyncSession,
    auth_headers: dict,
    test_workspace: dict
):
    file_content = b"Hello world, testing document upload."
    files = {"file": ("hello.txt", file_content, "text/plain")}
    data = {"title": "Hello World Doc"}
    
    response = await async_client.post(
        f"/api/v1/workspaces/{test_workspace['id']}/documents",
        headers=auth_headers,
        data=data,
        files=files
    )
    assert response.status_code == status.HTTP_201_CREATED
    data_res = response.json()
    assert data_res["title"] == "Hello World Doc"
    assert data_res["file_type"] == "text/plain"
    assert "id" in data_res
    assert data_res["processing_status"] in ["pending", "processing", "completed"]

@pytest.mark.asyncio
async def test_list_documents(
    async_client: AsyncClient,
    db_session: AsyncSession,
    auth_headers: dict,
    test_workspace: dict,
    test_document: dict
):
    response = await async_client.get(
        f"/api/v1/workspaces/{test_workspace['id']}/documents",
        headers=auth_headers
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["total"] >= 1
    titles = [item["title"] for item in data["items"]]
    assert test_document["title"] in titles

@pytest.mark.asyncio
async def test_update_document(
    async_client: AsyncClient,
    db_session: AsyncSession,
    auth_headers: dict,
    test_workspace: dict,
    test_document: dict
):
    response = await async_client.put(
        f"/api/v1/workspaces/{test_workspace['id']}/documents/{test_document['id']}",
        headers=auth_headers,
        json={"title": "Updated Doc Title"}
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["title"] == "Updated Doc Title"

@pytest.mark.asyncio
async def test_delete_document(
    async_client: AsyncClient,
    db_session: AsyncSession,
    auth_headers: dict,
    test_workspace: dict,
    test_document: dict
):
    response = await async_client.delete(
        f"/api/v1/workspaces/{test_workspace['id']}/documents/{test_document['id']}",
        headers=auth_headers
    )
    assert response.status_code == status.HTTP_204_NO_CONTENT
    
    # Verify document is deleted
    response = await async_client.get(
        f"/api/v1/workspaces/{test_workspace['id']}/documents/{test_document['id']}",
        headers=auth_headers
    )
    assert response.status_code == status.HTTP_404_NOT_FOUND

@pytest.mark.asyncio
async def test_upload_document_invalid_type(
    async_client: AsyncClient,
    db_session: AsyncSession,
    auth_headers: dict,
    test_workspace: dict
):
    file_content = b"Not allowed."
    files = {"file": ("test.exe", file_content, "application/x-msdownload")}
    
    response = await async_client.post(
        f"/api/v1/workspaces/{test_workspace['id']}/documents",
        headers=auth_headers,
        files=files
    )
    assert response.status_code == status.HTTP_400_BAD_REQUEST
