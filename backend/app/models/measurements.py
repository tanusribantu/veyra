"""Body measurements model storing user anthropometrics locally in centimeters."""

import uuid
from datetime import datetime, timezone
from backend.app.models.base import db


class BodyMeasurements(db.Model):
    """User body measurements stored locally in centimeters."""
    __tablename__ = "body_measurements"

    id = db.Column(db.String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(64), db.ForeignKey("users.id"), nullable=False, unique=True)

    # Core anthropometric values stored internally in centimeters (cm)
    height_cm = db.Column(db.Float, nullable=False)
    shoulder_cm = db.Column(db.Float, nullable=False)
    chest_bust_cm = db.Column(db.Float, nullable=False)
    waist_cm = db.Column(db.Float, nullable=False)
    hips_cm = db.Column(db.Float, nullable=False)

    preferred_unit = db.Column(db.String(16), default="cm")  # 'cm' or 'in'

    # Derived and optional user override
    derived_body_shape = db.Column(db.String(32), nullable=True)
    custom_body_shape = db.Column(db.String(32), nullable=True)
    ratios = db.Column(db.JSON, nullable=True)

    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(
        db.DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    def effective_body_shape(self) -> str:
        """Returns custom override if set, else mathematically derived shape."""
        return self.custom_body_shape or self.derived_body_shape or "rectangle"

    def to_dict(self, unit: str = None, lane: str = None) -> dict:
        """Serializes measurements, converting to preferred display unit if requested."""
        display_unit = unit or self.preferred_unit or "cm"
        scale = 1.0 if display_unit == "cm" else (1.0 / 2.54)
        shape = self.effective_body_shape()

        from backend.app.recommendation.body_labels import get_body_shape_label
        display_label = get_body_shape_label(shape, lane=lane)

        return {
            "id": self.id,
            "user_id": self.user_id,
            "unit": display_unit,
            "height": round(self.height_cm * scale, 1),
            "shoulder": round(self.shoulder_cm * scale, 1),
            "chest_bust": round(self.chest_bust_cm * scale, 1),
            "waist": round(self.waist_cm * scale, 1),
            "hips": round(self.hips_cm * scale, 1),
            "raw_cm": {
                "height_cm": self.height_cm,
                "shoulder_cm": self.shoulder_cm,
                "chest_bust_cm": self.chest_bust_cm,
                "waist_cm": self.waist_cm,
                "hips_cm": self.hips_cm,
            },
            "derived_body_shape": self.derived_body_shape,
            "custom_body_shape": self.custom_body_shape,
            "effective_body_shape": shape,
            "display_shape_label": display_label,
            "ratios": self.ratios or {},
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
