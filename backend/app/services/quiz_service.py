"""Service coordinating the Veyra Style Archetype Quiz."""

from typing import Dict, Any, Optional
import uuid
from backend.app.models.base import db
from backend.app.models.quiz import StyleQuizResult
from backend.app.recommendation.quiz_config import (
    QUIZ_VERSION,
    STYLE_DIMENSIONS,
    STYLE_QUIZ_QUESTIONS,
    STYLE_ARCHETYPES,
    compute_quiz_vector,
    get_adapted_quiz_questions,
)


class QuizService:
    """Orchestrates quiz question retrieval, answer scoring, archetype resolution, and persistence."""

    @classmethod
    def get_quiz_questions(cls, lane: Optional[str] = None) -> Dict[str, Any]:
        """Returns the versioned scenario questions for the style archetype quiz."""
        questions_source = get_adapted_quiz_questions(lane)
        # Strip internal raw point values from user-facing question options
        sanitized_questions = []
        for q in questions_source:
            sanitized_options = [
                {
                    "id": opt["id"],
                    "label": opt.get("label"),
                    "text": opt["text"],
                }
                for opt in q["options"]
            ]
            sanitized_questions.append({
                "id": q["id"],
                "scenario": q["scenario"],
                "question": q["question"],
                "options": sanitized_options,
            })

        return {
            "version": QUIZ_VERSION,
            "title": "Veyra Style Archetype Quiz",
            "description": "Discover your aesthetic archetype and silhouette preferences through everyday style scenarios.",
            "dimensions": STYLE_DIMENSIONS,
            "archetypes": [a["name"] for a in STYLE_ARCHETYPES],
            "questions": sanitized_questions,
        }

    @classmethod
    def submit_quiz_answers(cls, user_id: str, answers: Dict[str, str]) -> Dict[str, Any]:
        """Calculates normalized style vector, archetype, and saves record."""
        vector, archetype, description = compute_quiz_vector(answers)

        quiz_record = StyleQuizResult(
            id=f"quiz_{uuid.uuid4().hex[:8]}",
            user_id=user_id,
            quiz_version=QUIZ_VERSION,
            answers=answers,
            vector=vector,
            archetype=archetype,
            archetype_description=description,
        )
        db.session.add(quiz_record)
        db.session.commit()
        return quiz_record.to_dict()

    @classmethod
    def get_latest_result(cls, user_id: str) -> Optional[Dict[str, Any]]:
        """Retrieves the latest quiz result for a user."""
        record = (
            StyleQuizResult.query.filter_by(user_id=user_id)
            .order_by(StyleQuizResult.created_at.desc())
            .first()
        )
        return record.to_dict() if record else None

    @classmethod
    def delete_result(cls, user_id: str) -> bool:
        """Deletes all style quiz results for a user."""
        records = StyleQuizResult.query.filter_by(user_id=user_id).all()
        if not records:
            return False
        for r in records:
            db.session.delete(r)
        db.session.commit()
        return True
