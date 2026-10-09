import { describe, it, expect } from 'vitest'
import { getGarmentColorTokens } from '../utils/colors'

describe('getGarmentColorTokens utility', () => {
  it('returns valid tokens for recognized fashion colors', () => {
    const navy = getGarmentColorTokens('navy')
    expect(navy).toHaveProperty('fill')
    expect(navy).toHaveProperty('stroke')
    expect(navy.isLight).toBe(false)

    const white = getGarmentColorTokens('white')
    expect(white.isLight).toBe(true)
  })

  it('handles custom hex codes gracefully', () => {
    const custom = getGarmentColorTokens('#3A506B')
    expect(custom.fill).toBe('#3a506b')
  })

  it('provides safe fallback for unknown color values', () => {
    const fallback = getGarmentColorTokens('mystic-nebula')
    expect(fallback).toHaveProperty('fill')
    expect(fallback).toHaveProperty('stroke')
  })
})
