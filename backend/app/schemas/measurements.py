"""Validation schemas for user body measurements."""

from typing import Optional
from pydantic import BaseModel, Field, model_validator
from backend.app.recommendation.scoring_config import (
    MEASUREMENT_BOUNDS,
    SUPPORTED_BODY_SHAPES,
)


class BodyMeasurementsCreateSchema(BaseModel):
    """Schema for submitting anthropometric body measurements in cm or inches."""
    height: float = Field(..., description="Stature / height")
    shoulder: float = Field(..., description="Biacromial shoulder width or circumference")
    chest_bust: float = Field(..., description="Chest / bust circumference")
    waist: float = Field(..., description="Narrowest natural waist circumference")
    hips: float = Field(..., description="Widest hip / seat circumference")
    unit: Optional[str] = Field(default="cm", description="Measurement unit ('cm' or 'in')")
    custom_body_shape: Optional[str] = Field(default=None, description="Optional user shape override")

    # Normalized centimeter values computed by validator
    height_cm: Optional[float] = None
    shoulder_cm: Optional[float] = None
    chest_bust_cm: Optional[float] = None
    waist_cm: Optional[float] = None
    hips_cm: Optional[float] = None

    @model_validator(mode="after")
    def validate_and_normalize(self):
        unit_clean = (self.unit or "cm").lower().strip()
        if unit_clean not in ["cm", "in"]:
            raise ValueError("Unit must be either 'cm' or 'in'.")
        self.unit = unit_clean

        # Convert to cm if provided in inches
        multiplier = 2.54 if self.unit == "in" else 1.0

        h_cm = round(self.height * multiplier, 1)
        s_cm = round(self.shoulder * multiplier, 1)
        c_cm = round(self.chest_bust * multiplier, 1)
        w_cm = round(self.waist * multiplier, 1)
        hip_cm = round(self.hips * multiplier, 1)

        # Validate against realistic biological bounds
        fields = [
            ("height", h_cm, MEASUREMENT_BOUNDS["height_cm"]),
            ("shoulder", s_cm, MEASUREMENT_BOUNDS["shoulder_cm"]),
            ("chest_bust", c_cm, MEASUREMENT_BOUNDS["chest_bust_cm"]),
            ("waist", w_cm, MEASUREMENT_BOUNDS["waist_cm"]),
            ("hips", hip_cm, MEASUREMENT_BOUNDS["hips_cm"]),
        ]

        for name, val, (low, high) in fields:
            if not (low <= val <= high):
                unit_label = f"{val:.1f} cm" if self.unit == "cm" else f"{getattr(self, name):.1f} in ({val:.1f} cm)"
                raise ValueError(
                    f"Measurement '{name}' value {unit_label} is outside realistic human range "
                    f"({low:.0f} cm to {high:.0f} cm)."
                )

        self.height_cm = h_cm
        self.shoulder_cm = s_cm
        self.chest_bust_cm = c_cm
        self.waist_cm = w_cm
        self.hips_cm = hip_cm

        if self.custom_body_shape:
            shape_clean = self.custom_body_shape.lower().strip()
            if shape_clean not in SUPPORTED_BODY_SHAPES:
                raise ValueError(
                    f"Invalid custom_body_shape '{self.custom_body_shape}'. Supported: {SUPPORTED_BODY_SHAPES}"
                )
            self.custom_body_shape = shape_clean

        return self


class BodyMeasurementsOverrideSchema(BaseModel):
    """Schema for overriding or resetting body shape preference."""
    custom_body_shape: Optional[str] = None

    @model_validator(mode="after")
    def validate_shape(self):
        if self.custom_body_shape:
            shape_clean = self.custom_body_shape.lower().strip()
            if shape_clean not in SUPPORTED_BODY_SHAPES:
                raise ValueError(
                    f"Invalid custom_body_shape '{self.custom_body_shape}'. Supported: {SUPPORTED_BODY_SHAPES}"
                )
            self.custom_body_shape = shape_clean
        return self
