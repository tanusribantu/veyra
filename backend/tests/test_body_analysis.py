"""Tests for deterministic body analysis and proportion classifier."""

import pytest
from backend.app.services.body_analysis import BodyAnalysisService


def test_classify_hourglass_shape():
    """Defined waist (<= 0.75) relative to chest and hips, with balanced shoulders and hips."""
    res = BodyAnalysisService.classify_body_shape(
        shoulder_cm=96.0,
        chest_bust_cm=94.0,
        waist_cm=68.0,
        hips_cm=98.0,
    )
    assert res["derived_shape"] == "hourglass"
    assert res["effective_shape"] == "hourglass"
    assert res["is_overridden"] is False
    assert res["ratios"]["waist_to_hip"] <= 0.75
    assert "waistline" in res["explanation"].lower()


def test_classify_pear_shape():
    """Hips noticeably wider than shoulders and chest (s_to_h < 0.90, c_to_h < 0.92)."""
    res = BodyAnalysisService.classify_body_shape(
        shoulder_cm=82.0,
        chest_bust_cm=84.0,
        waist_cm=72.0,
        hips_cm=102.0,
    )
    assert res["derived_shape"] == "pear"
    assert res["ratios"]["shoulder_to_hip"] < 0.90


def test_classify_inverted_triangle_shape():
    """Shoulders noticeably broader than hips (s_to_h >= 1.08)."""
    res = BodyAnalysisService.classify_body_shape(
        shoulder_cm=112.0,
        chest_bust_cm=104.0,
        waist_cm=78.0,
        hips_cm=92.0,
    )
    assert res["derived_shape"] == "inverted_triangle"
    assert res["ratios"]["shoulder_to_hip"] >= 1.08


def test_classify_athletic_shape():
    """Broad shoulders (s_to_h >= 1.04) with moderate waist definition (0.75 <= w_to_h <= 0.88)."""
    res = BodyAnalysisService.classify_body_shape(
        shoulder_cm=104.0,
        chest_bust_cm=98.0,
        waist_cm=80.0,
        hips_cm=99.0,
    )
    assert res["derived_shape"] == "athletic"


def test_classify_apple_shape():
    """Midsection fuller relative to hips and chest (w_to_h >= 0.88, w_to_c >= 0.85)."""
    res = BodyAnalysisService.classify_body_shape(
        shoulder_cm=92.0,
        chest_bust_cm=96.0,
        waist_cm=95.0,
        hips_cm=100.0,
    )
    assert res["derived_shape"] == "apple"


def test_classify_rectangle_shape():
    """Balanced shoulder-to-hip alignment with straight waist (> 0.75)."""
    res = BodyAnalysisService.classify_body_shape(
        shoulder_cm=96.0,
        chest_bust_cm=94.0,
        waist_cm=80.0,
        hips_cm=97.0,
    )
    assert res["derived_shape"] == "rectangle"


def test_boundary_ratio_waist_to_hip():
    """Verify threshold boundary right below and above 0.75 waist_to_hip."""
    # Just below 0.75 (0.72) -> Hourglass
    res_below = BodyAnalysisService.classify_body_shape(
        shoulder_cm=98.0,
        chest_bust_cm=96.0,
        waist_cm=70.0,
        hips_cm=98.0,
    )
    assert res_below["derived_shape"] == "hourglass"

    # Just above 0.75 (0.78) -> Rectangle
    res_above = BodyAnalysisService.classify_body_shape(
        shoulder_cm=98.0,
        chest_bust_cm=96.0,
        waist_cm=77.0,
        hips_cm=98.0,
    )
    assert res_above["derived_shape"] == "rectangle"


def test_custom_user_override():
    """Verify that a user override changes effective_shape while keeping derived_shape intact."""
    res = BodyAnalysisService.classify_body_shape(
        shoulder_cm=96.0,
        chest_bust_cm=94.0,
        waist_cm=80.0,
        hips_cm=97.0,
        custom_override="hourglass",
    )
    assert res["derived_shape"] == "rectangle"
    assert res["effective_shape"] == "hourglass"
    assert res["is_overridden"] is True
    assert "Custom override selected: hourglass" in res["explanation"]
