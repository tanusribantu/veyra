"""Pytest fixtures for Veyra backend testing."""

import sys
from pathlib import Path
import pytest

# Ensure project root is in sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from backend.app import create_app
from backend.app.models.base import db
from backend.app.models.user import User
from backend.app.models.profile import StyleProfile
from backend.app.models.wardrobe import WardrobeItem


@pytest.fixture
def app():
    """Create Flask application configured for testing with in-memory SQLite."""
    application = create_app("testing")
    with application.app_context():
        db.create_all()
        yield application
        db.session.remove()
        db.drop_all()


@pytest.fixture
def client(app):
    """Test HTTP client."""
    return app.test_client()


@pytest.fixture
def sample_user_and_profile(app):
    """Seed test user and default style profile."""
    user = User(id="user_test", email="test@veyra.style")
    profile = StyleProfile(
        user_id="user_test",
        preferred_styles=["minimal", "casual"],
        favorite_colors=["navy", "white"],
        avoided_colors=["neon-green", "orange"],
        fit_preference="regular",
        pattern_preference="low",
        formality_preference=2,
    )
    db.session.add(user)
    db.session.add(profile)
    db.session.commit()
    return user, profile


@pytest.fixture
def sample_wardrobe(app, sample_user_and_profile):
    """Seed a representative test wardrobe containing tops, bottoms, and footwear."""
    user, _ = sample_user_and_profile
    items = [
        WardrobeItem(
            id="test_top_1",
            user_id=user.id,
            name="White Oxford Shirt",
            category="shirt",
            slot="top",
            color="white",
            pattern="solid",
            fit="regular",
            formality=3,
            style_tags=["minimal", "smart_casual"],
        ),
        WardrobeItem(
            id="test_top_2",
            user_id=user.id,
            name="Navy T-Shirt",
            category="t-shirt",
            slot="top",
            color="navy",
            pattern="solid",
            fit="regular",
            formality=1,
            style_tags=["casual", "minimal"],
        ),
        WardrobeItem(
            id="test_bottom_1",
            user_id=user.id,
            name="Navy Chinos",
            category="chinos",
            slot="bottom",
            color="navy",
            pattern="solid",
            fit="regular",
            formality=3,
            style_tags=["minimal", "smart_casual"],
        ),
        WardrobeItem(
            id="test_bottom_2",
            user_id=user.id,
            name="Blue Denim Jeans",
            category="jeans",
            slot="bottom",
            color="blue",
            pattern="solid",
            fit="regular",
            formality=1,
            style_tags=["casual"],
        ),
        WardrobeItem(
            id="test_footwear_1",
            user_id=user.id,
            name="White Leather Sneakers",
            category="sneakers",
            slot="footwear",
            color="white",
            pattern="solid",
            fit="regular",
            formality=2,
            style_tags=["minimal", "casual"],
        ),
        WardrobeItem(
            id="test_footwear_2",
            user_id=user.id,
            name="Brown Suede Loafers",
            category="loafers",
            slot="footwear",
            color="brown",
            pattern="solid",
            fit="regular",
            formality=3,
            style_tags=["smart_casual", "classic"],
        ),
    ]
    for item in items:
        db.session.add(item)
    db.session.commit()
    return items
