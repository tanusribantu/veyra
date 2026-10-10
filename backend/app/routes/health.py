"""Health and metadata routes."""

from flask import Blueprint, jsonify
from backend.app.schemas.constants import (
    CATEGORY_TO_SLOT,
    SUPPORTED_CATEGORIES,
    SUPPORTED_SLOTS,
    SUPPORTED_OCCASIONS,
    SUPPORTED_STYLES,
    SUPPORTED_FITS,
    SUPPORTED_PATTERNS,
    SUPPORTED_SILHOUETTES,
    SUPPORTED_NECKLINES,
    SUPPORTED_LENGTHS,
    SUPPORTED_COLOR_WARMTHS,
    SUPPORTED_ACCESSORY_TYPES,
)
from backend.app.recommendation.scoring_config import (
    SUPPORTED_BODY_SHAPES,
    SUPPORTED_SKIN_UNDERTONES,
    SUPPORTED_SKIN_DEPTHS,
    SUPPORTED_FACE_SHAPES,
)

bp = Blueprint("health", __name__)


@bp.route("/health", methods=["GET"])
def health_check():
    """System health check endpoint."""
    return jsonify({
        "status": "ok",
        "service": "veyra-api",
        "version": "0.1.0",
    }), 200


@bp.route("/meta", methods=["GET"])
def get_metadata():
    """Return supported categories, occasions, slots, and style attributes."""
    return jsonify({
        "categories": SUPPORTED_CATEGORIES,
        "slots": SUPPORTED_SLOTS,
        "category_to_slot": CATEGORY_TO_SLOT,
        "occasions": SUPPORTED_OCCASIONS,
        "styles": SUPPORTED_STYLES,
        "fits": SUPPORTED_FITS,
        "patterns": SUPPORTED_PATTERNS,
        "body_shapes": SUPPORTED_BODY_SHAPES,
        "skin_undertones": SUPPORTED_SKIN_UNDERTONES,
        "skin_depths": SUPPORTED_SKIN_DEPTHS,
        "face_shapes": SUPPORTED_FACE_SHAPES,
        "silhouettes": SUPPORTED_SILHOUETTES,
        "necklines": SUPPORTED_NECKLINES,
        "lengths": SUPPORTED_LENGTHS,
        "color_warmths": SUPPORTED_COLOR_WARMTHS,
        "accessory_types": SUPPORTED_ACCESSORY_TYPES,
    }), 200
