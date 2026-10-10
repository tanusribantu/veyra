"""Tests for Occasion Rules module."""

import pytest
from backend.app.recommendation.occasion_rules import (
    evaluate_occasion_suitability,
    OCCASION_PROFILES,
)


def test_casual_occasion_ideal():
    items = [
        {"category": "t-shirt", "formality": 1},
        {"category": "jeans", "formality": 1},
        {"category": "sneakers", "formality": 2},
    ]
    score, meta = evaluate_occasion_suitability(items, "casual")
    assert score >= 90.0
    assert meta["status"] in ["ideal", "good"]


def test_formal_occasion_ideal():
    items = [
        {"category": "shirt", "formality": 5},
        {"category": "trousers", "formality": 5},
        {"category": "formal_shoes", "formality": 5},
    ]
    score, meta = evaluate_occasion_suitability(items, "formal")
    assert score >= 95.0
    assert meta["status"] == "ideal"


def test_formal_occasion_inappropriate_garment():
    # Wearing sneakers at formal event incurs heavy penalty
    items = [
        {"category": "shirt", "formality": 4},
        {"category": "trousers", "formality": 4},
        {"category": "sneakers", "formality": 2},
    ]
    score, meta = evaluate_occasion_suitability(items, "formal")
    assert score <= 30.0
    assert meta["status"] == "inappropriate_garments"
    assert "sneakers" in meta["violations"]


def test_work_occasion_underdressed():
    # Extremely casual outfit for work
    items = [
        {"category": "t-shirt", "formality": 1},
        {"category": "shorts", "formality": 1},
        {"category": "sneakers", "formality": 1},
    ]
    score, meta = evaluate_occasion_suitability(items, "work")
    assert score <= 40.0
    assert meta["status"] == "inappropriate_garments"
