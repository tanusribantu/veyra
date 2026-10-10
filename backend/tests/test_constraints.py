"""Tests for OutfitConstraint model, endpoints, candidate filtering, soft scoring, and impossible fallback."""

import pytest
from backend.app.models.base import db
from backend.app.models.wardrobe import WardrobeItem
from backend.app.models.constraint import OutfitConstraint
from backend.app.services.constraint_service import ConstraintService
from backend.app.services.recommendation_service import RecommendationService


def test_constraint_crud_and_api(client, sample_user_and_profile):
    """Test creating, listing, filtering, and deleting default constraints."""
    user, _ = sample_user_and_profile
    headers = {"X-User-ID": user.id}

    # 1. Create a hard must_include default constraint
    resp1 = client.post(
        "/api/v1/constraints",
        json={
            "constraint_type": "must_include",
            "target_type": "category",
            "target_value": "shirt",
            "strength": "hard",
            "is_saved_default": True,
        },
        headers=headers,
    )
    assert resp1.status_code == 201
    c1 = resp1.get_json()
    assert c1["is_saved_default"] is True
    assert c1["target_value"] == "shirt"

    # 2. Create a soft avoid constraint (not default)
    resp2 = client.post(
        "/api/v1/constraints",
        json={
            "constraint_type": "avoid",
            "target_type": "color",
            "target_value": "neon-green",
            "strength": "soft",
            "is_saved_default": False,
        },
        headers=headers,
    )
    assert resp2.status_code == 201
    c2 = resp2.get_json()
    assert c2["strength"] == "soft"

    # 3. List all constraints
    list_all = client.get("/api/v1/constraints", headers=headers).get_json()["constraints"]
    assert len(list_all) == 2

    # 4. List only default constraints
    list_defaults = client.get("/api/v1/constraints?is_saved_default=true", headers=headers).get_json()["constraints"]
    assert len(list_defaults) == 1
    assert list_defaults[0]["id"] == c1["id"]

    # 5. Delete constraint
    del_resp = client.delete(f"/api/v1/constraints/{c2['id']}", headers=headers)
    assert del_resp.status_code == 200

    # 6. Delete non-existent constraint returns 404
    del_404 = client.delete("/api/v1/constraints/non_existent_id", headers=headers)
    assert del_404.status_code == 404


def test_constraint_api_validation_errors(client, sample_user_and_profile):
    """Test validation errors on invalid constraint attributes."""
    user, _ = sample_user_and_profile
    headers = {"X-User-ID": user.id}

    # Invalid constraint_type
    bad_type = client.post(
        "/api/v1/constraints",
        json={"constraint_type": "disallow", "target_type": "color", "target_value": "red"},
        headers=headers,
    )
    assert bad_type.status_code == 400

    # Invalid target_type
    bad_target = client.post(
        "/api/v1/constraints",
        json={"constraint_type": "must_include", "target_type": "brand", "target_value": "Nike"},
        headers=headers,
    )
    assert bad_target.status_code == 400

    # Invalid strength
    bad_strength = client.post(
        "/api/v1/constraints",
        json={"constraint_type": "must_include", "target_type": "color", "target_value": "navy", "strength": "medium"},
        headers=headers,
    )
    assert bad_strength.status_code == 400


def test_hard_constraints_filter_recommendations(client, sample_user_and_profile, sample_wardrobe):
    """Test that hard must_include and avoid constraints strictly filter candidates."""
    user, _ = sample_user_and_profile
    headers = {"X-User-ID": user.id}

    # Constraint: must_include item_id "test_top_1" (White Oxford Shirt)
    req_must = {
        "occasion": "work",
        "constraints": [
            {
                "constraint_type": "must_include",
                "target_type": "item_id",
                "target_value": "test_top_1",
                "strength": "hard",
            }
        ],
    }
    resp = client.post("/api/v1/recommendations", json=req_must, headers=headers)
    assert resp.status_code == 200
    recs = resp.get_json()["recommendations"]
    assert len(recs) > 0
    for r in recs:
        item_ids = [it["id"] for it in r["items"]]
        assert "test_top_1" in item_ids

    # Constraint: avoid category "t-shirt"
    req_avoid_cat = {
        "occasion": "casual",
        "constraints": [
            {
                "constraint_type": "avoid",
                "target_type": "category",
                "target_value": "t-shirt",
                "strength": "hard",
            }
        ],
    }
    resp_avoid = client.post("/api/v1/recommendations", json=req_avoid_cat, headers=headers)
    assert resp_avoid.status_code == 200
    recs_avoid = resp_avoid.get_json()["recommendations"]
    assert len(recs_avoid) > 0
    for r in recs_avoid:
        categories = [it["category"] for it in r["items"]]
        assert "t-shirt" not in categories

    # Constraint: avoid color "white"
    req_avoid_col = {
        "occasion": "casual",
        "constraints": [
            {
                "constraint_type": "avoid",
                "target_type": "color",
                "target_value": "white",
                "strength": "hard",
            }
        ],
    }
    resp_col = client.post("/api/v1/recommendations", json=req_avoid_col, headers=headers)
    assert resp_col.status_code == 200
    recs_col = resp_col.get_json()["recommendations"]
    assert len(recs_col) > 0
    for r in recs_col:
        colors = [it["color"].lower() for it in r["items"]]
        assert "white" not in colors


