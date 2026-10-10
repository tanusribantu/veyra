import uuid
from datetime import datetime, timezone
from backend.app.models.base import db


class Feedback(db.Model):
    """User feedback for an outfit recommendation."""
    __tablename__ = "feedbacks"

    id = db.Column(db.String(64), primary_key=True, default=lambda: f"fb_{uuid.uuid4().hex[:8]}")
    user_id = db.Column(db.String(64), db.ForeignKey("users.id"), nullable=False)
    recommendation_id = db.Column(db.String(64), db.ForeignKey("recommendations.id"), nullable=False, unique=True)
    feedback_type = db.Column(db.String(32), nullable=False)  # 'like', 'dislike', 'skip', 'worn'
    reason = db.Column(db.String(256), nullable=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "recommendation_id": self.recommendation_id,
            "feedback_type": self.feedback_type,
            "reason": self.reason,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
