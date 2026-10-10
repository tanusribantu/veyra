from typing import Optional
from typing_extensions import Literal
from pydantic import BaseModel, Field
from backend.app.schemas.constants import FEEDBACK_TYPES


class FeedbackCreateSchema(BaseModel):
    """Validation schema for recording user recommendation feedback."""
    feedback_type: Literal["like", "dislike", "save", "skip", "worn"]
    reason: Optional[str] = Field(default=None, max_length=256)
