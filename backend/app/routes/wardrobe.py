from flask import Blueprint, request, jsonify
from pydantic import ValidationError
from backend.app.schemas import WardrobeCreateSchema, WardrobeUpdateSchema, format_validation_error
from backend.app.services.wardrobe_service import WardrobeService

bp = Blueprint("wardrobe", __name__)


def get_current_user_id() -> str:
    """Extract user identifier from headers or default to prototype user."""
    return request.headers.get("X-User-ID", "user_001")


@bp.route("/wardrobe", methods=["GET"])
def list_wardrobe():
    """List all garments belonging to current user."""
    user_id = get_current_user_id()
    slot = request.args.get("slot")
    category = request.args.get("category")

    items = WardrobeService.list_items(user_id=user_id, slot=slot, category=category)
    return jsonify([item.to_dict() for item in items]), 200


@bp.route("/wardrobe", methods=["POST"])
def add_wardrobe_item():
    """Add a clothing item manually to the user's wardrobe."""
    user_id = get_current_user_id()
    payload = request.get_json(silent=True)
    if payload is None:
        return jsonify({"error": "Request body must be valid JSON"}), 400

    try:
        validated = WardrobeCreateSchema(**payload).model_dump()
    except ValidationError as err:
        return jsonify({"error": "Validation failed", "details": format_validation_error(err)}), 400

    item = WardrobeService.create_item(user_id=user_id, data=validated)
    return jsonify(item.to_dict()), 201


@bp.route("/wardrobe/<string:item_id>", methods=["GET"])
def get_wardrobe_item(item_id: str):
    """Retrieve details of a single wardrobe item."""
    user_id = get_current_user_id()
    item = WardrobeService.get_item(user_id=user_id, item_id=item_id)
    if not item:
        return jsonify({"error": f"Item '{item_id}' not found"}), 404
    return jsonify(item.to_dict()), 200


@bp.route("/wardrobe/<string:item_id>", methods=["PATCH"])
def update_wardrobe_item(item_id: str):
    """Update attributes of a single wardrobe item."""
    user_id = get_current_user_id()
    payload = request.get_json(silent=True)
    if payload is None:
        return jsonify({"error": "Request body must be valid JSON"}), 400

    try:
        validated = WardrobeUpdateSchema(**payload).model_dump(exclude_unset=True)
    except ValidationError as err:
        return jsonify({"error": "Validation failed", "details": format_validation_error(err)}), 400

    item = WardrobeService.update_item(user_id=user_id, item_id=item_id, updates=validated)
    if not item:
        return jsonify({"error": f"Item '{item_id}' not found"}), 404

    return jsonify(item.to_dict()), 200


@bp.route("/wardrobe/<string:item_id>", methods=["DELETE"])
def delete_wardrobe_item(item_id: str):
    """Delete a clothing item from the user's wardrobe."""
    user_id = get_current_user_id()
    deleted = WardrobeService.delete_item(user_id=user_id, item_id=item_id)
    if not deleted:
        return jsonify({"error": f"Item '{item_id}' not found"}), 404
    return jsonify({"message": f"Item '{item_id}' deleted successfully"}), 200
