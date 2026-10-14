from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict, field_validator

ALLOWED_STYLING_LANES = {"menswear", "womenswear", "mixed", "prefer_not_to_say"}


class ProfileUpdateSchema(BaseModel):
    """Schema for updating user style profile preferences."""
    model_config = ConfigDict(extra="forbid")

    preferred_styles: Optional[List[str]] = None
    favorite_colors: Optional[List[str]] = None
    avoided_colors: Optional[List[str]] = None
    fit_preference: Optional[str] = None
    pattern_preference: Optional[str] = None
    formality_preference: Optional[int] = Field(default=None, ge=1, le=5)

    # Self-selected personal attributes (no image processing)
    skin_undertone: Optional[str] = None
    skin_depth: Optional[str] = None
    face_shape: Optional[str] = None
    body_shape_override: Optional[str] = None
    styling_lane: Optional[str] = None

    @field_validator("styling_lane")
    @classmethod
    def validate_styling_lane(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return None
        v_clean = v.strip().lower()
        if not v_clean:
            return None
        if v_clean not in ALLOWED_STYLING_LANES:
            raise ValueError(
                f"Invalid styling_lane '{v}'. Must be one of: {sorted(list(ALLOWED_STYLING_LANES))}"
            )
        return v_clean

