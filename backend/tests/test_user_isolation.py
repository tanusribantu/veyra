"""Tests proving strict user isolation: User A cannot read, edit, or delete User B's resources."""

import time
import jwt
import pytest
from backend.app import create_app
from backend.app.models.base import db

TEST_SECRET = "test-secret-isolation-key-32-chars-long!"


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


def make_token(sub: str, email: str) -> str:
    now = int(time.time())
    payload = {
        "sub": sub,
        "email": email,
        "aud": "authenticated",
        "iat": now,
        "exp": now + 3600,
    }
    return jwt.encode(payload, TEST_SECRET, algorithm="HS256")


@pytest.fixture
def user_a_headers():
    token = make_token("sub_user_a", "usera@example.com")
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def user_b_headers():
    token = make_token("sub_user_b", "userb@example.com")
    return {"Authorization": f"Bearer {token}"}


def test_wardrobe_user_isolation(client, user_a_headers, user_b_headers):
    """User B cannot read, edit, or delete User A's wardrobe items."""
    # 1. User A adds an item
    resp_create = client.post(
        "/api/v1/wardrobe",
        headers=user_a_headers,
        json={
            "name": "Navy Cashmere Sweater",
            "category": "sweater",
            "slot": "top",
            "color": "navy",
            "fit": "regular",
            "formality": 3,
        },
    )
    assert resp_create.status_code == 201
    item_id = resp_create.get_json()["id"]

    # 2. User B lists wardrobe -> empty list
    resp_list_b = client.get("/api/v1/wardrobe", headers=user_b_headers)
    assert resp_list_b.status_code == 200
    assert len(resp_list_b.get_json()) == 0

    # 3. User B attempts to read User A's item -> 404
    resp_get_b = client.get(f"/api/v1/wardrobe/{item_id}", headers=user_b_headers)
    assert resp_get_b.status_code == 404

    # 4. User B attempts to edit User A's item -> 404
    resp_patch_b = client.patch(
        f"/api/v1/wardrobe/{item_id}",
        headers=user_b_headers,
        json={"name": "Hacked Sweater"},
    )
    assert resp_patch_b.status_code == 404

    # 5. User B attempts to delete User A's item -> 404
    resp_delete_b = client.delete(f"/api/v1/wardrobe/{item_id}", headers=user_b_headers)
    assert resp_delete_b.status_code == 404

    # 6. User A can still read item unmodified
    resp_get_a = client.get(f"/api/v1/wardrobe/{item_id}", headers=user_a_headers)
    assert resp_get_a.status_code == 200
    assert resp_get_a.get_json()["name"] == "Navy Cashmere Sweater"


def test_profile_user_isolation(client, user_a_headers, user_b_headers):
    """User A's profile updates do not bleed into User B's profile."""
    # User A updates profile
    client.put(
        "/api/v1/profile",
        headers=user_a_headers,
        json={
            "preferred_styles": ["streetwear"],
            "favorite_colors": ["terracotta"],
            "skin_undertone": "warm",
        },
    )

    # User B fetches profile -> default profile, not user A's
    resp_b = client.get("/api/v1/profile", headers=user_b_headers)
    assert resp_b.status_code == 200
    data_b = resp_b.get_json()
    assert data_b["preferred_styles"] != ["streetwear"]
    assert "terracotta" not in data_b["favorite_colors"]


def test_measurements_user_isolation(client, user_a_headers, user_b_headers):
    """User B cannot read or delete User A's body measurements."""
    # User A saves measurements
    resp_save = client.post(
        "/api/v1/measurements",
        headers=user_a_headers,
        json={
            "height": 178,
            "shoulder": 46,
            "chest_bust": 98,
            "waist": 82,
            "hips": 96,
            "unit": "cm",
        },
    )
    assert resp_save.status_code == 201

    # User B reads measurements -> missing
    resp_b = client.get("/api/v1/measurements", headers=user_b_headers)
    assert resp_b.status_code == 200
    assert resp_b.get_json()["measurements_missing"] is True

    # User B deletes measurements -> does not delete user A's measurements
    client.delete("/api/v1/measurements", headers=user_b_headers)

    resp_a = client.get("/api/v1/measurements", headers=user_a_headers)
    assert resp_a.status_code == 200
    assert resp_a.get_json()["measurements_missing"] is False


