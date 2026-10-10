"""Service managing user outfit inclusion and avoidance constraints."""

from typing import List, Dict, Any, Optional
import uuid
from backend.app.models.base import db
from backend.app.models.constraint import OutfitConstraint


class ConstraintService:
    """Manages saving, retrieving, listing, and deleting default constraints."""

    @classmethod
    def save_constraint(
        cls,
        user_id: str,
        constraint_type: str,
        target_type: str,
        target_value: str,
        strength: str = "hard",
        is_saved_default: bool = False,
    ) -> Dict[str, Any]:
        """Creates or updates a constraint rule for the user."""
        constraint = OutfitConstraint(
            id=f"const_{uuid.uuid4().hex[:8]}",
            user_id=user_id,
            constraint_type=constraint_type.lower().strip(),
            target_type=target_type.lower().strip(),
            target_value=str(target_value).strip(),
            strength=strength.lower().strip(),
            is_saved_default=bool(is_saved_default),
        )
        db.session.add(constraint)
        db.session.commit()
        return constraint.to_dict()

    @classmethod
    def list_constraints(
        cls,
        user_id: str,
        is_saved_default: Optional[bool] = None,
    ) -> List[Dict[str, Any]]:
        """Lists constraints for a user, optionally filtering by is_saved_default."""
        query = OutfitConstraint.query.filter_by(user_id=user_id)
        if is_saved_default is not None:
            query = query.filter_by(is_saved_default=is_saved_default)
        records = query.order_by(OutfitConstraint.created_at.desc()).all()
        return [r.to_dict() for r in records]

    @classmethod
    def get_constraint(cls, user_id: str, constraint_id: str) -> Optional[Dict[str, Any]]:
        """Retrieves a single constraint by ID."""
        record = OutfitConstraint.query.filter_by(id=constraint_id, user_id=user_id).first()
        return record.to_dict() if record else None

    @classmethod
    def delete_constraint(cls, user_id: str, constraint_id: str) -> bool:
        """Deletes a constraint record."""
        record = OutfitConstraint.query.filter_by(id=constraint_id, user_id=user_id).first()
        if not record:
            return False
        db.session.delete(record)
        db.session.commit()
        return True

    @classmethod
    def get_active_constraints(
        cls,
        user_id: str,
        request_constraints: Optional[List[Dict[str, Any]]] = None,
    ) -> List[Dict[str, Any]]:
        """Combines request constraints with user's saved default constraints.

        Request-specific constraints take precedence or combine cleanly with defaults.
        """
        defaults = cls.list_constraints(user_id=user_id, is_saved_default=True)
        active = list(defaults)

        if request_constraints:
            for req_c in request_constraints:
                # Add request constraint if not an exact duplicate
                if not any(
                    c["constraint_type"] == req_c["constraint_type"]
                    and c["target_type"] == req_c["target_type"]
                    and c["target_value"].lower() == str(req_c["target_value"]).lower()
                    for c in active
                ):
                    active.append(req_c)

        return active
