"""Outfit recommendation and feedback routes."""

from flask import Blueprint, request, jsonify
from pydantic import ValidationError
from backend.app.schemas import (
    RecommendationRequestSchema,
    FeedbackCreateSchema,
    format_validation_error,
)
from backend.app.services.recommendation_service import RecommendationService
from backend.app.auth import require_auth, get_current_user_id

bp = Blueprint("recommendations", __name__)
recommendation_service = RecommendationService()


@bp.route("/recommendations", methods=["POST"])
@require_auth
def create_recommendations():
    """Generate, rank, and explain outfit recommendations for a requested occasion."""
    user_id = get_current_user_id()
    payload = request.get_json(silent=True)
    if payload is None:
        return jsonify({"error": "Request body must be valid JSON"}), 400

    try:
        validated = RecommendationRequestSchema(**payload).model_dump()
    except ValidationError as err:
        return jsonify({"error": "Validation failed", "details": format_validation_error(err)}), 400

    recs, is_blocked, block_explanation = recommendation_service.generate_recommendations_detailed(
        user_id=user_id,
        occasion=validated["occasion"],
        wardrobe_item_ids=validated.get("wardrobe_item_ids"),
        constraints=validated.get("constraints"),
        result_limit=validated.get("result_limit", 3),
    )

    from backend.app.services.measurements_service import MeasurementsService
    measurements = MeasurementsService.get_measurements(user_id=user_id)

    response_data = {
        "recommendations": recs,
        "measurements_missing": (measurements is None),
    }
    if is_blocked:
        response_data["constraint_blocked"] = True
        response_data["block_explanation"] = block_explanation

    return jsonify(response_data), 200


@bp.route("/recommendations", methods=["GET"])
@require_auth
def list_recommendations():
    """Retrieve historical recommendations for the user."""
    user_id = get_current_user_id()
    limit = request.args.get("limit", 10, type=int)
    history = RecommendationService.list_recommendations(user_id=user_id, limit=limit)
    return jsonify({"recommendations": history}), 200


@bp.route("/recommendations/<string:recommendation_id>", methods=["GET"])
@require_auth
def get_recommendation_detail(recommendation_id: str):
    """Retrieve a specific recommendation by ID."""
    user_id = get_current_user_id()
    rec = RecommendationService.get_recommendation(user_id=user_id, recommendation_id=recommendation_id)
    if not rec:
        return jsonify({"error": f"Recommendation '{recommendation_id}' not found"}), 404
    return jsonify(rec), 200


@bp.route("/recommendations/<string:recommendation_id>/feedback", methods=["POST"])
@require_auth
def submit_recommendation_feedback(recommendation_id: str):
    """Submit user reaction (like, dislike, skip, worn) on a recommendation."""
    user_id = get_current_user_id()
    payload = request.get_json(silent=True)
    if payload is None:
        return jsonify({"error": "Request body must be valid JSON"}), 400

    try:
        validated = FeedbackCreateSchema(**payload).model_dump()
    except ValidationError as err:
        return jsonify({"error": "Validation failed", "details": format_validation_error(err)}), 400

    feedback = RecommendationService.submit_feedback(
        user_id=user_id,
        recommendation_id=recommendation_id,
        feedback_type=validated["feedback_type"],
        reason=validated.get("reason"),
    )

    if not feedback:
        return jsonify({"error": f"Recommendation '{recommendation_id}' not found"}), 404

    return jsonify(feedback), 200
