"""Tests for OutfitScorer module."""

import pytest
from backend.app.recommendation.scorer import OutfitScorer


def test_scorer_weights_sum_to_one():
    scorer = OutfitScorer()
    total = (
        scorer.WEIGHT_COLOR
        + scorer.WEIGHT_OCCASION
        + scorer.WEIGHT_STYLE
        + scorer.WEIGHT_FORMALITY
        + scorer.WEIGHT_PREFERENCES
    )
    assert abs(total - 1.0) < 1e-6


def test_scorer_bounds_and_breakdown():
    scorer = OutfitScorer()
    items = [
        {"slot": "top", "category": "shirt", "color": "white", "formality": 3, "style_tags": ["minimal"], "fit": "regular"},
        {"slot": "bottom", "category": "chinos", "color": "navy", "formality": 3, "style_tags": ["minimal"], "fit": "regular"},
        {"slot": "footwear", "category": "loafers", "color": "brown", "formality": 3, "style_tags": ["smart_casual"], "fit": "regular"},
    ]
    profile = {
        "preferred_styles": ["minimal", "smart_casual"],
        "favorite_colors": ["navy", "white"],
        "avoided_colors": ["neon-green"],
        "fit_preference": "regular",
        "pattern_preference": "low",
    }
    result = scorer.score_outfit(items, "work", profile)
    score = result["score"]
    breakdown = result["breakdown"]

    assert 0.0 <= score <= 100.0
    for key, val in breakdown.items():
        assert 0.0 <= val <= 100.0

    # High quality combination should score high (e.g. > 85)
    assert score >= 85.0


def test_scorer_avoided_color_penalty():
    scorer = OutfitScorer()
    items = [
        {"slot": "top", "category": "t-shirt", "color": "neon-green", "formality": 1, "style_tags": ["casual"]},
        {"slot": "bottom", "category": "jeans", "color": "blue", "formality": 1, "style_tags": ["casual"]},
        {"slot": "footwear", "category": "sneakers", "color": "white", "formality": 2, "style_tags": ["casual"]},
    ]
    profile = {
        "avoided_colors": ["neon-green"],
        "favorite_colors": ["black"],
        "preferred_styles": ["casual"],
    }
    pref_score, meta = scorer.compute_micro_preference_score(items, profile)
    assert pref_score <= 50.0
    assert "neon-green" in meta["message"]


def test_scorer_formality_cohesion():
    scorer = OutfitScorer()
    # Uniform items (all 3)
    uniform_items = [{"formality": 3}, {"formality": 3}, {"formality": 3}]
    score_uni, _ = scorer.compute_formality_cohesion_score(uniform_items)
    assert score_uni == 100.0

    # Large spread (1 to 4)
    clash_items = [{"formality": 1}, {"formality": 4}, {"formality": 4}]
    score_clash, _ = scorer.compute_formality_cohesion_score(clash_items)
    assert score_clash <= 50.0
