from pydantic import ValidationError
from backend.app.schemas.constants import (
    CATEGORY_TO_SLOT,
    SUPPORTED_CATEGORIES,
    SUPPORTED_SLOTS,
    SUPPORTED_OCCASIONS,
    SUPPORTED_STYLES,
    SUPPORTED_FITS,
    SUPPORTED_PATTERNS,
    FEEDBACK_TYPES,
    SUPPORTED_SILHOUETTES,
    SUPPORTED_NECKLINES,
    SUPPORTED_LENGTHS,
    SUPPORTED_COLOR_WARMTHS,
    SUPPORTED_ACCESSORY_TYPES,
)
from backend.app.schemas.profile import ProfileUpdateSchema
from backend.app.schemas.wardrobe import WardrobeCreateSchema, WardrobeUpdateSchema
from backend.app.schemas.measurements import (
    BodyMeasurementsCreateSchema,
    BodyMeasurementsOverrideSchema,
)
from backend.app.schemas.recommendation import RecommendationRequestSchema
from backend.app.schemas.feedback import FeedbackCreateSchema
from backend.app.schemas.quiz import QuizAnswerSubmitSchema
from backend.app.schemas.constraint import (
    ConstraintCreateSchema,
    ConstraintInputSchema,
    SUPPORTED_CONSTRAINT_TYPES,
    SUPPORTED_TARGET_TYPES,
    SUPPORTED_STRENGTHS,
)


def format_validation_error(err: ValidationError):
    """Formats Pydantic ValidationError into a JSON-serializable list."""
    formatted = []
    for error in err.errors():
        formatted.append({
            "loc": [str(x) for x in error.get("loc", [])],
            "msg": error.get("msg"),
            "type": error.get("type"),
        })
    return formatted


__all__ = [
    "CATEGORY_TO_SLOT",
    "SUPPORTED_CATEGORIES",
    "SUPPORTED_SLOTS",
    "SUPPORTED_OCCASIONS",
    "SUPPORTED_STYLES",
    "SUPPORTED_FITS",
    "SUPPORTED_PATTERNS",
    "FEEDBACK_TYPES",
    "SUPPORTED_SILHOUETTES",
    "SUPPORTED_NECKLINES",
    "SUPPORTED_LENGTHS",
    "SUPPORTED_COLOR_WARMTHS",
    "SUPPORTED_ACCESSORY_TYPES",
    "SUPPORTED_CONSTRAINT_TYPES",
    "SUPPORTED_TARGET_TYPES",
    "SUPPORTED_STRENGTHS",
    "ProfileUpdateSchema",
    "WardrobeCreateSchema",
    "WardrobeUpdateSchema",
    "BodyMeasurementsCreateSchema",
    "BodyMeasurementsOverrideSchema",
    "RecommendationRequestSchema",
    "FeedbackCreateSchema",
    "QuizAnswerSubmitSchema",
    "ConstraintCreateSchema",
    "ConstraintInputSchema",
    "format_validation_error",
]
