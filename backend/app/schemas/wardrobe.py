from typing import List, Optional
from pydantic import BaseModel, Field, model_validator
from backend.app.schemas.constants import (
    CATEGORY_TO_SLOT,
    SUPPORTED_CATEGORIES,
    SUPPORTED_SLOTS,
    SUPPORTED_SILHOUETTES,
    SUPPORTED_NECKLINES,
    SUPPORTED_LENGTHS,
    SUPPORTED_COLOR_WARMTHS,
    SUPPORTED_ACCESSORY_TYPES,
)
from backend.app.recommendation.color_rules import derive_color_warmth


class WardrobeCreateSchema(BaseModel):
    """Validation schema for adding an item to the wardrobe."""
    name: str = Field(..., min_length=1, max_length=120)
    category: str
    slot: Optional[str] = None
    color: str = Field(..., min_length=1, max_length=32)
    pattern: Optional[str] = "solid"
    fit: Optional[str] = "regular"
    formality: int = Field(default=2, ge=1, le=5)
    style_tags: Optional[List[str]] = Field(default_factory=list)
    image_url: Optional[str] = None

    # Optional Phase 1.5 attributes
    silhouette: Optional[str] = None
    neckline: Optional[str] = None
    length: Optional[str] = None
    color_warmth: Optional[str] = None
    accessory_type: Optional[str] = None

    @model_validator(mode="after")
    def validate_category_and_slot(self):
        cat = self.category.lower().strip()
        if cat not in CATEGORY_TO_SLOT:
            raise ValueError(
                f"Unsupported category '{self.category}'. Supported categories: {SUPPORTED_CATEGORIES}"
            )
        self.category = cat

        # Auto-assign or validate slot
        derived_slot = CATEGORY_TO_SLOT[cat]
        if self.slot:
            slot_clean = self.slot.lower().strip()
            if slot_clean not in SUPPORTED_SLOTS:
                raise ValueError(f"Invalid slot '{self.slot}'. Must be one of {SUPPORTED_SLOTS}")
            self.slot = slot_clean
        else:
            self.slot = derived_slot

        self.color = self.color.lower().strip()
        if self.pattern:
            self.pattern = self.pattern.lower().strip()
        if self.fit:
            self.fit = self.fit.lower().strip()
        if self.style_tags:
            self.style_tags = [tag.lower().strip() for tag in self.style_tags if tag]

        # Phase 1.5 Attribute validation & normalization
        if self.silhouette:
            sil = self.silhouette.lower().strip()
            if sil not in SUPPORTED_SILHOUETTES:
                raise ValueError(f"Invalid silhouette '{self.silhouette}'. Supported: {SUPPORTED_SILHOUETTES}")
            self.silhouette = sil

        if self.neckline:
            neck = self.neckline.lower().strip()
            if neck not in SUPPORTED_NECKLINES:
                raise ValueError(f"Invalid neckline '{self.neckline}'. Supported: {SUPPORTED_NECKLINES}")
            self.neckline = neck

        if self.length:
            leng = self.length.lower().strip()
            if leng not in SUPPORTED_LENGTHS:
                raise ValueError(f"Invalid length '{self.length}'. Supported: {SUPPORTED_LENGTHS}")
            self.length = leng

        if self.accessory_type:
            acc = self.accessory_type.lower().strip()
            if acc not in SUPPORTED_ACCESSORY_TYPES:
                raise ValueError(f"Invalid accessory_type '{self.accessory_type}'. Supported: {SUPPORTED_ACCESSORY_TYPES}")
            self.accessory_type = acc
            # If item has accessory_type, slot defaults to accessory if not specified otherwise
            if not self.slot or self.slot == "top":
                self.slot = "accessory"

        # Auto-derive color_warmth if not explicitly provided
        if self.color_warmth:
            warmth = self.color_warmth.lower().strip()
            if warmth not in SUPPORTED_COLOR_WARMTHS:
                raise ValueError(f"Invalid color_warmth '{self.color_warmth}'. Supported: {SUPPORTED_COLOR_WARMTHS}")
            self.color_warmth = warmth
        else:
            self.color_warmth = derive_color_warmth(self.color)

        return self


class WardrobeUpdateSchema(BaseModel):
    """Validation schema for updating wardrobe item attributes."""
    name: Optional[str] = Field(default=None, min_length=1, max_length=120)
    category: Optional[str] = None
    slot: Optional[str] = None
    color: Optional[str] = None
    pattern: Optional[str] = None
    fit: Optional[str] = None
    formality: Optional[int] = Field(default=None, ge=1, le=5)
    style_tags: Optional[List[str]] = None
    image_url: Optional[str] = None

    # Optional Phase 1.5 attributes
    silhouette: Optional[str] = None
    neckline: Optional[str] = None
    length: Optional[str] = None
    color_warmth: Optional[str] = None
    accessory_type: Optional[str] = None

    @model_validator(mode="after")
    def validate_fields(self):
        if self.category is not None:
            cat = self.category.lower().strip()
            if cat not in CATEGORY_TO_SLOT:
                raise ValueError(
                    f"Unsupported category '{self.category}'. Supported categories: {SUPPORTED_CATEGORIES}"
                )
            self.category = cat
            if not self.slot:
                self.slot = CATEGORY_TO_SLOT[cat]

        if self.slot is not None:
            slot_clean = self.slot.lower().strip()
            if slot_clean not in SUPPORTED_SLOTS:
                raise ValueError(f"Invalid slot '{self.slot}'. Must be one of {SUPPORTED_SLOTS}")
            self.slot = slot_clean

        if self.color is not None:
            self.color = self.color.lower().strip()
            if self.color_warmth is None:
                self.color_warmth = derive_color_warmth(self.color)

        if self.pattern is not None:
            self.pattern = self.pattern.lower().strip()
        if self.fit is not None:
            self.fit = self.fit.lower().strip()
        if self.style_tags is not None:
            self.style_tags = [tag.lower().strip() for tag in self.style_tags if tag]

        if self.silhouette is not None:
            sil = self.silhouette.lower().strip()
            if sil not in SUPPORTED_SILHOUETTES:
                raise ValueError(f"Invalid silhouette '{self.silhouette}'. Supported: {SUPPORTED_SILHOUETTES}")
            self.silhouette = sil

        if self.neckline is not None:
            neck = self.neckline.lower().strip()
            if neck not in SUPPORTED_NECKLINES:
                raise ValueError(f"Invalid neckline '{self.neckline}'. Supported: {SUPPORTED_NECKLINES}")
            self.neckline = neck

        if self.length is not None:
            leng = self.length.lower().strip()
            if leng not in SUPPORTED_LENGTHS:
                raise ValueError(f"Invalid length '{self.length}'. Supported: {SUPPORTED_LENGTHS}")
            self.length = leng

        if self.accessory_type is not None:
            acc = self.accessory_type.lower().strip()
            if acc not in SUPPORTED_ACCESSORY_TYPES:
                raise ValueError(f"Invalid accessory_type '{self.accessory_type}'. Supported: {SUPPORTED_ACCESSORY_TYPES}")
            self.accessory_type = acc

        if self.color_warmth is not None:
            warmth = self.color_warmth.lower().strip()
            if warmth not in SUPPORTED_COLOR_WARMTHS:
                raise ValueError(f"Invalid color_warmth '{self.color_warmth}'. Supported: {SUPPORTED_COLOR_WARMTHS}")
            self.color_warmth = warmth

        return self
