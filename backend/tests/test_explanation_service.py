"""Tests for ExplanationService module."""

import pytest
from backend.app.services.explanation_service import ExplanationService


def test_build_reasons_high_scoring_outfit():
    score_data = {
        "breakdown": {
            "color_score": 95.0,
            "occasion_score": 92.0,
            "style_score": 88.0,
            "formality_score": 92.0,
            "preference_score": 85.0,
        },
        "meta": {
            "color": {"message": "Classic nautical contrast; crisp, high-clarity balance."},
            "occasion": {"message": "Tailored perfectly for casual settings."},
            "style": {"matched_styles": ["minimal", "casual"]},
            "formality": {"message": "Balanced formality."},
            "preferences": {"reasons": ["Includes favorite color(s): navy"]},
        },
    }
    items = [
        {"color": "white", "category": "shirt"},
        {"color": "navy", "category": "chinos"},
        {"color": "white", "category": "sneakers"},
    ]
    profile = {"preferred_styles": ["minimal"]}

    reasons = ExplanationService.build_reasons(score_data, items, "casual", profile)
    factors = [r["factor"] for r in reasons]

    assert "color_compatibility" in factors
    assert "occasion_match" in factors
    assert "style_alignment" in factors
    assert "formality_cohesion" in factors
    assert "personal_preferences" in factors


def test_build_reasons_fallback():
    # If no high or low triggers fire, guaranteed fallback reason exists
    score_data = {"breakdown": {}, "meta": {}}
    reasons = ExplanationService.build_reasons(score_data, [], "casual", {})
    assert len(reasons) >= 1
    assert reasons[0]["factor"] == "balanced_selection"
