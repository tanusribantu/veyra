"""Deterministic body proportion classifier for Veyra style intelligence.

Analyzes anthropometric ratios (shoulder/hip, waist/hip, waist/chest, chest/hip)
to classify silhouette tendencies into structured body shapes with full explainability.
Allows custom user overrides without overwriting the derived mathematical baseline.
"""

from typing import Dict, Any, Optional
from backend.app.recommendation.scoring_config import (
    BODY_SHAPE_THRESHOLDS,
    SUPPORTED_BODY_SHAPES,
)
from backend.app.recommendation.body_labels import (
    get_body_shape_display_info,
    get_body_shape_label,
    BODY_SHAPE_DISPLAY_LABELS,
)


class BodyAnalysisService:
    """Calculates anthropometric ratios and classifies body proportion shapes."""

    @classmethod
    def get_display_label(cls, shape: str, lane: Optional[str] = None) -> str:
        """Retrieves the display label for a body shape based on styling lane."""
        return get_body_shape_label(shape, lane=lane)

    @classmethod
    def get_display_info(cls, shape: str, lane: Optional[str] = None) -> Dict[str, str]:
        """Retrieves the display label and description for a body shape based on styling lane."""
        return get_body_shape_display_info(shape, lane=lane)

    @staticmethod
    def calculate_ratios(
        shoulder_cm: float,
        chest_bust_cm: float,
        waist_cm: float,
        hips_cm: float,
    ) -> Dict[str, float]:
        """Calculates normalized body proportion ratios."""
        if hips_cm <= 0 or chest_bust_cm <= 0:
            raise ValueError("Hips and chest measurements must be greater than zero.")

        return {
            "shoulder_to_hip": round(shoulder_cm / hips_cm, 3),
            "waist_to_hip": round(waist_cm / hips_cm, 3),
            "waist_to_chest": round(waist_cm / chest_bust_cm, 3),
            "chest_to_hip": round(chest_bust_cm / hips_cm, 3),
        }

    @classmethod
    def classify_body_shape(
        cls,
        shoulder_cm: float,
        chest_bust_cm: float,
        waist_cm: float,
        hips_cm: float,
        custom_override: Optional[str] = None,
        lane: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Derives body shape deterministically from measurement ratios.

        Classification Priority:
        1. Hourglass: defined waist relative to both chest and hips, with balanced top & bottom.
        2. Pear: hips significantly wider than shoulders/bust.
        3. Inverted Triangle: shoulders/chest noticeably wider than hips with straight/tapered waist.
        4. Athletic: broad shoulders relative to hips with moderate waist definition.
        5. Apple: waist is the focal measurement, wider or close to chest/hips.
        6. Rectangle: shoulders, chest, and hips align evenly with straight waist.

        Returns:
            Dict containing:
                - derived_shape: mathematically derived shape
                - effective_shape: custom override if present, else derived_shape
                - is_overridden: boolean
                - ratios: dict of calculated ratios
                - explanation: human-readable rationale citing ratios
        """
        ratios = cls.calculate_ratios(
            shoulder_cm=shoulder_cm,
            chest_bust_cm=chest_bust_cm,
            waist_cm=waist_cm,
            hips_cm=hips_cm,
        )

        s_to_h = ratios["shoulder_to_hip"]
        w_to_h = ratios["waist_to_hip"]
        w_to_c = ratios["waist_to_chest"]
        c_to_h = ratios["chest_to_hip"]

        derived_shape = "rectangle"  # Default linear baseline
        explanation = "Balanced shoulder and hip alignment with a straight, linear silhouette."

        # 1. Hourglass Check
        # Defined waist: waist <= 75% of hip and chest, with balanced upper and lower proportions
        if (
            w_to_h <= 0.75
            and w_to_c <= 0.75
            and 0.88 <= s_to_h <= 1.12
        ):
            derived_shape = "hourglass"
            explanation = (
                f"Defined waistline (waist/hip: {w_to_h:.2f}, waist/chest: {w_to_c:.2f}) "
                f"paired with balanced shoulder-to-hip alignment ({s_to_h:.2f})."
            )

        # 2. Pear Check
        # Lower body prominently wider than shoulders and chest
        elif s_to_h < 0.90 and c_to_h < 0.92:
            derived_shape = "pear"
            explanation = (
                f"Lower silhouette is dominant with hips wider than upper body "
                f"(shoulder/hip: {s_to_h:.2f}, chest/hip: {c_to_h:.2f})."
            )

        # 3. Inverted Triangle Check
        # Shoulders significantly wider than hips with tapered lower body
        elif s_to_h >= 1.08 and w_to_h <= 0.88:
            derived_shape = "inverted_triangle"
            explanation = (
                f"Upper silhouette is broader with shoulders wider than hips "
                f"(shoulder/hip: {s_to_h:.2f})."
            )

        # 4. Athletic Check
        # Moderately broad shoulders with tapered torso lines
        elif s_to_h >= 1.04 and 0.75 <= w_to_h <= 0.88:
            derived_shape = "athletic"
            explanation = (
                f"Sculpted upper-body frame with gently tapered waist lines "
                f"(shoulder/hip: {s_to_h:.2f}, waist/hip: {w_to_h:.2f})."
            )

        # 5. Apple Check
        # Fuller waistline relative to hips and chest
        elif w_to_h >= 0.88 and w_to_c >= 0.85:
            derived_shape = "apple"
            explanation = (
                f"Midsection is the primary focal proportion with softer, unified transitions "
                f"(waist/hip: {w_to_h:.2f}, waist/chest: {w_to_c:.2f})."
            )

        # 6. Rectangle Check (Fall-through)
        else:
            derived_shape = "rectangle"
            explanation = (
                f"Balanced, linear frame where shoulders, chest, and hips align evenly "
                f"(shoulder/hip: {s_to_h:.2f}, waist/hip: {w_to_h:.2f})."
            )

        # Handle User Override
        effective_shape = derived_shape
        is_overridden = False
        if custom_override:
            clean_override = custom_override.lower().strip()
            if clean_override in SUPPORTED_BODY_SHAPES:
                effective_shape = clean_override
                is_overridden = True
                explanation += f" (Custom override selected: {clean_override})."

        display_info = get_body_shape_display_info(effective_shape, lane=lane)

        return {
            "derived_shape": derived_shape,
            "effective_shape": effective_shape,
            "display_shape_label": display_info["label"],
            "display_shape_desc": display_info["description"],
            "is_overridden": is_overridden,
            "ratios": ratios,
            "explanation": explanation,
        }
