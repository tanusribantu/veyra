import uuid
from datetime import datetime, timezone
from backend.app.models.base import db


class OutfitConstraint(db.Model):
    """User-specified outfit inclusion or avoidance constraint rule."""
    __tablename__ = "outfit_constraints"

    id = db.Column(db.String(64), primary_key=True, default=lambda: f"const_{uuid.uuid4().hex[:8]}")
    user_id = db.Column(db.String(64), db.ForeignKey("users.id"), nullable=False, index=True)
    constraint_type = db.Column(db.String(32), nullable=False)  # "must_include" or "avoid"
    target_type = db.Column(db.String(32), nullable=False)      # "item_id", "category", "color", "accessory_type"
    target_value = db.Column(db.String(64), nullable=False)     # e.g., "item_001", "jacket", "navy", "scarf"
    strength = db.Column(db.String(16), nullable=False, default="hard")  # "hard" or "soft"
    is_saved_default = db.Column(db.Boolean, default=False, nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "constraint_type": self.constraint_type,
            "target_type": self.target_type,
            "target_value": self.target_value,
            "strength": self.strength,
            "is_saved_default": self.is_saved_default,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
