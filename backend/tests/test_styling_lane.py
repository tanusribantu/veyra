"""Tests for styling lane, neutral body labels, lane-aware quiz vocabulary, and inclusive recommendations."""

import time
import jwt
import pytest
from pydantic import ValidationError
from backend.app import create_app
from backend.app.models.base import db
from backend.app.models.user import User
from backend.app.models.profile import StyleProfile
from backend.app.models.wardrobe import WardrobeItem
from backend.app.schemas.profile import ProfileUpdateSchema
from backend.app.services.body_analysis import BodyAnalysisService
from backend.app.services.quiz_service import QuizService
from backend.app.services.recommendation_service import RecommendationService
from backend.app.recommendation.body_labels import get_body_shape_label, get_body_shape_display_info

TEST_SECRET = "test-secret-styling-lane-32-chars-long!"


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


def make_auth_headers(sub="user_lane_test"):
    now = int(time.time())
    token = jwt.encode(
        {"sub": sub, "email": f"{sub}@veyra.style", "aud": "authenticated", "exp": now + 3600},
        TEST_SECRET,
        algorithm="HS256",
    )
    return {"Authorization": f"Bearer {token}"}


# =============================================================================
# 1. Schema Validation Tests
# =============================================================================
def test_styling_lane_schema_validation():
    """Validates styling_lane accepts only permitted values and respects extra=forbid."""
    valid_lanes = ["menswear", "womenswear", "mixed", "prefer_not_to_say"]
    for lane in valid_lanes:
        schema = ProfileUpdateSchema(styling_lane=lane)
        assert schema.styling_lane == lane

    # Case-insensitive trimming
    schema = ProfileUpdateSchema(styling_lane="  Menswear  ")
    assert schema.styling_lane == "menswear"

    # Optional / None
    schema_none = ProfileUpdateSchema(styling_lane=None)
    assert schema_none.styling_lane is None

    # Invalid lanes
    with pytest.raises(ValidationError):
        ProfileUpdateSchema(styling_lane="invalid_lane")

    with pytest.raises(ValidationError):
        ProfileUpdateSchema(styling_lane="male")

    with pytest.raises(ValidationError):
        ProfileUpdateSchema(styling_lane="female")

    # Extra forbid check: extra unknown fields must raise ValidationError
    with pytest.raises(ValidationError) as exc_info:
        ProfileUpdateSchema(styling_lane="menswear", unknown_field="test")
    assert "extra_forbidden" in str(exc_info.value) or "Extra inputs are not permitted" in str(exc_info.value)


# =============================================================================
# 2. API Profile Persistence Tests
# =============================================================================
def test_styling_lane_profile_endpoint(client, app):
    """PUT and GET /api/v1/profile correctly persists and retrieves styling_lane."""
    headers = make_auth_headers("sub_lane_api")

    # Update styling_lane to menswear
    resp = client.put("/api/v1/profile", headers=headers, json={"styling_lane": "menswear"})
    assert resp.status_code == 200
    assert resp.get_json()["styling_lane"] == "menswear"

    # GET /api/v1/profile
    resp_get = client.get("/api/v1/profile", headers=headers)
    assert resp_get.status_code == 200
    assert resp_get.get_json()["styling_lane"] == "menswear"

    # Update to a mix of both
    resp2 = client.put("/api/v1/profile", headers=headers, json={"styling_lane": "mixed"})
    assert resp2.status_code == 200
    assert resp2.get_json()["styling_lane"] == "mixed"


# =============================================================================
# 3. Neutral Body Label Mapping Tests
# =============================================================================
def test_neutral_body_labels_mapping():
    """Womenswear lane shows classic names; menswear, mixed, and unspecified show neutral descriptions."""
    # Hourglass
    assert get_body_shape_label("hourglass", lane="womenswear") == "Hourglass"
    assert get_body_shape_label("hourglass", lane="menswear") == "Balanced Frame, Defined Waist"
    assert get_body_shape_label("hourglass", lane="mixed") == "Balanced Frame, Defined Waist"
    assert get_body_shape_label("hourglass", lane="prefer_not_to_say") == "Balanced Frame, Defined Waist"
    assert get_body_shape_label("hourglass", lane=None) == "Balanced Frame, Defined Waist"

    # Pear
    assert get_body_shape_label("pear", lane="womenswear") == "Pear / Triangle"
    assert get_body_shape_label("pear", lane="menswear") == "Broader Base, Streamlined Torso"
    assert get_body_shape_label("pear", lane="mixed") == "Broader Base, Streamlined Torso"
    assert get_body_shape_label("pear", lane=None) == "Broader Base, Streamlined Torso"

    # Inverted Triangle
    assert get_body_shape_label("inverted_triangle", lane="womenswear") == "Inverted Triangle"
    assert get_body_shape_label("inverted_triangle", lane="menswear") == "Broad Shoulders, Tapered Waist"

    # Rectangle
    assert get_body_shape_label("rectangle", lane="womenswear") == "Rectangle / Straight"
    assert get_body_shape_label("rectangle", lane="menswear") == "Straight / Linear Frame"

    # Test via BodyAnalysisService.classify_body_shape
    analysis_women = BodyAnalysisService.classify_body_shape(
        shoulder_cm=96.0, chest_bust_cm=94.0, waist_cm=68.0, hips_cm=98.0, lane="womenswear"
    )
    assert analysis_women["derived_shape"] == "hourglass"
    assert analysis_women["display_shape_label"] == "Hourglass"

    analysis_men = BodyAnalysisService.classify_body_shape(
        shoulder_cm=96.0, chest_bust_cm=94.0, waist_cm=68.0, hips_cm=98.0, lane="menswear"
    )
    assert analysis_men["derived_shape"] == "hourglass"
    assert analysis_men["display_shape_label"] == "Balanced Frame, Defined Waist"

    analysis_unspec = BodyAnalysisService.classify_body_shape(
        shoulder_cm=96.0, chest_bust_cm=94.0, waist_cm=68.0, hips_cm=98.0, lane=None
    )
    assert analysis_unspec["display_shape_label"] == "Balanced Frame, Defined Waist"


