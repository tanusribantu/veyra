"""Editable configuration and mapping functions for lane-aware body silhouette display labels.

Keeps anthropometric ratio logic intact while mapping display terminology per styling lane:
- Womenswear displays classic proportion names (e.g. Hourglass, Pear).
- Menswear, mixed, prefer_not_to_say, and unspecified lanes display neutral descriptive labels
  (e.g. "Broad Shoulders, Tapered Waist", "Balanced Frame, Defined Waist").
All labels live in this single editable config and users can always override.
"""

from typing import Dict, Any, Optional

BODY_SHAPE_DISPLAY_LABELS: Dict[str, Dict[str, Dict[str, str]]] = {
    "womenswear": {
        "hourglass": {
            "label": "Hourglass",
            "description": "Harmonious upper & lower proportion with defined waist drape",
        },
        "pear": {
            "label": "Pear / Triangle",
            "description": "Lower body carries ease, creating a grounded silhouette",
        },
        "inverted_triangle": {
            "label": "Inverted Triangle",
            "description": "Broader shoulder line tapering to streamlined hips",
        },
        "rectangle": {
            "label": "Rectangle / Straight",
            "description": "Linear alignment through shoulders, waist, and hips",
        },
        "apple": {
            "label": "Apple / Soft Round",
            "description": "Comfortable midsection ease with fluid, graceful lines",
        },
        "athletic": {
            "label": "Athletic / Sculpted",
            "description": "Structured shoulder posture with trim, active proportions",
        },
    },
    "neutral": {
        "hourglass": {
            "label": "Balanced Frame, Defined Waist",
            "description": "Proportional chest and hips with a tapered waistline",
        },
        "pear": {
            "label": "Broader Base, Streamlined Torso",
            "description": "Lower torso carries width relative to shoulders",
        },
        "inverted_triangle": {
            "label": "Broad Shoulders, Tapered Waist",
            "description": "Upper silhouette is broader with shoulders tapering to hips",
        },
        "rectangle": {
            "label": "Straight / Linear Frame",
            "description": "Balanced alignment with consistent width from shoulders to hips",
        },
        "apple": {
            "label": "Relaxed Midsection, Fluid Torso",
            "description": "Midsection is the primary focal width with comfortable ease",
        },
        "athletic": {
            "label": "Structured Shoulders, Athletic Taper",
            "description": "Sculpted shoulder line with athletic torso taper",
        },
    },
}


def get_body_shape_display_info(shape: str, lane: Optional[str] = None) -> Dict[str, str]:
    """Retrieves the display label and description for a body shape based on styling lane.
    
    Womenswear shows classic names. Menswear, mixed, prefer_not_to_say, and unspecified
    show neutral descriptive terminology.
    """
    clean_shape = (shape or "rectangle").lower().strip()
    lane_clean = (lane or "").lower().strip()
    lane_key = "womenswear" if lane_clean == "womenswear" else "neutral"

    lane_dict = BODY_SHAPE_DISPLAY_LABELS.get(lane_key, BODY_SHAPE_DISPLAY_LABELS["neutral"])
    fallback_dict = BODY_SHAPE_DISPLAY_LABELS["neutral"]

    if clean_shape in lane_dict:
        return lane_dict[clean_shape]
    elif clean_shape in fallback_dict:
        return fallback_dict[clean_shape]
    return {
        "label": clean_shape.replace("_", " ").title(),
        "description": "Proportional silhouette alignment.",
    }


def get_body_shape_label(shape: str, lane: Optional[str] = None) -> str:
    """Convenience helper returning just the display label string."""
    return get_body_shape_display_info(shape, lane).get("label", shape)
