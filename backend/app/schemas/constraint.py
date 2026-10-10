"""Validation schemas for outfit constraints."""

from typing import Literal, Optional
from pydantic import BaseModel, Field, model_validator

SUPPORTED_CONSTRAINT_TYPES = ["must_include", "avoid"]
SUPPORTED_TARGET_TYPES = ["item_id", "category", "color", "accessory_type"]
SUPPORTED_STRENGTHS = ["hard", "soft"]


class ConstraintCreateSchema(BaseModel):
    """Schema for creating a saved outfit constraint."""
    constraint_type: str = Field(..., description="'must_include' or 'avoid'")
    target_type: str = Field(..., description="'item_id', 'category', 'color', or 'accessory_type'")
    target_value: str = Field(..., min_length=1, description="Target item ID, category, color, or accessory type")
    strength: Optional[str] = Field(default="hard", description="'hard' or 'soft'")
    is_saved_default: Optional[bool] = Field(default=False, description="Persist as user default constraint")

    @model_validator(mode="after")
    def validate_fields(self):
        c_type = self.constraint_type.lower().strip()
        if c_type not in SUPPORTED_CONSTRAINT_TYPES:
            raise ValueError(
                f"Invalid constraint_type '{self.constraint_type}'. Supported: {SUPPORTED_CONSTRAINT_TYPES}"
            )
        self.constraint_type = c_type

        t_type = self.target_type.lower().strip()
        if t_type not in SUPPORTED_TARGET_TYPES:
            raise ValueError(
                f"Invalid target_type '{self.target_type}'. Supported: {SUPPORTED_TARGET_TYPES}"
            )
        self.target_type = t_type

        str_val = self.strength.lower().strip() if self.strength else "hard"
        if str_val not in SUPPORTED_STRENGTHS:
            raise ValueError(
                f"Invalid strength '{self.strength}'. Supported: {SUPPORTED_STRENGTHS}"
            )
        self.strength = str_val

        self.target_value = self.target_value.strip()
        if not self.target_value:
            raise ValueError("target_value cannot be empty.")

        return self


class ConstraintInputSchema(BaseModel):
    """Schema for inline constraints supplied within a recommendation request."""
    constraint_type: str = Field(..., description="'must_include' or 'avoid'")
    target_type: str = Field(..., description="'item_id', 'category', 'color', or 'accessory_type'")
    target_value: str = Field(..., min_length=1)
    strength: Optional[str] = Field(default="hard")

    @model_validator(mode="after")
    def validate_fields(self):
        c_type = self.constraint_type.lower().strip()
        if c_type not in SUPPORTED_CONSTRAINT_TYPES:
            raise ValueError(
                f"Invalid constraint_type '{self.constraint_type}'. Supported: {SUPPORTED_CONSTRAINT_TYPES}"
            )
        self.constraint_type = c_type

        t_type = self.target_type.lower().strip()
        if t_type not in SUPPORTED_TARGET_TYPES:
            raise ValueError(
                f"Invalid target_type '{self.target_type}'. Supported: {SUPPORTED_TARGET_TYPES}"
            )
        self.target_type = t_type

        str_val = self.strength.lower().strip() if self.strength else "hard"
        if str_val not in SUPPORTED_STRENGTHS:
            raise ValueError(
                f"Invalid strength '{self.strength}'. Supported: {SUPPORTED_STRENGTHS}"
            )
        self.strength = str_val

        self.target_value = self.target_value.strip()
        if not self.target_value:
            raise ValueError("target_value cannot be empty.")

        return self
