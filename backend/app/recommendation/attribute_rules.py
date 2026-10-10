"""Personal attribute matching rules (complexion, body silhouette, face shape).

================================================================================
DESIGN PHILOSOPHY & ETHICAL GUIDELINES
================================================================================
1. Suggestive, Body-Positive Language:
   All generated advice uses non-judgmental, suggestive framing ("may suit",
   "tends to balance proportions", "complements natural lines").
   Absolute or deficit-based wording ("flaws", "hide", "correct") is strictly forbidden.

2. Documented, Editable Mappings:
   Styling heuristics for skin undertone, body shape, and face shape are defined
   in explicit lookup tables below for easy auditing and updates.

3. Graceful Skipping:
   Missing attributes or 'prefer_not_to_say' selections are never penalized.
   Sub-weights are redistributed dynamically among available inputs.
================================================================================
"""

from typing import List, Dict, Any, Tuple, Optional

# ==============================================================================
# 1. BODY SHAPE -> SILHOUETTE & FIT PREFERENCES
# ==============================================================================
BODY_SHAPE_SILHOUETTES = {
    "hourglass": {
        "preferred_silhouettes": {"fitted", "straight"},
        "preferred_fits": {"slim", "regular"},
        "avoided_silhouettes": {"baggy", "oversized"},
        "positive_message": "Fitted cuts may complement natural waist definition.",
    },
    "pear": {
        "top_silhouettes": {"relaxed", "straight", "cropped", "flowy"},
        "bottom_silhouettes": {"straight", "wide_leg", "relaxed"},
        "positive_message": "Wide-leg and straight bottoms tend to balance hip proportions with upper silhouette.",
    },
    "inverted_triangle": {
        "top_silhouettes": {"relaxed", "straight", "flowy"},
        "bottom_silhouettes": {"wide_leg", "straight", "relaxed"},
        "positive_message": "Straight and wide-leg lines tend to create balanced symmetry with broader shoulders.",
    },
    "athletic": {
        "preferred_silhouettes": {"straight", "fitted", "relaxed"},
        "preferred_fits": {"regular", "slim", "relaxed"},
        "positive_message": "Clean, structured cuts may complement an athletic, sculpted frame.",
    },
    "apple": {
        "preferred_silhouettes": {"flowy", "straight", "relaxed"},
        "preferred_fits": {"regular", "relaxed"},
        "positive_message": "Flowy and relaxed silhouettes may offer comfortable, elegant drape.",
    },
    "rectangle": {
        "preferred_silhouettes": {"fitted", "straight", "wide_leg", "cropped"},
        "positive_message": "Varied silhouette proportions tend to add visual dimension and structure.",
    },
}

# ==============================================================================
# 2. COMPLEXION -> COLOR WARMTH & CONTRAST
# ==============================================================================
UNDERTONE_WARMTH_PREFERENCES = {
    "warm": {
        "ideal_warmths": {"warm"},
        "positive_message": "Warm earth and golden tones may naturally complement your undertone.",
    },
    "cool": {
        "ideal_warmths": {"cool"},
        "positive_message": "Cool blues and crisp jewel tones tend to harmonize with your complexion.",
    },
    "neutral": {
        "ideal_warmths": {"warm", "cool", "neutral"},
        "positive_message": "Neutral undertones allow versatile styling across both warm and cool palettes.",
    },
}

SKIN_DEPTH_CONTRAST = {
    "light": {
        "positive_message": "Contrast between soft neutrals and rich anchors brings crisp definition.",
    },
    "medium": {
        "positive_message": "Medium depth carries saturated jewel hues and warm neutrals effortlessly.",
    },
    "deep": {
        "positive_message": "Vibrant colors and crisp contrast pop with high visual clarity.",
    },
}

