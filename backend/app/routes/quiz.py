"""Style archetype quiz routes."""

from flask import Blueprint, request, jsonify
from pydantic import ValidationError
from backend.app.schemas import QuizAnswerSubmitSchema, format_validation_error
from backend.app.services.quiz_service import QuizService

bp = Blueprint("style_quiz", __name__)


def get_current_user_id() -> str:
    """Extract user identifier from headers or default to prototype user."""
    return request.headers.get("X-User-ID", "user_001")


@bp.route("/style-quiz", methods=["GET"])
@bp.route("/style-quiz/questions", methods=["GET"])
def get_quiz_questions():
    """Returns the 10 versioned scenario questions for the style archetype quiz."""
    data = QuizService.get_quiz_questions()
    return jsonify(data), 200


@bp.route("/style-quiz", methods=["POST"])
@bp.route("/style-quiz/answers", methods=["POST"])
def submit_quiz_answers():
    """Scores quiz answers, determines normalized 5D style vector and archetype, and persists record."""
    user_id = get_current_user_id()
    payload = request.get_json(silent=True)
    if payload is None:
        return jsonify({"error": "Request body must be valid JSON"}), 400

    try:
        validated = QuizAnswerSubmitSchema(**payload).model_dump()
    except ValidationError as err:
        return jsonify({"error": "Validation failed", "details": format_validation_error(err)}), 400

    result = QuizService.submit_quiz_answers(user_id=user_id, answers=validated["answers"])
    return jsonify(result), 201


@bp.route("/style-quiz/result", methods=["GET"])
@bp.route("/style-quiz/results/latest", methods=["GET"])
def get_latest_quiz_result():
    """Retrieves the latest style quiz result for the current user."""
    user_id = get_current_user_id()
    result = QuizService.get_latest_result(user_id=user_id)
    if not result:
        return jsonify({"error": "No style quiz result found for this user"}), 404
    return jsonify(result), 200


@bp.route("/style-quiz/result", methods=["DELETE"])
def delete_quiz_result():
    """Deletes style quiz results for the current user."""
    user_id = get_current_user_id()
    deleted = QuizService.delete_result(user_id=user_id)
    if not deleted:
        return jsonify({"error": "No style quiz result found to delete"}), 404
    return jsonify({"message": "Style quiz result successfully deleted"}), 200
