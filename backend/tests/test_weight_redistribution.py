"""Tests for dynamic scoring weight redistribution and missing data handling."""

import pytest
from backend.app.recommendation.scoring_config import (
    BASE_SCORING_WEIGHTS,
    redistribute_weights,
)
from backend.app.recommendation.scorer import OutfitScorer


def test_base_scoring_weights_sum_to_one():
    total = sum(BASE_SCORING_WEIGHTS.values())
    assert abs(total - 1.0) < 1e-6


def test_redistribute_all_active():
    active = {k: True for k in BASE_SCORING_WEIGHTS}
    weights = redistribute_weights(active)
    assert abs(sum(weights.values()) - 1.0) < 1e-6
    for k in BASE_SCORING_WEIGHTS:
        assert weights[k] == BASE_SCORING_WEIGHTS[k]


def test_redistribute_personal_attributes_missing():
    # If personal_attribute_match is inactive, its 0.15 weight is redistributed
    active = {k: True for k in BASE_SCORING_WEIGHTS}
    active["personal_attribute_match"] = False

    weights = redistribute_weights(active)
    assert abs(sum(weights.values()) - 1.0) < 1e-6
    assert weights["personal_attribute_match"] == 0.0

    # Remaining 5 weights should match Phase 1 exact weights:
    # 0.25 / 0.85 = ~0.294 (or scaled proportionally)
    assert weights["color_compatibility"] > BASE_SCORING_WEIGHTS["color_compatibility"]
    assert weights["occasion_suitability"] > BASE_SCORING_WEIGHTS["occasion_suitability"]


def test_redistribute_arbitrary_missing():
    active = {
        "color_compatibility": True,
        "occasion_suitability": True,
        "style_preference": False,
        "formality_cohesion": False,
        "micro_preference": False,
        "personal_attribute_match": False,
    }
    weights = redistribute_weights(active)
    assert abs(sum(weights.values()) - 1.0) < 1e-6
    assert weights["style_preference"] == 0.0
    assert weights["color_compatibility"] > 0
    assert weights["occasion_suitability"] > 0


def test_scorer_with_and_without_personal_attributes():
    scorer = OutfitScorer()
    items = [
        {"slot": "top", "category": "shirt", "color": "white", "formality": 3, "style_tags": ["minimal"], "fit": "regular"},
        {"slot": "bottom", "category": "chinos", "color": "navy", "formality": 3, "style_tags": ["minimal"], "fit": "regular"},
        {"slot": "footwear", "category": "loafers", "color": "brown", "formality": 3, "style_tags": ["smart_casual"], "fit": "regular"},
    ]
    profile = {
        "preferred_styles": ["minimal"],
        "favorite_colors": ["navy", "white"],
    }

    # 1. Without body measurements or personal attributes
    res_no_attr = scorer.score_outfit(
        candidate_items=items,
        occasion="work",
        user_profile=profile,
        body_shape=None,
    )
    score_no_attr = res_no_attr["score"]
    weights_no_attr = res_no_attr["meta"]["weights"]
    assert 0.0 <= score_no_attr <= 100.0
    assert abs(sum(weights_no_attr.values()) - 1.0) < 1e-6
    assert weights_no_attr["personal_attribute_match"] == 0.0
    assert "personal_attribute_score" not in res_no_attr["breakdown"]

    # 2. With body shape and personal attributes
    res_with_attr = scorer.score_outfit(
        candidate_items=items,
        occasion="work",
        user_profile={**profile, "skin_undertone": "cool", "face_shape": "oval"},
        body_shape="hourglass",
    )
    score_with_attr = res_with_attr["score"]
    weights_with_attr = res_with_attr["meta"]["weights"]
    assert 0.0 <= score_with_attr <= 100.0
    assert abs(sum(weights_with_attr.values()) - 1.0) < 1e-6
    assert weights_with_attr["personal_attribute_match"] > 0.0
    assert "personal_attribute_score" in res_with_attr["breakdown"]


def test_redistribute_with_and_without_quiz_result():
    """Verify that style_archetype_match weight is allocated when active and proportionally redistributed when inactive."""
    # 1. With quiz result active
    active_with_quiz = {k: True for k in BASE_SCORING_WEIGHTS}
    weights_with_quiz = redistribute_weights(active_with_quiz)
    assert abs(sum(weights_with_quiz.values()) - 1.0) < 1e-6
    assert weights_with_quiz["style_archetype_match"] == BASE_SCORING_WEIGHTS["style_archetype_match"]

    # 2. Without quiz result active
    active_no_quiz = {k: True for k in BASE_SCORING_WEIGHTS}
    active_no_quiz["style_archetype_match"] = False
    weights_no_quiz = redistribute_weights(active_no_quiz)
    assert abs(sum(weights_no_quiz.values()) - 1.0) < 1e-6
    assert weights_no_quiz["style_archetype_match"] == 0.0
    # Other active components scale up proportionally
    assert weights_no_quiz["color_compatibility"] > weights_with_quiz["color_compatibility"]
    assert weights_no_quiz["occasion_suitability"] > weights_with_quiz["occasion_suitability"]


def test_scorer_with_and_without_quiz_result_and_soft_constraints():
    """Verify OutfitScorer calculates breakdown and redistributes weights dynamically."""
    scorer = OutfitScorer()
    items = [
        {"slot": "top", "category": "shirt", "color": "white", "formality": 3, "style_tags": ["minimal"], "fit": "regular", "silhouette": "straight", "pattern": "solid"},
        {"slot": "bottom", "category": "chinos", "color": "navy", "formality": 3, "style_tags": ["minimal"], "fit": "regular", "silhouette": "straight", "pattern": "solid"},
        {"slot": "footwear", "category": "loafers", "color": "brown", "formality": 3, "style_tags": ["smart_casual"], "fit": "regular", "silhouette": "straight", "pattern": "solid"},
    ]
    profile = {"preferred_styles": ["minimal"], "favorite_colors": ["navy", "white"]}

    # Without quiz or soft constraints
    res_base = scorer.score_outfit(
        candidate_items=items,
        occasion="work",
        user_profile=profile,
        style_vector=None,
        soft_constraints=None,
    )
    assert abs(sum(res_base["meta"]["weights"].values()) - 1.0) < 1e-6
    assert "style_archetype_score" not in res_base["breakdown"]
    assert "soft_constraint_score" not in res_base["breakdown"]

    # With quiz vector
    vector = {
        "classic_expressive": 0.20,
        "comfort_polish": 0.80,
        "subtle_bold": 0.20,
        "timeless_trend": 0.20,
        "structured_relaxed": 0.30,
    }
    res_quiz = scorer.score_outfit(
        candidate_items=items,
        occasion="work",
        user_profile=profile,
        style_vector=vector,
        soft_constraints=[{"constraint_type": "must_include", "target_type": "category", "target_value": "shirt"}],
    )
    assert abs(sum(res_quiz["meta"]["weights"].values()) - 1.0) < 1e-6
    assert "style_archetype_score" in res_quiz["breakdown"]
    assert "soft_constraint_score" in res_quiz["breakdown"]
    assert res_quiz["meta"]["weights"]["style_archetype_match"] > 0.0
    assert res_quiz["meta"]["weights"]["soft_constraints"] > 0.0
