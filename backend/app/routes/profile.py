from flask import Blueprint, request, jsonify
from pydantic import ValidationError
from backend.app.schemas import ProfileUpdateSchema, format_validation_error
from backend.app.services.profile_service import ProfileService
from backend.app.auth import require_auth, get_current_user_id

bp = Blueprint("profile", __name__)


@bp.route("/profile", methods=["GET"])
@require_auth
def get_profile():
    """Retrieve current user style profile."""
    user_id = get_current_user_id()
    profile = ProfileService.get_or_create_profile(user_id=user_id)
    return jsonify(profile.to_dict()), 200


@bp.route("/profile", methods=["PUT"])
@require_auth
def update_profile():
    """Update current user style profile."""
    user_id = get_current_user_id()
    payload = request.get_json(silent=True) or {}

    try:
        validated_data = ProfileUpdateSchema(**payload).model_dump(exclude_unset=True)
    except ValidationError as err:
        return jsonify({"error": "Validation failed", "details": format_validation_error(err)}), 400

    profile = ProfileService.update_profile(user_id=user_id, updates=validated_data)
    return jsonify(profile.to_dict()), 200


@bp.route("/profile/preferences", methods=["GET"])
@require_auth
def get_preferences():
    """Read specific style preference settings."""
    user_id = get_current_user_id()
    profile = ProfileService.get_or_create_profile(user_id=user_id)
    return jsonify({
        "preferred_styles": profile.preferred_styles or [],
        "favorite_colors": profile.favorite_colors or [],
        "avoided_colors": profile.avoided_colors or [],
        "fit_preference": profile.fit_preference,
        "pattern_preference": profile.pattern_preference,
        "formality_preference": profile.formality_preference,
    }), 200


@bp.route("/profile/preferences", methods=["PUT"])
@require_auth
def update_preferences():
    """Update specific style preference settings."""
    user_id = get_current_user_id()
    payload = request.get_json(silent=True) or {}

    try:
        validated_data = ProfileUpdateSchema(**payload).model_dump(exclude_unset=True)
    except ValidationError as err:
        return jsonify({"error": "Validation failed", "details": format_validation_error(err)}), 400

    profile = ProfileService.update_profile(user_id=user_id, updates=validated_data)
    return jsonify({
        "preferred_styles": profile.preferred_styles or [],
        "favorite_colors": profile.favorite_colors or [],
        "avoided_colors": profile.avoided_colors or [],
        "fit_preference": profile.fit_preference,
        "pattern_preference": profile.pattern_preference,
        "formality_preference": profile.formality_preference,
    }), 200
