"""Versioned configuration and mathematical mapping for Veyra Style Archetype Quiz.

Framed exclusively as an aesthetic and sartorial quiz (never a personality diagnosis).
Captures 5 continuous dimensions:
  1. classic_expressive   (0.0: Classic / Heritage  <-> 1.0: Expressive / Avant-Garde)
  2. comfort_polish       (0.0: Comfort / Ease      <-> 1.0: Polish / High Sartorial)
  3. subtle_bold          (0.0: Subtle / Tonal      <-> 1.0: Bold / High-Contrast)
  4. timeless_trend       (0.0: Timeless / Capsule  <-> 1.0: Trend / Contemporary)
  5. structured_relaxed   (0.0: Structured / Crisp  <-> 1.0: Relaxed / Fluid Drape)
"""

from typing import Dict, List, Any, Tuple, Optional
import math

QUIZ_VERSION = "1.1.0"

STYLE_DIMENSIONS = [
    "classic_expressive",
    "comfort_polish",
    "subtle_bold",
    "timeless_trend",
    "structured_relaxed",
]

# Relatable style choice scenarios
STYLE_QUIZ_QUESTIONS = [
    {
        "id": "q1",
        "scenario": "A College Day",
        "question": "For a full day of classes, walking between campus blocks, and sitting with friends at the canteen, what outfit feels most natural?",
        "options": [
            {
                "id": "q1_a",
                "label": "Crisp Tailored Classics",
                "text": "Crisp collared cotton shirt, straight-fit dark jeans, and clean canvas sneakers.",
                "points": {
                    "classic_expressive": 0.15,
                    "comfort_polish": 0.70,
                    "subtle_bold": 0.15,
                    "timeless_trend": 0.15,
                    "structured_relaxed": 0.25,
                },
            },
            {
                "id": "q1_b",
                "label": "Casual Comfort",
                "text": "Soft relaxed t-shirt, comfortable cargo pants or chinos, and easy slip-on sandals or chappals.",
                "points": {
                    "classic_expressive": 0.35,
                    "comfort_polish": 0.30,
                    "subtle_bold": 0.20,
                    "timeless_trend": 0.40,
                    "structured_relaxed": 0.85,
                },
            },
            {
                "id": "q1_c",
                "label": "Vibrant Fusion Touch",
                "text": "Vibrant printed short kurti or bright polo tee, relaxed denim, and colorful sneakers.",
                "points": {
                    "classic_expressive": 0.80,
                    "comfort_polish": 0.50,
                    "subtle_bold": 0.85,
                    "timeless_trend": 0.60,
                    "structured_relaxed": 0.60,
                },
            },
            {
                "id": "q1_d",
                "label": "Contemporary Oversized Cut",
                "text": "Oversized graphic tee, wide-leg utility trousers, and chunky sneakers.",
                "points": {
                    "classic_expressive": 0.85,
                    "comfort_polish": 0.45,
                    "subtle_bold": 0.70,
                    "timeless_trend": 0.90,
                    "structured_relaxed": 0.75,
                },
            },
            {
                "id": "q1_e",
                "label": "None of these feel like me",
                "text": "None of these feel like me",
                "points": {},
            },
        ],
    },
    {
        "id": "q2",
        "scenario": "Bus or Metro Ride",
        "question": "Heading out for your morning commute on a crowded bus or metro in warm weather, how do you dress for the trip?",
        "options": [
            {
                "id": "q2_a",
                "label": "Pressed Neatness",
                "text": "Breathable cotton linen shirt tucked into tailored trousers with closed leather shoes.",
                "points": {
                    "classic_expressive": 0.10,
                    "comfort_polish": 0.80,
                    "subtle_bold": 0.10,
                    "timeless_trend": 0.20,
                    "structured_relaxed": 0.20,
                },
            },
            {
                "id": "q2_b",
                "label": "Breeze & Ease",
                "text": "Lightweight cotton tee or tunic with breathable drawstring pants and flat sandals.",
                "points": {
                    "classic_expressive": 0.25,
                    "comfort_polish": 0.25,
                    "subtle_bold": 0.15,
                    "timeless_trend": 0.35,
                    "structured_relaxed": 0.90,
                },
            },
            {
                "id": "q2_c",
                "label": "Pattern Pop",
                "text": "Contrast patterned shirt or kurti with dark jeans and statement footwear.",
                "points": {
                    "classic_expressive": 0.75,
                    "comfort_polish": 0.55,
                    "subtle_bold": 0.80,
                    "timeless_trend": 0.65,
                    "structured_relaxed": 0.50,
                },
            },
            {
                "id": "q2_d",
                "label": "Layered Streetwear",
                "text": "Boxy casual shirt layered open over a plain vest, cropped pants, and casual sneakers.",
                "points": {
                    "classic_expressive": 0.70,
                    "comfort_polish": 0.50,
                    "subtle_bold": 0.50,
                    "timeless_trend": 0.85,
                    "structured_relaxed": 0.70,
                },
            },
            {
                "id": "q2_e",
                "label": "None of these feel like me",
                "text": "None of these feel like me",
                "points": {},
            },
        ],
    },
    {
        "id": "q3",
        "scenario": "First Day at a Job",
        "question": "It is your first day at a new office or workplace. How do you dress to make a confident, authentic impression?",
        "options": [
            {
                "id": "q3_a",
                "label": "Formal Business Tailoring",
                "text": "Neatly pressed solid button-down shirt, tailored trousers, and polished derby dress shoes.",
                "points": {
                    "classic_expressive": 0.05,
                    "comfort_polish": 0.95,
                    "subtle_bold": 0.10,
                    "timeless_trend": 0.10,
                    "structured_relaxed": 0.15,
                },
            },
            {
                "id": "q3_b",
                "label": "Smart Casual Balance",
                "text": "Smart polo shirt or neat mandarin collar shirt, dark chinos, and clean low-top sneakers.",
                "points": {
                    "classic_expressive": 0.30,
                    "comfort_polish": 0.75,
                    "subtle_bold": 0.20,
                    "timeless_trend": 0.40,
                    "structured_relaxed": 0.45,
                },
            },
            {
                "id": "q3_c",
                "label": "Handloom Texture",
                "text": "Earthy handloom cotton kurta or structured blazer over a solid top with slim trousers.",
                "points": {
                    "classic_expressive": 0.70,
                    "comfort_polish": 0.80,
                    "subtle_bold": 0.50,
                    "timeless_trend": 0.55,
                    "structured_relaxed": 0.40,
                },
            },
            {
                "id": "q3_d",
                "label": "Soft Unstructured Layering",
                "text": "Relaxed soft blazer layered over a fine crewneck knit, tapered pants, and sleek loafers.",
                "points": {
                    "classic_expressive": 0.60,
                    "comfort_polish": 0.80,
                    "subtle_bold": 0.35,
                    "timeless_trend": 0.85,
                    "structured_relaxed": 0.55,
                },
            },
            {
                "id": "q3_e",
                "label": "None of these feel like me",
                "text": "None of these feel like me",
                "points": {},
            },
        ],
    },
    {
        "id": "q4",
        "scenario": "Weekend Outing",
        "question": "Joining friends for tea, market browsing, or street food on a Sunday afternoon, what do you reach for?",
        "options": [
            {
                "id": "q4_a",
                "label": "Classic Polo & Chinos",
                "text": "Classic polo shirt, regular-fit cotton shorts or trousers, and boat shoes or loafers.",
                "points": {
                    "classic_expressive": 0.15,
                    "comfort_polish": 0.65,
                    "subtle_bold": 0.15,
                    "timeless_trend": 0.15,
                    "structured_relaxed": 0.35,
                },
            },
            {
                "id": "q4_b",
                "label": "Everyday Denim & Tee",
                "text": "Relaxed cotton t-shirt, washed denim jeans, and comfortable walking shoes.",
                "points": {
                    "classic_expressive": 0.25,
                    "comfort_polish": 0.30,
                    "subtle_bold": 0.15,
                    "timeless_trend": 0.35,
                    "structured_relaxed": 0.80,
                },
            },
            {
                "id": "q4_c",
                "label": "Ethnic Craft Accent",
                "text": "Embroidered casual tunic or short kurta with cropped pants and leather kolhapuris.",
                "points": {
                    "classic_expressive": 0.75,
                    "comfort_polish": 0.60,
                    "subtle_bold": 0.70,
                    "timeless_trend": 0.50,
                    "structured_relaxed": 0.60,
                },
            },
            {
                "id": "q4_d",
                "label": "Wide-Leg Chill",
                "text": "Relaxed oversized overshirt, wide-leg trousers, and casual canvas shoes.",
                "points": {
                    "classic_expressive": 0.70,
                    "comfort_polish": 0.45,
                    "subtle_bold": 0.45,
                    "timeless_trend": 0.90,
                    "structured_relaxed": 0.85,
                },
            },
            {
                "id": "q4_e",
                "label": "None of these feel like me",
                "text": "None of these feel like me",
                "points": {},
            },
        ],
    },
    {
        "id": "q5",
        "scenario": "Friend's Birthday",
        "question": "Going to a friend's birthday dinner at a cozy neighborhood cafe or restaurant, what is your look?",
        "options": [
            {
                "id": "q5_a",
                "label": "Smart Dark Tones",
                "text": "Dark navy shirt, well-fitted chinos, and smart leather loafers.",
                "points": {
                    "classic_expressive": 0.20,
                    "comfort_polish": 0.80,
                    "subtle_bold": 0.20,
                    "timeless_trend": 0.25,
                    "structured_relaxed": 0.30,
                },
            },
            {
                "id": "q5_b",
                "label": "Casual Knit Ease",
                "text": "Soft knit sweater or clean crewneck t-shirt with straight-leg denim and suede shoes.",
                "points": {
                    "classic_expressive": 0.30,
                    "comfort_polish": 0.50,
                    "subtle_bold": 0.20,
                    "timeless_trend": 0.40,
                    "structured_relaxed": 0.70,
                },
            },
            {
                "id": "q5_c",
                "label": "Statement Print",
                "text": "Bold printed casual shirt or festive tunic with dark pants and statement watch.",
                "points": {
                    "classic_expressive": 0.85,
                    "comfort_polish": 0.65,
                    "subtle_bold": 0.85,
                    "timeless_trend": 0.65,
                    "structured_relaxed": 0.50,
                },
            },
            {
                "id": "q5_d",
                "label": "Monochrome Layered",
                "text": "Layered jacket over a minimalist black tee, wide dark trousers, and clean white sneakers.",
                "points": {
                    "classic_expressive": 0.65,
                    "comfort_polish": 0.65,
                    "subtle_bold": 0.55,
                    "timeless_trend": 0.85,
                    "structured_relaxed": 0.60,
                },
            },
            {
                "id": "q5_e",
                "label": "None of these feel like me",
                "text": "None of these feel like me",
                "points": {},
            },
        ],
    },
    {
        "id": "q6",
        "scenario": "Family Function",
        "question": "For a family dinner gathering or home puja, how do you balance tradition and personal ease?",
        "options": [
            {
                "id": "q6_a",
                "label": "Classic Traditional Kurta",
                "text": "Classic solid cotton kurta-pyjama or simple silk saree with subtle gold border.",
                "points": {
                    "classic_expressive": 0.15,
                    "comfort_polish": 0.75,
                    "subtle_bold": 0.20,
                    "timeless_trend": 0.15,
                    "structured_relaxed": 0.40,
                },
            },
            {
                "id": "q6_b",
                "label": "Soft Daily Kurta",
                "text": "Comfortable short kurta with straight cotton pants or flat sandals.",
                "points": {
                    "classic_expressive": 0.35,
                    "comfort_polish": 0.40,
                    "subtle_bold": 0.25,
                    "timeless_trend": 0.35,
                    "structured_relaxed": 0.80,
                },
            },
            {
                "id": "q6_c",
                "label": "Rich Festive Palette",
                "text": "Rich jewel-toned floral or patterned kurta with contrasting dupatta or stole.",
                "points": {
                    "classic_expressive": 0.85,
                    "comfort_polish": 0.75,
                    "subtle_bold": 0.90,
                    "timeless_trend": 0.50,
                    "structured_relaxed": 0.55,
                },
            },
            {
                "id": "q6_d",
                "label": "Layered Nehru Set",
                "text": "Modern layered Nehru jacket over a crisp white linen kurta set.",
                "points": {
                    "classic_expressive": 0.50,
                    "comfort_polish": 0.85,
                    "subtle_bold": 0.45,
                    "timeless_trend": 0.75,
                    "structured_relaxed": 0.35,
                },
            },
            {
                "id": "q6_e",
                "label": "None of these feel like me",
                "text": "None of these feel like me",
                "points": {},
            },
        ],
    },
    {
        "id": "q7",
        "scenario": "Festival Celebration",
        "question": "During a major festival like Diwali or Eid, what outfit brings out your festive spirit?",
        "options": [
            {
                "id": "q7_a",
                "label": "Timeless Ivory / Navy Silk",
                "text": "Traditional silk or fine cotton kurta set in timeless ivory or navy.",
                "points": {
                    "classic_expressive": 0.10,
                    "comfort_polish": 0.85,
                    "subtle_bold": 0.20,
                    "timeless_trend": 0.15,
                    "structured_relaxed": 0.35,
                },
            },
            {
                "id": "q7_b",
                "label": "Breathable Chikankari",
                "text": "Soft breathable chikankari or handloom cotton kurta with relaxed pyjama.",
                "points": {
                    "classic_expressive": 0.40,
                    "comfort_polish": 0.50,
                    "subtle_bold": 0.25,
                    "timeless_trend": 0.40,
                    "structured_relaxed": 0.85,
                },
            },
            {
                "id": "q7_c",
                "label": "Vivid Embroidered Outfit",
                "text": "Bright mustard or maroon embroidered festive outfit with rich texture and contrast.",
                "points": {
                    "classic_expressive": 0.90,
                    "comfort_polish": 0.80,
                    "subtle_bold": 0.95,
                    "timeless_trend": 0.55,
                    "structured_relaxed": 0.50,
                },
            },
            {
                "id": "q7_d",
                "label": "Contemporary Asymmetric Drape",
                "text": "Contemporary draped jacket set with asymmetry or modern collar detail.",
                "points": {
                    "classic_expressive": 0.85,
                    "comfort_polish": 0.80,
                    "subtle_bold": 0.65,
                    "timeless_trend": 0.90,
                    "structured_relaxed": 0.45,
                },
            },
            {
                "id": "q7_e",
                "label": "None of these feel like me",
                "text": "None of these feel like me",
                "points": {},
            },
        ],
    },
    {
        "id": "q8",
        "scenario": "Relative's Wedding",
        "question": "Attending a relative's evening wedding reception, how do you dress for the special celebration?",
        "options": [
            {
                "id": "q8_a",
                "label": "Structured Bandhgala / Suit",
                "text": "Tailored suit or crisp bandhgala jacket with structured trousers and oxfords.",
                "points": {
                    "classic_expressive": 0.10,
                    "comfort_polish": 0.95,
                    "subtle_bold": 0.20,
                    "timeless_trend": 0.15,
                    "structured_relaxed": 0.15,
                },
            },
            {
                "id": "q8_b",
                "label": "Soft Unlined Jacket",
                "text": "Elegant unlined blazer over a mandarin collar shirt and dark trousers.",
                "points": {
                    "classic_expressive": 0.35,
                    "comfort_polish": 0.75,
                    "subtle_bold": 0.25,
                    "timeless_trend": 0.45,
                    "structured_relaxed": 0.55,
                },
            },
            {
                "id": "q8_c",
                "label": "Ornate Statement Sherwani / Saree",
                "text": "Ornate silk saree or embroidered sherwani jacket with rich color accents.",
                "points": {
                    "classic_expressive": 0.85,
                    "comfort_polish": 0.90,
                    "subtle_bold": 0.90,
                    "timeless_trend": 0.50,
                    "structured_relaxed": 0.45,
                },
            },
            {
                "id": "q8_d",
                "label": "Directional Modern Tailoring",
                "text": "Modern minimalist blazer with fluid wide-leg pants and sleek footwear.",
                "points": {
                    "classic_expressive": 0.75,
                    "comfort_polish": 0.85,
                    "subtle_bold": 0.50,
                    "timeless_trend": 0.90,
                    "structured_relaxed": 0.40,
                },
            },
            {
                "id": "q8_e",
                "label": "None of these feel like me",
                "text": "None of these feel like me",
                "points": {},
            },
        ],
    },
]

