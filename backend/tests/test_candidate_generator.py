"""Tests for CandidateGenerator module."""

import pytest
from backend.app.recommendation.candidate_generator import CandidateGenerator


def test_candidate_generation_full():
    """Verify Cartesian product of Top + Bottom + Footwear."""
    generator = CandidateGenerator()
    wardrobe = [
        {"id": "t1", "slot": "top", "category": "shirt", "formality": 3},
        {"id": "t2", "slot": "top", "category": "t-shirt", "formality": 1},
        {"id": "b1", "slot": "bottom", "category": "chinos", "formality": 3},
        {"id": "f1", "slot": "footwear", "category": "sneakers", "formality": 2},
    ]
    # 2 tops * 1 bottom * 1 footwear = 2 candidates
    candidates = generator.generate_candidates(wardrobe)
    assert len(candidates) == 2
    assert {"t1", "b1", "f1"} == set(candidates[0]["item_ids"])


def test_candidate_generation_empty_wardrobe():
    """Verify empty wardrobe yields empty list without crashing."""
    generator = CandidateGenerator()
    assert generator.generate_candidates([]) == []


def test_candidate_generation_missing_slot():
    """Verify missing required slot (e.g. no footwear) yields empty list."""
    generator = CandidateGenerator()
    wardrobe = [
        {"id": "t1", "slot": "top", "category": "shirt", "formality": 3},
        {"id": "b1", "slot": "bottom", "category": "chinos", "formality": 3},
    ]
    assert generator.generate_candidates(wardrobe) == []


def test_candidate_generation_id_filter():
    """Verify passing filter_item_ids restricts candidate pool."""
    generator = CandidateGenerator()
    wardrobe = [
        {"id": "t1", "slot": "top", "category": "shirt", "formality": 3},
        {"id": "t2", "slot": "top", "category": "t-shirt", "formality": 1},
        {"id": "b1", "slot": "bottom", "category": "chinos", "formality": 3},
        {"id": "f1", "slot": "footwear", "category": "sneakers", "formality": 2},
    ]
    candidates = generator.generate_candidates(wardrobe, filter_item_ids=["t1", "b1", "f1"])
    assert len(candidates) == 1
    assert candidates[0]["item_ids"] == ["t1", "b1", "f1"]


def test_candidate_pruning_extreme_formality_dissonance():
    """Verify combination with formality spread >= 4 is pruned (e.g. gym shorts + formal tux shoes)."""
    generator = CandidateGenerator()
    wardrobe = [
        {"id": "t1", "slot": "top", "category": "shirt", "formality": 1},
        {"id": "b1", "slot": "bottom", "category": "shorts", "formality": 1},
        {"id": "f1", "slot": "footwear", "category": "formal_shoes", "formality": 5},
    ]
    candidates = generator.generate_candidates(wardrobe)
    assert len(candidates) == 0
