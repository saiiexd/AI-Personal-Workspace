import pytest
from httpx import AsyncClient
from fastapi import status
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.user import user_repo

@pytest.mark.asyncio
async def test_full_auth_flow(async_client: AsyncClient, db_session: AsyncSession):
    # 1. Register a new user
    register_payload = {
        "email": "user@example.com",
        "password": "securepassword123",
        "first_name": "John",
        "last_name": "Doe"
    }
    
    response = await async_client.post("/api/v1/auth/register", json=register_payload)
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["email"] == "user@example.com"
    assert data["is_active"] is True
    assert data["profile"]["first_name"] == "John"

    # Test duplicate registration rejection
    dup_response = await async_client.post("/api/v1/auth/register", json=register_payload)
    assert dup_response.status_code == status.HTTP_400_BAD_REQUEST

    # 2. Login
    login_payload = {
        "username": "user@example.com",
        "password": "securepassword123"
    }
    login_response = await async_client.post(
        "/api/v1/auth/login",
        data=login_payload
    )
    assert login_response.status_code == status.HTTP_200_OK
    token_data = login_response.json()
    assert "access_token" in token_data
    assert "refresh_token" in token_data
    assert token_data["token_type"] == "bearer"
    
    access_token = token_data["access_token"]
    refresh_token = token_data["refresh_token"]

    # 3. Retrieve current user profile (with authentication)
    headers = {"Authorization": f"Bearer {access_token}"}
    me_response = await async_client.get("/api/v1/auth/me", headers=headers)
    assert me_response.status_code == status.HTTP_200_OK
    me_data = me_response.json()
    assert me_data["email"] == "user@example.com"
    
    # 4. Refresh token
    refresh_response = await async_client.post(
        f"/api/v1/auth/refresh?refresh_token={refresh_token}"
    )
    assert refresh_response.status_code == status.HTTP_200_OK
    new_token_data = refresh_response.json()
    assert "access_token" in new_token_data
    new_access_token = new_token_data["access_token"]

    # 5. Update profile
    update_payload = {
        "first_name": "Johnny",
        "last_name": "Doe",
        "avatar_url": "http://avatar.url/image.jpg"
    }
    update_headers = {"Authorization": f"Bearer {new_access_token}"}
    profile_response = await async_client.put(
        "/api/v1/auth/me/profile",
        json=update_payload,
        headers=update_headers
    )
    assert profile_response.status_code == status.HTTP_200_OK
    profile_data = profile_response.json()
    assert profile_data["profile"]["first_name"] == "Johnny"
    assert profile_data["profile"]["avatar_url"] == "http://avatar.url/image.jpg"

    # 6. Change password
    password_change_payload = {
        "current_password": "securepassword123",
        "new_password": "newsecurepassword456"
    }
    pw_response = await async_client.post(
        "/api/v1/auth/change-password",
        json=password_change_payload,
        headers=update_headers
    )
    assert pw_response.status_code == status.HTTP_200_OK
    
    # Verify new login succeeds
    relogin_payload = {
        "username": "user@example.com",
        "password": "newsecurepassword456"
    }
    relogin_response = await async_client.post(
        "/api/v1/auth/login",
        data=relogin_payload
    )
    assert relogin_response.status_code == status.HTTP_200_OK