def test_quiz_result_user_isolation(client, user_a_headers, user_b_headers):
    """User B cannot view or delete User A's quiz result."""
    # User A submits quiz
    resp_submit = client.post(
        "/api/v1/style-quiz/answers",
        headers=user_a_headers,
        json={
            "answers": {
                "q1": "q1_a",
                "q2": "q2_a",
                "q3": "q3_a",
                "q4": "q4_a",
                "q5": "q5_a",
                "q6": "q6_a",
                "q7": "q7_a",
                "q8": "q8_a",
            }
        },
    )
    assert resp_submit.status_code == 201

    # User B requests latest result -> 404
    resp_b = client.get("/api/v1/style-quiz/result", headers=user_b_headers)
    assert resp_b.status_code == 404

    # User B attempts to delete result -> 404
    resp_del_b = client.delete("/api/v1/style-quiz/result", headers=user_b_headers)
    assert resp_del_b.status_code == 404

    # User A can still retrieve result
    resp_a = client.get("/api/v1/style-quiz/result", headers=user_a_headers)
    assert resp_a.status_code == 200


def test_constraints_user_isolation(client, user_a_headers, user_b_headers):
    """User B cannot read or delete User A's constraints."""
    # User A creates constraint
    resp_create = client.post(
        "/api/v1/constraints",
        headers=user_a_headers,
        json={
            "constraint_type": "must_include",
            "target_type": "color",
            "target_value": "olive",
            "strength": "hard",
        },
    )
    assert resp_create.status_code == 201
    const_id = resp_create.get_json()["id"]

    # User B list constraints -> empty
    resp_list_b = client.get("/api/v1/constraints", headers=user_b_headers)
    assert resp_list_b.status_code == 200
    assert len(resp_list_b.get_json()["constraints"]) == 0

    # User B get constraint -> 404
    resp_get_b = client.get(f"/api/v1/constraints/{const_id}", headers=user_b_headers)
    assert resp_get_b.status_code == 404

    # User B delete constraint -> 404
    resp_del_b = client.delete(f"/api/v1/constraints/{const_id}", headers=user_b_headers)
    assert resp_del_b.status_code == 404


def test_recommendations_and_feedback_user_isolation(client, user_a_headers, user_b_headers):
    """User B cannot view User A's recommendations or submit feedback on them."""
    # 1. Setup User A's wardrobe items to generate recommendations
    items = [
        {"name": "White Shirt", "category": "shirt", "slot": "top", "color": "white", "fit": "regular", "formality": 2},
        {"name": "Navy Chinos", "category": "chinos", "slot": "bottom", "color": "navy", "fit": "regular", "formality": 2},
        {"name": "White Sneakers", "category": "sneakers", "slot": "footwear", "color": "white", "fit": "regular", "formality": 2},
    ]
    for it in items:
        client.post("/api/v1/wardrobe", headers=user_a_headers, json=it)

    # 2. User A generates recommendations
    resp_rec = client.post(
        "/api/v1/recommendations",
        headers=user_a_headers,
        json={"occasion": "smart_casual", "result_limit": 1},
    )
    assert resp_rec.status_code == 200
    recs = resp_rec.get_json()["recommendations"]
    assert len(recs) > 0
    rec_id = recs[0]["id"]

    # 3. User B lists recommendations -> empty
    resp_list_b = client.get("/api/v1/recommendations", headers=user_b_headers)
    assert resp_list_b.status_code == 200
    assert len(resp_list_b.get_json()["recommendations"]) == 0

    # 4. User B cannot read User A's recommendation -> 404
    resp_get_b = client.get(f"/api/v1/recommendations/{rec_id}", headers=user_b_headers)
    assert resp_get_b.status_code == 404

    # 5. User B cannot submit feedback on User A's recommendation -> 404
    resp_fb_b = client.post(
        f"/api/v1/recommendations/{rec_id}/feedback",
        headers=user_b_headers,
        json={"feedback_type": "like"},
    )
    assert resp_fb_b.status_code == 404
