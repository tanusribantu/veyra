"""Tests for Color Rules module."""

import pytest
from backend.app.recommendation.color_rules import (
    evaluate_color_compatibility,
    are_monochromatic,
    normalize_color,
    NEUTRALS,
)


def test_normalize_color():
    assert normalize_color("  NAVY  ") == "navy"
    assert normalize_color("Sky_Blue") == "sky-blue"
    assert normalize_color("") == "gray"


def test_monochromatic_harmony():
    colors = ["navy", "blue", "indigo"]
    score, meta = evaluate_color_compatibility(colors)
    assert score >= 90.0
    assert meta["type"] == "monochromatic"


def test_all_neutrals_harmony():
    colors = ["white", "navy", "brown"]
    score, meta = evaluate_color_compatibility(colors)
    assert score >= 90.0


def test_neutral_grounded_accent():
    colors = ["white", "navy", "burgundy"]
    score, meta = evaluate_color_compatibility(colors)
    assert score >= 85.0
    assert "burgundy" in meta.get("message", "").lower()


def test_known_clash_detection():
    # Red + Green clash penalty
    colors = ["red", "green", "white"]
    score, meta = evaluate_color_compatibility(colors)
    assert score <= 40.0
    assert meta["type"] == "clash"


def test_multi_accent_overload():
    # 3 competing saturated accents without neutrals
    colors = ["yellow", "teal", "orange"]
    score, meta = evaluate_color_compatibility(colors)
    assert score <= 50.0
    assert meta["type"] == "color_overload"


def test_classic_harmony_pairing():
    # Navy + Khaki pairing
    colors = ["navy", "khaki", "white"]
    score, meta = evaluate_color_compatibility(colors)
    assert score >= 90.0