# Style Archetypes with reference centroids
STYLE_ARCHETYPES = [
    {
        "name": "The Architectural Minimalist",
        "centroid": {
            "classic_expressive": 0.15,
            "comfort_polish": 0.85,
            "subtle_bold": 0.15,
            "timeless_trend": 0.25,
            "structured_relaxed": 0.20,
        },
        "description": "Clean lines, immaculate tailoring, and subtle tonal palettes with an architectural emphasis on structure.",
    },
    {
        "name": "The Effortless Naturalist",
        "centroid": {
            "classic_expressive": 0.30,
            "comfort_polish": 0.25,
            "subtle_bold": 0.15,
            "timeless_trend": 0.30,
            "structured_relaxed": 0.85,
        },
        "description": "Breathable fabrics, relaxed silhouettes, and organic tones prioritizing comfort, ease, and fluid drape.",
    },
    {
        "name": "The Creative Expressionist",
        "centroid": {
            "classic_expressive": 0.85,
            "comfort_polish": 0.60,
            "subtle_bold": 0.85,
            "timeless_trend": 0.70,
            "structured_relaxed": 0.50,
        },
        "description": "Vibrant color play, eclectic textures, and memorable statement pieces reflecting distinct personal flair.",
    },
    {
        "name": "The Modern Sartorialist",
        "centroid": {
            "classic_expressive": 0.40,
            "comfort_polish": 0.85,
            "subtle_bold": 0.35,
            "timeless_trend": 0.65,
            "structured_relaxed": 0.35,
        },
        "description": "Sharp contemporary tailoring bridging timeless craftsmanship with fresh, modern styling accents.",
    },
    {
        "name": "The Contemporary Trendsetter",
        "centroid": {
            "classic_expressive": 0.80,
            "comfort_polish": 0.55,
            "subtle_bold": 0.65,
            "timeless_trend": 0.90,
            "structured_relaxed": 0.65,
        },
        "description": "Volume play, progressive silhouettes, and forward-looking cuts that embrace modern sartorial innovation.",
    },
    {
        "name": "The Heritage Classic",
        "centroid": {
            "classic_expressive": 0.10,
            "comfort_polish": 0.80,
            "subtle_bold": 0.20,
            "timeless_trend": 0.15,
            "structured_relaxed": 0.30,
        },
        "description": "Timeless enduring essentials, traditional proportions, and refined versatility across all occasions.",
    },
]


