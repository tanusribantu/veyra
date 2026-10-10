"""Outfit inclusion and avoidance constraint routes."""

from flask import Blueprint, request, jsonify
from pydantic import ValidationError
from backend.app.schemas import ConstraintCreateSchema, format_validation_error
from backend.app.services.constraint_service import ConstraintService

bp = Blueprint("constraints", __name__)


def get_current_user_id() -> str:
    """Extract user identifier from headers or default to prototype user."""
    return request.headers.get("X-User-ID", "user_001")


@bp.route("/constraints", methods=["POST"])
def create_constraint():
    """Saves a must_include or avoid constraint rule for the user."""
    user_id = get_current_user_id()
    payload = request.get_json(silent=True)
    if payload is None:
        return jsonify({"error": "Request body must be valid JSON"}), 400

    try:
        validated = ConstraintCreateSchema(**payload).model_dump()
    except ValidationError as err:
        return jsonify({"error": "Validation failed", "details": format_validation_error(err)}), 400

    record = ConstraintService.save_constraint(
        user_id=user_id,
        constraint_type=validated["constraint_type"],
        target_type=validated["target_type"],
        target_value=validated["target_value"],
        strength=validated.get("strength", "hard"),
        is_saved_default=validated.get("is_saved_default", False),
    )
    return jsonify(record), 201


@bp.route("/constraints", methods=["GET"])
def list_constraints():
    """Lists saved constraints for the user, with optional filter by default status."""
    user_id = get_current_user_id()
    is_default_param = request.args.get("is_saved_default")
    is_saved_default = None
    if is_default_param is not None:
        is_saved_default = is_default_param.lower() in ["true", "1", "yes"]

    records = ConstraintService.list_constraints(user_id=user_id, is_saved_default=is_saved_default)
    return jsonify({"constraints": records}), 200


@bp.route("/constraints/<string:constraint_id>", methods=["DELETE"])
def delete_constraint(constraint_id: str):
    """Deletes a saved constraint by ID."""
    user_id = get_current_user_id()
    deleted = ConstraintService.delete_constraint(user_id=user_id, constraint_id=constraint_id)
    if not deleted:
        return jsonify({"error": f"Constraint '{constraint_id}' not found"}), 404
    return jsonify({"message": f"Constraint '{constraint_id}' successfully deleted"}), 200
