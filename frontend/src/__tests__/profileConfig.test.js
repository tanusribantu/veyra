import { describe, it, expect } from 'vitest'
import {
  SKIN_DEPTH_OPTIONS,
  UNDERTONE_OPTIONS,
  FACE_SHAPE_OPTIONS,
  BODY_SHAPE_OPTIONS,
  STYLING_LANE_OPTIONS,
  FLUID_STYLE_TENDENCIES,
  getBodyShapeOptions,
  getBodyShapeLabel,
  deriveUndertone,
  deriveFaceShape,
  deriveBodyShapeFromFit,
} from '../config/profileConfig'

describe('profileConfig Mappings and Derivation Rules', () => {
  it('contains 8 to 10 skin depth swatches with valid hex codes', () => {
    expect(SKIN_DEPTH_OPTIONS.length).toBeGreaterThanOrEqual(8)
    expect(SKIN_DEPTH_OPTIONS.length).toBeLessThanOrEqual(10)
    SKIN_DEPTH_OPTIONS.forEach((item) => {
      expect(item.id).toBeDefined()
      expect(item.label).toBeDefined()
      expect(item.hex).toMatch(/^#[0-9A-Fa-f]{6}$/)
    })
  })

  it('contains undertones, face shapes, and body shapes configs', () => {
    expect(UNDERTONE_OPTIONS.length).toBeGreaterThanOrEqual(3)
    expect(FACE_SHAPE_OPTIONS.length).toBe(6)
    expect(BODY_SHAPE_OPTIONS.length).toBe(6)
  })

  describe('STYLING_LANE_OPTIONS & Inclusive Configurations', () => {
    it('defines exactly 4 options with "A mix of both" third as an equal option', () => {
      expect(STYLING_LANE_OPTIONS.length).toBe(4)
      expect(STYLING_LANE_OPTIONS.map((o) => o.id)).toEqual([
        'menswear',
        'womenswear',
        'mixed',
        'prefer_not_to_say',
      ])
      expect(STYLING_LANE_OPTIONS[2].label).toBe('A mix of both')
    })

    it('never uses the word "gender" anywhere in labels or descriptions', () => {
      STYLING_LANE_OPTIONS.forEach((opt) => {
        expect(opt.label.toLowerCase()).not.toContain('gender')
        expect(opt.desc.toLowerCase()).not.toContain('gender')
      })
    })

    it('contains neutral fluid style tendencies', () => {
      expect(FLUID_STYLE_TENDENCIES.length).toBe(4)
      const labels = FLUID_STYLE_TENDENCIES.map((t) => t.label.toLowerCase())
      expect(labels).toContain('structured and sharp')
      expect(labels).toContain('relaxed and oversized')
      expect(labels).toContain('soft and flowing')
      expect(labels).toContain('mix of everything')
    })

    it('returns neutral body shape display labels for menswear, mixed, and unspecified lanes', () => {
      // Inverted triangle should be "Broad Shoulders, Tapered Waist"
      expect(getBodyShapeLabel('inverted_triangle', 'menswear')).toBe('Broad Shoulders, Tapered Waist')
      expect(getBodyShapeLabel('inverted_triangle', 'mixed')).toBe('Broad Shoulders, Tapered Waist')
      expect(getBodyShapeLabel('inverted_triangle', 'prefer_not_to_say')).toBe('Broad Shoulders, Tapered Waist')
      expect(getBodyShapeLabel('inverted_triangle', null)).toBe('Broad Shoulders, Tapered Waist')

      // Hourglass should be "Balanced Frame, Defined Waist"
      expect(getBodyShapeLabel('hourglass', 'menswear')).toBe('Balanced Frame, Defined Waist')
      expect(getBodyShapeLabel('hourglass', 'mixed')).toBe('Balanced Frame, Defined Waist')

      // Pear should be "Broader Base, Streamlined Torso"
      expect(getBodyShapeLabel('pear', 'menswear')).toBe('Broader Base, Streamlined Torso')
    })

    it('returns classic labels for womenswear lane', () => {
      expect(getBodyShapeLabel('hourglass', 'womenswear')).toBe('Hourglass')
      expect(getBodyShapeLabel('pear', 'womenswear')).toBe('Pear / Triangle')
      expect(getBodyShapeLabel('inverted_triangle', 'womenswear')).toBe('Inverted Triangle')
    })
  })

  describe('deriveUndertone', () => {
    it('maps green veins + gold jewelry + tans easily deterministically to warm', () => {
      const res = deriveUndertone({
        wrist_veins: 'green',
        jewelry: 'gold',
        sun_reaction: 'tan_easily',
      })
      expect(res).toBe('warm')
    })

    it('maps blue veins + silver jewelry + burns easily deterministically to cool', () => {
      const res = deriveUndertone({
        wrist_veins: 'blue',
        jewelry: 'silver',
        sun_reaction: 'burn_easily',
      })
      expect(res).toBe('cool')
    })

    it('defaults to neutral when answers are not sure or mixed', () => {
      const res = deriveUndertone({
        wrist_veins: 'not_sure',
        jewelry: 'not_sure',
        sun_reaction: 'not_sure',
      })
      expect(res).toBe('neutral')
    })

    it('returns neutral on empty answers', () => {
      expect(deriveUndertone({})).toBe('neutral')
    })
  })

  describe('deriveFaceShape', () => {
    it('derives heart for forehead widest + pointed jaw', () => {
      const res = deriveFaceShape({
        proportions: 'balanced',
        widest_point: 'forehead',
        jawline_shape: 'pointed',
      })
      expect(res).toBe('heart')
    })

    it('derives diamond for cheekbones widest + pointed jaw', () => {
      const res = deriveFaceShape({
        proportions: 'balanced',
        widest_point: 'cheekbones',
        jawline_shape: 'pointed',
      })
      expect(res).toBe('diamond')
    })

    it('derives square for equal dimensions + angular jaw', () => {
      const res = deriveFaceShape({
        proportions: 'equal',
        widest_point: 'equal_width',
        jawline_shape: 'angular',
      })
      expect(res).toBe('square')
    })

    it('derives round for equal dimensions + rounded jaw', () => {
      const res = deriveFaceShape({
        proportions: 'equal',
        widest_point: 'equal_width',
        jawline_shape: 'rounded',
      })
      expect(res).toBe('round')
    })

    it('defaults gracefully to oval', () => {
      expect(deriveFaceShape({})).toBe('oval')
    })
  })

  describe('deriveBodyShapeFromFit', () => {
    it('derives inverted_triangle when shoulders are snug and lower hips are loose', () => {
      const res = deriveBodyShapeFromFit({
        upper_fit: 'top_heavy',
        lower_fit: 'loose_hips',
      })
      expect(res).toBe('inverted_triangle')
    })

    it('derives pear when lower fit is snug at hips', () => {
      const res = deriveBodyShapeFromFit({
        upper_fit: 'balanced',
        lower_fit: 'bottom_heavy',
      })
      expect(res).toBe('pear')
    })

    it('derives apple when upper fit is midsection heavy', () => {
      const res = deriveBodyShapeFromFit({
        upper_fit: 'mid_heavy',
        lower_fit: 'uniform',
      })
      expect(res).toBe('apple')
    })

    it('defaults gracefully to rectangle', () => {
      expect(deriveBodyShapeFromFit({})).toBe('rectangle')
    })
  })
})
