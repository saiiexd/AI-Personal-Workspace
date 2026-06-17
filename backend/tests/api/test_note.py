import pytest
from httpx import AsyncClient
from fastapi import status
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.user import user_repo

@pytest.fixture
async def setup_workspace(async_client: AsyncClient, db_session: AsyncSession):
    # Setup test user and get authentication token
    user = await user_repo.create_user_with_profile(
        db_session,
        email="note_tester@example.com",
        hashed_password="hashed_pw_123",
        first_name="Note",
        last_name="Tester"
    )
    # Perform login
    login_payload = {
        "username": "note_tester@example.com",
        "password": "hashed_pw_123"
    }
    response = await async_client.post("/api/v1/auth/login", data=login_payload)
    token_data = response.json()
    headers = {"Authorization": f"Bearer {token_data['access_token']}"}

    # Fetch default workspace ID
    ws_response = await async_client.get("/api/v1/workspaces/", headers=headers)
    ws_id = ws_response.json()[0]["id"]

    return headers, ws_id

@pytest.mark.asyncio
async def test_note_lifecycle(async_client: AsyncClient, db_session: AsyncSession, setup_workspace: tuple):
    headers, ws_id = setup_workspace

    # 1. Create a note
    create_payload = {
        "title": "Meeting Minutes",
        "content": "Discuss backend development tasks."
    }
    create_response = await async_client.post(
        f"/api/v1/workspaces/{ws_id}/notes",
        json=create_payload,
        headers=headers
    )
    assert create_response.status_code == status.HTTP_201_CREATED
    note = create_response.json()
    assert note["title"] == "Meeting Minutes"
    assert note["version"] == 1
    note_id = note["id"]

    # 2. Update note
    update_payload = {
        "title": "Meeting Minutes (June)",
        "content": "Discuss backend development and database schema."
    }
    update_response = await async_client.put(
        f"/api/v1/notes/{note_id}",
        json=update_payload,
        headers=headers
    )
    assert update_response.status_code == status.HTTP_200_OK
    assert update_response.json()["version"] == 2

    # 3. List and search notes
    search_response = await async_client.get(
        f"/api/v1/workspaces/{ws_id}/notes?query=schema",
        headers=headers
    )
    assert search_response.status_code == status.HTTP_200_OK
    results = search_response.json()
    assert len(results) == 1
    assert results[0]["title"] == "Meeting Minutes (June)"

    # Search with non-matching query
    empty_search = await async_client.get(
        f"/api/v1/workspaces/{ws_id}/notes?query=nonexistent",
        headers=headers
    )
    assert len(empty_search.json()) == 0

    # 4. View history versions
    history_response = await async_client.get(
        f"/api/v1/notes/{note_id}/versions",
        headers=headers
    )
    assert history_response.status_code == status.HTTP_200_OK
    versions = history_response.json()
    assert len(versions) == 2
    assert versions[0]["version_num"] == 2
    assert versions[1]["version_num"] == 1

    # 5. Rollback to version 1
    rollback_response = await async_client.post(
        f"/api/v1/notes/{note_id}/versions/1/rollback",
        headers=headers
    )
    assert rollback_response.status_code == status.HTTP_200_OK
    rolled_back_note = rollback_response.json()
    assert rolled_back_note["content"] == "Discuss backend development tasks."
    assert rolled_back_note["version"] == 3

    # 6. Soft Delete note
    delete_response = await async_client.delete(f"/api/v1/notes/{note_id}", headers=headers)
    assert delete_response.status_code == status.HTTP_200_OK

    # Verify note is no longer reachable
    check_response = await async_client.get(f"/api/v1/notes/{note_id}", headers=headers)
    assert check_response.status_code == status.HTTP_404_NOT_FOUND

    # 7. Restore note
    restore_response = await async_client.post(f"/api/v1/notes/{note_id}/restore", headers=headers)
    assert restore_response.status_code == status.HTTP_200_OK
    assert restore_response.json()["deleted_at"] is None
