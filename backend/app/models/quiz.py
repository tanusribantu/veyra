import uuid
from datetime import datetime, timezone
from backend.app.models.base import db


class StyleQuizResult(db.Model):
    """User style archetype quiz responses, normalized dimension vector, and archetype."""
    __tablename__ = "style_quiz_results"

    id = db.Column(db.String(64), primary_key=True, default=lambda: f"quiz_{uuid.uuid4().hex[:8]}")
    user_id = db.Column(db.String(64), db.ForeignKey("users.id"), nullable=False, index=True)
    quiz_version = db.Column(db.String(32), nullable=False, default="1.0.0")
    answers = db.Column(db.JSON, nullable=False, default=dict)
    vector = db.Column(db.JSON, nullable=False, default=dict)
    archetype = db.Column(db.String(128), nullable=False)
    archetype_description = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(
        db.DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "quiz_version": self.quiz_version,
            "answers": self.answers or {},
            "vector": self.vector or {},
            "archetype": self.archetype,
            "archetype_description": self.archetype_description,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
