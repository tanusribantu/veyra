"""Tests for Supabase JWT verification (valid, expired, missing, tampered)."""

import time
import jwt
import pytest
from backend.app import create_app
from backend.app.models.base import db
from backend.app.models.user import User

TEST_SECRET = "test-secret-key-for-jwt-testing-32-chars-long!"


@pytest.fixture
def auth_app():
    """Create test Flask application with token verification test key."""
    app = create_app("testing")
    app.config["ALLOW_DEV_AUTH_OVERRIDE"] = False
    app.config["JWT_TEST_VERIFY_KEY"] = TEST_SECRET
    app.config["JWT_TEST_ALGORITHM"] = "HS256"
    app.config["SUPABASE_URL"] = "https://testproject.supabase.co"

    with app.app_context():
        db.create_all()
        yield app
        db.session.remove()
        db.drop_all()


@pytest.fixture
def client(auth_app):
    return auth_app.test_client()


def generate_token(sub="supabase-user-123", email="user@example.com", expires_in=3600, secret=TEST_SECRET):
    """Generate signed JWT token for testing."""
    now = int(time.time())
    payload = {
        "sub": sub,
        "email": email,
        "aud": "authenticated",
        "iss": "https://testproject.supabase.co/auth/v1",
        "iat": now,
        "exp": now + expires_in,
    }
    return jwt.encode(payload, secret, algorithm="HS256")


def test_missing_token_returns_401(client):
    """Missing authorization header must return 401 Unauthorized."""
    resp = client.get("/api/v1/profile")
    assert resp.status_code == 401
    data = resp.get_json()
    assert data["error"] == "Unauthorized"
    assert "Missing authorization token" in data["message"]


def test_malformed_auth_header_returns_401(client):
    """Authorization header without 'Bearer ' prefix returns 401."""
    token = generate_token()
    resp = client.get("/api/v1/profile", headers={"Authorization": f"Basic {token}"})
    assert resp.status_code == 401
    data = resp.get_json()
    assert "Bearer" in data["message"]


def test_valid_token_authenticates_and_derives_user(client):
    """Valid JWT token authenticates user, derives auth_user_id and links local User."""
    token = generate_token(sub="sub_valid_001", email="valid@veyra.style")
    resp = client.get("/api/v1/profile", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200

    # Verify user row created in database with auth_user_id
    with client.application.app_context():
        user = User.query.filter_by(auth_user_id="sub_valid_001").first()
        assert user is not None
        assert user.email == "valid@veyra.style"


def test_expired_token_returns_401(client):
    """Expired JWT token returns 401 Token has expired."""
    expired_token = generate_token(expires_in=-300)
    resp = client.get("/api/v1/profile", headers={"Authorization": f"Bearer {expired_token}"})
    assert resp.status_code == 401
    data = resp.get_json()
    assert data["error"] == "Unauthorized"
    assert "expired" in data["message"].lower()


def test_tampered_token_returns_401(client):
    """Token with invalid signature / tampered payload returns 401 Invalid token."""
    # Signed with wrong secret
    tampered_token = generate_token(secret="wrong-secret-key-for-tampering-attempt!!")
    resp = client.get("/api/v1/profile", headers={"Authorization": f"Bearer {tampered_token}"})
    assert resp.status_code == 401
    data = resp.get_json()
    assert data["error"] == "Unauthorized"
    assert "invalid token" in data["message"].lower() or "signature" in data["message"].lower()


def test_production_disallows_dev_auth_override():
    """In production environment, ALLOW_DEV_AUTH_OVERRIDE is strictly False."""
    prod_app = create_app("production")
    assert prod_app.config["ALLOW_DEV_AUTH_OVERRIDE"] is False
