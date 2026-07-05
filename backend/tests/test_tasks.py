from fastapi.testclient import TestClient


def test_create_task(auth_client: TestClient):
    response = auth_client.post("/tasks", json={"title": "Write README", "priority": "high"})
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Write README"
    assert data["status"] == "todo"


def test_create_task_blank_title_rejected(auth_client: TestClient):
    response = auth_client.post("/tasks", json={"title": "   "})
    assert response.status_code == 422


def test_tasks_require_authentication(client: TestClient):
    response = client.get("/tasks")
    assert response.status_code == 401


def test_list_tasks_returns_only_own_tasks(client: TestClient):
    client.post("/auth/signup", json={"email": "a@example.com", "password": "supersecret1"})
    token_a = client.post(
        "/auth/login", data={"username": "a@example.com", "password": "supersecret1"}
    ).json()["access_token"]

    client.post("/auth/signup", json={"email": "b@example.com", "password": "supersecret1"})
    token_b = client.post(
        "/auth/login", data={"username": "b@example.com", "password": "supersecret1"}
    ).json()["access_token"]

    client.headers.update({"Authorization": f"Bearer {token_a}"})
    client.post("/tasks", json={"title": "Task from A"})

    client.headers.update({"Authorization": f"Bearer {token_b}"})
    client.post("/tasks", json={"title": "Task from B"})

    response = client.get("/tasks")
    titles = [t["title"] for t in response.json()]
    assert titles == ["Task from B"]


def test_filter_tasks_by_status(auth_client: TestClient):
    auth_client.post("/tasks", json={"title": "Todo task", "status": "todo"})
    auth_client.post("/tasks", json={"title": "Done task", "status": "done"})

    response = auth_client.get("/tasks", params={"status_filter": "done"})
    titles = [t["title"] for t in response.json()]
    assert titles == ["Done task"]


def test_update_task(auth_client: TestClient):
    create_response = auth_client.post("/tasks", json={"title": "Original"})
    task_id = create_response.json()["id"]

    update_response = auth_client.put(f"/tasks/{task_id}", json={"status": "done"})
    assert update_response.status_code == 200
    assert update_response.json()["status"] == "done"
    assert update_response.json()["title"] == "Original"


def test_update_nonexistent_task_returns_404(auth_client: TestClient):
    response = auth_client.put("/tasks/9999", json={"status": "done"})
    assert response.status_code == 404


def test_delete_task(auth_client: TestClient):
    create_response = auth_client.post("/tasks", json={"title": "To delete"})
    task_id = create_response.json()["id"]

    delete_response = auth_client.delete(f"/tasks/{task_id}")
    assert delete_response.status_code == 204

    get_response = auth_client.get(f"/tasks/{task_id}")
    assert get_response.status_code == 404


def test_cannot_access_other_users_task(client: TestClient):
    client.post("/auth/signup", json={"email": "owner@example.com", "password": "supersecret1"})
    owner_token = client.post(
        "/auth/login", data={"username": "owner@example.com", "password": "supersecret1"}
    ).json()["access_token"]
    client.headers.update({"Authorization": f"Bearer {owner_token}"})
    task_id = client.post("/tasks", json={"title": "Private task"}).json()["id"]

    client.post("/auth/signup", json={"email": "intruder@example.com", "password": "supersecret1"})
    intruder_token = client.post(
        "/auth/login", data={"username": "intruder@example.com", "password": "supersecret1"}
    ).json()["access_token"]
    client.headers.update({"Authorization": f"Bearer {intruder_token}"})

    response = client.get(f"/tasks/{task_id}")
    assert response.status_code == 404


def test_task_stats(auth_client: TestClient):
    auth_client.post("/tasks", json={"title": "One", "status": "todo"})
    auth_client.post("/tasks", json={"title": "Two", "status": "in_progress"})
    auth_client.post("/tasks", json={"title": "Three", "status": "done"})
    auth_client.post("/tasks", json={"title": "Four", "status": "done"})

    response = auth_client.get("/tasks/stats")
    assert response.json() == {"todo": 1, "in_progress": 1, "done": 2, "total": 4}
