"""Constants and vocabulary normalization for Veyra style intelligence."""

CATEGORY_TO_SLOT = {
    # Tops
    "shirt": "top",
    "t-shirt": "top",
    "polo": "top",
    "hoodie": "top",
    "sweater": "top",
    "overshirt": "top",
    "jacket": "top",
    "kurta": "top",
    "kurti": "top",
    "blouse": "top",
    "dress": "top",
    "saree": "top",

    # Bottoms
    "trousers": "bottom",
    "jeans": "bottom",
    "chinos": "bottom",
    "shorts": "bottom",
    "pants": "bottom",
    "skirt": "bottom",

    # Footwear
    "sneakers": "footwear",
    "loafers": "footwear",
    "boots": "footwear",
    "formal_shoes": "footwear",
    "derbies": "footwear",
    "sandals": "footwear",

    # Accessories
    "accessory": "accessory",
    "glasses": "accessory",
    "hat": "accessory",
    "scarf": "accessory",
    "bag": "accessory",
    "belt": "accessory",
    "necklace": "accessory",
    "earrings": "accessory",
    "watch": "accessory",
}

SUPPORTED_CATEGORIES = list(CATEGORY_TO_SLOT.keys())
SUPPORTED_SLOTS = ["top", "bottom", "footwear", "accessory"]

SUPPORTED_OCCASIONS = [
    "casual",
    "college",
    "work",
    "smart_casual",
    "party",
    "formal_event",
    "formal",
    "traditional_event",
    "date_night",
]

SUPPORTED_STYLES = [
    "minimal",
    "casual",
    "smart_casual",
    "classic",
    "streetwear",
    "formal",
    "preppy",
]

SUPPORTED_FITS = ["slim", "regular", "relaxed", "oversized"]
SUPPORTED_PATTERNS = ["solid", "striped", "plaid", "checkered", "graphic", "floral"]
FEEDBACK_TYPES = ["like", "dislike", "save", "skip", "worn"]

# Phase 1.5 Attribute Normalization
SUPPORTED_SILHOUETTES = ["fitted", "straight", "relaxed", "wide_leg", "cropped", "flowy"]
SUPPORTED_NECKLINES = ["crew", "v_neck", "collared", "scoop", "boat", "none"]
SUPPORTED_LENGTHS = ["short", "regular", "long"]
SUPPORTED_COLOR_WARMTHS = ["warm", "cool", "neutral"]
SUPPORTED_ACCESSORY_TYPES = [
    "earrings",
    "glasses",
    "scarf",
    "hat",
    "necklace",
    "bag",
    "belt",
    "watch",
    "other",
]
