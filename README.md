# Veyra — Personal Style Intelligence System

Veyra is a personal style intelligence platform designed to understand an individual's wardrobe, preferences, context, and body proportions to suggest explainable, cohesive outfit combinations.

---

## 🔒 Privacy & Data Storage Guarantees

1. **Local Storage Only:**
   - All body measurements (`height_cm`, `shoulder_cm`, `chest_bust_cm`, `waist_cm`, `hips_cm`), style quiz answers, constraints, and styling preferences are stored strictly locally in your local database.
   - No biometric data or quiz responses are sent to external cloud APIs or third parties.

2. **No Photo Storage or Processing:**
   - **No photos or images are uploaded, stored, or processed**.
   - Personal attributes (skin undertone, skin depth, face shape) are completely self-selected and voluntary.

3. **Permanent Right to Deletion:**
   - You can permanently delete all stored body measurements at any time via `DELETE /api/v1/measurements`.
   - You can delete style archetype quiz results at any time via `DELETE /api/v1/style-quiz/result`.
   - You can delete saved default constraints at any time via `DELETE /api/v1/constraints/{id}`.

4. **Heuristic Styling Guidance Disclaimer:**
   - All personalization calculations, body proportion classifications, archetype matches, and color harmony ratings are **heuristic styling guidance and mathematical approximations**, not rigid fashion dogma or psychological diagnoses.
   - Styling suggestions use suggestive framing (*"may suit"*, *"tends to balance proportions"*, *"could read as"*) to celebrate individual expression.

---

## 🧭 Phase 3A Architecture & Features

### 1. Style Archetype Quiz
- **Sartorial Framing**: Exclusively framed as an aesthetic style scenario quiz, never as a psychological diagnosis.
- **5 Continuous Dimensions**:
  1. `classic_expressive` (0.0: Classic / Heritage ↔ 1.0: Expressive / Avant-Garde)
  2. `comfort_polish` (0.0: Comfort / Ease ↔ 1.0: High Sartorial Polish)
  3. `subtle_bold` (0.0: Subtle / Tonal ↔ 1.0: Bold / High-Contrast)
  4. `timeless_trend` (0.0: Timeless / Capsule ↔ 1.0: Trend-Forward)
  5. `structured_relaxed` (0.0: Structured / Crisp ↔ 1.0: Relaxed / Fluid Drape)
- **Scoring & Normalization**: Versioned scenario choices add points to dimensions and normalize to a 5D vector in `[0.0, 1.0]`.
- **Dynamic Weight Redistribution**: When present, `style_archetype_match` receives a 0.10 base weight. When absent, its weight is proportionally redistributed so total active weight always equals 1.0 (100%).

### 2. Include / Avoid Constraints
- **Model (`OutfitConstraint`)**:
  - `constraint_type`: `must_include` or `avoid`
  - `target_type`: `item_id`, `category`, `color`, or `accessory_type`
  - `strength`: `hard` or `soft`
  - `is_saved_default`: Persist as a saved default constraint across recommendation sessions.
- **Execution**:
  - **Hard Constraints**: Strictly filter candidate generation.
  - **Impossible Constraints Fallback**: If no outfit satisfies all hard constraints, the closest combinations are returned alongside a clear explanation of which constraint caused the block. Wardrobe items are **never fabricated**.
  - **Soft Constraints**: Adjust score via the configurable `soft_constraint_score` component (0.10 base weight).

### 3. Gentle Fit Notes
- Triggered when a user-requested piece lowers occasion suitability, color harmony, or personal-attribute match.
- **5-Step Psychological Safety Pattern**:
  1. Acknowledge intent (*"We love that you want to style..."*)
  2. Name the shared goal (*"...to create an ensemble that feels both personal and polished."*)
  3. State one factual mismatch using gentle modal language (*"A piece with relaxed formality tends to read as more casual than formal settings typically anticipate."*)
  4. Offer one bridge (*"Layering a tailored jacket over it could bridge the formality, or you could swap to your Oxford Shirt."*)
  5. Leave the decision to the user (*"The choice is entirely yours to keep it anyway or try the alternative."*)
- **Empathy Guarantee**: Never uses banned language (*"wrong"*, *"doesn't suit you"*, *"flattering"*, *"unflattering"*, *"bad"*, *"ugly"*, or body-negative terms). Always provides real wardrobe alternative IDs.

---

## 🚀 Quickstart

### 1. Installation
```bash
pip install -r backend/requirements.txt
```

### 2. Database Initialization
Database tables are automatically created safely via `db.create_all()` without deleting existing data:
```bash
python backend/run.py
```

### 3. Running Tests
Run all unit and integration test suites:
```bash
python -m pytest backend/tests -v
```

---

## 📐 API Overview

### Core & Profile
- `GET /api/v1/health` — API health check
- `GET /api/v1/meta` — Supported categories, slots, occasions, shapes, undertones
- `GET /api/v1/profile` & `PUT /api/v1/profile` — User profile & preferences
- `GET /api/v1/wardrobe` & `POST /api/v1/wardrobe` — Digital wardrobe items

### Body Measurements (Phase 1.5)
- `GET /api/v1/measurements` — Retrieve body measurements, ratios, derived body shape
- `POST /api/v1/measurements` — Save/update body measurements (validates realistic ranges)
- `DELETE /api/v1/measurements` — Permanently delete all body measurements
- `PATCH /api/v1/measurements/shape-override` — Override derived body shape

### Style Archetype Quiz (Phase 3A)
- `GET /api/v1/style-quiz` — Retrieve versioned style scenario questions
- `POST /api/v1/style-quiz` — Submit answers; returns 5D normalized vector and archetype
- `GET /api/v1/style-quiz/result` — Retrieve latest style quiz result
- `DELETE /api/v1/style-quiz/result` — Delete style quiz result

### Constraints & Recommendations (Phase 3A)
- `POST /api/v1/constraints` — Create or save default outfit constraint (`must_include`/`avoid`)
- `GET /api/v1/constraints` — List saved constraints (`?is_saved_default=true`)
- `DELETE /api/v1/constraints/{id}` — Delete a saved constraint
- `POST /api/v1/recommendations` — Generate recommendations with inline constraints, archetype matching, fallback diagnostics, and gentle fit notes
- `POST /api/v1/recommendations/{id}/feedback` — Submit feedback (`like`, `dislike`, `skip`, `worn`)