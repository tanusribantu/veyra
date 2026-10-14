"""Tests for account deletion and cascading data removal."""

import time
import jwt
import pytest
from backend.app import create_app
from backend.app.models.base import db
from backend.app.models.user import User
from backend.app.models.profile import StyleProfile
from backend.app.models.wardrobe import WardrobeItem
from backend.app.models.measurements import BodyMeasurements
from backend.app.models.constraint import OutfitConstraint
from backend.app.models.quiz import StyleQuizResult

TEST_SECRET = "test-secret-account-delete-32-chars-long!"


@pytest.fixture
def app():
    app = create_app("testing")
    app.config["ALLOW_DEV_AUTH_OVERRIDE"] = False
    app.config["JWT_TEST_VERIFY_KEY"] = TEST_SECRET
    app.config["JWT_TEST_ALGORITHM"] = "HS256"

    with app.app_context():
        db.create_all()
        yield app
        db.session.remove()
        db.drop_all()


@pytest.fixture
def client(app):
    return app.test_client()


def test_delete_account_removes_all_user_data(client, app):
    """Calling DELETE /api/v1/account permanently deletes user and all cascaded children."""
    now = int(time.time())
    token = jwt.encode(
        {"sub": "sub_delete_user", "email": "to_delete@veyra.style", "aud": "authenticated", "exp": now + 3600},
        TEST_SECRET,
        algorithm="HS256",
    )
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Populate full set of user data
    client.put("/api/v1/profile", headers=headers, json={"preferred_styles": ["minimal"]})
    client.post(
        "/api/v1/wardrobe",
        headers=headers,
        json={"name": "Linen Shirt", "category": "shirt", "slot": "top", "color": "white", "fit": "regular", "formality": 2},
    )
    client.post(
        "/api/v1/measurements",
        headers=headers,
        json={"height": 175, "shoulder": 44, "chest_bust": 95, "waist": 80, "hips": 95, "unit": "cm"},
    )
    client.post(
        "/api/v1/constraints",
        headers=headers,
        json={"constraint_type": "must_include", "target_type": "color", "target_value": "white"},
    )
    client.post(
        "/api/v1/style-quiz/answers",
        headers=headers,
        json={"answers": {"q1": "q1_a"}},
    )

    with app.app_context():
        user = User.query.filter_by(auth_user_id="sub_delete_user").first()
        assert user is not None
        uid = user.id
        assert StyleProfile.query.filter_by(user_id=uid).count() == 1
        assert WardrobeItem.query.filter_by(user_id=uid).count() == 1
        assert BodyMeasurements.query.filter_by(user_id=uid).count() == 1
        assert OutfitConstraint.query.filter_by(user_id=uid).count() == 1
        assert StyleQuizResult.query.filter_by(user_id=uid).count() == 1

    # 2. Call DELETE /api/v1/account
    resp_del = client.delete("/api/v1/account", headers=headers)
    assert resp_del.status_code == 200
    assert "permanently deleted" in resp_del.get_json()["message"]

    # 3. Verify in database that EVERY row has been deleted
    with app.app_context():
        assert User.query.filter_by(auth_user_id="sub_delete_user").count() == 0
        assert StyleProfile.query.filter_by(user_id=uid).count() == 0
        assert WardrobeItem.query.filter_by(user_id=uid).count() == 0
        assert BodyMeasurements.query.filter_by(user_id=uid).count() == 0
        assert OutfitConstraint.query.filter_by(user_id=uid).count() == 0
        assert StyleQuizResult.query.filter_by(user_id=uid).count() == 0


def test_delete_account_invokes_supabase_admin_api(client, app, mocker):
    """Account deletion invokes Supabase Admin API with SUPABASE_SECRET_KEY or SUPABASE_SERVICE_ROLE_KEY."""
    mock_delete = mocker.patch("requests.delete")
    mock_delete.return_value.status_code = 200

    now = int(time.time())
    token = jwt.encode(
        {"sub": "sub_admin_del_test", "email": "admin_del@veyra.style", "aud": "authenticated", "exp": now + 3600},
        TEST_SECRET,
        algorithm="HS256",
    )
    headers = {"Authorization": f"Bearer {token}"}

    # Test with SUPABASE_SECRET_KEY
    app.config["SUPABASE_URL"] = "https://example.supabase.co"
    app.config["SUPABASE_SECRET_KEY"] = "secret_key_123"
    app.config["SUPABASE_SERVICE_ROLE_KEY"] = ""

    # Call PUT /profile first so user exists
    client.put("/api/v1/profile", headers=headers, json={"preferred_styles": ["minimal"]})
    resp = client.delete("/api/v1/account", headers=headers)
    assert resp.status_code == 200
    mock_delete.assert_called_with(
        "https://example.supabase.co/auth/v1/admin/users/sub_admin_del_test",
        headers={"Authorization": "Bearer secret_key_123", "apikey": "secret_key_123"},
        timeout=5,
    )

    # Test with SUPABASE_SERVICE_ROLE_KEY
    mock_delete.reset_mock()
    token2 = jwt.encode(
        {"sub": "sub_admin_del_test_2", "email": "admin_del2@veyra.style", "aud": "authenticated", "exp": now + 3600},
        TEST_SECRET,
        algorithm="HS256",
    )
    headers2 = {"Authorization": f"Bearer {token2}"}
    app.config["SUPABASE_SECRET_KEY"] = ""
    app.config["SUPABASE_SERVICE_ROLE_KEY"] = "service_role_key_456"

    client.put("/api/v1/profile", headers=headers2, json={"preferred_styles": ["casual"]})
    resp2 = client.delete("/api/v1/account", headers=headers2)
    assert resp2.status_code == 200
    mock_delete.assert_called_with(
        "https://example.supabase.co/auth/v1/admin/users/sub_admin_del_test_2",
        headers={"Authorization": "Bearer service_role_key_456", "apikey": "service_role_key_456"},
        timeout=5,
    )
