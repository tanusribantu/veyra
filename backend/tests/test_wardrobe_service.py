"""Tests for WardrobeService module."""

import pytest
from backend.app.services.wardrobe_service import WardrobeService


def test_wardrobe_crud_operations(app, sample_user_and_profile):
    user, _ = sample_user_and_profile

    # 1. Create item
    item_data = {
        "name": "Olive Overshirt",
        "category": "overshirt",
        "slot": "top",
        "color": "olive",
        "pattern": "solid",
        "fit": "relaxed",
        "formality": 2,
        "style_tags": ["casual", "streetwear"],
    }
    created = WardrobeService.create_item(user_id=user.id, data=item_data)
    assert created.id is not None
    assert created.name == "Olive Overshirt"

    # 2. Get item
    fetched = WardrobeService.get_item(user_id=user.id, item_id=created.id)
    assert fetched is not None
    assert fetched.color == "olive"

    # 3. List items
    items = WardrobeService.list_items(user_id=user.id, slot="top")
    assert len(items) == 1
    assert items[0].id == created.id

    # 4. Update item
    updated = WardrobeService.update_item(user_id=user.id, item_id=created.id, updates={"name": "Olive Utility Jacket", "formality": 3})
    assert updated.name == "Olive Utility Jacket"
    assert updated.formality == 3

    # 5. Delete item
    deleted = WardrobeService.delete_item(user_id=user.id, item_id=created.id)
    assert deleted is True
    assert WardrobeService.get_item(user_id=user.id, item_id=created.id) is None


def test_wardrobe_isolation(app, sample_user_and_profile):
    user, _ = sample_user_and_profile
    item_data = {
        "name": "Secret Jacket",
        "category": "jacket",
        "slot": "top",
        "color": "black",
        "formality": 2,
    }
    item = WardrobeService.create_item(user_id=user.id, data=item_data)

    # Another user cannot fetch this item
    other_item = WardrobeService.get_item(user_id="user_other", item_id=item.id)
    assert other_item is None