# ==============================================================================
# 3. FACE SHAPE -> NECKLINE & ACCESSORY COORDINATION
# ==============================================================================
FACE_SHAPE_RECOMMENDATIONS = {
    "round": {
        "preferred_necklines": {"v_neck", "collared", "scoop"},
        "preferred_accessories": {"glasses", "necklace", "earrings"},
        "positive_message": "V-neck and angular collar lines tend to gently elongate rounded facial contours.",
    },
    "square": {
        "preferred_necklines": {"scoop", "boat", "crew", "none"},
        "preferred_accessories": {"scarf", "hat", "earrings"},
        "positive_message": "Curved and soft necklines may soften angular jawlines.",
    },
    "heart": {
        "preferred_necklines": {"scoop", "boat", "crew", "collared"},
        "preferred_accessories": {"earrings", "scarf"},
        "positive_message": "Open or balanced necklines tend to harmonize with a tapered chin line.",
    },
    "oblong": {
        "preferred_necklines": {"crew", "boat", "collared"},
        "preferred_accessories": {"glasses", "scarf", "hat"},
        "positive_message": "Horizontal necklines like crew or boat may balance longer facial proportions.",
    },
    "oval": {
        "preferred_necklines": {"crew", "v_neck", "collared", "scoop", "boat", "none"},
        "preferred_accessories": {"glasses", "hat", "scarf", "necklace", "earrings"},
        "positive_message": "Balanced facial proportions pair easily with most neckline cuts.",
    },
}


def evaluate_body_shape_match(
    items: List[Dict[str, Any]],
    body_shape: Optional[str]
) -> Tuple[Optional[float], Optional[Dict[str, Any]]]:
    """Evaluates how outfit silhouettes and cuts align with user body shape.

    Returns (None, None) if body_shape is missing or not provided.
    """
    if not body_shape or body_shape == "prefer_not_to_say":
        return None, None

    shape_key = body_shape.lower().strip()
    profile = BODY_SHAPE_SILHOUETTES.get(shape_key)
    if not profile:
        return None, None

    # Evaluate silhouettes and fits of items
    base_score = 80.0
    matched_reasons = []

    for item in items:
        sil = (item.get("silhouette") or "").lower().strip()
        fit = (item.get("fit") or "").lower().strip()
        slot = item.get("slot")

        if shape_key == "hourglass":
            if sil in profile.get("preferred_silhouettes", set()):
                base_score += 6.0
                matched_reasons.append("waist-defining silhouette")
            if fit in profile.get("preferred_fits", set()):
                base_score += 4.0

        elif shape_key == "pear":
            if slot == "top" and sil in profile.get("top_silhouettes", set()):
                base_score += 7.0
            if slot == "bottom" and sil in profile.get("bottom_silhouettes", set()):
                base_score += 7.0
                matched_reasons.append("proportional bottom cut")

        elif shape_key == "inverted_triangle":
            if slot == "bottom" and sil in profile.get("bottom_silhouettes", set()):
                base_score += 8.0
                matched_reasons.append("balanced lower silhouette")

        elif shape_key == "athletic":
            if sil in profile.get("preferred_silhouettes", set()):
                base_score += 5.0
            if fit in profile.get("preferred_fits", set()):
                base_score += 4.0
                matched_reasons.append("sculpted fit")

        elif shape_key == "apple":
            if sil in profile.get("preferred_silhouettes", set()):
                base_score += 6.0
                matched_reasons.append("draped silhouette")

        elif shape_key == "rectangle":
            if sil in profile.get("preferred_silhouettes", set()):
                base_score += 5.0
                matched_reasons.append("structured silhouette")

    score = min(100.0, max(60.0, base_score))
    message = profile["positive_message"]

    return round(score, 1), {
        "body_shape": shape_key,
        "score": score,
        "message": message,
    }


def evaluate_complexion_match(
    items: List[Dict[str, Any]],
    skin_undertone: Optional[str],
    skin_depth: Optional[str],
) -> Tuple[Optional[float], Optional[Dict[str, Any]]]:
    """Evaluates how outfit color warmth aligns with skin undertone and depth.

    Returns (None, None) if undertone is missing or 'prefer_not_to_say'.
    """
    if not skin_undertone or skin_undertone == "prefer_not_to_say":
        return None, None

    undertone_key = skin_undertone.lower().strip()
    profile = UNDERTONE_WARMTH_PREFERENCES.get(undertone_key)
    if not profile:
        return None, None

    item_warmths = [item.get("color_warmth", "neutral") for item in items]
    ideal_warmths = profile["ideal_warmths"]

    matching_count = sum(1 for w in item_warmths if w in ideal_warmths or w == "neutral")
    ratio = matching_count / len(item_warmths) if item_warmths else 1.0

    score = 75.0 + (ratio * 25.0)
    score = min(100.0, max(60.0, score))

    message = profile["positive_message"]
    if skin_depth and skin_depth != "prefer_not_to_say":
        depth_key = skin_depth.lower().strip()
        if depth_key in SKIN_DEPTH_CONTRAST:
            message += " " + SKIN_DEPTH_CONTRAST[depth_key]["positive_message"]

    return round(score, 1), {
        "skin_undertone": undertone_key,
        "skin_depth": skin_depth,
        "score": score,
        "message": message,
    }


