"""Color harmony and compatibility engine for Veyra outfit recommendation.

================================================================================
INTERVIEW DEFENSE & SYSTEM DESIGN RATIONALE
================================================================================
Why Color Compatibility is Weighted at 0.30 in Veyra's Core Formulation:
  1. Human Visual Primacy: In human cognitive perception of garments, color is
     processed pre-attentively within the first 100-200ms—well before fine details
     like texture, stitching, or silhouette are parsed. A color clash creates
     immediate cognitive dissonance ("visual noise"), ruining an outfit even if the
     fit and brand are luxurious.
  2. The "Neutral-Anchor" Heuristic (60-30-10 Rule):
     Professional stylists rely on balancing dominant neutrals (60%), secondary
     neutrals/sub-tones (30%), and focal accents (10%). Outfits with 2 or 3 neutrals
     consistently achieve effortless elegance. Conversely, 3 competing saturated
     chromas overwhelm the eye.
  3. Explainability:
     Color theory allows deterministic, rule-based decomposition:
     - Monochromatic / Tonal harmony
     - Neutral foundations
     - Classic complementary pairings (e.g., Navy + Tan, Olive + Burgundy)
     - Clash penalties (e.g., Red + Green holiday clash, competing high-saturation accents).
================================================================================
"""

from typing import List, Tuple, Dict, Any

# Universal wardrobe neutral colors (achromatic or desaturated earth tones)
# Neutrals act as universal visual stabilizers and can pair with almost any hue.
NEUTRALS = {
    "white",
    "black",
    "gray",
    "grey",
    "charcoal",
    "navy",
    "beige",
    "cream",
    "khaki",
    "tan",
    "brown",
    "olive",
}

# Color families for tonal / monochromatic detection
COLOR_FAMILIES = {
    "blue": {"blue", "navy", "sky-blue", "light-blue", "indigo"},
    "neutral_dark": {"black", "charcoal", "dark-gray"},
    "neutral_light": {"white", "cream", "ivory", "off-white"},
    "earth_warm": {"beige", "khaki", "tan", "camel", "brown"},
    "earth_green": {"olive", "army-green", "sage", "forest-green"},
    "red_wine": {"burgundy", "maroon", "wine", "rust"},
}

# Classic time-tested harmonious color pairings recognized across fashion
CLASSIC_HARMONY_PAIRS = {
    frozenset(["navy", "white"]): (98.0, "Classic nautical contrast; crisp, high-clarity balance."),
    frozenset(["navy", "beige"]): (95.0, "Refined tonal contrast between cool navy and warm beige."),
    frozenset(["navy", "khaki"]): (95.0, "Traditional smart-casual menswear synergy."),
    frozenset(["navy", "brown"]): (95.0, "Timeless complementary relationship between deep blue and leather tan/brown."),
    frozenset(["black", "white"]): (95.0, "High-contrast monochrome; clean, minimalist, and modern."),
    frozenset(["black", "gray"]): (93.0, "Sleek greyscale tonal progression with soft contrast."),
    frozenset(["black", "grey"]): (93.0, "Sleek greyscale tonal progression with soft contrast."),
    frozenset(["olive", "white"]): (92.0, "Clean earth-tone contrast where white illuminates muted olive."),
    frozenset(["olive", "black"]): (90.0, "Utilitarian urban harmony with grounded low-key tones."),
    frozenset(["olive", "beige"]): (93.0, "Harmonious analogous earth tones evoking organic warmth."),
    frozenset(["olive", "khaki"]): (91.0, "Analogous military/safari heritage palette."),
    frozenset(["burgundy", "navy"]): (90.0, "Sophisticated dual-jewel tone with rich, subdued contrast."),
    frozenset(["burgundy", "gray"]): (92.0, "Neutral gray softens the deep intensity of burgundy."),
    frozenset(["burgundy", "white"]): (92.0, "Crisp contrast highlighting the richness of burgundy."),
    frozenset(["blue", "brown"]): (94.0, "Cool blue fabric complemented by warm leather tones."),
}

# Discordant color clashes that create jarring visual competition
KNOWN_CLASH_PAIRS = {
    frozenset(["red", "green"]): (35.0, "Holiday/festive conflict; strong saturated chromatic vibration."),
    frozenset(["orange", "purple"]): (38.0, "Jarring high-saturation clash with competing focal weights."),
    frozenset(["orange", "pink"]): (40.0, "High chroma tension without sufficient value contrast."),
    frozenset(["yellow", "purple"]): (42.0, "Intense complementary vibration that distracts the eye."),
}

WARM_COLORS = {
    "camel", "tan", "khaki", "brown", "olive", "beige", "cream",
    "gold", "orange", "rust", "yellow", "red", "burgundy", "maroon",
    "peach", "coral",
}

COOL_COLORS = {
    "navy", "blue", "sky-blue", "light-blue", "indigo", "teal",
    "lavender", "purple", "silver", "charcoal", "dark-gray",
}

NEUTRAL_COLORS = {"white", "black", "gray", "grey"}


def derive_color_warmth(color: str) -> str:
    """Auto-derive color warmth (warm, cool, neutral) from color name."""
    norm = normalize_color(color)
    if norm in WARM_COLORS:
        return "warm"
    if norm in COOL_COLORS:
        return "cool"
    return "neutral"


