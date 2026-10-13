"""Body measurements API endpoints with validation and privacy deletion support."""

from flask import Blueprint, request, jsonify
from pydantic import ValidationError
from backend.app.schemas.measurements import (
    BodyMeasurementsCreateSchema,
    BodyMeasurementsOverrideSchema,
)
from backend.app.schemas import format_validation_error
from backend.app.services.measurements_service import MeasurementsService
from backend.app.auth import require_auth, get_current_user_id

bp = Blueprint("measurements", __name__)


@bp.route("/measurements", methods=["GET"])
@require_auth
def get_user_measurements():
    """Retrieve current user's body measurements, ratios, and derived shape."""
    user_id = get_current_user_id()
    unit = request.args.get("unit")
    data = MeasurementsService.get_measurements(user_id=user_id, unit=unit)

    if not data:
        return jsonify({
            "measurements_missing": True,
            "message": "No body measurements recorded. Personalization operates in standard mode.",
        }), 200

    data["measurements_missing"] = False
    return jsonify(data), 200


@bp.route("/measurements", methods=["POST"])
@require_auth
def save_user_measurements():
    """Save or update user body measurements with deterministic proportion classification."""
    user_id = get_current_user_id()
    payload = request.get_json(silent=True)
    if payload is None:
        return jsonify({"error": "Request body must be valid JSON"}), 422

    try:
        validated = BodyMeasurementsCreateSchema(**payload).model_dump()
    except ValidationError as err:
        # Return 422 Unprocessable Entity as required for measurement validation
        return jsonify({
            "error": "Measurement validation failed",
            "details": format_validation_error(err),
        }), 422

    result = MeasurementsService.save_measurements(user_id=user_id, data=validated)
    result["measurements_missing"] = False
    return jsonify(result), 201


@bp.route("/measurements", methods=["DELETE"])
@require_auth
def delete_user_measurements():
    """Permanently delete user body measurements for complete local privacy."""
    user_id = get_current_user_id()
    deleted = MeasurementsService.delete_measurements(user_id=user_id)
    if not deleted:
        return jsonify({
            "message": "No measurements were found to delete.",
            "measurements_missing": True,
        }), 200

    return jsonify({
        "message": "Body measurements permanently deleted from local storage.",
        "measurements_missing": True,
    }), 200


@bp.route("/measurements/shape-override", methods=["PATCH"])
@require_auth
def override_body_shape():
    """Allow user to manually override or reset their derived body shape."""
    user_id = get_current_user_id()
    payload = request.get_json(silent=True) or {}

    try:
        validated = BodyMeasurementsOverrideSchema(**payload).model_dump()
    except ValidationError as err:
        return jsonify({
            "error": "Validation failed",
            "details": format_validation_error(err),
        }), 422

    result = MeasurementsService.set_shape_override(
        user_id=user_id,
        custom_shape=validated.get("custom_body_shape"),
    )
    if not result:
        return jsonify({
            "error": "Cannot override shape before saving base measurements.",
            "measurements_missing": True,
        }), 404

    return jsonify(result), 200
