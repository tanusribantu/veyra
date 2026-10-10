"""Integration tests for Veyra REST API endpoints."""

import pytest
import json


def test_health_endpoint(client):
    res = client.get("/api/v1/health")
    assert res.status_code == 200
    data = res.get_json()
    assert data["status"] == "ok"
    assert data["service"] == "veyra-api"
    assert "version" in data


def test_meta_endpoint(client):
    res = client.get("/api/v1/meta")
    assert res.status_code == 200
    data = res.get_json()
    assert "categories" in data
    assert "occasions" in data
    assert "slots" in data
    assert "casual" in data["occasions"]
    assert "shirt" in data["categories"]


def test_profile_endpoints(client):
    # GET default profile
    res = client.get("/api/v1/profile", headers={"X-User-ID": "user_api_test"})
    assert res.status_code == 200
    data = res.get_json()
    assert data["user_id"] == "user_api_test"
    assert "minimal" in data["preferred_styles"]

    # PUT update profile
    update_payload = {
        "preferred_styles": ["streetwear", "casual"],
        "favorite_colors": ["black", "charcoal"],
        "formality_preference": 2,
    }
    res = client.put(
        "/api/v1/profile",
        json=update_payload,
        headers={"X-User-ID": "user_api_test"},
    )
    assert res.status_code == 200
    updated = res.get_json()
    assert updated["preferred_styles"] == ["streetwear", "casual"]
    assert updated["favorite_colors"] == ["black", "charcoal"]

    # GET preferences
    res = client.get("/api/v1/profile/preferences", headers={"X-User-ID": "user_api_test"})
    assert res.status_code == 200
    prefs = res.get_json()
    assert prefs["formality_preference"] == 2


def test_wardrobe_crud_endpoints(client):
    headers = {"X-User-ID": "user_api_test"}

    # 1. POST wardrobe item
    new_item = {
        "name": "Classic White Oxford",
        "category": "shirt",
        "color": "white",
        "pattern": "solid",
        "fit": "regular",
        "formality": 3,
        "style_tags": ["minimal", "classic"],
    }
    res = client.post("/api/v1/wardrobe", json=new_item, headers=headers)
    assert res.status_code == 201
    item = res.get_json()
    item_id = item["id"]
    assert item["name"] == "Classic White Oxford"
    assert item["slot"] == "top"

    # 2. GET list
    res = client.get("/api/v1/wardrobe", headers=headers)
    assert res.status_code == 200
    items = res.get_json()
    assert len(items) == 1

    # 3. GET single item
    res = client.get(f"/api/v1/wardrobe/{item_id}", headers=headers)
    assert res.status_code == 200
    assert res.get_json()["id"] == item_id

    # 4. PATCH item
    res = client.patch(
        f"/api/v1/wardrobe/{item_id}",
        json={"name": "Updated Oxford Shirt", "formality": 4},
        headers=headers,
    )
    assert res.status_code == 200
    assert res.get_json()["name"] == "Updated Oxford Shirt"
    assert res.get_json()["formality"] == 4

    # 5. DELETE item
    res = client.delete(f"/api/v1/wardrobe/{item_id}", headers=headers)
    assert res.status_code == 200

    # 6. GET deleted item -> 404
    res = client.get(f"/api/v1/wardrobe/{item_id}", headers=headers)
    assert res.status_code == 404


def test_wardrobe_validation_errors(client):
    headers = {"X-User-ID": "user_api_test"}

    # Unsupported category
    res = client.post(
        "/api/v1/wardrobe",
        json={"name": "Spacesuit", "category": "astronaut_suit", "color": "white", "formality": 3},
        headers=headers,
    )
    assert res.status_code == 400

    # Formality out of bounds (> 5)
    res = client.post(
        "/api/v1/wardrobe",
        json={"name": "Gold Tuxedo", "category": "shirt", "color": "white", "formality": 10},
        headers=headers,
    )
    assert res.status_code == 400


def test_recommendation_and_feedback_flow(client, sample_wardrobe):
    headers = {"X-User-ID": "user_test"}

    # 1. Request recommendation
    req_body = {
        "occasion": "casual",
        "result_limit": 2,
    }
    res = client.post("/api/v1/recommendations", json=req_body, headers=headers)
    assert res.status_code == 200
    data = res.get_json()
    assert "recommendations" in data
    recs = data["recommendations"]
    assert len(recs) == 2
    rec_id = recs[0]["id"]
    assert recs[0]["score"] > 0
    assert len(recs[0]["items"]) == 3
    assert len(recs[0]["reasons"]) > 0

    # 2. Invalid occasion -> 400
    res = client.post(
        "/api/v1/recommendations",
        json={"occasion": "scuba_diving_party"},
        headers=headers,
    )
    assert res.status_code == 400

    # 3. GET recommendations history
    res = client.get("/api/v1/recommendations", headers=headers)
    assert res.status_code == 200
    history = res.get_json()["recommendations"]
    assert len(history) >= 2

    # 4. GET specific recommendation
    res = client.get(f"/api/v1/recommendations/{rec_id}", headers=headers)
    assert res.status_code == 200
    assert res.get_json()["id"] == rec_id

    # 5. POST feedback
    feedback_payload = {
        "feedback_type": "like",
        "reason": "matches_my_style",
    }
    res = client.post(
        f"/api/v1/recommendations/{rec_id}/feedback",
        json=feedback_payload,
        headers=headers,
    )
    assert res.status_code == 200
    fb = res.get_json()
    assert fb["feedback_type"] == "like"
    assert fb["reason"] == "matches_my_style"

    # 6. Invalid feedback type -> 400
    res = client.post(
        f"/api/v1/recommendations/{rec_id}/feedback",
        json={"feedback_type": "super_love"},
        headers=headers,
    )
    assert res.status_code == 400
