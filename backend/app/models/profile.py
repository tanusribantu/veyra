import uuid
from datetime import datetime, timezone
from backend.app.models.base import db


class StyleProfile(db.Model):
    """User style preferences and aesthetic constraints."""
    __tablename__ = "style_profiles"

    id = db.Column(db.String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(64), db.ForeignKey("users.id"), nullable=False, unique=True)
    preferred_styles = db.Column(db.JSON, default=lambda: ["minimal", "casual"])
    favorite_colors = db.Column(db.JSON, default=lambda: ["navy", "white", "black"])
    avoided_colors = db.Column(db.JSON, default=lambda: ["neon-green"])
    fit_preference = db.Column(db.String(32), default="regular")
    pattern_preference = db.Column(db.String(32), default="low")
    formality_preference = db.Column(db.Integer, default=3)

    # Self-selected personal styling attributes (no photo processing)
    skin_undertone = db.Column(db.String(32), default="prefer_not_to_say")  # warm, cool, neutral, prefer_not_to_say
    skin_depth = db.Column(db.String(32), default="prefer_not_to_say")      # light, medium, deep, prefer_not_to_say
    face_shape = db.Column(db.String(32), default="prefer_not_to_say")      # oval, round, square, heart, oblong, prefer_not_to_say
    body_shape_override = db.Column(db.String(32), nullable=True)           # user override if desired

    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(
        db.DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc)
    )

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "preferred_styles": self.preferred_styles or [],
            "favorite_colors": self.favorite_colors or [],
            "avoided_colors": self.avoided_colors or [],
            "fit_preference": self.fit_preference,
            "pattern_preference": self.pattern_preference,
            "formality_preference": self.formality_preference,
            "skin_undertone": self.skin_undertone or "prefer_not_to_say",
            "skin_depth": self.skin_depth or "prefer_not_to_say",
            "face_shape": self.face_shape or "prefer_not_to_say",
            "body_shape_override": self.body_shape_override,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
