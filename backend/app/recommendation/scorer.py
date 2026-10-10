"""Outfit scoring engine for Veyra recommendation intelligence.

================================================================================
INTERVIEW DEFENSE: FORMULATION & DYNAMIC WEIGHT REDISTRIBUTION
================================================================================
Mathematical Formulation:
    S = w_C * C + w_O * O + w_P * P + w_F * F + w_V * V + w_A * A

Where:
  - C: Color Compatibility
  - O: Occasion Suitability
  - P: Personal Style Preference Match
  - F: Formality Cohesion
  - V: Micro-Preference Adherence
  - A: Personal Attribute Match (Body Shape, Complexion, Face Shape)

Dynamic Weight Redistribution Principle:
  If any personalization input is missing or marked "prefer_not_to_say", that
  component is gracefully skipped and its weight is proportionally redistributed
  among the remaining active components.
  - When Personal Attributes (A) are present:
      Base weights: C: 0.25, O: 0.20, P: 0.15, F: 0.15, V: 0.10, A: 0.15 (Sum = 1.00)
  - When Personal Attributes (A) are absent:
      Weights scale to: C: 0.30, O: 0.25, P: 0.20, F: 0.15, V: 0.10 (Sum = 1.00)

  Total weight is mathematically guaranteed to equal 1.00 (100%) at all times,
  ensuring missing data is never penalized and existing tests remain invariant.
================================================================================
"""

from typing import List, Dict, Any, Tuple, Optional
from backend.app.recommendation.color_rules import evaluate_color_compatibility
from backend.app.recommendation.occasion_rules import evaluate_occasion_suitability
from backend.app.recommendation.attribute_rules import compute_personal_attribute_score
from backend.app.recommendation.quiz_config import compute_style_archetype_score
from backend.app.recommendation.scoring_config import (
    BASE_SCORING_WEIGHTS,
    redistribute_weights,
)


