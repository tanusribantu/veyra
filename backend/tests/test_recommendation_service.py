"""Tests for RecommendationService module."""

import pytest
from backend.app.services.recommendation_service import RecommendationService


def test_generate_recommendations_success(app, sample_wardrobe, sample_user_and_profile):
    user, _ = sample_user_and_profile
    service = RecommendationService()

    recs = service.generate_recommendations(
        user_id=user.id,
        occasion="casual",
        result_limit=2,
    )
    assert len(recs) == 2
    # Check that highest score is ranked first
    assert recs[0]["score"] >= recs[1]["score"]
    # Check item structure: each rec must have 3 items (top, bottom, footwear)
    assert len(recs[0]["items"]) == 3
    # Check breakdown presence
    assert "color_score" in recs[0]["breakdown"]
    # Check reasons presence
    assert len(recs[0]["reasons"]) > 0


def test_generate_recommendations_empty_wardrobe(app, sample_user_and_profile):
    service = RecommendationService()
    recs = service.generate_recommendations(
        user_id="empty_user",
        occasion="casual",
        result_limit=3,
    )
    assert recs == []


def test_feedback_submission(app, sample_wardrobe, sample_user_and_profile):
    user, _ = sample_user_and_profile
    service = RecommendationService()

    recs = service.generate_recommendations(user_id=user.id, occasion="casual", result_limit=1)
    rec_id = recs[0]["id"]

    feedback = service.submit_feedback(
        user_id=user.id,
        recommendation_id=rec_id,
        feedback_type="like",
        reason="matches_my_style",
    )
    assert feedback is not None
    assert feedback["feedback_type"] == "like"
    assert feedback["reason"] == "matches_my_style"

    # Verify retrieval
    rec_detail = service.get_recommendation(user_id=user.id, recommendation_id=rec_id)
    assert rec_detail is not None
    assert rec_detail["feedback"]["feedback_type"] == "like"