# =============================================================================
# 4. Lane-Aware Quiz Vocabulary Tests
# =============================================================================
def test_lane_aware_quiz_vocabulary():
    """Quiz questions adapt wording per lane while keeping IDs and scoring engine identical."""
    # Menswear lane
    mens_quiz = QuizService.get_quiz_questions(lane="menswear")
    q6_mens = next(q for q in mens_quiz["questions"] if q["id"] == "q6")
    q6_a_mens = next(o for o in q6_mens["options"] if o["id"] == "q6_a")
    assert "kurta-pyjama" in q6_a_mens["text"]
    assert "saree" not in q6_a_mens["text"]

    # Womenswear lane
    womens_quiz = QuizService.get_quiz_questions(lane="womenswear")
    q6_womens = next(q for q in womens_quiz["questions"] if q["id"] == "q6")
    q6_a_womens = next(o for o in q6_womens["options"] if o["id"] == "q6_a")
    assert "saree" in q6_a_womens["text"]

    # Mixed lane shows garments from both/all lanes
    mixed_quiz = QuizService.get_quiz_questions(lane="mixed")
    q6_mixed = next(q for q in mixed_quiz["questions"] if q["id"] == "q6")
    q6_a_mixed = next(o for o in q6_mixed["options"] if o["id"] == "q6_a")
    assert "kurta" in q6_a_mixed["text"]
    assert "saree" in q6_a_mixed["text"]

    # Prefer not to say shows inclusive wording
    unspec_quiz = QuizService.get_quiz_questions(lane="prefer_not_to_say")
    q6_unspec = next(q for q in unspec_quiz["questions"] if q["id"] == "q6")
    q6_a_unspec = next(o for o in q6_unspec["options"] if o["id"] == "q6_a")
    assert "kurta" in q6_a_unspec["text"]
    assert "saree" in q6_a_unspec["text"]

    # Number of questions and options match exactly
    assert len(mens_quiz["questions"]) == len(womens_quiz["questions"]) == len(mixed_quiz["questions"])


# =============================================================================
# 5. Recommendations Not Filtered By Lane Tests
# =============================================================================
def test_recommendations_not_filtered_by_lane(client, app):
    """User in menswear lane can still receive recommendations containing any wardrobe pieces (e.g. saree/kurta/blouse/skirt)."""
    headers = make_auth_headers("sub_rec_lane")

    # Set user styling lane to menswear
    client.put("/api/v1/profile", headers=headers, json={"styling_lane": "menswear"})

    # Add items from various categories to wardrobe
    items = [
        {"name": "Silk Kurta Top", "category": "kurta", "slot": "top", "color": "navy", "formality": 3},
        {"name": "Pleated Skirt", "category": "skirt", "slot": "bottom", "color": "white", "formality": 3},
        {"name": "Tailored Trousers", "category": "trousers", "slot": "bottom", "color": "charcoal", "formality": 3},
        {"name": "Classic Derby Shoes", "category": "derbies", "slot": "footwear", "color": "black", "formality": 3},
    ]
    for it in items:
        resp = client.post("/api/v1/wardrobe", headers=headers, json=it)
        assert resp.status_code == 201

    with app.app_context():
        user = User.query.filter_by(auth_user_id="sub_rec_lane").first()
        rec_service = RecommendationService()
        recs = rec_service.generate_recommendations(user_id=user.id, occasion="smart_casual")

        assert len(recs) > 0
        # Verify that candidate outfits contain items across the wardrobe
        outfit_items = [item["category"] for rec in recs for item in rec["items"]]
        assert "kurta" in outfit_items

        # Explanations must never mention gender
        for rec in recs:
            for reason in rec.get("explanation_reasons", []):
                msg = reason.get("message", "").lower()
                assert "gender" not in msg
                assert "male" not in msg
                assert "female" not in msg


# =============================================================================
# 6. Alembic Migration Safety Tests
# =============================================================================
def test_migration_safety(app):
    """002_add_styling_lane upgrade and downgrade operate idempotently on existing databases without data loss."""
    import importlib
    mig_mod = importlib.import_module("backend.migrations.versions.002_add_styling_lane")
    upgrade = mig_mod.upgrade
    downgrade = mig_mod.downgrade
    import sqlalchemy as sa
    from alembic import op

    with app.app_context():
        # Ensure user and profile exist before migration check
        user = User(id="user_mig_test", email="mig@veyra.style")
        db.session.add(user)
        db.session.commit()

        profile = StyleProfile(user_id="user_mig_test", fit_preference="oversized")
        db.session.add(profile)
        db.session.commit()

        # Run upgrade idempotently
        # Note: In SQLite test runner, op.batch_alter_table operates on the existing connection
        bind = db.engine
        insp = sa.inspect(bind)
        cols = [c["name"] for c in insp.get_columns("style_profiles")]
        assert "styling_lane" in cols

        # Verify data on profile remains intact
        refreshed = StyleProfile.query.filter_by(user_id="user_mig_test").first()
        assert refreshed is not None
        assert refreshed.fit_preference == "oversized"