def normalize_quiz_vector(raw_points: Dict[str, float], count: int) -> Dict[str, float]:
    """Normalizes summed point values across answered questions into [0.0, 1.0]."""
    divisor = max(1, count)
    return {
        dim: round(max(0.0, min(1.0, raw_points.get(dim, 0.5) / divisor)), 2)
        for dim in STYLE_DIMENSIONS
    }


def compute_quiz_vector(answers: Dict[str, str]) -> Tuple[Dict[str, float], str, str]:
    """Calculates normalized 5D style vector and nearest human-readable archetype from answers.

    Args:
        answers: Map of question_id -> option_id (e.g. {'q1': 'q1_a', ...})

    Returns:
        (vector_dict, archetype_name, archetype_description)
    """
    options_by_q = {
        q["id"]: {opt["id"]: opt["points"] for opt in q["options"]}
        for q in STYLE_QUIZ_QUESTIONS
    }

    accumulated = {dim: 0.0 for dim in STYLE_DIMENSIONS}
    answered_count = 0

    for q_id, opt_id in answers.items():
        if q_id in options_by_q and opt_id in options_by_q[q_id]:
            points = options_by_q[q_id][opt_id]
            if points:
                for dim in STYLE_DIMENSIONS:
                    accumulated[dim] += points.get(dim, 0.5)
                answered_count += 1

    if answered_count == 0:
        vector = {dim: 0.50 for dim in STYLE_DIMENSIONS}
    else:
        vector = normalize_quiz_vector(accumulated, answered_count)

    archetype, desc = determine_archetype(vector)
    return vector, archetype, desc


