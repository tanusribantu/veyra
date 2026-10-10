"""Service for digital wardrobe management (CRUD operations and item lookups)."""

from typing import List, Dict, Any, Optional
import uuid
from backend.app.models.base import db
from backend.app.models.wardrobe import WardrobeItem
from backend.app.services.profile_service import ProfileService


class WardrobeService:
    """Manages clothing item creation, retrieval, updates, and deletion."""

    @classmethod
    def list_items(
        cls,
        user_id: str = "user_001",
        slot: Optional[str] = None,
        category: Optional[str] = None
    ) -> List[WardrobeItem]:
        """List wardrobe items belonging to a user, optionally filtered by slot or category."""
        ProfileService.get_or_create_user(user_id)
        query = WardrobeItem.query.filter_by(user_id=user_id)
        if slot:
            query = query.filter_by(slot=slot.lower().strip())
        if category:
            query = query.filter_by(category=category.lower().strip())
        return query.order_by(WardrobeItem.created_at.desc()).all()

    @classmethod
    def get_item(cls, user_id: str, item_id: str) -> Optional[WardrobeItem]:
        """Get a single wardrobe item ensuring user isolation."""
        return WardrobeItem.query.filter_by(id=item_id, user_id=user_id).first()

    @classmethod
    def create_item(cls, user_id: str, data: Dict[str, Any]) -> WardrobeItem:
        """Add a new clothing piece to the user's digital wardrobe."""
        ProfileService.get_or_create_user(user_id)

        item_id = data.get("id") or f"item_{uuid.uuid4().hex[:8]}"
        item = WardrobeItem(
            id=item_id,
            user_id=user_id,
            name=data["name"],
            category=data["category"],
            slot=data["slot"],
            color=data["color"],
            pattern=data.get("pattern", "solid"),
            fit=data.get("fit", "regular"),
            formality=data.get("formality", 2),
            style_tags=data.get("style_tags", []),
            image_url=data.get("image_url"),
            silhouette=data.get("silhouette"),
            neckline=data.get("neckline"),
            length=data.get("length"),
            color_warmth=data.get("color_warmth"),
            accessory_type=data.get("accessory_type"),
        )
        db.session.add(item)
        db.session.commit()
        return item

    @classmethod
    def update_item(cls, user_id: str, item_id: str, updates: Dict[str, Any]) -> Optional[WardrobeItem]:
        """Modify attributes of an existing wardrobe item."""
        item = cls.get_item(user_id, item_id)
        if not item:
            return None

        updatable_fields = [
            "name",
            "category",
            "slot",
            "color",
            "pattern",
            "fit",
            "formality",
            "style_tags",
            "image_url",
            "silhouette",
            "neckline",
            "length",
            "color_warmth",
            "accessory_type",
        ]
        for field in updatable_fields:
            if field in updates and updates[field] is not None:
                setattr(item, field, updates[field])

        db.session.commit()
        return item

    @classmethod
    def delete_item(cls, user_id: str, item_id: str) -> bool:
        """Remove an item from the wardrobe."""
        item = cls.get_item(user_id, item_id)
        if not item:
            return False

        db.session.delete(item)
        db.session.commit()
        return True
