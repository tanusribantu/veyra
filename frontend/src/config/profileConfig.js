/**
 * Editable configuration and deterministic mapping functions for user personal attributes.
 * Covers Skin Depth, Skin Undertone, Face Shape, and Body Silhouette preferences.
 */

// =============================================================================
// 1. SKIN DEPTH (8-10 Tappable Swatches)
// =============================================================================
export const SKIN_DEPTH_OPTIONS = [
  { id: 'fair_light', label: 'Fair Light', hex: '#F9E4D4', border: '#D0A890' },
  { id: 'fair', label: 'Fair', hex: '#F3D4C1', border: '#C5957C' },
  { id: 'light', label: 'Light', hex: '#E8BEA5', border: '#B68266' },
  { id: 'light_medium', label: 'Light-Medium', hex: '#D9A688', border: '#A66D4E' },
  { id: 'medium', label: 'Medium', hex: '#C68A68', border: '#925232' },
  { id: 'medium_tan', label: 'Medium-Tan', hex: '#B27350', border: '#7D3B1C' },
  { id: 'tan', label: 'Tan', hex: '#995938', border: '#68280B' },
  { id: 'deep_tan', label: 'Deep Tan', hex: '#7C4327', border: '#4E1903' },
  { id: 'deep', label: 'Deep', hex: '#5B2F18', border: '#351100' },
  { id: 'very_deep', label: 'Very Deep', hex: '#3B1C0C', border: '#1C0600' },
]

// =============================================================================
// 2. SKIN UNDERTONE & GUIDED CHECKS
// =============================================================================
export const UNDERTONE_OPTIONS = [
  { id: 'warm', label: 'Warm', desc: 'Golden, Peachy, or Yellow tones', color: '#E0A868' },
  { id: 'cool', label: 'Cool', desc: 'Pink, Rosy, or Bluish tones', color: '#A2C2E8' },
  { id: 'neutral', label: 'Neutral', desc: 'Balanced, adaptable mix of warm & cool', color: '#C8B6A6' },
  { id: 'olive', label: 'Olive', desc: 'Subtle greenish or golden-grey undertones', color: '#8F9B6E' },
]

export const UNDERTONE_GUIDED_QUESTIONS = [
  {
    id: 'wrist_veins',
    question: 'Observe the color of veins on the inner side of your wrist under natural light:',
    options: [
      { id: 'green', label: 'Greenish or Olive', map: 'warm' },
      { id: 'blue', label: 'Blue or Purple', map: 'cool' },
      { id: 'mixed', label: 'Mix of blue and green / Hard to tell', map: 'neutral' },
      { id: 'not_sure', label: 'Not sure / Unclear', map: 'neutral' },
    ],
  },
  {
    id: 'jewelry',
    question: 'Which metal tone complements your bare skin most naturally?',
    options: [
      { id: 'gold', label: 'Yellow Gold or Warm Brass', map: 'warm' },
      { id: 'silver', label: 'Silver, Platinum, or White Gold', map: 'cool' },
      { id: 'both', label: 'Both look equally harmonious', map: 'neutral' },
      { id: 'not_sure', label: 'Not sure / Prefer not to say', map: 'neutral' },
    ],
  },
  {
    id: 'sun_reaction',
    question: 'How does your skin react to direct afternoon sun exposure without sunscreen?',
    options: [
      { id: 'tan_easily', label: 'Tans easily with rare or minimal sun burning', map: 'warm' },
      { id: 'burn_easily', label: 'Burns or turns red easily; tans minimally', map: 'cool' },
      { id: 'burn_then_tan', label: 'Burns slightly first, then gradually tans', map: 'neutral' },
      { id: 'not_sure', label: 'Not sure / Unclear', map: 'neutral' },
    ],
  },
]

/**
 * Deterministically derives undertone from guided check answers.
 * Returns 'warm', 'cool', or 'neutral'. Defaults to 'neutral' when uncertain.
 */