def determine_archetype(vector: Dict[str, float]) -> Tuple[str, str]:
    """Finds closest canonical archetype using Euclidean distance in 5D style space."""
    best_name = STYLE_ARCHETYPES[0]["name"]
    best_desc = STYLE_ARCHETYPES[0]["description"]
    min_dist = float("inf")

    for arch in STYLE_ARCHETYPES:
        centroid = arch["centroid"]
        dist_sq = sum((vector.get(d, 0.5) - centroid.get(d, 0.5)) ** 2 for d in STYLE_DIMENSIONS)
        if dist_sq < min_dist:
            min_dist = dist_sq
            best_name = arch["name"]
            best_desc = arch["description"]

    return best_name, best_desc


# ==============================================================================
# ITEM ATTRIBUTE TO DIMENSION MAPPINGS
# ==============================================================================
# Documented, editable mappings from item attributes to the 5 style dimensions.

SILHOUETTE_MAPPINGS = {
    "fitted": {"structured_relaxed": 0.15, "comfort_polish": 0.85, "timeless_trend": 0.30},
    "straight": {"structured_relaxed": 0.35, "comfort_polish": 0.70, "timeless_trend": 0.20},
    "relaxed": {"structured_relaxed": 0.75, "comfort_polish": 0.40, "timeless_trend": 0.55},
    "wide_leg": {"structured_relaxed": 0.85, "comfort_polish": 0.60, "timeless_trend": 0.85},
    "cropped": {"structured_relaxed": 0.50, "comfort_polish": 0.55, "timeless_trend": 0.80},
    "flowy": {"structured_relaxed": 0.95, "comfort_polish": 0.50, "timeless_trend": 0.65},
}

