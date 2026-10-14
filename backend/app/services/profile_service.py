"""Service for managing user profiles and style preferences."""

from typing import Dict, Any, Optional
from datetime import datetime, timezone
from backend.app.models.base import db
from backend.app.models.user import User
from backend.app.models.profile import StyleProfile


class ProfileService:
    """Handles style profile querying, persistence, and preference mutation."""

    @staticmethod
    def get_or_create_user(user_id: str = "user_001", email: Optional[str] = None) -> User:
        """Retrieves an existing user or creates a default demo user."""
        user = db.session.get(User, user_id)
        if not user:
            user = User(id=user_id, email=email or "demo@veyra.style")
            db.session.add(user)
            db.session.commit()
        return user

    @classmethod
    def get_or_create_profile(cls, user_id: str = "user_001") -> StyleProfile:
        """Retrieves or creates a default style profile for the given user."""
        cls.get_or_create_user(user_id)
        profile = StyleProfile.query.filter_by(user_id=user_id).first()
        if not profile:
            profile = StyleProfile(
                user_id=user_id,
                preferred_styles=["minimal", "casual"],
                favorite_colors=["navy", "white", "black"],
                avoided_colors=["neon-green"],
                fit_preference="regular",
                pattern_preference="low",
                formality_preference=3,
            )
            db.session.add(profile)
            db.session.commit()
        return profile

    @classmethod
    def update_profile(cls, user_id: str, updates: Dict[str, Any]) -> StyleProfile:
        """Updates style preferences for a user."""
        profile = cls.get_or_create_profile(user_id)

        for field in [
            "preferred_styles",
            "favorite_colors",
            "avoided_colors",
            "fit_preference",
            "pattern_preference",
            "formality_preference",
            "skin_undertone",
            "skin_depth",
            "face_shape",
            "body_shape_override",
            "styling_lane",
        ]:
            if field in updates and updates[field] is not None:
                setattr(profile, field, updates[field])

        profile.updated_at = datetime.now(timezone.utc)
        db.session.commit()
        return profile
