"""Account management routes for profile identity and permanent data deletion."""

import logging
from flask import Blueprint, jsonify, current_app, g
import requests
from backend.app.auth import require_auth, get_current_user_id
from backend.app.models.base import db

logger = logging.getLogger(__name__)
bp = Blueprint("account", __name__)


@bp.route("/account/me", methods=["GET"])
@require_auth
def get_current_account():
    """Retrieve details about the currently authenticated user."""
    user = g.current_user
    return jsonify({
        "user": user.to_dict(),
        "has_profile": user.profile is not None,
        "has_measurements": user.measurements is not None,
        "wardrobe_count": len(user.wardrobe_items),
        "recommendation_count": len(user.recommendations),
    }), 200


@bp.route("/account", methods=["DELETE"])
@require_auth
def delete_account():
    """Permanently delete user account and all personal data.
    
    Removes style profile, measurements, wardrobe items, recommendations,
    feedback, constraints, and quiz results via cascading delete.
    Also deletes user record in Supabase Auth if service role secret is present.
    """
    user = g.current_user
    auth_user_id = user.auth_user_id

    # 1. Optionally delete from Supabase Auth via Admin API
    supabase_url = current_app.config.get("SUPABASE_URL")
    supabase_secret_key = (
        current_app.config.get("SUPABASE_SECRET_KEY")
        or current_app.config.get("SUPABASE_SERVICE_ROLE_KEY")
    )

    if supabase_url and supabase_secret_key and auth_user_id:
        try:
            admin_url = f"{supabase_url.rstrip('/')}/auth/v1/admin/users/{auth_user_id}"
            headers = {
                "Authorization": f"Bearer {supabase_secret_key}",
                "apikey": supabase_secret_key,
            }
            resp = requests.delete(admin_url, headers=headers, timeout=5)
            if resp.status_code not in (200, 204, 404):
                logger.warning("Supabase Admin delete returned status %s: %s", resp.status_code, resp.text)
        except Exception as exc:
            logger.warning("Failed to invoke Supabase admin deletion: %s", str(exc))

    # 2. Delete local user database record (cascades to all owned child entities)
    db.session.delete(user)
    db.session.commit()

    return jsonify({
        "message": "Account and all associated personal data permanently deleted.",
    }), 200
