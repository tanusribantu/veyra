from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict


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