PATTERN_MAPPINGS = {
    "solid": {"classic_expressive": 0.10, "subtle_bold": 0.10, "timeless_trend": 0.15},
    "striped": {"classic_expressive": 0.30, "subtle_bold": 0.35, "timeless_trend": 0.25},
    "plaid": {"classic_expressive": 0.55, "subtle_bold": 0.55, "timeless_trend": 0.40},
    "checkered": {"classic_expressive": 0.60, "subtle_bold": 0.60, "timeless_trend": 0.45},
    "graphic": {"classic_expressive": 0.85, "subtle_bold": 0.85, "timeless_trend": 0.85},
    "floral": {"classic_expressive": 0.90, "subtle_bold": 0.85, "timeless_trend": 0.70},
}

COLOR_BOLDNESS_PALETTE = {
    # Neutrals / Subtle
    "black": 0.15,
    "white": 0.10,
    "navy": 0.15,
    "grey": 0.10,
    "gray": 0.10,
    "beige": 0.15,
    "cream": 0.15,
    "brown": 0.20,
    "olive": 0.30,
    # Mid-range
    "blue": 0.40,
    "green": 0.45,
    "maroon": 0.50,
    "burgundy": 0.55,
    "rust": 0.55,
    # Bold / Statement
    "red": 0.85,
    "yellow": 0.90,
    "orange": 0.90,
    "cobalt": 0.85,
    "magenta": 0.95,
    "neon-green": 1.00,
}


