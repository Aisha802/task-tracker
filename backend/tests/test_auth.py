from fastapi.testclient import TestClient


def test_signup_success(client: TestClient):
    response = client.post("/auth/signup", json={"email": "new@example.com", "password": "supersecret1"})
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "new@example.com"
    assert "id" in data
    assert "hashed_password" not in data


def test_signup_duplicate_email_rejected(client: TestClient):
    client.post("/auth/signup", json={"email": "dupe@example.com", "password": "supersecret1"})
    response = client.post("/auth/signup", json={"email": "dupe@example.com", "password": "anotherpass1"})
    assert response.status_code == 400


def test_signup_short_password_rejected(client: TestClient):
    response = client.post("/auth/signup", json={"email": "short@example.com", "password": "short"})
    assert response.status_code == 422


def test_login_success(client: TestClient):
    client.post("/auth/signup", json={"email": "login@example.com", "password": "supersecret1"})
    response = client.post(
        "/auth/login", data={"username": "login@example.com", "password": "supersecret1"}
    )
    assert response.status_code == 200
    body = response.json()
    assert body["token_type"] == "bearer"
    assert len(body["access_token"]) > 0


def test_login_wrong_password_rejected(client: TestClient):
    client.post("/auth/signup", json={"email": "wrongpw@example.com", "password": "supersecret1"})
    response = client.post(
        "/auth/login", data={"username": "wrongpw@example.com", "password": "wrongpassword"}
    )
    assert response.status_code == 401


def test_me_requires_authentication(client: TestClient):
    response = client.get("/auth/me")
    assert response.status_code == 401


def test_me_returns_current_user(auth_client: TestClient):
    response = auth_client.get("/auth/me")
    assert response.status_code == 200
    assert response.json()["email"] == "user@example.com"
