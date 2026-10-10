"""Validation schemas for style archetype quiz."""

from typing import Dict, Any
from pydantic import BaseModel, Field, model_validator


class QuizAnswerSubmitSchema(BaseModel):
    """Schema for validating user answers submitted to the style quiz."""
    answers: Dict[str, str] = Field(
        ...,
        description="Map of question_id to selected option_id (e.g. {'q1': 'q1_a'}).",
    )

    @model_validator(mode="after")
    def validate_answers(self):
        if not self.answers:
            raise ValueError("Answers dictionary cannot be empty.")
        for q_id, opt_id in self.answers.items():
            if not isinstance(q_id, str) or not q_id.strip():
                raise ValueError("Question IDs must be non-empty strings.")
            if not isinstance(opt_id, str) or not opt_id.strip():
                raise ValueError(f"Option ID for question '{q_id}' must be a non-empty string.")
        return self
