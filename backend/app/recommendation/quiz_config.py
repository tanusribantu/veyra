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

QUIZ_VERSION = "1.0.0"

STYLE_DIMENSIONS = [
    "classic_expressive",
    "comfort_polish",
    "subtle_bold",
    "timeless_trend",
    "structured_relaxed",
]

# 10 Scenario-based style choices
STYLE_QUIZ_QUESTIONS = [
    {
        "id": "q1",
        "scenario": "Evening Gallery Opening",
        "question": "You are attending an evening exhibition opening at a contemporary gallery. Which ensemble feels most natural to you?",
        "options": [
            {
                "id": "q1_a",
                "label": "Heritage Tailoring",
                "text": "Charcoal tailored trousers, pressed white poplin shirt, and polished black leather derbies.",
                "points": {
                    "classic_expressive": 0.10,
                    "comfort_polish": 0.85,
                    "subtle_bold": 0.15,
                    "timeless_trend": 0.15,
                    "structured_relaxed": 0.15,
                },
            },
            {
                "id": "q1_b",
                "label": "Relaxed Tactile Ease",
                "text": "Unstructured linen chore jacket, relaxed-taper chinos, and minimalist suede sneakers.",
                "points": {
                    "classic_expressive": 0.35,
                    "comfort_polish": 0.40,
                    "subtle_bold": 0.20,
                    "timeless_trend": 0.45,
                    "structured_relaxed": 0.85,
                },
            },
            {
                "id": "q1_c",
                "label": "Statement Focal Piece",
                "text": "Cobalt blue architectural knit, dark wash straight denim, and sleek chelsea boots.",
                "points": {
                    "classic_expressive": 0.75,
                    "comfort_polish": 0.65,
                    "subtle_bold": 0.85,
                    "timeless_trend": 0.60,
                    "structured_relaxed": 0.40,
                },
            },
            {
                "id": "q1_d",
                "label": "Deconstructed Silhouette",
                "text": "Asymmetric boxy blazer, wide-leg fluid trousers, and lug-sole leather loafers.",
                "points": {
                    "classic_expressive": 0.90,
                    "comfort_polish": 0.70,
                    "subtle_bold": 0.70,
                    "timeless_trend": 0.90,
                    "structured_relaxed": 0.65,
                },
            },
        ],
    },
    {
        "id": "q2",
        "scenario": "Creative Executive Presentation",
        "question": "A key presentation is scheduled in an agency boardroom. How do you calibrate your presence?",
        "options": [
            {
                "id": "q2_a",
                "label": "Crisp Business Formal",
                "text": "A structured navy suit with a spread-collar dress shirt and cap-toe oxfords.",
                "points": {
                    "classic_expressive": 0.05,
                    "comfort_polish": 0.95,
                    "subtle_bold": 0.10,
                    "timeless_trend": 0.10,
                    "structured_relaxed": 0.10,
                },
            },
            {
                "id": "q2_b",
                "label": "Smart Casual Layering",
                "text": "Soft-shouldered wool blazer over a fine-gauge crewneck knit and pleated trousers.",
                "points": {
                    "classic_expressive": 0.30,
                    "comfort_polish": 0.80,
                    "subtle_bold": 0.20,
                    "timeless_trend": 0.35,
                    "structured_relaxed": 0.45,
                },
            },
            {
                "id": "q2_c",
                "label": "Contemporary Proportions",
                "text": "High-waisted wide trousers, silk-cotton mock neck, and minimalist architectural loafers.",
                "points": {
                    "classic_expressive": 0.65,
                    "comfort_polish": 0.75,
                    "subtle_bold": 0.35,
                    "timeless_trend": 0.85,
                    "structured_relaxed": 0.50,
                },
            },
            {
                "id": "q2_d",
                "label": "Artisanal Texture",
                "text": "Subtly patterned overshirt over dark Japanese selvedge denim and Goodyear-welted boots.",
                "points": {
                    "classic_expressive": 0.80,
                    "comfort_polish": 0.50,
                    "subtle_bold": 0.55,
                    "timeless_trend": 0.55,
                    "structured_relaxed": 0.70,
                },
            },
        ],
    },
    {
        "id": "q3",
        "scenario": "Weekend Travel Capsule",
        "question": "You are packing a single weekender bag for three days in a vibrant city. What anchors your bag?",
        "options": [
            {
                "id": "q3_a",
                "label": "Time-Tested Staples",
                "text": "Navy hopsack blazer, two oxford cloth button-downs, and grey wool trousers.",
                "points": {
                    "classic_expressive": 0.10,
                    "comfort_polish": 0.75,
                    "subtle_bold": 0.10,
                    "timeless_trend": 0.10,
                    "structured_relaxed": 0.25,
                },
            },
            {
                "id": "q3_b",
                "label": "Soft Utilitarian Comfort",
                "text": "Breathable merino tees, elastic-waist drawstring chinos, and premium leather slip-on sneakers.",
                "points": {
                    "classic_expressive": 0.25,
                    "comfort_polish": 0.30,
                    "subtle_bold": 0.15,
                    "timeless_trend": 0.40,
                    "structured_relaxed": 0.90,
                },
            },
            {
                "id": "q3_c",
                "label": "Curated Contrast",
                "text": "A bold geometric knit, high-contrast overcoat, and statement Chelsea boots.",
                "points": {
                    "classic_expressive": 0.80,
                    "comfort_polish": 0.65,
                    "subtle_bold": 0.85,
                    "timeless_trend": 0.70,
                    "structured_relaxed": 0.40,
                },
            },
            {
                "id": "q3_d",
                "label": "Modern Streetwear Cuts",
                "text": "Boxy heavyweight tees, relaxed barrel trousers, and technical trail-runner footwear.",
                "points": {
                    "classic_expressive": 0.75,
                    "comfort_polish": 0.45,
                    "subtle_bold": 0.55,
                    "timeless_trend": 0.90,
                    "structured_relaxed": 0.75,
                },
            },
        ],
    },
    {
        "id": "q4",
        "scenario": "Signature Autumn Coat",
        "question": "When investing in your primary outerwear piece for cool weather, which silhouette calls to you?",
        "options": [
            {
                "id": "q4_a",
                "label": "Double-Breasted Wool",
                "text": "A camel or navy double-breasted coat with sharp peak lapels and structured shoulders.",
                "points": {
                    "classic_expressive": 0.10,
                    "comfort_polish": 0.90,
                    "subtle_bold": 0.25,
                    "timeless_trend": 0.10,
                    "structured_relaxed": 0.10,
                },
            },
            {
                "id": "q4_b",
                "label": "Draped Wrap Trench",
                "text": "An unlined wool wrap trench with dropped shoulders and a soft belted waist.",
                "points": {
                    "classic_expressive": 0.40,
                    "comfort_polish": 0.60,
                    "subtle_bold": 0.20,
                    "timeless_trend": 0.50,
                    "structured_relaxed": 0.85,
                },
            },
            {
                "id": "q4_c",
                "label": "Heritage Houndstooth",
                "text": "A bold houndstooth or glen check coat with rich textural contrast.",
                "points": {
                    "classic_expressive": 0.65,
                    "comfort_polish": 0.75,
                    "subtle_bold": 0.75,
                    "timeless_trend": 0.35,
                    "structured_relaxed": 0.35,
                },
            },
            {
                "id": "q4_d",
                "label": "Cropped Utility Jacket",
                "text": "A boxy cropped wool jacket with oversized front pockets and clean metallic hardware.",
                "points": {
                    "classic_expressive": 0.80,
                    "comfort_polish": 0.55,
                    "subtle_bold": 0.55,
                    "timeless_trend": 0.90,
                    "structured_relaxed": 0.55,
                },
            },
        ],
    },
    {
        "id": "q5",
        "scenario": "Sunday Morning Routine",
        "question": "Stepping out for a relaxed coffee and stroll through the neighborhood. What do you reach for?",
        "options": [
            {
                "id": "q5_a",
                "label": "Tidy Casual",
                "text": "Knit polo, tailored slim-straight chinos, and pristine white court sneakers.",
                "points": {
                    "classic_expressive": 0.20,
                    "comfort_polish": 0.75,
                    "subtle_bold": 0.10,
                    "timeless_trend": 0.20,
                    "structured_relaxed": 0.30,
                },
            },
            {
                "id": "q5_b",
                "label": "Pure Loungewear Ease",
                "text": "Heavyweight loopback French terry sweatshirt, washed relaxed denim, and retro trainers.",
                "points": {
                    "classic_expressive": 0.25,
                    "comfort_polish": 0.15,
                    "subtle_bold": 0.10,
                    "timeless_trend": 0.30,
                    "structured_relaxed": 0.95,
                },
            },
            {
                "id": "q5_c",
                "label": "Warm Earth Tones",
                "text": "Waffle cardigan in burnt sienna over cream ecru denim and supple suede loafers.",
                "points": {
                    "classic_expressive": 0.60,
                    "comfort_polish": 0.55,
                    "subtle_bold": 0.65,
                    "timeless_trend": 0.60,
                    "structured_relaxed": 0.65,
                },
            },
            {
                "id": "q5_d",
                "label": "Chore Coat Uniform",
                "text": "Vintage herringbone chore coat, wide skater trousers, and bold-colored canvas sneakers.",
                "points": {
                    "classic_expressive": 0.85,
                    "comfort_polish": 0.35,
                    "subtle_bold": 0.65,
                    "timeless_trend": 0.80,
                    "structured_relaxed": 0.70,
                },
            },
        ],
    },
    {
        "id": "q6",
        "scenario": "Color Palette for an Intimate Dinner",
        "question": "Which color story best captures your ideal evening mood?",
        "options": [
            {
                "id": "q6_a",
                "label": "Monochrome Minimal",
                "text": "Charcoal, deep slate grey, and optic white.",
                "points": {
                    "classic_expressive": 0.10,
                    "comfort_polish": 0.80,
                    "subtle_bold": 0.10,
                    "timeless_trend": 0.20,
                    "structured_relaxed": 0.30,
                },
            },
            {
                "id": "q6_b",
                "label": "Tactile Organic Neutrals",
                "text": "Sand, olive green, espresso brown, and natural unbleached cotton.",
                "points": {
                    "classic_expressive": 0.40,
                    "comfort_polish": 0.50,
                    "subtle_bold": 0.25,
                    "timeless_trend": 0.40,
                    "structured_relaxed": 0.75,
                },
            },
            {
                "id": "q6_c",
                "label": "Rich Jewel Accent",
                "text": "Midnight navy paired with a deep emerald or rich burgundy statement element.",
                "points": {
                    "classic_expressive": 0.65,
                    "comfort_polish": 0.75,
                    "subtle_bold": 0.75,
                    "timeless_trend": 0.45,
                    "structured_relaxed": 0.35,
                },
            },
            {
                "id": "q6_d",
                "label": "Dynamic Color Contrast",
                "text": "Bold mustard or burnt orange color-blocked against deep indigo or black.",
                "points": {
                    "classic_expressive": 0.90,
                    "comfort_polish": 0.60,
                    "subtle_bold": 0.95,
                    "timeless_trend": 0.80,
                    "structured_relaxed": 0.50,
                },
            },
        ],
    },
    {
        "id": "q7",
        "scenario": "Tailoring Cut and Trouser Break",
        "question": "When selecting your ideal pair of everyday trousers, what cut feels right?",
        "options": [
            {
                "id": "q7_a",
                "label": "Tapered Slight Break",
                "text": "Mid-rise, crisp front ironed crease, gently tapered leg with a clean slight break.",
                "points": {
                    "classic_expressive": 0.10,
                    "comfort_polish": 0.90,
                    "subtle_bold": 0.10,
                    "timeless_trend": 0.10,
                    "structured_relaxed": 0.10,
                },
            },
            {
                "id": "q7_b",
                "label": "Wide Double-Pleat",
                "text": "High waist, deep double pleats, wide flowing leg puddling slightly over shoes.",
                "points": {
                    "classic_expressive": 0.60,
                    "comfort_polish": 0.65,
                    "subtle_bold": 0.40,
                    "timeless_trend": 0.85,
                    "structured_relaxed": 0.80,
                },
            },
            {
                "id": "q7_c",
                "label": "Straight Unpressed Chino",
                "text": "Regular straight leg, washed finish, relaxed ankle clearance with no crease.",
                "points": {
                    "classic_expressive": 0.40,
                    "comfort_polish": 0.40,
                    "subtle_bold": 0.20,
                    "timeless_trend": 0.50,
                    "structured_relaxed": 0.70,
                },
            },
            {
                "id": "q7_d",
                "label": "Modular Cargo Detail",
                "text": "Relaxed curved barrel silhouette with integrated utilitarian flap pockets.",
                "points": {
                    "classic_expressive": 0.80,
                    "comfort_polish": 0.35,
                    "subtle_bold": 0.60,
                    "timeless_trend": 0.90,
                    "structured_relaxed": 0.80,
                },
            },
        ],
    },
    {
        "id": "q8",
        "scenario": "Finishing Touches and Accessories",
        "question": "How do you naturally complete an outfit before heading out the door?",
        "options": [
            {
                "id": "q8_a",
                "label": "Discreet Horology",
                "text": "A timeless mechanical dress watch with a black leather strap, nothing more.",
                "points": {
                    "classic_expressive": 0.10,
                    "comfort_polish": 0.85,
                    "subtle_bold": 0.10,
                    "timeless_trend": 0.10,
                    "structured_relaxed": 0.20,
                },
            },
            {
                "id": "q8_b",
                "label": "Understated Function",
                "text": "A sturdy canvas or waxed leather tote, zero jewelry.",
                "points": {
                    "classic_expressive": 0.25,
                    "comfort_polish": 0.30,
                    "subtle_bold": 0.10,
                    "timeless_trend": 0.30,
                    "structured_relaxed": 0.85,
                },
            },
            {
                "id": "q8_c",
                "label": "Textural Accents",
                "text": "A patterned wool-silk scarf, horn-rimmed glasses, and a vintage silver cuff.",
                "points": {
                    "classic_expressive": 0.80,
                    "comfort_polish": 0.65,
                    "subtle_bold": 0.80,
                    "timeless_trend": 0.60,
                    "structured_relaxed": 0.45,
                },
            },
            {
                "id": "q8_d",
                "label": "Architectural Eyewear",
                "text": "Sculptural thick acetate frames and a minimalist geometric crossbody sling.",
                "points": {
                    "classic_expressive": 0.90,
                    "comfort_polish": 0.60,
                    "subtle_bold": 0.65,
                    "timeless_trend": 0.95,
                    "structured_relaxed": 0.45,
                },
            },
        ],
    },
    {
        "id": "q9",
        "scenario": "Patterns and Textures",
        "question": "When bringing visual depth to an outfit, what surface treatment do you favor?",
        "options": [
            {
                "id": "q9_a",
                "label": "Micro Pinstripe or Check",
                "text": "Subtle tonal Bengal stripe or micro-houndstooth visible only up close.",
                "points": {
                    "classic_expressive": 0.20,
                    "comfort_polish": 0.85,
                    "subtle_bold": 0.20,
                    "timeless_trend": 0.20,
                    "structured_relaxed": 0.30,
                },
            },
            {
                "id": "q9_b",
                "label": "Textured Solids",
                "text": "Completely solid fabrics relying on slub linen, brushed twill, and cable knits.",
                "points": {
                    "classic_expressive": 0.30,
                    "comfort_polish": 0.50,
                    "subtle_bold": 0.10,
                    "timeless_trend": 0.25,
                    "structured_relaxed": 0.65,
                },
            },
            {
                "id": "q9_c",
                "label": "Vivid Heritage Plaid",
                "text": "Rich blackwatch tartan, Madras check, or bold Fair Isle knitwear.",
                "points": {
                    "classic_expressive": 0.80,
                    "comfort_polish": 0.65,
                    "subtle_bold": 0.85,
                    "timeless_trend": 0.50,
                    "structured_relaxed": 0.45,
                },
            },
            {
                "id": "q9_d",
                "label": "Abstract Graphic Motif",
                "text": "Modern artistic print, subtle watercolor dye, or bold color-blocked panels.",
                "points": {
                    "classic_expressive": 0.95,
                    "comfort_polish": 0.45,
                    "subtle_bold": 0.90,
                    "timeless_trend": 0.90,
                    "structured_relaxed": 0.70,
                },
            },
        ],
    },
    {
        "id": "q10",
        "scenario": "Personal Style Philosophy",
        "question": "Looking at the outfits in which you feel most centered and confident, what core thread unites them?",
        "options": [
            {
                "id": "q10_a",
                "label": "Quiet Tailoring",
                "text": "Clean proportions, flawless fit, and timeless quiet luxury.",
                "points": {
                    "classic_expressive": 0.05,
                    "comfort_polish": 0.95,
                    "subtle_bold": 0.10,
                    "timeless_trend": 0.10,
                    "structured_relaxed": 0.10,
                },
            },
            {
                "id": "q10_b",
                "label": "Effortless Ease",
                "text": "Soft natural fibers, unconstrained movement, and lived-in casual elegance.",
                "points": {
                    "classic_expressive": 0.30,
                    "comfort_polish": 0.20,
                    "subtle_bold": 0.15,
                    "timeless_trend": 0.30,
                    "structured_relaxed": 0.95,
                },
            },
            {
                "id": "q10_c",
                "label": "Expressive Signature",
                "text": "Distinctive color pairings, unexpected silhouettes, and an eye-catching personality.",
                "points": {
                    "classic_expressive": 0.90,
                    "comfort_polish": 0.60,
                    "subtle_bold": 0.90,
                    "timeless_trend": 0.70,
                    "structured_relaxed": 0.50,
                },
            },
            {
                "id": "q10_d",
                "label": "Contemporary Edge",
                "text": "Forward-looking cuts, bold silhouettes, and progressive modern streetwear influences.",
                "points": {
                    "classic_expressive": 0.85,
                    "comfort_polish": 0.55,
                    "subtle_bold": 0.65,
                    "timeless_trend": 0.95,
                    "structured_relaxed": 0.70,
                },
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
