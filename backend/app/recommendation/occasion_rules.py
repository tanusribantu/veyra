"""Occasion suitability and social context evaluation for Veyra outfit recommendation.

================================================================================
INTERVIEW DEFENSE & SYSTEM DESIGN RATIONALE
================================================================================
Why Occasion Suitability is Weighted at 0.25 in Veyra's Core Formulation:
  1. Pragmatic Social Appropriateness:
     An outfit can possess flawless color theory (e.g., navy + white + tan), but if
     it consists of swim shorts and flip-flops at a corporate boardroom presentation,
     it is a total failure. Occasion represents the "social contract" of dress code.
  2. Asymmetric Penalty Mechanics:
     Unlike personal style (which is forgiving and subjective), occasion suitability
     has hard boundaries. Wearing an outfit 2 or 3 formality levels above or below
     the expected social context causes severe discomfort or embarrassment.
  3. Dynamic Acceptability Windows:
     Each occasion specifies an acceptable formality window [min_f, max_f] and a
     target formality. Deviations incur graduated penalties, while forbidden
     garment categories (e.g. gym shorts or hoodies for 'formal') enforce hard floors.
================================================================================
"""

from typing import List, Tuple, Dict, Any

# Target formality ranges (1-5 scale) and forbidden categories for each occasion
OCCASION_PROFILES = {
    "casual": {
        "target_formality": 2,
        "allowed_range": (1, 3),
        "ideal_categories": {"t-shirt", "shirt", "jeans", "chinos", "shorts", "sneakers", "hoodie", "sweater", "overshirt"},
        "inappropriate_categories": {"formal_shoes"},
        "description": "Relaxed everyday wear emphasizing comfort and casual ease.",
    },
    "work": {
        "target_formality": 3,
        "allowed_range": (2, 4),
        "ideal_categories": {"shirt", "polo", "sweater", "chinos", "trousers", "loafers", "boots", "derbies", "sneakers"},
        "inappropriate_categories": {"shorts", "hoodie", "sandals"},
        "description": "Smart-casual to professional work environment balancing polish and comfort.",
    },
    "formal": {
        "target_formality": 5,
        "allowed_range": (4, 5),
        "ideal_categories": {"shirt", "trousers", "formal_shoes", "derbies"},
        "inappropriate_categories": {"shorts", "hoodie", "t-shirt", "jeans", "sneakers", "sandals"},
        "description": "Elevated formal dress requiring structured tailoring and dress footwear.",
    },
    "college": {
        "target_formality": 1.5,
        "allowed_range": (1, 3),
        "ideal_categories": {"t-shirt", "hoodie", "overshirt", "jeans", "chinos", "sneakers", "boots"},
        "inappropriate_categories": {"formal_shoes"},
        "description": "Campus lifestyle with practical, expressive, and comfortable pieces.",
    },
    "date_night": {
        "target_formality": 3,
        "allowed_range": (2, 4),
        "ideal_categories": {"shirt", "sweater", "overshirt", "chinos", "jeans", "boots", "loafers", "sneakers"},
        "inappropriate_categories": {"shorts", "sandals"},
        "description": "Sharp, curated evening aesthetic that feels intentional without being stiff.",
    },
    "party": {
        "target_formality": 2.5,
        "allowed_range": (2, 4),
        "ideal_categories": {"shirt", "t-shirt", "overshirt", "jeans", "chinos", "boots", "sneakers", "loafers"},
        "inappropriate_categories": {"sandals"},
        "description": "Expressive social gathering welcoming modern, stylish silhouettes.",
    },
}


def evaluate_occasion_suitability(
    items: List[Dict[str, Any]],
    occasion: str
) -> Tuple[float, Dict[str, Any]]:
    """Evaluate whether an outfit meets the functional and social expectations of an occasion.

    Scoring Logic:
    1. Base Score: 100.0
    2. Category Suitability:
       - If any item belongs to inappropriate categories (e.g., sneakers in formal):
         Deducts 40-50 points immediately.
    3. Formality Alignment:
       - Compares mean item formality to occasion's target_formality and allowed_range.
       - Small deviation within range: -5 to -10 pts.
       - Large deviation outside range: -25 pts per formality unit delta.
    4. Ideal Category Synergy:
       - Bonus if all pieces are from ideal categories.

    Returns:
        (score, explanation_meta):
            score: float bounded between 0.0 and 100.0
            explanation_meta: dictionary with details for explanation generator.
    """
    occ_key = occasion.lower().strip()
    profile = OCCASION_PROFILES.get(occ_key)

    if not profile:
        # Fallback for unrecognized custom occasions
        return 75.0, {
            "occasion": occasion,
            "message": f"Evaluated against general standard for {occasion}.",
            "status": "default",
        }

    categories = [item.get("category", "").lower().strip() for item in items]
    formalities = [item.get("formality", 2) for item in items]
    mean_formality = sum(formalities) / len(formalities) if formalities else 2.0

    inappropriate_hits = [cat for cat in categories if cat in profile["inappropriate_categories"]]
    min_f, max_f = profile["allowed_range"]
    target_f = profile["target_formality"]

    # Severe penalty for inappropriate garments (e.g. sneakers at black-tie formal)
    if inappropriate_hits:
        penalty = len(inappropriate_hits) * 35.0
        score = max(15.0, 60.0 - penalty)
        return round(score, 1), {
            "occasion": occasion,
            "status": "inappropriate_garments",
            "violations": inappropriate_hits,
            "message": f"Contains {', '.join(inappropriate_hits)} which clash with {occasion} expectations.",
            "mean_formality": mean_formality,
        }

    # Formality distance calculation
    if min_f <= mean_formality <= max_f:
        # Inside acceptable range; small penalty proportional to distance from ideal target
        delta = abs(mean_formality - target_f)
        score = 100.0 - (delta * 10.0)
        status = "ideal" if delta <= 0.5 else "good"
        msg = f"Comfortably fits {occasion} dress standards ({profile['description']})"
    else:
        # Outside acceptable range
        if mean_formality < min_f:
            delta = min_f - mean_formality
            score = max(20.0, 85.0 - (delta * 30.0))
            status = "underdressed"
            msg = f"Appears too casual for {occasion} (formality level {mean_formality:.1f} vs required {min_f})."
        else:
            delta = mean_formality - max_f
            score = max(25.0, 85.0 - (delta * 25.0))
            status = "overdressed"
            msg = f"Appears overly formal for {occasion} (formality level {mean_formality:.1f} vs maximum {max_f})."

    # Small boost if all items are in ideal categories
    all_ideal = all(cat in profile["ideal_categories"] for cat in categories)
    if all_ideal and score < 95.0:
        score = min(100.0, score + 5.0)

    return round(score, 1), {
        "occasion": occasion,
        "status": status,
        "message": msg,
        "mean_formality": mean_formality,
        "target_formality": target_f,
    }