export function deriveUndertone(answers = {}) {
  const counts = { warm: 0, cool: 0, neutral: 0 }

  UNDERTONE_GUIDED_QUESTIONS.forEach((q) => {
    const selectedId = answers[q.id]
    const matchedOpt = q.options.find((opt) => opt.id === selectedId)
    if (matchedOpt) {
      counts[matchedOpt.map] = (counts[matchedOpt.map] || 0) + 1
    } else {
      counts.neutral += 1
    }
  })

  if (counts.warm > counts.cool && counts.warm > counts.neutral) {
    return 'warm'
  }
  if (counts.cool > counts.warm && counts.cool > counts.neutral) {
    return 'cool'
  }
  return 'neutral'
}

// =============================================================================
// 3. FACE SHAPE & GUIDED DERIVATION
// =============================================================================
export const FACE_SHAPE_OPTIONS = [
  {
    id: 'oval',
    label: 'Oval',
    desc: 'Balanced length with gently curved jawline and slightly wider forehead',
    svgPath: 'M 30 10 C 52 10, 52 40, 52 50 C 52 75, 30 90, 30 90 C 30 90, 8 75, 8 50 C 8 40, 8 10, 30 10 Z',
  },
  {
    id: 'round',
    label: 'Round',
    desc: 'Soft circular contours with equal width and length',
    svgPath: 'M 30 10 C 55 10, 55 90, 30 90 C 5 90, 5 10, 30 10 Z',
  },
  {
    id: 'square',
    label: 'Square',
    desc: 'Straight vertical sides with crisp, angular jawline',
    svgPath: 'M 12 12 L 48 12 L 48 65 L 36 86 L 24 86 L 12 65 Z',
  },
  {
    id: 'heart',
    label: 'Heart',
    desc: 'Broader forehead & cheekbones tapering gracefully to a slender chin',
    svgPath: 'M 30 18 C 12 8, 8 35, 14 52 C 20 68, 30 88, 30 88 C 30 88, 40 68, 46 52 C 52 35, 48 8, 30 18 Z',
  },
  {
    id: 'diamond',
    label: 'Diamond',
    desc: 'Prominent cheekbones with tapered forehead and neat chin',
    svgPath: 'M 30 10 L 52 46 L 30 90 L 8 46 Z',
  },
  {
    id: 'oblong',
    label: 'Oblong',
    desc: 'Elongated vertical silhouette with smooth, linear jawline',
    svgPath: 'M 30 6 C 50 6, 50 35, 50 65 C 50 85, 30 94, 30 94 C 30 94, 10 85, 10 65 C 10 35, 10 6, 30 6 Z',
  },
]

export const FACE_SHAPE_GUIDED_QUESTIONS = [
  {
    id: 'proportions',
    question: 'How do your overall face length and width compare?',
    options: [
      { id: 'longer', label: 'Length is noticeably greater than width', map: 'long' },
      { id: 'equal', label: 'Length and width are nearly equal', map: 'equal' },
      { id: 'balanced', label: 'Gently longer than wide with smooth curve', map: 'balanced' },
      { id: 'not_sure', label: 'Not sure / Unsure', map: 'balanced' },
    ],
  },
  {
    id: 'widest_point',
    question: 'Which area appears widest when looking straight in a mirror?',
    options: [
      { id: 'forehead', label: 'Forehead and temples', map: 'forehead' },
      { id: 'cheekbones', label: 'Cheekbones', map: 'cheekbones' },
      { id: 'jaw', label: 'Jawline and lower face', map: 'jaw' },
      { id: 'equal_width', label: 'Forehead, cheekbones, and jaw are equal', map: 'equal' },
    ],
  },
  {
    id: 'jawline_shape',
    question: 'How would you describe your jawline contour?',
    options: [
      { id: 'rounded', label: 'Soft and curved', map: 'rounded' },
      { id: 'angular', label: 'Sharp and square', map: 'angular' },
      { id: 'pointed', label: 'Slender and tapered chin', map: 'pointed' },
      { id: 'not_sure', label: 'Not sure', map: 'rounded' },
    ],
  },
]

