"""Explanation builder for Veyra outfit recommendation intelligence.

Translates mathematical score components and evaluation metadata into
clear, transparent, human-comprehensible reasons and trade-offs.
Adheres strictly to Core Principle 2: "Explainable, not mysterious."
"""

from typing import List, Dict, Any


class ExplanationService:
    """Builds transparent and faithful explanations based on scoring evidence."""

    @staticmethod
    def build_reasons(
        score_data: Dict[str, Any],
        items: List[Dict[str, Any]],
        occasion: str,
        user_profile: Dict[str, Any],
    ) -> List[Dict[str, str]]:
        """Constructs an ordered list of structured reasons from scoring components."""
        breakdown = score_data.get("breakdown", {})
        meta = score_data.get("meta", {})
        reasons = []

        # 1. Color Compatibility Reason
        color_meta = meta.get("color", {})
        color_score = breakdown.get("color_score")
        if color_score is not None:
            if color_score >= 85:
                reasons.append({
                    "factor": "color_compatibility",
                    "message": color_meta.get("message", "Selected colors form a naturally harmonious palette."),
                })
            elif color_score <= 50:
                reasons.append({
                    "factor": "color_compatibility",
                    "message": color_meta.get("message", "Color combination contains high chromatic tension."),
                })

        # 2. Occasion Match Reason
        occ_meta = meta.get("occasion", {})
        occ_score = breakdown.get("occasion_score")
        if occ_score is not None:
            if occ_score >= 85:
                reasons.append({
                    "factor": "occasion_match",
                    "message": occ_meta.get("message", f"Tailored perfectly for {occasion} settings."),
                })
            elif occ_score < 70:
                reasons.append({
                    "factor": "occasion_match",
                    "message": occ_meta.get("message", f"May push dress boundaries for {occasion}."),
                })

        # 3. Personal Style Alignment Reason
        style_meta = meta.get("style", {})
        matched_styles = style_meta.get("matched_styles", [])
        if matched_styles:
            reasons.append({
                "factor": "style_alignment",
                "message": f"Reflects your preferred {', '.join(matched_styles)} style aesthetic.",
            })

        # 4. Formality Cohesion Reason
        formality_meta = meta.get("formality", {})
        formality_score = breakdown.get("formality_score")
        if formality_score is not None:
            if formality_score >= 90:
                reasons.append({
                    "factor": "formality_cohesion",
                    "message": formality_meta.get("message", "Pieces blend naturally with balanced formality."),
                })
            elif formality_score < 50:
                reasons.append({
                    "factor": "formality_cohesion",
                    "message": formality_meta.get("message", "Notable contrast between casual and formal pieces."),
                })

        # 5. User Preferences & Favorites Reason
        pref_meta = meta.get("preferences", {})
        pref_reasons = pref_meta.get("reasons", [])
        if pref_reasons:
            reasons.append({
                "factor": "personal_preferences",
                "message": pref_reasons[0],
            })

        # 6. Personal Attribute Match Reasons (Body Shape, Complexion, Face Shape)
        attr_meta = meta.get("personal_attributes", {})
        if attr_meta and attr_meta.get("active"):
            for attr_reason in attr_meta.get("reasons", []):
                reasons.append(attr_reason)

        # Fallback guarantee: ensure at least one reason is always present
        if not reasons:
            reasons.append({
                "factor": "balanced_selection",
                "message": f"Solid overall combination from your wardrobe suited for {occasion}.",
            })

        return reasons
