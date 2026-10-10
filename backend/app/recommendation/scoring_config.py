"""Centralized, editable configuration for Veyra scoring weights and body analysis thresholds.

All mathematical weights, ratio cutoffs, and biological measurement bounds
are declared here in a transparent and testable format.
"""

from typing import Dict, Any, Tuple

# ==============================================================================
# 1. CORE SCORING WEIGHTS CONFIGURATION
# ==============================================================================
# When all personalization attributes and constraints are present, these baseline weights apply.
# They are strictly required to sum to 1.0 (100%).
BASE_SCORING_WEIGHTS = {
    "color_compatibility": 0.20,
    "occasion_suitability": 0.20,
    "style_preference": 0.10,
    "formality_cohesion": 0.10,
    "micro_preference": 0.10,
    "personal_attribute_match": 0.10,
    "style_archetype_match": 0.10,
    "soft_constraints": 0.10,
}

# Sub-weights within the "personal_attribute_match" component (sum to 1.0)
PERSONAL_ATTRIBUTE_SUB_WEIGHTS = {
    "body_shape": 0.50,       # Silhouette and fit alignment
    "complexion": 0.35,       # Skin undertone and depth color harmony
    "face_shape": 0.15,       # Neckline and accessory coordination (deliberately small)
}

# ==============================================================================
# 2. REALISTIC MEASUREMENT BOUNDS (IN CENTIMETERS)
# ==============================================================================
# Used to validate human biological realism and return 422 Unprocessable Entity
MEASUREMENT_BOUNDS = {
    "height_cm": (50.0, 260.0),       # ~20 in to 102 in
    "shoulder_cm": (25.0, 85.0),      # ~10 in to 34 in
    "chest_bust_cm": (45.0, 210.0),   # ~18 in to 83 in
    "waist_cm": (40.0, 210.0),        # ~16 in to 83 in
    "hips_cm": (50.0, 220.0),         # ~20 in to 87 in
}

# ==============================================================================
# 3. DETERMINISTIC BODY PROPORTION CLASSIFIER THRESHOLDS
# ==============================================================================
# Ratios:
#   shoulder_to_hip = shoulder_cm / hips_cm
#   waist_to_hip    = waist_cm / hips_cm
#   waist_to_chest  = waist_cm / chest_bust_cm
#   chest_to_hip    = chest_bust_cm / hips_cm
BODY_SHAPE_THRESHOLDS = {
    "hourglass": {
        "max_waist_to_hip": 0.75,
        "max_waist_to_chest": 0.75,
        "shoulder_to_hip_range": (0.90, 1.10),
        "chest_to_hip_range": (0.90, 1.10),
        "description": "Balanced shoulder and hip proportions with defined waist.",
    },
    "pear": {
        "max_shoulder_to_hip": 0.90,
        "max_chest_to_hip": 0.90,
        "max_waist_to_hip": 0.85,
        "description": "Hip proportions wider than upper body silhouette.",
    },
    "inverted_triangle": {
        "min_shoulder_to_hip": 1.08,
        "max_waist_to_chest": 0.90,
        "description": "Upper body and shoulder line broader relative to hips.",
    },
    "athletic": {
        "min_shoulder_to_hip": 1.04,
        "waist_to_hip_range": (0.75, 0.90),
        "description": "Broad shoulder silhouette with gently tapered waist and athletic lines.",
    },
    "apple": {
        "min_waist_to_hip": 0.88,
        "min_waist_to_chest": 0.85,
        "description": "Softer, fuller midsection proportions with smooth transitions.",
    },
    "rectangle": {
        "min_waist_to_hip": 0.75,
        "min_waist_to_chest": 0.75,
        "shoulder_to_hip_range": (0.90, 1.10),
        "description": "Linear, straight proportions where shoulders, waist, and hips align evenly.",
    },
}

SUPPORTED_BODY_SHAPES = [
    "hourglass",
    "pear",
    "apple",
    "rectangle",
    "inverted_triangle",
    "athletic",
]

SUPPORTED_SKIN_UNDERTONES = ["warm", "cool", "neutral", "prefer_not_to_say"]
SUPPORTED_SKIN_DEPTHS = ["light", "medium", "deep", "prefer_not_to_say"]
SUPPORTED_FACE_SHAPES = ["oval", "round", "square", "heart", "oblong", "prefer_not_to_say"]
SUPPORTED_SILHOUETTES = ["fitted", "straight", "relaxed", "wide_leg", "cropped", "flowy"]
SUPPORTED_NECKLINES = ["crew", "v_neck", "collared", "scoop", "boat", "none"]
SUPPORTED_LENGTHS = ["short", "regular", "long"]
SUPPORTED_COLOR_WARMTHS = ["warm", "cool", "neutral"]
SUPPORTED_ACCESSORY_TYPES = [
    "earrings",
    "glasses",
    "scarf",
    "hat",
    "necklace",
    "bag",
    "belt",
    "watch",
    "other",
]


def redistribute_weights(active_components: Dict[str, bool]) -> Dict[str, float]:
    """Dynamically redistributes weights among active components so the sum is exactly 1.0.

    Rule: If an input is missing or 'prefer_not_to_say', skip that component and
    redistribute its weight proportionally. Never penalize missing data.

    Args:
        active_components: Dict mapping component name to boolean is_active.

    Returns:
        Dict mapping active component names to normalized weights summing to 1.0.
    """
    total_active_weight = sum(
        BASE_SCORING_WEIGHTS[comp]
        for comp, is_active in active_components.items()
        if is_active and comp in BASE_SCORING_WEIGHTS
    )

    if total_active_weight <= 0:
        # Fallback if somehow nothing is active: uniform distribution across base keys
        count = len(BASE_SCORING_WEIGHTS)
        return {k: 1.0 / count for k in BASE_SCORING_WEIGHTS}

    redistributed = {}
    for comp in BASE_SCORING_WEIGHTS:
        if active_components.get(comp, False):
            redistributed[comp] = BASE_SCORING_WEIGHTS[comp] / total_active_weight
        else:
            redistributed[comp] = 0.0

    return redistributed