def evaluate_face_shape_match(
    items: List[Dict[str, Any]],
    face_shape: Optional[str],
) -> Tuple[Optional[float], Optional[Dict[str, Any]]]:
    """Evaluates how top neckline and accessories align with face shape.

    Returns (None, None) if face_shape is missing or 'prefer_not_to_say'.
    """
    if not face_shape or face_shape == "prefer_not_to_say":
        return None, None

    face_key = face_shape.lower().strip()
    profile = FACE_SHAPE_RECOMMENDATIONS.get(face_key)
    if not profile:
        return None, None

    base_score = 80.0
    matched_features = []

    for item in items:
        neckline = (item.get("neckline") or "").lower().strip()
        acc_type = (item.get("accessory_type") or "").lower().strip()

        if neckline and neckline in profile["preferred_necklines"]:
            base_score += 10.0
            matched_features.append(f"{neckline} neckline")

        if acc_type and acc_type in profile["preferred_accessories"]:
            base_score += 8.0
            matched_features.append(f"{acc_type}")

    score = min(100.0, max(70.0, base_score))
    return round(score, 1), {
        "face_shape": face_key,
        "score": score,
        "message": profile["positive_message"],
        "matched_features": matched_features,
    }


def compute_personal_attribute_score(
    items: List[Dict[str, Any]],
    body_shape: Optional[str],
    skin_undertone: Optional[str],
    skin_depth: Optional[str],
    face_shape: Optional[str],
) -> Tuple[Optional[float], Dict[str, Any]]:
    """Aggregates sub-components of personal attribute match with sub-weight redistribution.

    Sub-weights:
        - body_shape: 0.50
        - complexion: 0.35
        - face_shape: 0.15

    If any sub-component is missing or 'prefer_not_to_say', its weight is proportionally
    redistributed among the remaining active sub-components.
    If ALL sub-components are missing, returns (None, {}) so the caller can redistribute
    the parent weight to core components.

    Returns:
        (composite_score, metadata_dict)
    """
    body_score, body_meta = evaluate_body_shape_match(items, body_shape)
    comp_score, comp_meta = evaluate_complexion_match(items, skin_undertone, skin_depth)
    face_score, face_meta = evaluate_face_shape_match(items, face_shape)

    sub_scores = {
        "body_shape": body_score,
        "complexion": comp_score,
        "face_shape": face_score,
    }

    base_sub_weights = {
        "body_shape": 0.50,
        "complexion": 0.35,
        "face_shape": 0.15,
    }

    active_sub_weights = {
        k: base_sub_weights[k] for k, v in sub_scores.items() if v is not None
    }

    if not active_sub_weights:
        # No personal attributes available to score
        return None, {
            "active": False,
            "reasons": [],
        }

    # Redistribute sub-weights proportionally among active sub-components
    total_active_w = sum(active_sub_weights.values())
    composite = 0.0
    for k, w in active_sub_weights.items():
        normalized_w = w / total_active_w
        composite += normalized_w * sub_scores[k]

    reasons = []
    if body_meta:
        reasons.append({"factor": "body_shape_harmony", "message": body_meta["message"]})
    if comp_meta:
        reasons.append({"factor": "complexion_harmony", "message": comp_meta["message"]})
    if face_meta and face_meta.get("matched_features"):
        reasons.append({"factor": "face_shape_coordination", "message": face_meta["message"]})

    return round(composite, 1), {
        "active": True,
        "body_meta": body_meta,
        "complexion_meta": comp_meta,
        "face_meta": face_meta,
        "reasons": reasons,
    }