/**
 * Deterministically derives face shape from guided questions.
 */
export function deriveFaceShape(answers = {}) {
  const prop = answers.proportions || 'balanced'
  const widest = answers.widest_point || 'equal_width'
  const jaw = answers.jawline_shape || 'rounded'

  if (widest === 'forehead' && jaw === 'pointed') return 'heart'
  if (widest === 'cheekbones' && jaw === 'pointed') return 'diamond'
  if (prop === 'equal' && jaw === 'angular') return 'square'
  if (prop === 'equal' && jaw === 'rounded') return 'round'
  if (prop === 'longer' && jaw === 'angular') return 'oblong'
  if (prop === 'longer') return 'oblong'
  if (jaw === 'angular') return 'square'

  return 'oval'
}

// =============================================================================
// 4. STYLING LANE & INCLUSIVE SHOPPING SECTION
// =============================================================================
export const STYLING_LANE_OPTIONS = [
  {
    id: 'menswear',
    label: 'Menswear',
    desc: 'Tailored shirts, trousers, jackets, and classic structured cuts',
  },
  {
    id: 'womenswear',
    label: 'Womenswear',
    desc: 'Blouses, dresses, skirts, sarees, and fluid silhouette cuts',
  },
  {
    id: 'mixed',
    label: 'A mix of both',
    desc: 'Fluid wardrobe curated across all departments and tailoring styles',
  },
  {
    id: 'prefer_not_to_say',
    label: 'Prefer not to say',
    desc: 'Keep suggestions open, versatile, and universally inclusive',
  },
]

// Short "closest to my style" fluid and tomboy-friendly option set phrased neutrally
export const FLUID_STYLE_TENDENCIES = [
  {
    id: 'structured_sharp',
    label: 'Structured and sharp',
    desc: 'Architectural cuts, tailored lines, and crisp geometry',
  },
  {
    id: 'relaxed_oversized',
    label: 'Relaxed and oversized',
    desc: 'Generous proportions, drop shoulders, and effortless tomboy ease',
  },
  {
    id: 'soft_flowing',
    label: 'Soft and flowing',
    desc: 'Fluid drapes, breathable ease, and gentle movement',
  },
  {
    id: 'mix_of_everything',
    label: 'Mix of everything',
    desc: 'Versatile balance combining structure and relaxed fluidity',
  },
]

// =============================================================================
// 5. BODY SILHOUETTE (NO-TAPE FIGURE CARDS & FIT GUIDED QUESTIONS)
// =============================================================================
export const BODY_SHAPE_DISPLAY_LABELS = {
  womenswear: {
    hourglass: { label: 'Hourglass', desc: 'Harmonious upper & lower proportion with defined waist drape' },
    pear: { label: 'Pear / Triangle', desc: 'Lower body carries ease, creating a grounded silhouette' },
    inverted_triangle: { label: 'Inverted Triangle', desc: 'Broader shoulder line tapering to streamlined hips' },
    rectangle: { label: 'Rectangle / Straight', desc: 'Linear alignment through shoulders, waist, and hips' },
    apple: { label: 'Apple / Soft Round', desc: 'Comfortable midsection ease with fluid, graceful lines' },
    athletic: { label: 'Athletic / Sculpted', desc: 'Structured shoulder posture with trim, active proportions' },
  },
  neutral: {
    hourglass: { label: 'Balanced Frame, Defined Waist', desc: 'Proportional chest and hips with a tapered waistline' },
    pear: { label: 'Broader Base, Streamlined Torso', desc: 'Lower torso carries width relative to shoulders' },
    inverted_triangle: { label: 'Broad Shoulders, Tapered Waist', desc: 'Upper silhouette is broader with shoulders tapering to hips' },
    rectangle: { label: 'Straight / Linear Frame', desc: 'Balanced alignment with consistent width from shoulders to hips' },
    apple: { label: 'Relaxed Midsection, Fluid Torso', desc: 'Midsection is the primary focal width with comfortable ease' },
    athletic: { label: 'Structured Shoulders, Athletic Taper', desc: 'Sculpted shoulder line with athletic torso taper' },
  },
}

