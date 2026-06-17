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
        email="task_tester@example.com",
        hashed_password="hashed_pw_123",
        first_name="Task",
        last_name="Tester"
    )
    # Perform login
    login_payload = {
        "username": "task_tester@example.com",
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
async def test_category(async_client: AsyncClient, auth_headers: dict, test_workspace: dict):
    response = await async_client.post(
        f"/api/v1/workspaces/{test_workspace['id']}/categories",
        headers=auth_headers,
        json={"name": "Bug", "color": "#FF0000"}
    )
    return response.json()

@pytest.fixture
async def test_task(async_client: AsyncClient, auth_headers: dict, test_workspace: dict, test_category: dict):
    response = await async_client.post(
        f"/api/v1/workspaces/{test_workspace['id']}/tasks",
        headers=auth_headers,
        json={
            "title": "Initial Task",
            "description": "Just a test",
            "category_id": test_category['id']
        }
    )
    return response.json()

@pytest.mark.asyncio
async def test_create_category(
    async_client: AsyncClient,
    db_session: AsyncSession,
    auth_headers: dict,
    test_workspace: dict
):
    response = await async_client.post(
        f"/api/v1/workspaces/{test_workspace['id']}/categories",
        headers=auth_headers,
        json={"name": "Urgent", "color": "#FF0000"}
    )
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["name"] == "Urgent"
    assert data["color"] == "#FF0000"
    assert "id" in data

@pytest.mark.asyncio
async def test_create_task(
    async_client: AsyncClient,
    db_session: AsyncSession,
    auth_headers: dict,
    test_workspace: dict,
    test_category: dict
):
    response = await async_client.post(
        f"/api/v1/workspaces/{test_workspace['id']}/tasks",
        headers=auth_headers,
        json={
            "title": "Fix bug",
            "description": "Fix the login bug",
            "category_id": test_category['id'],
            "priority": "HIGH"
        }
    )
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["title"] == "Fix bug"
    assert data["description"] == "Fix the login bug"
    assert data["status"] == "TODO"
    assert data["priority"] == "HIGH"
    assert data["category_id"] == test_category['id']

@pytest.mark.asyncio
async def test_list_tasks(
    async_client: AsyncClient,
    db_session: AsyncSession,
    auth_headers: dict,
    test_workspace: dict,
    test_task: dict
):
    response = await async_client.get(
        f"/api/v1/workspaces/{test_workspace['id']}/tasks",
        headers=auth_headers
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["total"] >= 1
    titles = [item["title"] for item in data["items"]]
    assert test_task["title"] in titles

@pytest.mark.asyncio
async def test_update_task(
    async_client: AsyncClient,
    db_session: AsyncSession,
    auth_headers: dict,
    test_workspace: dict,
    test_task: dict
):
    response = await async_client.put(
        f"/api/v1/workspaces/{test_workspace['id']}/tasks/{test_task['id']}",
        headers=auth_headers,
        json={"status": "IN_PROGRESS"}
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["status"] == "IN_PROGRESS"

@pytest.mark.asyncio
async def test_delete_task(
    async_client: AsyncClient,
    db_session: AsyncSession,
    auth_headers: dict,
    test_workspace: dict,
    test_task: dict
):
    response = await async_client.delete(
        f"/api/v1/workspaces/{test_workspace['id']}/tasks/{test_task['id']}",
        headers=auth_headers
    )
    assert response.status_code == status.HTTP_204_NO_CONTENT
    
    # Verify task is deleted
    response = await async_client.get(
        f"/api/v1/workspaces/{test_workspace['id']}/tasks/{test_task['id']}",
        headers=auth_headers
    )
    assert response.status_code == status.HTTP_404_NOT_FOUND
