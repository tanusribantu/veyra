"""Gentle fit-note generator for Veyra recommendation engine.

Adheres strictly to the 5-step psychological-safety communication framework:
  1. Acknowledge intent
  2. Name the shared goal
  3. State one factual mismatch (using gentle modal phrasing: 'may', 'tends to', 'could read as')
  4. Offer one bridge (styling tweak or wardrobe alternative)
  5. Leave the decision to the user ('Keep it anyway')

Never uses banned words ('wrong', 'doesn't suit you', 'unflattering', 'flattering', 'bad', 'ugly', body-negative words).
Never contradicts score numbers.
"""

from typing import List, Dict, Any, Optional
from backend.app.schemas.constants import SUPPORTED_OCCASIONS

BANNED_WORDS = [
    "wrong",
    "doesn't suit you",
    "does not suit you",
    "flattering",
    "unflattering",
    "bad",
    "ugly",
    "fat",
    "hide",
    "disguise",
    "fix",
    "inappropriate",
    "terrible",
    "fault",
]


class FitNoteService:
    """Generates constructive, gentle fit notes when user-included pieces lower scoring components."""

    @classmethod
    def validate_no_banned_words(cls, text: str):
        """Ensures generated notes strictly comply with brand empathy and language guidelines."""
        lower_text = text.lower()
        for banned in BANNED_WORDS:
            assert banned not in lower_text, f"Banned phrase '{banned}' found in fit note: {text}"

    @classmethod
    def generate_fit_notes(
        cls,
        candidate_items: List[Dict[str, Any]],
        user_included_item_ids: List[str],
        occasion: str,
        score_breakdown: Dict[str, float],
        all_wardrobe_items: List[Dict[str, Any]],
        user_profile: Optional[Dict[str, Any]] = None,
    ) -> List[Dict[str, Any]]:
        """Evaluates if user-requested include items lower occasion, color, or attribute scores.

        Args:
            candidate_items: Garments in the current outfit candidate.
            user_included_item_ids: IDs of items specifically requested by user.
            occasion: Social context.
            score_breakdown: Component scores (color_score, occasion_score, personal_attribute_score, etc.).
            all_wardrobe_items: User's entire wardrobe to search for bridge alternatives.
            user_profile: User profile with preferences and personal attributes.

        Returns:
            List of fit note dictionaries with gentle messaging and wardrobe alternative item IDs.
        """
        if not user_included_item_ids:
            return []

        fit_notes = []
        user_included_set = set(user_included_item_ids)

        for item in candidate_items:
            item_id = item.get("id")
            if item_id not in user_included_set:
                continue

            item_name = item.get("name", "selected piece")
            slot = item.get("slot", "item")
            formality = int(item.get("formality", 2))
            color = item.get("color", "")

            # 1. Check Occasion Suitability Mismatch
            occ_score = score_breakdown.get("occasion_score", 100.0)
            target_formality = 4 if occasion in ["formal", "date_night"] else (3 if occasion == "work" else 2)

            if occ_score < 75.0 or (occasion in ["formal", "work"] and formality < target_formality):
                alts_items = [
                    w for w in all_wardrobe_items
                    if w.get("slot") == slot and w.get("id") != item_id and int(w.get("formality", 2)) > formality
                ]
                alts_items.sort(key=lambda x: int(x.get("formality", 2)), reverse=True)
                alts = [w["id"] for w in alts_items]
                alt_names = [w.get("name") for w in alts_items[:2]]

                if alt_names:
                    bridge_text = f"You could pair it with a tailored outer layer, or swap with your {' or '.join(alt_names)}."
                else:
                    bridge_text = "Layering a tailored jacket or structured blazer over it could bridge the formality."

                note_text = (
                    f"We love that you want to style your {item_name} for this {occasion}, "
                    f"aiming for an ensemble that feels both personal and well-coordinated. "
                    f"A piece with relaxed formality tends to read as more casual than {occasion} settings typically anticipate. "
                    f"{bridge_text} "
                    f"The decision is entirely yours to keep it anyway or explore the bridge."
                )

                cls.validate_no_banned_words(note_text)
                fit_notes.append({
                    "item_id": item_id,
                    "item_name": item_name,
                    "lowered_component": "occasion_suitability",
                    "note": note_text,
                    "bridge_type": "styling_tweak_or_alternative",
                    "bridge_suggestion": bridge_text,
                    "alternatives": alts[:3],
                })
                continue

            # 2. Check Color Harmony Mismatch
            color_score = score_breakdown.get("color_score", 100.0)
            if color_score < 70.0:
                alts = [
                    w["id"] for w in all_wardrobe_items
                    if w.get("slot") == slot and w.get("id") != item_id and w.get("color", "").lower() in ["navy", "white", "black", "grey", "beige"]
                ]
                alt_names = [
                    w.get("name") for w in all_wardrobe_items if w.get("id") in alts[:2]
                ]

                if alt_names:
                    bridge_text = f"Toning the contrast with neutral accessories, or swapping to your {' or '.join(alt_names)}, creates a harmonious palette."
                else:
                    bridge_text = "Grounding the look with understated neutral accessories could soften the contrast."

                note_text = (
                    f"We appreciate your intention to feature your {item_name} for this {occasion}, "
                    f"crafting an expressive color story. "
                    f"The {color} hue may create higher visual contrast than a cohesive palette typically uses. "
                    f"{bridge_text} "
                    f"You are welcome to keep it anyway if this energy resonates with you."
                )

                cls.validate_no_banned_words(note_text)
                fit_notes.append({
                    "item_id": item_id,
                    "item_name": item_name,
                    "lowered_component": "color_harmony",
                    "note": note_text,
                    "bridge_type": "palette_balance",
                    "bridge_suggestion": bridge_text,
                    "alternatives": alts[:3],
                })
                continue

            # 3. Check Personal Attribute Match Mismatch
            attr_score = score_breakdown.get("personal_attribute_score")
            if attr_score is not None and attr_score < 70.0:
                sil = item.get("silhouette", "cut")
                neck = item.get("neckline", "neckline")
                alts = [
                    w["id"] for w in all_wardrobe_items
                    if w.get("slot") == slot and w.get("id") != item_id
                ]

                bridge_text = "Experimenting with unbuttoning the collar, cuffing the hem, or wearing it open could provide gentle balance."
                note_text = (
                    f"We appreciate your choice to incorporate your {item_name} into this {occasion} look, "
                    f"curating a silhouette that feels distinct. "
                    f"This {sil} cut could read as slightly different in balance compared to your personal styling preferences. "
                    f"{bridge_text} "
                    f"Feel free to keep it anyway or adjust the styling details as you prefer."
                )

                cls.validate_no_banned_words(note_text)
                fit_notes.append({
                    "item_id": item_id,
                    "item_name": item_name,
                    "lowered_component": "personal_attribute_match",
                    "note": note_text,
                    "bridge_type": "silhouette_balance",
                    "bridge_suggestion": bridge_text,
                    "alternatives": alts[:3],
                })

        return fit_notes
