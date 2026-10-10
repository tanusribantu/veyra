import uuid
from datetime import datetime, timezone
from backend.app.models.base import db


class Recommendation(db.Model):
    """Historical or generated outfit recommendation record."""
    __tablename__ = "recommendations"

    id = db.Column(db.String(64), primary_key=True, default=lambda: f"rec_{uuid.uuid4().hex[:8]}")
    user_id = db.Column(db.String(64), db.ForeignKey("users.id"), nullable=False)
    occasion = db.Column(db.String(64), nullable=False)
    score = db.Column(db.Float, nullable=False)
    breakdown = db.Column(db.JSON, default=dict)  # Component scores: C, O, P, F, V
    reasons = db.Column(db.JSON, default=list)  # Structured explanation objects
    fit_notes = db.Column(db.JSON, default=list)  # Gentle fit notes for user-included pieces
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    items = db.relationship("RecommendationItem", backref="recommendation", lazy=True, cascade="all, delete-orphan")
    feedback = db.relationship("Feedback", backref="recommendation", uselist=False, cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "occasion": self.occasion,
            "score": round(self.score, 1),
            "breakdown": self.breakdown or {},
            "items": [item.to_dict() for item in self.items],
            "reasons": self.reasons or [],
            "fit_notes": self.fit_notes or [],
            "feedback": self.feedback.to_dict() if self.feedback else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class RecommendationItem(db.Model):
    """Link between a recommendation and a chosen wardrobe garment."""
    __tablename__ = "recommendation_items"

    id = db.Column(db.String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    recommendation_id = db.Column(db.String(64), db.ForeignKey("recommendations.id"), nullable=False)
    wardrobe_item_id = db.Column(db.String(64), db.ForeignKey("wardrobe_items.id"), nullable=False)
    slot = db.Column(db.String(32), nullable=False)

    wardrobe_item = db.relationship("WardrobeItem")

    def to_dict(self):
        if self.wardrobe_item:
            return self.wardrobe_item.to_dict()
        return {
            "id": self.wardrobe_item_id,
            "slot": self.slot,
        }
