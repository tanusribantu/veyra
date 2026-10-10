"""Candidate outfit generator for Veyra recommendation engine.

Generates structurally valid combinations of clothing items from a user's wardrobe,
respecting template rules (Top + Bottom + Footwear + optional Accessory) and pruning
anatomically or formally impossible combinations before scoring.
Supports hard inclusion/avoidance constraints with intelligent fallback for impossible combinations.
"""

from typing import List, Dict, Any, Optional, Tuple
import itertools


class CandidateGenerator:
    """Combines eligible wardrobe items into valid candidate outfits."""

    def __init__(self, template: Optional[List[str]] = None):
        # Default V0.1 prototype template is Top + Bottom + Footwear
        self.template = template or ["top", "bottom", "footwear"]

    @staticmethod
    def item_matches_constraint(item: Dict[str, Any], constraint: Dict[str, Any]) -> bool:
        """Determines if a wardrobe item matches the target of a constraint."""
        t_type = constraint.get("target_type")
        t_val = str(constraint.get("target_value", "")).lower().strip()

        if t_type == "item_id":
            return str(item.get("id")) == str(constraint.get("target_value"))
        elif t_type == "category":
            return str(item.get("category", "")).lower().strip() == t_val
        elif t_type == "color":
            return str(item.get("color", "")).lower().strip() == t_val
        elif t_type == "accessory_type":
            return str(item.get("accessory_type", "")).lower().strip() == t_val
        return False

    @classmethod
    def outfit_satisfies_constraint(cls, items: List[Dict[str, Any]], constraint: Dict[str, Any]) -> bool:
        """Evaluates whether an outfit satisfies a single constraint rule."""
        c_type = constraint.get("constraint_type")  # "must_include" or "avoid"
        has_match = any(cls.item_matches_constraint(item, constraint) for item in items)

        if c_type == "must_include":
            return has_match
        elif c_type == "avoid":
            return not has_match
        return True

    def generate_candidates(
        self,
        wardrobe_items: List[Dict[str, Any]],
        filter_item_ids: Optional[List[str]] = None,
        constraints: Optional[List[Dict[str, Any]]] = None,
    ) -> List[Dict[str, Any]]:
        """Generate candidate outfits, applying hard constraints and fallbacks.

        Args:
            wardrobe_items: List of wardrobe item dictionaries.
            filter_item_ids: Optional list of item IDs to restrict generation to.
            constraints: Optional list of constraint dictionaries.

        Returns:
            List of candidate outfit dicts, each containing:
                - 'items': list of item dictionaries
                - 'slots': list of slots
                - 'item_ids': list of item ids
                - 'is_fallback': bool indicating if generated via closest-option fallback
                - 'block_explanation': Optional explanation if hard constraints were impossible
        """
        candidates, _, _, _ = self.generate_candidates_with_status(
            wardrobe_items=wardrobe_items,
            filter_item_ids=filter_item_ids,
            constraints=constraints,
        )
        return candidates

    def generate_candidates_with_status(
        self,
        wardrobe_items: List[Dict[str, Any]],
        filter_item_ids: Optional[List[str]] = None,
        constraints: Optional[List[Dict[str, Any]]] = None,
    ) -> Tuple[List[Dict[str, Any]], bool, Optional[str], List[Dict[str, Any]]]:
        """Generate candidate outfits with explicit constraint satisfaction status.

        Returns:
            Tuple of:
                - candidates: list of candidate outfit dicts
                - is_blocked: bool (True if hard constraints could not be satisfied)
                - block_explanation: str or None
                - blocked_constraints: list of failed constraint dicts
        """
        if not wardrobe_items:
            return [], False, None, []

        # Filter by requested item IDs if provided
        if filter_item_ids:
            allowed_ids = set(filter_item_ids)
            pool = [item for item in wardrobe_items if item.get("id") in allowed_ids]
        else:
            pool = wardrobe_items

        # Check for accessory constraints or accessories in pool
        hard_constraints = [
            c for c in (constraints or []) if c.get("strength", "hard") == "hard"
        ]
        has_accessory_req = any(
            c.get("constraint_type") == "must_include"
            and (c.get("target_type") == "accessory_type" or c.get("target_type") == "category" and c.get("target_value") in ["accessory", "scarf", "glasses", "hat", "necklace", "earrings", "bag", "belt", "watch"])
            for c in (constraints or [])
        )
        accessory_items = [it for it in pool if it.get("slot") == "accessory"]

        # Group items by required core slots
        slot_buckets: Dict[str, List[Dict[str, Any]]] = {slot: [] for slot in self.template}
        for item in pool:
            slot = item.get("slot")
            if slot in slot_buckets:
                slot_buckets[slot].append(item)

        # Check if all required core slots have at least one eligible item
        for slot in self.template:
            if not slot_buckets[slot]:
                return [], False, None, []

        # Generate Cartesian product across core slots
        slot_lists = [slot_buckets[slot] for slot in self.template]
        raw_candidates = list(itertools.product(*slot_lists))

        base_candidates = []
        for candidate_tuple in raw_candidates:
            candidate_items = list(candidate_tuple)

            # Fast pruning rules:
            # 1. Extreme formality dissonance across pieces (spread >= 4)
            formalities = [item.get("formality", 2) for item in candidate_items]
            formality_spread = max(formalities) - min(formalities)
            if formality_spread >= 4:
                continue

            # 2. Hard category contradictions
            categories = {item.get("category") for item in candidate_items}
            if "formal_shoes" in categories and "shorts" in categories:
                continue
            if "formal_shoes" in categories and "hoodie" in categories:
                continue

            base_candidates.append(candidate_items)

        # If accessory is requested or present with matching accessory constraint, pair with accessory
        expanded_candidates = []
        if has_accessory_req and accessory_items:
            matching_accessories = [
                acc for acc in accessory_items
                if any(self.item_matches_constraint(acc, c) for c in (constraints or []) if c.get("constraint_type") == "must_include")
            ]
            acc_pool = matching_accessories or accessory_items
            for base_items in base_candidates:
                for acc in acc_pool:
                    expanded_candidates.append(base_items + [acc])
        else:
            expanded_candidates = base_candidates

        # Structure candidate dicts
        candidate_dicts = []
        for cand_items in expanded_candidates:
            candidate_dicts.append({
                "items": cand_items,
                "slots": [it.get("slot", "unknown") for it in cand_items],
                "item_ids": [it.get("id") for it in cand_items],
            })

        if not candidate_dicts:
            return [], False, None, []

        if not hard_constraints:
            return candidate_dicts, False, None, []

        # Filter against hard constraints
        satisfied_candidates = []
        for cand in candidate_dicts:
            if all(self.outfit_satisfies_constraint(cand["items"], c) for c in hard_constraints):
                satisfied_candidates.append(cand)

        if satisfied_candidates:
            return satisfied_candidates, False, None, []

        # ==============================================================================
        # IMPOSSIBLE HARD CONSTRAINTS FALLBACK HANDLING
        # "If no outfit satisfies the hard constraints, return the closest options plus
        # a clear explanation of which constraint blocked results. Never fabricate items."
        # ==============================================================================
        # 1. Diagnose which constraints caused the block
        blocked_constraints = []
        block_reasons = []

        for c in hard_constraints:
            matching_outfits = [
                cand for cand in candidate_dicts
                if self.outfit_satisfies_constraint(cand["items"], c)
            ]
            if len(matching_outfits) == 0:
                blocked_constraints.append(c)
                c_type = c.get("constraint_type")
                t_type = c.get("target_type")
                t_val = c.get("target_value")

                # Check if user owns any item matching target in general wardrobe
                has_in_wardrobe = any(self.item_matches_constraint(it, c) for it in wardrobe_items)
                if not has_in_wardrobe:
                    reason = f"Constraint '{c_type}: {t_type}=\"{t_val}\"' could not be met because no matching items exist in your wardrobe."
                else:
                    reason = f"Constraint '{c_type}: {t_type}=\"{t_val}\"' could not form a compatible outfit with current category and formality rules."
                block_reasons.append(reason)

        if not block_reasons:
            block_reasons.append("Conflicting hard constraints could not be simultaneously satisfied.")

        block_explanation = (
            "No outfits satisfied all requested hard constraints. "
            + " ".join(block_reasons)
            + " Returning the closest matching options from your wardrobe."
        )

        # 2. Score candidates by how many hard constraints they satisfy
        for cand in candidate_dicts:
            sat_count = sum(
                1 for c in hard_constraints
                if self.outfit_satisfies_constraint(cand["items"], c)
            )
            cand["satisfied_hard_count"] = sat_count
            cand["is_fallback"] = True
            cand["block_explanation"] = block_explanation

        # Sort by satisfied_hard_count descending
        candidate_dicts.sort(key=lambda x: x.get("satisfied_hard_count", 0), reverse=True)

        return candidate_dicts, True, block_explanation, blocked_constraints