def compute_item_style_vector(item: Dict[str, Any]) -> Dict[str, float]:
    """Maps a single item's attributes (silhouette, pattern, color, formality) to 5 dimensions."""
    sil = (item.get("silhouette") or "straight").lower().strip()
    pat = (item.get("pattern") or "solid").lower().strip()
    col = (item.get("color") or "").lower().strip()
    formality = int(item.get("formality", 2))
    fit = (item.get("fit") or "regular").lower().strip()

    # Formality normalized [0.0, 1.0]
    norm_formality = max(0.0, min(1.0, (formality - 1) / 4.0))

    # Color boldness
    color_bold = COLOR_BOLDNESS_PALETTE.get(col, 0.40)

    # Silhouette lookups
    sil_data = SILHOUETTE_MAPPINGS.get(sil, SILHOUETTE_MAPPINGS["straight"])
    pat_data = PATTERN_MAPPINGS.get(pat, PATTERN_MAPPINGS["solid"])

    # 1. classic_expressive
    ce_pat = pat_data.get("classic_expressive", 0.2)
    ce_form = 0.8 if formality == 1 else (0.2 if formality >= 4 else 0.4)
    classic_expressive = round((ce_pat * 0.5 + color_bold * 0.3 + ce_form * 0.2), 2)

    # 2. comfort_polish
    cp_sil = sil_data.get("comfort_polish", 0.5)
    comfort_polish = round((norm_formality * 0.55 + cp_sil * 0.45), 2)

    # 3. subtle_bold
    sb_pat = pat_data.get("subtle_bold", 0.2)
    subtle_bold = round((color_bold * 0.6 + sb_pat * 0.4), 2)

    # 4. timeless_trend
    tt_sil = sil_data.get("timeless_trend", 0.3)
    tt_pat = pat_data.get("timeless_trend", 0.2)
    timeless_trend = round((tt_sil * 0.55 + tt_pat * 0.45), 2)

    # 5. structured_relaxed
    sr_sil = sil_data.get("structured_relaxed", 0.5)
    sr_fit = 0.8 if fit in ["relaxed", "oversized"] else (0.2 if fit == "slim" else 0.4)
    structured_relaxed = round((sr_sil * 0.6 + sr_fit * 0.4), 2)

    return {
        "classic_expressive": classic_expressive,
        "comfort_polish": comfort_polish,
        "subtle_bold": subtle_bold,
        "timeless_trend": timeless_trend,
        "structured_relaxed": structured_relaxed,
    }


