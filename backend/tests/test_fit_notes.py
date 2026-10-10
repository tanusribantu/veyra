"""Tests for gentle fit-note generation and psychological safety brand language."""

import pytest
from backend.app.services.fit_note_service import FitNoteService, BANNED_WORDS


def test_fit_note_five_step_pattern_and_banned_words(client, sample_user_and_profile, sample_wardrobe):
    """Verify that when a casual item is requested for a formal event, a compliant 5-part fit note is generated."""
    user, _ = sample_user_and_profile
    headers = {"X-User-ID": user.id}

    # Request to include test_top_2 (Navy T-shirt, formality 1) for a formal occasion
    req_body = {
        "occasion": "formal",
        "constraints": [
            {
                "constraint_type": "must_include",
                "target_type": "item_id",
                "target_value": "test_top_2",
                "strength": "hard",
            }
        ],
    }
    resp = client.post("/api/v1/recommendations", json=req_body, headers=headers)
    assert resp.status_code == 200
    recs = resp.get_json()["recommendations"]
    assert len(recs) > 0

    top_rec = recs[0]
    fit_notes = top_rec.get("fit_notes")
    assert fit_notes is not None
    assert len(fit_notes) > 0

    note_obj = fit_notes[0]
    assert note_obj["item_id"] == "test_top_2"
    assert note_obj["lowered_component"] == "occasion_suitability"
    assert "alternatives" in note_obj
    assert len(note_obj["alternatives"]) > 0

    # The alternative must be in the same slot (top) and in wardrobe (e.g., test_top_1 Oxford shirt)
    assert "test_top_1" in note_obj["alternatives"]

    text = note_obj["note"]

    # 1. Assert required 5-part pattern elements
    # Part 1: acknowledge intent
    assert "love that you want to style" in text or "appreciate" in text
    # Part 2: name shared goal
    assert "ensemble" in text or "outfit" in text
    # Part 3: factual mismatch with gentle modal phrasing ("may", "tends to", "could read as")
    assert ("tends to read as" in text) or ("may" in text) or ("could read as" in text)
    # Part 4: offer bridge (styling tweak or wardrobe alternative)
    assert ("bridge" in text) or ("swap" in text) or ("pair" in text)
    # Part 5: leave decision to user
    assert ("keep it anyway" in text) or ("decision is entirely yours" in text)

    # 2. Assert BANNED WORDS NEVER APPEAR
    lower_text = text.lower()
    for banned in BANNED_WORDS:
        assert banned not in lower_text, f"Banned phrase '{banned}' unexpectedly found in note: {text}"


def test_fit_note_color_harmony_bridge():
    """Verify fit note generated for color contrast mismatch uses gentle language and alternatives."""
    items = [
        {"id": "c1", "name": "Neon Top", "slot": "top", "formality": 3, "color": "neon-green"},
        {"id": "b1", "name": "Brown Pants", "slot": "bottom", "formality": 3, "color": "brown"},
        {"id": "f1", "name": "Sneakers", "slot": "footwear", "formality": 3, "color": "white"},
    ]
    all_wardrobe = [
        {"id": "c1", "name": "Neon Top", "slot": "top", "formality": 3, "color": "neon-green"},
        {"id": "alt_top", "name": "White Shirt", "slot": "top", "formality": 3, "color": "white"},
    ]

    notes = FitNoteService.generate_fit_notes(
        candidate_items=items,
        user_included_item_ids=["c1"],
        occasion="work",
        score_breakdown={"color_score": 55.0, "occasion_score": 85.0},
        all_wardrobe_items=all_wardrobe,
    )

    assert len(notes) == 1
    note = notes[0]
    assert note["lowered_component"] == "color_harmony"
    assert "may create higher visual contrast" in note["note"]
    assert "alt_top" in note["alternatives"]

    # Assert banned words never appear
    lower_text = note["note"].lower()
    for banned in BANNED_WORDS:
        assert banned not in lower_text


def test_no_fit_note_when_requested_item_is_suitable(client, sample_user_and_profile, sample_wardrobe):
    """Verify that when a requested piece aligns well with occasion and palette, no fit note is triggered."""
    user, _ = sample_user_and_profile
    headers = {"X-User-ID": user.id}

    # Request test_top_1 (White Oxford Shirt, formality 3) for occasion work
    req_body = {
        "occasion": "work",
        "constraints": [
            {
                "constraint_type": "must_include",
                "target_type": "item_id",
                "target_value": "test_top_1",
                "strength": "hard",
            }
        ],
    }
    resp = client.post("/api/v1/recommendations", json=req_body, headers=headers)
    assert resp.status_code == 200
    recs = resp.get_json()["recommendations"]
    assert len(recs) > 0
    top_rec = recs[0]
    # No fit note triggered because White Oxford Shirt is perfectly suitable for work
    assert len(top_rec.get("fit_notes", [])) == 0


def test_fit_note_personal_attribute_mismatch():
    """Verify personal attribute mismatch fit note is generated with gentle framing and no banned words."""
    items = [
        {"id": "t_box", "name": "Boxy Top", "slot": "top", "formality": 2, "silhouette": "cropped", "neckline": "crew"},
        {"id": "b_wide", "name": "Wide Pants", "slot": "bottom", "formality": 2, "silhouette": "wide_leg"},
        {"id": "f_sneakers", "name": "Sneakers", "slot": "footwear", "formality": 2},
    ]
    all_wardrobe = [
        {"id": "t_box", "name": "Boxy Top", "slot": "top", "formality": 2, "silhouette": "cropped", "neckline": "crew"},
        {"id": "t_alt", "name": "Fitted V-Neck", "slot": "top", "formality": 2, "silhouette": "fitted", "neckline": "v_neck"},
    ]

    notes = FitNoteService.generate_fit_notes(
        candidate_items=items,
        user_included_item_ids=["t_box"],
        occasion="casual",
        score_breakdown={"color_score": 90.0, "occasion_score": 90.0, "personal_attribute_score": 60.0},
        all_wardrobe_items=all_wardrobe,
    )

    assert len(notes) == 1
    note = notes[0]
    assert note["lowered_component"] == "personal_attribute_match"
    assert "could read as slightly different in balance" in note["note"]
    assert "t_alt" in note["alternatives"]

    # Assert banned words never appear
    lower_text = note["note"].lower()
    for banned in BANNED_WORDS:
        assert banned not in lower_text

