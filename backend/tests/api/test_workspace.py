import pytest
import uuid
from httpx import AsyncClient
from fastapi import status
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.user import user_repo

@pytest.fixture
async def auth_headers(async_client: AsyncClient, db_session: AsyncSession):
    # Setup test user and get authentication token
    user = await user_repo.create_user_with_profile(
        db_session,
        email="workspace_tester@example.com",
        hashed_password="hashed_pw_123",
        first_name="Workspace",
        last_name="Tester"
    )
    # Perform login
    login_payload = {
        "username": "workspace_tester@example.com",
        "password": "hashed_pw_123"
    }
    response = await async_client.post("/api/v1/auth/login", data=login_payload)
    token_data = response.json()
    return {"Authorization": f"Bearer {token_data['access_token']}"}

@pytest.mark.asyncio
async def test_workspace_lifecycle(async_client: AsyncClient, db_session: AsyncSession, auth_headers: dict):
    # 1. List workspaces (should have 1 personal workspace created on registration)
    list_response = await async_client.get("/api/v1/workspaces/", headers=auth_headers)
    assert list_response.status_code == status.HTTP_200_OK
    workspaces = list_response.json()
    assert len(workspaces) == 1
    assert workspaces[0]["slug"] == "personal-workspace"
    
    # 2. Create a new workspace
    create_payload = {
        "name": "Project Alpha",
        "slug": "project-alpha"
    }
    create_response = await async_client.post("/api/v1/workspaces/", json=create_payload, headers=auth_headers)
    assert create_response.status_code == status.HTTP_201_CREATED
    new_ws = create_response.json()
    assert new_ws["name"] == "Project Alpha"
    assert new_ws["slug"] == "project-alpha"
    ws_id = new_ws["id"]

    # Try duplicate slug creation
    dup_response = await async_client.post("/api/v1/workspaces/", json=create_payload, headers=auth_headers)
    assert dup_response.status_code == status.HTTP_400_BAD_REQUEST

    # 3. Retrieve workspace detail
    get_response = await async_client.get(f"/api/v1/workspaces/{ws_id}", headers=auth_headers)
    assert get_response.status_code == status.HTTP_200_OK
    assert get_response.json()["name"] == "Project Alpha"

    # 4. Update workspace
    update_payload = {
        "name": "Project Alpha Renovated",
        "slug": "project-alpha-renovated"
    }
    update_response = await async_client.put(f"/api/v1/workspaces/{ws_id}", json=update_payload, headers=auth_headers)
    assert update_response.status_code == status.HTTP_200_OK
    assert update_response.json()["name"] == "Project Alpha Renovated"
    assert update_response.json()["slug"] == "project-alpha-renovated"

    # 5. Soft Delete workspace
    delete_response = await async_client.delete(f"/api/v1/workspaces/{ws_id}", headers=auth_headers)
    assert delete_response.status_code == status.HTTP_200_OK
    
    # Verify workspace is no longer reachable
    check_deleted_response = await async_client.get(f"/api/v1/workspaces/{ws_id}", headers=auth_headers)
    assert check_deleted_response.status_code == status.HTTP_404_NOT_FOUND

    # 6. Restore workspace
    restore_response = await async_client.post(f"/api/v1/workspaces/{ws_id}/restore", headers=auth_headers)
    assert restore_response.status_code == status.HTTP_200_OK
    assert restore_response.json()["deleted_at"] is None

    # Verify workspace is reachable again
    check_restored_response = await async_client.get(f"/api/v1/workspaces/{ws_id}", headers=auth_headers)
    assert check_restored_response.status_code == status.HTTP_200_OK