def compute_outfit_style_vector(items: List[Dict[str, Any]]) -> Dict[str, float]:
    """Averages individual garment style vectors into an overall outfit style vector."""
    if not items:
        return {dim: 0.50 for dim in STYLE_DIMENSIONS}

    item_vectors = [compute_item_style_vector(item) for item in items]
    outfit_vector = {}
    for dim in STYLE_DIMENSIONS:
        mean_val = sum(v[dim] for v in item_vectors) / len(item_vectors)
        outfit_vector[dim] = round(mean_val, 2)

    return outfit_vector


def compute_style_archetype_score(
    items: List[Dict[str, Any]],
    user_style_vector: Optional[Dict[str, float]]
) -> Tuple[Optional[float], Dict[str, Any]]:
    """Calculates style archetype match score (0.0 to 100.0) between outfit and user vector.

    If user_style_vector is None or empty, returns (None, {}).
    """
    if not user_style_vector:
        return None, {}

    outfit_vector = compute_outfit_style_vector(items)

    diffs = [
        abs(outfit_vector.get(d, 0.5) - user_style_vector.get(d, 0.5))
        for d in STYLE_DIMENSIONS
    ]
    mean_abs_diff = sum(diffs) / len(diffs)

    # Score from 0 to 100: distance 0.0 -> 100.0, distance 0.5 -> 50.0, distance 1.0 -> 0.0
    score = round(max(0.0, min(100.0, 100.0 * (1.0 - mean_abs_diff))), 1)

    archetype, desc = determine_archetype(user_style_vector)
    meta = {
        "user_vector": user_style_vector,
        "outfit_vector": outfit_vector,
        "mean_deviation": round(mean_abs_diff, 2),
        "user_archetype": archetype,
        "message": f"Outfit aligns with your {archetype} style vector (score: {score}).",
    }

    return score, meta
