"""Database seed command to populate demo user, default style profile, and sample wardrobe."""

import json
import sys
from pathlib import Path

# Ensure project root is in sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from backend.app import create_app
from backend.app.models.base import db
from backend.app.models.user import User
from backend.app.models.profile import StyleProfile
from backend.app.models.wardrobe import WardrobeItem
from backend.app.models.measurements import BodyMeasurements
from backend.app.recommendation.color_rules import derive_color_warmth

SEED_FILE = Path(__file__).resolve().parent.parent / "data" / "sample" / "wardrobe_seed.json"


def seed_database(user_id: str = "user_001", reset_db: bool = True):
    """Populates the database with initial wardrobe data from sample JSON."""
    app = create_app("development")
    with app.app_context():
        if reset_db:
            print("[*] Recreating development database tables with updated schema...")
            db.drop_all()
            db.create_all()
        else:
            print("[*] Ensuring database tables exist...")
            db.create_all()

        # 1. Create or retrieve demo user
        user = db.session.get(User, user_id)
        if not user:
            print(f"[*] Creating demo user '{user_id}'...")
            user = User(id=user_id, email="demo@veyra.style")
            db.session.add(user)
            db.session.commit()
        else:
            print(f"[i] Demo user '{user_id}' already exists.")

        # 2. Create or reset default style profile
        profile = StyleProfile.query.filter_by(user_id=user_id).first()
        if not profile:
            print(f"[*] Initializing style profile for '{user_id}'...")
            profile = StyleProfile(
                user_id=user_id,
                preferred_styles=["minimal", "casual", "smart_casual"],
                favorite_colors=["navy", "white", "black", "beige"],
                avoided_colors=["neon-green"],
                fit_preference="regular",
                pattern_preference="low",
                formality_preference=3,
                skin_undertone="warm",
                skin_depth="medium",
                face_shape="oval",
            )
            db.session.add(profile)
            db.session.commit()
        else:
            print(f"[i] Style profile for '{user_id}' already exists.")

        # 3. Load sample items from JSON
        if not SEED_FILE.exists():
            print(f"[!] Seed file not found at {SEED_FILE}")
            return

        with open(SEED_FILE, "r", encoding="utf-8") as f:
            sample_items = json.load(f)

        added_count = 0
        for raw in sample_items:
            existing = WardrobeItem.query.filter_by(id=raw["id"], user_id=user_id).first()
            if not existing:
                cat = raw["category"]
                # Default silhouette/neckline based on category
                default_neckline = "collared" if cat in ["shirt", "polo"] else ("crew" if cat in ["t-shirt", "sweater", "hoodie"] else None)
                default_silhouette = "fitted" if raw.get("fit") == "slim" else ("relaxed" if raw.get("fit") == "relaxed" else "straight")
                color_warmth = raw.get("color_warmth") or derive_color_warmth(raw["color"])

                item = WardrobeItem(
                    id=raw["id"],
                    user_id=user_id,
                    name=raw["name"],
                    category=raw["category"],
                    slot=raw["slot"],
                    color=raw["color"],
                    pattern=raw.get("pattern", "solid"),
                    fit=raw.get("fit", "regular"),
                    formality=raw.get("formality", 2),
                    style_tags=raw.get("style_tags", []),
                    image_url=raw.get("image_url"),
                    silhouette=raw.get("silhouette", default_silhouette),
                    neckline=raw.get("neckline", default_neckline),
                    length=raw.get("length", "regular"),
                    color_warmth=color_warmth,
                    accessory_type=raw.get("accessory_type"),
                )
                db.session.add(item)
                added_count += 1

        db.session.commit()
        total_items = WardrobeItem.query.filter_by(user_id=user_id).count()
        print(f"[OK] Seeding completed: added {added_count} items. Total wardrobe items: {total_items}.")


if __name__ == "__main__":
    seed_database()
