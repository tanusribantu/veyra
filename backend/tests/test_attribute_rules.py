"""Tests for personal attribute rules, complexion, silhouette, and face shape mappings."""

import pytest
from backend.app.recommendation.attribute_rules import (
    evaluate_body_shape_match,
    evaluate_complexion_match,
    evaluate_face_shape_match,
    compute_personal_attribute_score,
    BODY_SHAPE_SILHOUETTES,
    UNDERTONE_WARMTH_PREFERENCES,
    FACE_SHAPE_RECOMMENDATIONS,
)


def test_body_shape_mappings_exist_and_positive():
    """Verify that every supported shape has a documented positive message."""
    shapes = ["hourglass", "pear", "inverted_triangle", "athletic", "apple", "rectangle"]
    for shape in shapes:
        assert shape in BODY_SHAPE_SILHOUETTES
        msg = BODY_SHAPE_SILHOUETTES[shape]["positive_message"]
        assert any(phrase in msg for phrase in ["may", "tends to", "tend to"])
        # Body-negative words must not appear
        for negative in ["flaw", "hide", "correct", "fix", "disguise"]:
            assert negative not in msg.lower()


def test_hourglass_silhouette_match():
    items = [
        {"slot": "top", "silhouette": "fitted", "fit": "slim"},
        {"slot": "bottom", "silhouette": "straight", "fit": "regular"},
    ]
    score, meta = evaluate_body_shape_match(items, "hourglass")
    assert score is not None
    assert score >= 85.0
    assert "waist" in meta["message"].lower()


def test_pear_silhouette_match():
    items = [
        {"slot": "top", "silhouette": "relaxed"},
        {"slot": "bottom", "silhouette": "wide_leg"},
    ]
    score, meta = evaluate_body_shape_match(items, "pear")
    assert score is not None
    assert score >= 85.0


def test_complexion_warm_undertone():
    # Warm items should score high for warm undertone
    warm_items = [
        {"color": "olive", "color_warmth": "warm"},
        {"color": "tan", "color_warmth": "warm"},
    ]
    score, meta = evaluate_complexion_match(warm_items, "warm", "medium")
    assert score is not None
    assert score >= 90.0
    assert "warm" in meta["message"].lower()


def test_complexion_cool_undertone():
    cool_items = [
        {"color": "navy", "color_warmth": "cool"},
        {"color": "white", "color_warmth": "neutral"},
    ]
    score, meta = evaluate_complexion_match(cool_items, "cool", "light")
    assert score is not None
    assert score >= 90.0
    assert "cool" in meta["message"].lower()


def test_face_shape_and_neckline_round():
    # Round face harmonizes with v_neck
    items = [
        {"slot": "top", "neckline": "v_neck"},
        {"slot": "accessory", "accessory_type": "glasses"},
    ]
    score, meta = evaluate_face_shape_match(items, "round")
    assert score is not None
    assert score >= 90.0
    assert "v_neck neckline" in meta["matched_features"]


def test_missing_and_prefer_not_to_say_skips_cleanly():
    """Verify that 'prefer_not_to_say' or None returns None without penalty."""
    items = [{"color": "white"}]

    score_body, meta_body = evaluate_body_shape_match(items, None)
    assert score_body is None and meta_body is None

    score_body_pref, _ = evaluate_body_shape_match(items, "prefer_not_to_say")
    assert score_body_pref is None

    score_comp, _ = evaluate_complexion_match(items, "prefer_not_to_say", "prefer_not_to_say")
    assert score_comp is None

    score_face, _ = evaluate_face_shape_match(items, "prefer_not_to_say")
    assert score_face is None


def test_composite_personal_attribute_partial_sub_weights():
    items = [
        {"slot": "top", "silhouette": "fitted", "neckline": "v_neck", "color_warmth": "warm"},
        {"slot": "bottom", "silhouette": "straight"},
    ]
    # Only body_shape and complexion provided, face_shape is prefer_not_to_say
    score, meta = compute_personal_attribute_score(
        items=items,
        body_shape="hourglass",
        skin_undertone="warm",
        skin_depth="medium",
        face_shape="prefer_not_to_say",
    )
    assert score is not None
    assert meta["active"] is True
    # Reasons only include body and complexion
    factors = [r["factor"] for r in meta["reasons"]]
    assert "body_shape_harmony" in factors
    assert "complexion_harmony" in factors
    assert "face_shape_coordination" not in factors


def test_composite_personal_attribute_none_active():
    items = [{"slot": "top"}]
    score, meta = compute_personal_attribute_score(
        items=items,
        body_shape=None,
        skin_undertone="prefer_not_to_say",
        skin_depth="prefer_not_to_say",
        face_shape="prefer_not_to_say",
    )
    assert score is None
    assert meta["active"] is False
    assert meta["reasons"] == []
