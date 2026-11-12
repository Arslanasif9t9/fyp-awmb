PASSWORD = "Passw0rd!x"


def _register(client, email):
    r = client.post(
        "/api/auth/register",
        json={"name": "Test User", "email": email, "password": PASSWORD},
    )
    assert r.status_code == 201, r.text
    return r.json()["access_token"]


def _auth(token):
    return {"Authorization": f"Bearer {token}"}


def test_register_login_and_wrong_password(client):
    _register(client, "a@example.com")

    ok = client.post(
        "/api/auth/login", data={"username": "a@example.com", "password": PASSWORD}
    )
    assert ok.status_code == 200
    me = client.get("/api/auth/me", headers=_auth(ok.json()["access_token"]))
    assert me.status_code == 200
    assert me.json()["email"] == "a@example.com"
    assert me.json()["role"] == "user"

    bad = client.post(
        "/api/auth/login", data={"username": "a@example.com", "password": "wrong-pass"}
    )
    assert bad.status_code == 401


def test_worlds_are_private_per_user(client):
    token_a = _register(client, "a@example.com")
    token_b = _register(client, "b@example.com")

    created = client.post(
        "/api/worlds",
        json={"name": "City Traffic", "domain": "city_traffic", "purpose": "Bridge test"},
        headers=_auth(token_a),
    )
    assert created.status_code == 201
    world_id = created.json()["id"]

    # User B cannot see, open or delete User A's world.
    assert client.get("/api/worlds", headers=_auth(token_b)).json() == []
    assert client.get(f"/api/worlds/{world_id}", headers=_auth(token_b)).status_code == 404
    assert client.delete(f"/api/worlds/{world_id}", headers=_auth(token_b)).status_code == 404

    # User A still can, and a normal user cannot use admin routes.
    assert client.get(f"/api/worlds/{world_id}", headers=_auth(token_a)).status_code == 200
    assert client.get("/api/admin/users", headers=_auth(token_a)).status_code == 403