export function getBodyShapeOptions(lane) {
  const laneKey = lane === 'womenswear' ? 'womenswear' : 'neutral'
  const mapping = BODY_SHAPE_DISPLAY_LABELS[laneKey] || BODY_SHAPE_DISPLAY_LABELS.neutral
  return Object.keys(mapping).map((key) => ({
    id: key,
    label: mapping[key].label,
    desc: mapping[key].desc,
  }))
}

export function getBodyShapeLabel(shapeId, lane) {
  const laneKey = lane === 'womenswear' ? 'womenswear' : 'neutral'
  const mapping = BODY_SHAPE_DISPLAY_LABELS[laneKey] || BODY_SHAPE_DISPLAY_LABELS.neutral
  return mapping[shapeId]?.label || shapeId
}

export const BODY_SHAPE_OPTIONS = [
  {
    id: 'hourglass',
    label: 'Hourglass',
    desc: 'Harmonious upper & lower proportion with defined waist drape',
  },
  {
    id: 'pear',
    label: 'Pear / Triangle',
    desc: 'Lower body carries ease, creating a grounded silhouette',
  },
  {
    id: 'inverted_triangle',
    label: 'Inverted Triangle',
    desc: 'Broader shoulder line tapering to streamlined hips',
  },
  {
    id: 'rectangle',
    label: 'Rectangle / Straight',
    desc: 'Linear alignment through shoulders, waist, and hips',
  },
  {
    id: 'apple',
    label: 'Apple / Soft Round',
    desc: 'Comfortable midsection ease with fluid, graceful lines',
  },
  {
    id: 'athletic',
    label: 'Athletic / Sculpted',
    desc: 'Structured shoulder posture with trim, active proportions',
  },
]

export const FIT_GUIDED_QUESTIONS = [
  {
    id: 'upper_fit',
    question: 'Where do shirts, jackets, or tops usually feel most structured or snug first?',
    options: [
      { id: 'shoulders', label: 'Across shoulders or chest', map: 'top_heavy' },
      { id: 'midsection', label: 'Around the waist or abdomen', map: 'mid_heavy' },
      { id: 'balanced', label: 'Balanced fit across shoulders and waist', map: 'balanced' },
      { id: 'none', label: 'Never feels tight anywhere', map: 'balanced' },
    ],
  },
  {
    id: 'lower_fit',
    question: 'How do trousers, jeans, or skirts usually drape over your hips and thighs?',
    options: [
      { id: 'snug_hips', label: 'Fitted through hips/thighs while waist has extra room', map: 'bottom_heavy' },
      { id: 'loose_hips', label: 'Fits comfortably at waist while hips/thighs are loose', map: 'top_heavy' },
      { id: 'snug_waist', label: 'Snug at waist with balanced hip ease', map: 'defined_waist' },
      { id: 'uniform', label: 'Uniform drape from waist down to hem', map: 'linear' },
    ],
  },
]

/**
 * Deterministically derives body silhouette from how clothes fit.
 */
export function deriveBodyShapeFromFit(answers = {}) {
  const upper = answers.upper_fit || 'balanced'
  const lower = answers.lower_fit || 'uniform'

  if (upper === 'top_heavy' && lower === 'loose_hips') return 'inverted_triangle'
  if (upper === 'mid_heavy') return 'apple'
  if (lower === 'bottom_heavy') return 'pear'
  if (lower === 'defined_waist') return 'hourglass'
  if (upper === 'top_heavy') return 'athletic'

  return 'rectangle'
}