class OutfitScorer:
    """Scores candidate outfits using Veyra's multi-attribute objective function."""

    # Backward-compatible baseline weights
    WEIGHT_COLOR = 0.30
    WEIGHT_OCCASION = 0.25
    WEIGHT_STYLE = 0.20
    WEIGHT_FORMALITY = 0.15
    WEIGHT_PREFERENCES = 0.10

    def __init__(self, base_weights: Optional[Dict[str, float]] = None):
        self.base_weights = base_weights or dict(BASE_SCORING_WEIGHTS)
        assert abs(sum(self.base_weights.values()) - 1.0) < 1e-6, "Weights must sum to 1.0"

    def compute_style_score(
        self,
        items: List[Dict[str, Any]],
        user_profile: Dict[str, Any]
    ) -> Tuple[float, Dict[str, Any]]:
        """Evaluate alignment between outfit style tags and user's preferred styles (P)."""
        preferred_styles = set(
            s.lower().strip() for s in user_profile.get("preferred_styles", []) if s
        )
        if not preferred_styles:
            return 80.0, {
                "message": "Neutral style score (no explicit style preferences specified).",
                "matched_styles": [],
            }

        outfit_tags = set()
        for item in items:
            for tag in item.get("style_tags", []):
                outfit_tags.add(tag.lower().strip())

        if not outfit_tags:
            return 75.0, {
                "message": "Items have versatile, unbranded foundational styling.",
                "matched_styles": [],
            }

        matched = preferred_styles.intersection(outfit_tags)
        if matched:
            coverage = len(matched) / len(preferred_styles)
            score = 80.0 + min(20.0, coverage * 20.0)
            return round(score, 1), {
                "message": f"Matches preferred styles: {', '.join(sorted(matched))}.",
                "matched_styles": list(matched),
            }
        else:
            return 60.0, {
                "message": "Neutral departure from primary style preferences.",
                "matched_styles": [],
            }

    def compute_formality_cohesion_score(
        self,
        items: List[Dict[str, Any]]
    ) -> Tuple[float, Dict[str, Any]]:
        """Evaluate internal formality consistency across items (F)."""
        formalities = [item.get("formality", 2) for item in items]
        if not formalities:
            return 80.0, {"message": "Standard formality."}

        spread = max(formalities) - min(formalities)
        mean_f = sum(formalities) / len(formalities)

        if spread == 0:
            score = 100.0
            msg = f"Uniform formality across all items (level {formalities[0]})."
        elif spread == 1:
            score = 92.0
            msg = f"Well-coordinated formality with subtle, natural variance (levels {min(formalities)}-{max(formalities)})."
        elif spread == 2:
            score = 75.0
            msg = f"Moderate formality contrast between pieces (spread of {spread})."
        elif spread == 3:
            score = 45.0
            msg = f"Noticeable formality clash between pieces (spread of {spread})."
        else:
            score = 20.0
            msg = f"Severe internal formality clash (spread of {spread} out of 5)."

        return score, {
            "message": msg,
            "formality_spread": spread,
            "mean_formality": round(mean_f, 1),
        }

    def compute_micro_preference_score(
        self,
        items: List[Dict[str, Any]],
        user_profile: Dict[str, Any]
    ) -> Tuple[float, Dict[str, Any]]:
        """Evaluate favorite colors, avoided colors, fit, and pattern preferences (V)."""
        base = 80.0
        reasons = []

        item_colors = [item.get("color", "").lower().strip() for item in items]
        fav_colors = set(c.lower().strip() for c in user_profile.get("favorite_colors", []) if c)
        avoid_colors = set(c.lower().strip() for c in user_profile.get("avoided_colors", []) if c)

        fav_matches = [c for c in item_colors if c in fav_colors]
        if fav_matches:
            base += min(15.0, len(fav_matches) * 7.5)
            reasons.append(f"Includes favorite color(s): {', '.join(set(fav_matches))}")

        avoid_matches = [c for c in item_colors if c in avoid_colors]
        if avoid_matches:
            base -= len(avoid_matches) * 35.0
            reasons.append(f"Contains avoided color(s): {', '.join(set(avoid_matches))}")

        fit_pref = user_profile.get("fit_preference", "").lower().strip()
        if fit_pref:
            matching_fits = sum(1 for item in items if item.get("fit", "").lower().strip() == fit_pref)
            if matching_fits == len(items):
                base += 5.0
                reasons.append(f"All pieces align with your preferred '{fit_pref}' fit")

        pattern_pref = user_profile.get("pattern_preference", "").lower().strip()
        pattern_count = sum(1 for item in items if item.get("pattern", "solid").lower().strip() != "solid")
        if pattern_pref == "low" and pattern_count <= 1:
            base += 3.0
        elif pattern_pref == "low" and pattern_count >= 2:
            base -= 10.0
            reasons.append("Contains multiple patterns, exceeding low-pattern preference")

        score = max(0.0, min(100.0, base))
        msg = "; ".join(reasons) if reasons else "Aligns with baseline wardrobe preferences."
        return round(score, 1), {"message": msg, "reasons": reasons}

    def evaluate_soft_constraints(
        self,
        items: List[Dict[str, Any]],
        soft_constraints: Optional[List[Dict[str, Any]]] = None,
    ) -> Tuple[Optional[float], Dict[str, Any]]:
        """Evaluates adherence to soft must_include or avoid constraints."""
        if not soft_constraints:
            return None, {}

        satisfied = 0
        details = []
        for c in soft_constraints:
            c_type = c.get("constraint_type")
            t_type = c.get("target_type")
            t_val = str(c.get("target_value", "")).lower().strip()

            has_match = any(
                (t_type == "item_id" and str(it.get("id")) == str(c.get("target_value")))
                or (t_type == "category" and str(it.get("category", "")).lower().strip() == t_val)
                or (t_type == "color" and str(it.get("color", "")).lower().strip() == t_val)
                or (t_type == "accessory_type" and str(it.get("accessory_type", "")).lower().strip() == t_val)
                for it in items
            )

            is_met = has_match if c_type == "must_include" else (not has_match)
            if is_met:
                satisfied += 1
            details.append({"constraint": c, "satisfied": is_met})

        score = round(100.0 * (satisfied / len(soft_constraints)), 1)
        meta = {
            "satisfied_count": satisfied,
            "total_count": len(soft_constraints),
            "details": details,
            "message": f"Satisfies {satisfied} of {len(soft_constraints)} soft constraints ({score}%).",
        }
        return score, meta

    def score_outfit(
        self,
        candidate_items: List[Dict[str, Any]],
        occasion: str,
        user_profile: Dict[str, Any],
        body_shape: Optional[str] = None,
        style_vector: Optional[Dict[str, float]] = None,
        soft_constraints: Optional[List[Dict[str, Any]]] = None,
    ) -> Dict[str, Any]:
        """Calculates total score and detailed breakdown for an outfit candidate.

        Args:
            candidate_items: List of garments forming the candidate outfit.
            occasion: Target social context.
            user_profile: User styling preferences dictionary.
            body_shape: Optional derived or user-overridden body shape.
            style_vector: Optional 5D normalized style archetype vector.
            soft_constraints: Optional list of soft constraint dictionaries.

        Returns:
            Dictionary containing:
                - 'score': float (0.0 to 100.0)
                - 'breakdown': dict with component scores
                - 'meta': intermediate evaluation metadata for explanation generation
                - 'weights': actual normalized weights applied
        """
        colors = [item.get("color", "") for item in candidate_items]

        # 1. Color Score (C)
        color_score, color_meta = evaluate_color_compatibility(colors)

        # 2. Occasion Score (O)
        occasion_score, occasion_meta = evaluate_occasion_suitability(candidate_items, occasion)

        # 3. Personal Style Score (P)
        style_score, style_meta = self.compute_style_score(candidate_items, user_profile)

        # 4. Formality Cohesion Score (F)
        formality_score, formality_meta = self.compute_formality_cohesion_score(candidate_items)

        # 5. Micro-Preferences Score (V)
        pref_score, pref_meta = self.compute_micro_preference_score(candidate_items, user_profile)

        # 6. Personal Attribute Match (A)
        effective_shape = body_shape or user_profile.get("body_shape_override")
        skin_undertone = user_profile.get("skin_undertone")
        skin_depth = user_profile.get("skin_depth")
        face_shape = user_profile.get("face_shape")

        attr_score, attr_meta = compute_personal_attribute_score(
            items=candidate_items,
            body_shape=effective_shape,
            skin_undertone=skin_undertone,
            skin_depth=skin_depth,
            face_shape=face_shape,
        )

        # 7. Style Archetype Match
        style_arch_score, style_arch_meta = compute_style_archetype_score(
            items=candidate_items,
            user_style_vector=style_vector,
        )

        # 8. Soft Constraints Adherence
        soft_score, soft_meta = self.evaluate_soft_constraints(
            items=candidate_items,
            soft_constraints=soft_constraints,
        )

        # Determine which scoring components are active
        active_components = {
            "color_compatibility": True,
            "occasion_suitability": True,
            "style_preference": True,
            "formality_cohesion": True,
            "micro_preference": True,
            "personal_attribute_match": (attr_score is not None),
            "style_archetype_match": (style_arch_score is not None),
            "soft_constraints": (soft_score is not None),
        }

        # Dynamically redistribute weights so sum is guaranteed to be 1.0
        effective_weights = redistribute_weights(active_components)

        # Calculate final weighted score
        total_score = (
            effective_weights.get("color_compatibility", 0.0) * color_score
            + effective_weights.get("occasion_suitability", 0.0) * occasion_score
            + effective_weights.get("style_preference", 0.0) * style_score
            + effective_weights.get("formality_cohesion", 0.0) * formality_score
            + effective_weights.get("micro_preference", 0.0) * pref_score
        )
        if attr_score is not None:
            total_score += effective_weights.get("personal_attribute_match", 0.0) * attr_score
        if style_arch_score is not None:
            total_score += effective_weights.get("style_archetype_match", 0.0) * style_arch_score
        if soft_score is not None:
            total_score += effective_weights.get("soft_constraints", 0.0) * soft_score

        total_score = round(max(0.0, min(100.0, total_score)), 1)

        breakdown = {
            "color_score": color_score,
            "occasion_score": occasion_score,
            "style_score": style_score,
            "formality_score": formality_score,
            "preference_score": pref_score,
        }
        if attr_score is not None:
            breakdown["personal_attribute_score"] = attr_score
        if style_arch_score is not None:
            breakdown["style_archetype_score"] = style_arch_score
        if soft_score is not None:
            breakdown["soft_constraint_score"] = soft_score

        meta = {
            "color": color_meta,
            "occasion": occasion_meta,
            "style": style_meta,
            "formality": formality_meta,
            "preferences": pref_meta,
            "personal_attributes": attr_meta,
            "style_archetype": style_arch_meta,
            "soft_constraints": soft_meta,
            "weights": effective_weights,
        }

        return {
            "score": total_score,
            "breakdown": breakdown,
            "meta": meta,
        }
