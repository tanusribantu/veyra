"""Service for managing user body measurements and proportion classifications."""

from typing import Dict, Any, Optional
from datetime import datetime, timezone
from backend.app.models.base import db
from backend.app.models.measurements import BodyMeasurements
from backend.app.services.profile_service import ProfileService
from backend.app.services.body_analysis import BodyAnalysisService


class MeasurementsService:
    """Handles storage, classification, retrieval, and permanent deletion of body measurements."""

    @classmethod
    def get_measurements(cls, user_id: str, unit: Optional[str] = None) -> Optional[Dict[str, Any]]:
        """Retrieve user measurements if present."""
        ProfileService.get_or_create_user(user_id)
        record = BodyMeasurements.query.filter_by(user_id=user_id).first()
        if not record:
            return None
        return record.to_dict(unit=unit)

    @classmethod
    def save_measurements(cls, user_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """Save or update user body measurements with deterministic classification."""
        ProfileService.get_or_create_user(user_id)

        h_cm = data["height_cm"]
        s_cm = data["shoulder_cm"]
        c_cm = data["chest_bust_cm"]
        w_cm = data["waist_cm"]
        hip_cm = data["hips_cm"]
        pref_unit = data.get("unit", "cm")
        custom_shape = data.get("custom_body_shape")

        # Classify body proportions deterministically
        analysis = BodyAnalysisService.classify_body_shape(
            shoulder_cm=s_cm,
            chest_bust_cm=c_cm,
            waist_cm=w_cm,
            hips_cm=hip_cm,
            custom_override=custom_shape,
        )

        record = BodyMeasurements.query.filter_by(user_id=user_id).first()
        if not record:
            record = BodyMeasurements(
                user_id=user_id,
                height_cm=h_cm,
                shoulder_cm=s_cm,
                chest_bust_cm=c_cm,
                waist_cm=w_cm,
                hips_cm=hip_cm,
                preferred_unit=pref_unit,
                derived_body_shape=analysis["derived_shape"],
                custom_body_shape=custom_shape,
                ratios=analysis["ratios"],
            )
            db.session.add(record)
        else:
            record.height_cm = h_cm
            record.shoulder_cm = s_cm
            record.chest_bust_cm = c_cm
            record.waist_cm = w_cm
            record.hips_cm = hip_cm
            record.preferred_unit = pref_unit
            record.derived_body_shape = analysis["derived_shape"]
            if custom_shape is not None:
                record.custom_body_shape = custom_shape
            record.ratios = analysis["ratios"]
            record.updated_at = datetime.now(timezone.utc)

        db.session.commit()
        result = record.to_dict(unit=pref_unit)
        result["classification_explanation"] = analysis["explanation"]
        return result

    @classmethod
    def delete_measurements(cls, user_id: str) -> bool:
        """Permanently deletes the user's body measurements for privacy."""
        record = BodyMeasurements.query.filter_by(user_id=user_id).first()
        if not record:
            return False

        db.session.delete(record)
        db.session.commit()
        return True

    @classmethod
    def set_shape_override(cls, user_id: str, custom_shape: Optional[str]) -> Optional[Dict[str, Any]]:
        """Allows user to override or reset their derived body shape."""
        record = BodyMeasurements.query.filter_by(user_id=user_id).first()
        if not record:
            return None

        record.custom_body_shape = custom_shape.lower().strip() if custom_shape else None
        record.updated_at = datetime.now(timezone.utc)
        db.session.commit()
        return record.to_dict()
