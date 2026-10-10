"""Core service coordinating outfit candidate generation, scoring, explanation, and persistence."""

from typing import List, Dict, Any, Optional, Tuple
import uuid
from backend.app.models.base import db
from backend.app.models.recommendation import Recommendation, RecommendationItem
from backend.app.models.feedback import Feedback
from backend.app.services.wardrobe_service import WardrobeService
from backend.app.services.profile_service import ProfileService
from backend.app.services.quiz_service import QuizService
from backend.app.services.constraint_service import ConstraintService
from backend.app.services.fit_note_service import FitNoteService
from backend.app.recommendation.candidate_generator import CandidateGenerator
from backend.app.recommendation.scorer import OutfitScorer
from backend.app.services.explanation_service import ExplanationService


class RecommendationService:
    """Orchestrates candidate generation, scoring, ranking, explanation, and history."""

    def __init__(self):
        self.candidate_generator = CandidateGenerator()
        self.scorer = OutfitScorer()

    def generate_recommendations(
        self,
        user_id: str,
        occasion: str,
        wardrobe_item_ids: Optional[List[str]] = None,
        constraints: Optional[List[Dict[str, Any]]] = None,
        result_limit: int = 3,
    ) -> List[Dict[str, Any]]:
        """Generates, scores, ranks, and persists top outfit recommendations.

        Backward-compatible wrapper returning only the recommendation list.
        """
        recs, _, _ = self.generate_recommendations_detailed(
            user_id=user_id,
            occasion=occasion,
            wardrobe_item_ids=wardrobe_item_ids,
            constraints=constraints,
            result_limit=result_limit,
        )
        return recs

    def generate_recommendations_detailed(
        self,
        user_id: str,
        occasion: str,
        wardrobe_item_ids: Optional[List[str]] = None,
        constraints: Optional[List[Dict[str, Any]]] = None,
        result_limit: int = 3,
    ) -> Tuple[List[Dict[str, Any]], bool, Optional[str]]:
        """Generates, scores, ranks, and persists top outfit recommendations with constraint metadata.

        Returns:
            (persisted_recs, is_blocked, block_explanation)
        """
        # 1. Fetch user wardrobe items, style profile, and body measurements
        db_items = WardrobeService.list_items(user_id=user_id)
        if not db_items:
            return [], False, None

        item_dicts = [item.to_dict() for item in db_items]
        profile = ProfileService.get_or_create_profile(user_id=user_id)
        profile_dict = profile.to_dict()

        # Check body measurements (Phase 1.5)
        from backend.app.services.measurements_service import MeasurementsService
        measurements = MeasurementsService.get_measurements(user_id=user_id)
        measurements_missing = (measurements is None)
        body_shape = measurements.get("effective_body_shape") if measurements else None

        # Style Quiz Archetype Vector (Phase 3A)
        quiz_result = QuizService.get_latest_result(user_id=user_id)
        style_vector = quiz_result.get("vector") if quiz_result else None

        # Constraints (Phase 3A)
        active_constraints = ConstraintService.get_active_constraints(
            user_id=user_id,
            request_constraints=constraints,
        )
        soft_constraints = [c for c in active_constraints if c.get("strength") == "soft"]

        # Track user-requested include item IDs for gentle fit note generation
        user_included_item_ids = list(wardrobe_item_ids or [])
        for c in active_constraints:
            if c.get("constraint_type") == "must_include":
                if c.get("target_type") == "item_id":
                    user_included_item_ids.append(str(c.get("target_value")))
                else:
                    # Also collect any items in wardrobe that match must_include category/color
                    for it in item_dicts:
                        if CandidateGenerator.item_matches_constraint(it, c):
                            user_included_item_ids.append(it.get("id"))

        user_included_item_ids = list(set(user_included_item_ids))

        # 2. Generate candidates with hard constraint filtering and impossible fallback
        candidates, is_blocked, block_explanation, _ = self.candidate_generator.generate_candidates_with_status(
            wardrobe_items=item_dicts,
            filter_item_ids=wardrobe_item_ids,
            constraints=active_constraints,
        )
        if not candidates:
            return [], False, None

        # 3. Score all candidates
        scored_candidates = []
        for cand in candidates:
            cand_items = cand["items"]
            score_result = self.scorer.score_outfit(
                candidate_items=cand_items,
                occasion=occasion,
                user_profile=profile_dict,
                body_shape=body_shape,
                style_vector=style_vector,
                soft_constraints=soft_constraints,
            )
            reasons = ExplanationService.build_reasons(
                score_data=score_result,
                items=cand_items,
                occasion=occasion,
                user_profile=profile_dict,
            )

            # Generate gentle fit notes if user-requested include item lowers components
            fit_notes = FitNoteService.generate_fit_notes(
                candidate_items=cand_items,
                user_included_item_ids=user_included_item_ids,
                occasion=occasion,
                score_breakdown=score_result["breakdown"],
                all_wardrobe_items=item_dicts,
                user_profile=profile_dict,
            )

            scored_candidates.append({
                "score": score_result["score"],
                "breakdown": score_result["breakdown"],
                "items": cand_items,
                "reasons": reasons,
                "fit_notes": fit_notes,
                "measurements_missing": measurements_missing,
                "is_fallback": cand.get("is_fallback", False),
                "block_explanation": cand.get("block_explanation", block_explanation),
                "satisfied_hard_count": cand.get("satisfied_hard_count"),
            })

        # 4. Rank candidates by descending score (and satisfied_hard_count if fallback)
        if is_blocked:
            scored_candidates.sort(
                key=lambda x: (x.get("satisfied_hard_count", 0), x["score"]),
                reverse=True,
            )
        else:
            scored_candidates.sort(key=lambda x: x["score"], reverse=True)

        # 5. Select top K unique combinations
        top_candidates = scored_candidates[:result_limit]

        # 6. Persist recommendations into database for history and feedback tracking
        persisted_recs = []
        for cand in top_candidates:
            rec_id = f"rec_{uuid.uuid4().hex[:8]}"
            rec_record = Recommendation(
                id=rec_id,
                user_id=user_id,
                occasion=occasion,
                score=cand["score"],
                breakdown=cand["breakdown"],
                reasons=cand["reasons"],
                fit_notes=cand["fit_notes"],
            )
            db.session.add(rec_record)

            for item in cand["items"]:
                rec_item = RecommendationItem(
                    recommendation_id=rec_id,
                    wardrobe_item_id=item["id"],
                    slot=item["slot"],
                )
                db.session.add(rec_item)

            rec_dict = {
                "id": rec_id,
                "user_id": user_id,
                "occasion": occasion,
                "score": cand["score"],
                "breakdown": cand["breakdown"],
                "items": cand["items"],
                "reasons": cand["reasons"],
                "fit_notes": cand["fit_notes"],
                "measurements_missing": measurements_missing,
            }
            if is_blocked:
                rec_dict["constraint_blocked"] = True
                rec_dict["block_explanation"] = cand.get("block_explanation")

            persisted_recs.append(rec_dict)

        db.session.commit()
        return persisted_recs, is_blocked, block_explanation

    @classmethod
    def list_recommendations(cls, user_id: str, limit: int = 10) -> List[Dict[str, Any]]:
        """Retrieve recent recommendations for a user."""
        recs = (
            Recommendation.query.filter_by(user_id=user_id)
            .order_by(Recommendation.created_at.desc())
            .limit(limit)
            .all()
        )
        return [r.to_dict() for r in recs]

    @classmethod
    def get_recommendation(cls, user_id: str, recommendation_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve a specific recommendation by ID."""
        rec = Recommendation.query.filter_by(id=recommendation_id, user_id=user_id).first()
        return rec.to_dict() if rec else None

    @classmethod
    def submit_feedback(
        cls,
        user_id: str,
        recommendation_id: str,
        feedback_type: str,
        reason: Optional[str] = None,
    ) -> Optional[Dict[str, Any]]:
        """Record user reaction (like, dislike, skip, worn) to a recommendation."""
        rec = Recommendation.query.filter_by(id=recommendation_id, user_id=user_id).first()
        if not rec:
            return None

        # Check if feedback already exists for this recommendation
        existing = Feedback.query.filter_by(recommendation_id=recommendation_id).first()
        if existing:
            existing.feedback_type = feedback_type
            existing.reason = reason
            db.session.commit()
            return existing.to_dict()

        feedback = Feedback(
            user_id=user_id,
            recommendation_id=recommendation_id,
            feedback_type=feedback_type,
            reason=reason,
        )
        db.session.add(feedback)
        db.session.commit()
        return feedback.to_dict()