def normalize_color(color: str) -> str:
    """Normalize color strings by stripping whitespace and lowercasing."""
    if not color:
        return "gray"
    return color.strip().lower().replace("_", "-")


def are_monochromatic(colors: List[str]) -> bool:
    """Check if all colors belong to the same tonal family (e.g. navy and blue, black and charcoal)."""
    norm = [normalize_color(c) for c in colors]
    for family, members in COLOR_FAMILIES.items():
        if all(c in members for c in norm):
            return True
    return len(set(norm)) == 1


def evaluate_color_compatibility(colors: List[str]) -> Tuple[float, Dict[str, Any]]:
    """Evaluate color harmony across an outfit's item set (typically 3 items: top, bottom, footwear).

    Scoring Logic:
    1. Base Score: Defaults to 80 (baseline wearable).
    2. All Neutrals: +15 bonus (Score ~95). Neutral palettes are foolproof.
    3. Two Neutrals + One Accent: +12 bonus (Score ~92-94). Ideal 60-30-10 principle.
    4. Monochromatic / Tonal: +14 bonus (Score ~94-96). Sophisticated, clean silhouette.
    5. Curated Classic Pairings: Direct lookup override or bonus up to 98.
    6. Clashes / Over-saturation:
       - Direct clash detected -> Heavy penalty (Score drops to 35-45).
       - Multiple non-neutrals without harmony -> -25 to -40 penalty.

    Returns:
        (score, explanation_meta):
            score: float 0.0 - 100.0
            explanation_meta: dictionary with details used by ExplanationService.
    """
    if not colors:
        return 50.0, {"type": "empty", "message": "No colors provided to evaluate."}

    norm_colors = [normalize_color(c) for c in colors]
    unique_colors = list(dict.fromkeys(norm_colors))  # preserve order, deduplicate
    num_items = len(norm_colors)

    # 1. Monochromatic check
    if are_monochromatic(norm_colors):
        return 95.0, {
            "type": "monochromatic",
            "message": f"Monochromatic harmony using cohesive {norm_colors[0]} tones.",
            "palette": norm_colors,
        }

    # Count neutral vs accent pieces
    neutral_count = sum(1 for c in norm_colors if c in NEUTRALS)
    accent_count = num_items - neutral_count

    # Check for direct clashes between any pair in the outfit
    for i in range(len(norm_colors)):
        for j in range(i + 1, len(norm_colors)):
            pair = frozenset([norm_colors[i], norm_colors[j]])
            if pair in KNOWN_CLASH_PAIRS:
                clash_score, clash_msg = KNOWN_CLASH_PAIRS[pair]
                return clash_score, {
                    "type": "clash",
                    "message": clash_msg,
                    "clashing_pair": list(pair),
                    "palette": norm_colors,
                }

    # Check for curated classic harmony pairings
    matching_harmonies = []
    for i in range(len(norm_colors)):
        for j in range(i + 1, len(norm_colors)):
            pair = frozenset([norm_colors[i], norm_colors[j]])
            if pair in CLASSIC_HARMONY_PAIRS:
                score_val, desc = CLASSIC_HARMONY_PAIRS[pair]
                matching_harmonies.append((score_val, desc))

    # 2. All items are neutral (e.g. white, navy, brown or black, gray, white)
    if neutral_count == num_items:
        if matching_harmonies:
            top_harmony_score, top_harmony_desc = max(matching_harmonies, key=lambda x: x[0])
            return top_harmony_score, {
                "type": "classic_harmony",
                "message": top_harmony_desc,
                "palette": norm_colors,
            }
        # Check if there is enough value contrast (e.g., all black vs dark brown muddy pairing)
        if "black" in norm_colors and "brown" in norm_colors and "white" not in norm_colors:
            return 72.0, {
                "type": "low_contrast_neutrals",
                "message": "Black and brown together require intentional contrast to avoid appearing muddy.",
                "palette": norm_colors,
            }
        return 93.0, {
            "type": "neutral_foundation",
            "message": "Versatile neutral foundation with natural aesthetic balance.",
            "palette": norm_colors,
        }

    # 3. Two neutrals + One accent (Stylist standard: 60-30-10 rule)
    if neutral_count == num_items - 1 and accent_count == 1:
        accent_color = next(c for c in norm_colors if c not in NEUTRALS)
        if matching_harmonies:
            top_harmony_score, top_harmony_desc = max(matching_harmonies, key=lambda x: x[0])
            return 93.0, {
                "type": "neutral_grounded_accent",
                "message": f"Grounds the accent {accent_color} with balanced neutral anchors ({top_harmony_desc})",
                "palette": norm_colors,
            }
        return 88.0, {
            "type": "neutral_grounded_accent",
            "message": f"Balanced neutral base allows the {accent_color} piece to stand out cleanly.",
            "palette": norm_colors,
        }

    # 4. Multiple non-neutral accents (High risk of color overload)
    if accent_count >= 2:
        if matching_harmonies:
            return 75.0, {
                "type": "harmonious_multi_accent",
                "message": "Multiple colors present, but paired through harmonious complementary hues.",
                "palette": norm_colors,
            }
        # Heavy penalty for uncoordinated multiple accents
        return 48.0, {
            "type": "color_overload",
            "message": "Too many competing focal colors create visual clutter and discord.",
            "palette": norm_colors,
        }

    # Default fallback
    return 80.0, {
        "type": "balanced",
        "message": "Standard balanced color coordination.",
        "palette": norm_colors,
    }
