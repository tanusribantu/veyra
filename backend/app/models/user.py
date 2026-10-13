import uuid
from datetime import datetime, timezone
from backend.app.models.base import db


class User(db.Model):
    """User entity for styling profile and wardrobe isolation."""
    __tablename__ = "users"

    id = db.Column(db.String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    auth_user_id = db.Column(db.String(128), unique=True, nullable=True, index=True)
    email = db.Column(db.String(120), unique=True, nullable=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    profile = db.relationship("StyleProfile", backref="user", uselist=False, cascade="all, delete-orphan")
    measurements = db.relationship("BodyMeasurements", backref="user", uselist=False, cascade="all, delete-orphan")
    wardrobe_items = db.relationship("WardrobeItem", backref="user", lazy=True, cascade="all, delete-orphan")
    recommendations = db.relationship("Recommendation", backref="user", lazy=True, cascade="all, delete-orphan")
    feedbacks = db.relationship("Feedback", backref="user", lazy=True, cascade="all, delete-orphan")
    outfit_constraints = db.relationship("OutfitConstraint", backref="user", lazy=True, cascade="all, delete-orphan")
    quiz_results = db.relationship("StyleQuizResult", backref="user", lazy=True, cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "auth_user_id": self.auth_user_id,
            "email": self.email,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
