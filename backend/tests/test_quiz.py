"""Tests for Style Archetype Quiz module and endpoints."""

import pytest
from backend.app.recommendation.quiz_config import (
    QUIZ_VERSION,
    STYLE_DIMENSIONS,
    STYLE_QUIZ_QUESTIONS,
    STYLE_ARCHETYPES,
    compute_quiz_vector,
    determine_archetype,
    compute_style_archetype_score,
)
from backend.app.services.quiz_service import QuizService


def test_quiz_questions_framing_and_version():
    """Verify quiz questions are versioned and strictly framed as sartorial style scenarios."""
    assert QUIZ_VERSION == "1.0.0"
    assert len(STYLE_QUIZ_QUESTIONS) == 10

    banned_clinical_terms = [
        "personality disorder",
        "diagnosis",
        "neurotic",
        "psychopathology",
        "introvert",
        "extrovert",
        "mental health",
        "psychological",
    ]

    for q in STYLE_QUIZ_QUESTIONS:
        assert "id" in q
        assert "scenario" in q
        assert "question" in q
        assert len(q["options"]) == 4

        # Verify no clinical or personality diagnosis wording
        for term in banned_clinical_terms:
            assert term not in q["scenario"].lower()
            assert term not in q["question"].lower()

        for opt in q["options"]:
            assert "points" in opt
            for dim in STYLE_DIMENSIONS:
                assert dim in opt["points"]
                val = opt["points"][dim]
                assert 0.0 <= val <= 1.0


def test_quiz_scoring_and_normalization():
    """Verify user answers accumulate points and normalize strictly to [0.0, 1.0]."""
    # Answer with classic/tailored options (q1_a, q2_a, etc.)
    classic_answers = {f"q{i}": f"q{i}_a" for i in range(1, 11)}
    vector, archetype, desc = compute_quiz_vector(classic_answers)

    assert len(vector) == 5
    for dim, val in vector.items():
        assert dim in STYLE_DIMENSIONS
        assert 0.0 <= val <= 1.0

    # For classic answers, classic_expressive and subtle_bold should be low, comfort_polish high
    assert vector["classic_expressive"] <= 0.25
    assert vector["comfort_polish"] >= 0.75
    assert vector["subtle_bold"] <= 0.25
    assert "Minimalist" in archetype or "Classic" in archetype

    # Answer with creative/expressive options (q1_c/q1_d, etc.)
    expressive_answers = {f"q{i}": f"q{i}_d" for i in range(1, 11)}
    exp_vector, exp_arch, exp_desc = compute_quiz_vector(expressive_answers)

    assert exp_vector["classic_expressive"] >= 0.70
    assert exp_vector["timeless_trend"] >= 0.70
    assert "Trendsetter" in exp_arch or "Expressionist" in exp_arch


def test_style_archetype_match_scoring():
    """Verify that archetype match score computes accurately based on item attributes."""
    # Architectural minimalist user vector: structured, polished, subtle
    user_vector = {
        "classic_expressive": 0.15,
        "comfort_polish": 0.85,
        "subtle_bold": 0.15,
        "timeless_trend": 0.25,
        "structured_relaxed": 0.20,
    }

    # Highly matching outfit: white collared shirt, navy trousers, brown loafers (fitted/straight, solid)
    matching_items = [
        {"slot": "top", "category": "shirt", "color": "white", "pattern": "solid", "silhouette": "straight", "formality": 4, "fit": "slim"},
        {"slot": "bottom", "category": "trousers", "color": "navy", "pattern": "solid", "silhouette": "straight", "formality": 4, "fit": "regular"},
        {"slot": "footwear", "category": "loafers", "color": "black", "pattern": "solid", "silhouette": "straight", "formality": 4, "fit": "regular"},
    ]
    score_match, meta_match = compute_style_archetype_score(matching_items, user_vector)
    assert score_match is not None
    assert score_match >= 75.0
    assert "user_archetype" in meta_match

    # Divergent outfit: neon green hoodie, relaxed shorts, floral print
    divergent_items = [
        {"slot": "top", "category": "hoodie", "color": "neon-green", "pattern": "floral", "silhouette": "relaxed", "formality": 1, "fit": "oversized"},
        {"slot": "bottom", "category": "shorts", "color": "yellow", "pattern": "graphic", "silhouette": "wide_leg", "formality": 1, "fit": "relaxed"},
        {"slot": "footwear", "category": "sandals", "color": "orange", "pattern": "solid", "silhouette": "relaxed", "formality": 1, "fit": "regular"},
    ]
    score_div, _ = compute_style_archetype_score(divergent_items, user_vector)
    assert score_div is not None
    assert score_div < score_match


def test_quiz_api_flow(client, sample_user_and_profile):
    """Test full API lifecycle: GET questions, POST answers, GET result, DELETE result."""
    user, _ = sample_user_and_profile
    headers = {"X-User-ID": user.id}

    # 1. GET quiz questions
    resp = client.get("/api/v1/style-quiz", headers=headers)
    assert resp.status_code == 200
    data = resp.get_json()
    assert data["version"] == "1.0.0"
    assert len(data["questions"]) == 10

    # 2. POST answers
    answers = {f"q{i}": f"q{i}_a" for i in range(1, 11)}
    submit_resp = client.post(
        "/api/v1/style-quiz",
        json={"answers": answers},
        headers=headers,
    )
    assert submit_resp.status_code == 201
    submit_data = submit_resp.get_json()
    assert submit_data["user_id"] == user.id
    assert "vector" in submit_data
    assert "archetype" in submit_data
    assert submit_data["vector"]["classic_expressive"] <= 0.30

    # 3. GET latest result
    get_resp = client.get("/api/v1/style-quiz/result", headers=headers)
    assert get_resp.status_code == 200
    get_data = get_resp.get_json()
    assert get_data["id"] == submit_data["id"]
    assert get_data["archetype"] == submit_data["archetype"]

    # 4. DELETE result
    del_resp = client.delete("/api/v1/style-quiz/result", headers=headers)
    assert del_resp.status_code == 200

    # 5. GET result after deletion returns 404
    after_del_resp = client.get("/api/v1/style-quiz/result", headers=headers)
    assert after_del_resp.status_code == 404


def test_quiz_api_validation_errors(client, sample_user_and_profile):
    """Test API error handling on malformed submissions."""
    user, _ = sample_user_and_profile
    headers = {"X-User-ID": user.id}

    # Non-JSON payload
    resp = client.post("/api/v1/style-quiz", data="not json", headers=headers)
    assert resp.status_code == 400

    # Empty answers dictionary
    resp = client.post("/api/v1/style-quiz", json={"answers": {}}, headers=headers)
    assert resp.status_code == 400
    assert "Validation failed" in resp.get_json()["error"]
