import uuid
from datetime import datetime, timezone
from backend.app.models.base import db


class WardrobeItem(db.Model):
    """Digital representation of a clothing piece owned by the user."""
    __tablename__ = "wardrobe_items"

    id = db.Column(db.String(64), primary_key=True, default=lambda: f"item_{uuid.uuid4().hex[:8]}")
    user_id = db.Column(db.String(64), db.ForeignKey("users.id"), nullable=False)
    name = db.Column(db.String(120), nullable=False)
    category = db.Column(db.String(64), nullable=False)
    slot = db.Column(db.String(32), nullable=False)  # 'top', 'bottom', 'footwear'
    color = db.Column(db.String(32), nullable=False)
    pattern = db.Column(db.String(32), default="solid")
    fit = db.Column(db.String(32), default="regular")
    formality = db.Column(db.Integer, nullable=False, default=2)  # 1 (ultra-casual) to 5 (formal)
    style_tags = db.Column(db.JSON, default=list)
    image_url = db.Column(db.String(256), nullable=True)

    # Optional styling attributes
    silhouette = db.Column(db.String(32), nullable=True)    # fitted, straight, relaxed, wide_leg, cropped, flowy
    neckline = db.Column(db.String(32), nullable=True)      # crew, v_neck, collared, scoop, boat, none
    length = db.Column(db.String(32), nullable=True)        # short, regular, long
    color_warmth = db.Column(db.String(32), nullable=True)  # warm, cool, neutral (auto-derived if omitted)
    accessory_type = db.Column(db.String(32), nullable=True)# earrings, glasses, scarf, hat, necklace, bag, belt, watch, other

    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "name": self.name,
            "category": self.category,
            "slot": self.slot,
            "color": self.color,
            "pattern": self.pattern,
            "fit": self.fit,
            "formality": self.formality,
            "style_tags": self.style_tags or [],
            "image_url": self.image_url,
            "silhouette": self.silhouette,
            "neckline": self.neckline,
            "length": self.length,
            "color_warmth": self.color_warmth,
            "accessory_type": self.accessory_type,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