def test_soft_constraints_adjust_scoring(client, sample_user_and_profile, sample_wardrobe):
    """Test that soft constraints affect score via the soft_constraint_score component."""
    user, _ = sample_user_and_profile
    headers = {"X-User-ID": user.id}

    # Soft constraint to include brown loafers
    req_soft = {
        "occasion": "work",
        "constraints": [
            {
                "constraint_type": "must_include",
                "target_type": "item_id",
                "target_value": "test_footwear_2",
                "strength": "soft",
            }
        ],
    }
    resp = client.post("/api/v1/recommendations", json=req_soft, headers=headers)
    assert resp.status_code == 200
    recs = resp.get_json()["recommendations"]
    assert len(recs) > 0
    top_rec = recs[0]
    assert "soft_constraint_score" in top_rec["breakdown"]
    # Loafers outfit satisfies the soft constraint (100.0), sneakers outfit gets 0.0
    item_ids = [it["id"] for it in top_rec["items"]]
    if "test_footwear_2" in item_ids:
        assert top_rec["breakdown"]["soft_constraint_score"] == 100.0


def test_saved_default_constraints_applied_automatically(client, sample_user_and_profile, sample_wardrobe):
    """Test that saved default constraints are automatically applied when no inline constraints are passed."""
    user, _ = sample_user_and_profile
    headers = {"X-User-ID": user.id}

    # Save a default constraint: avoid category t-shirt
    client.post(
        "/api/v1/constraints",
        json={
            "constraint_type": "avoid",
            "target_type": "category",
            "target_value": "t-shirt",
            "strength": "hard",
            "is_saved_default": True,
        },
        headers=headers,
    )

    # Request recommendations without inline constraints
    resp = client.post("/api/v1/recommendations", json={"occasion": "casual"}, headers=headers)
    assert resp.status_code == 200
    recs = resp.get_json()["recommendations"]
    assert len(recs) > 0
    for r in recs:
        categories = [it["category"] for it in r["items"]]
        assert "t-shirt" not in categories


def test_impossible_hard_constraint_fallback_and_explanation(client, sample_user_and_profile, sample_wardrobe):
    """Verify that when no outfit satisfies hard constraints, closest options are returned with clear explanation."""
    user, _ = sample_user_and_profile
    headers = {"X-User-ID": user.id}

    # Impossible constraint: must_include a non-existent item and a color not in wardrobe
    req_impossible = {
        "occasion": "work",
        "constraints": [
            {
                "constraint_type": "must_include",
                "target_type": "color",
                "target_value": "neon-purple",
                "strength": "hard",
            }
        ],
    }
    resp = client.post("/api/v1/recommendations", json=req_impossible, headers=headers)
    assert resp.status_code == 200
    data = resp.get_json()

    assert data.get("constraint_blocked") is True
    assert "block_explanation" in data
    explanation = data["block_explanation"]
    assert "neon-purple" in explanation
    assert "No outfits satisfied all requested hard constraints" in explanation

    # Verify recommendations are NOT empty and items are NOT fabricated
    recs = data["recommendations"]
    assert len(recs) > 0
    wardrobe_ids = {it.id for it in sample_wardrobe}
    for r in recs:
        assert r.get("constraint_blocked") is True
        for it in r["items"]:
            # Never fabricate items: each item must exist in real wardrobe
            assert it["id"] in wardrobe_ids


def test_accessory_and_color_must_include_constraints(client, sample_user_and_profile, sample_wardrobe):
    """Test must_include color and accessory_type constraints."""
    user, _ = sample_user_and_profile
    headers = {"X-User-ID": user.id}

    # Add an accessory to wardrobe
    acc = WardrobeItem(
        id="test_acc_1",
        user_id=user.id,
        name="Cashmere Scarf",
        category="scarf",
        slot="accessory",
        accessory_type="scarf",
        color="grey",
        formality=3,
    )
    db.session.add(acc)
    db.session.commit()

    # 1. Must include color navy
    req_navy = {
        "occasion": "casual",
        "constraints": [
            {
                "constraint_type": "must_include",
                "target_type": "color",
                "target_value": "navy",
                "strength": "hard",
            }
        ],
    }
    resp_navy = client.post("/api/v1/recommendations", json=req_navy, headers=headers)
    assert resp_navy.status_code == 200
    recs_navy = resp_navy.get_json()["recommendations"]
    for r in recs_navy:
        colors = [it["color"].lower() for it in r["items"]]
        assert "navy" in colors

    # 2. Must include accessory_type scarf
    req_scarf = {
        "occasion": "casual",
        "constraints": [
            {
                "constraint_type": "must_include",
                "target_type": "accessory_type",
                "target_value": "scarf",
                "strength": "hard",
            }
        ],
    }
    resp_scarf = client.post("/api/v1/recommendations", json=req_scarf, headers=headers)
    assert resp_scarf.status_code == 200
    recs_scarf = resp_scarf.get_json()["recommendations"]
    assert len(recs_scarf) > 0
    for r in recs_scarf:
        acc_types = [it.get("accessory_type") for it in r["items"]]
        assert "scarf" in acc_types


def test_contradictory_hard_constraints_fallback(client, sample_user_and_profile, sample_wardrobe):
    """Test contradictory hard constraints (must_include and avoid same item) gracefully fall back."""
    user, _ = sample_user_and_profile
    headers = {"X-User-ID": user.id}

    # Must include test_top_1 AND avoid test_top_1
    req_conflict = {
        "occasion": "work",
        "constraints": [
            {
                "constraint_type": "must_include",
                "target_type": "item_id",
                "target_value": "test_top_1",
                "strength": "hard",
            },
            {
                "constraint_type": "avoid",
                "target_type": "item_id",
                "target_value": "test_top_1",
                "strength": "hard",
            },
        ],
    }
    resp = client.post("/api/v1/recommendations", json=req_conflict, headers=headers)
    assert resp.status_code == 200
    data = resp.get_json()
    assert data.get("constraint_blocked") is True
    assert len(data["recommendations"]) > 0
    assert "No outfits satisfied all requested hard constraints" in data["block_explanation"]

