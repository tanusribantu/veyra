from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, model_validator
from backend.app.schemas.constants import SUPPORTED_OCCASIONS
from backend.app.schemas.constraint import ConstraintInputSchema


class RecommendationRequestSchema(BaseModel):
    """Validation schema for outfit recommendation request."""
    occasion: str = Field(..., min_length=1)
    wardrobe_item_ids: Optional[List[str]] = None
    constraints: Optional[List[ConstraintInputSchema]] = None
    result_limit: Optional[int] = Field(default=3, ge=1, le=10)

    @model_validator(mode="after")
    def validate_occasion(self):
        occ = self.occasion.lower().strip()
        if occ not in SUPPORTED_OCCASIONS:
            raise ValueError(
                f"Unsupported occasion '{self.occasion}'. Supported occasions: {SUPPORTED_OCCASIONS}"
            )
        self.occasion = occ
        return self
