import { describe, it, expect, vi, afterEach } from 'vitest'
import { api } from '../services/api'

describe('API Service Error Formatting', () => {
  const originalFetch = global.fetch

  afterEach(() => {
    global.fetch = originalFetch
  })

  it('converts Pydantic extra_forbidden errors into friendly toast messages instead of raw JSON', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      statusText: 'Bad Request',
      json: async () => ({
        error: 'Validation failed',
        details: [
          {
            loc: ['name'],
            msg: 'Extra inputs are not permitted',
            type: 'extra_forbidden',
          },
        ],
      }),
    })

    await expect(api.updateProfile({ name: 'Alexandra' })).rejects.toThrow(
      'Please check the name field'
    )
  })

  it('converts multi-field validation error details into readable friendly messages', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      statusText: 'Bad Request',
      json: async () => ({
        error: 'Validation failed',
        details: [
          {
            loc: ['formality_preference'],
            msg: 'Input should be less than or equal to 5',
            type: 'less_than_equal',
          },
          {
            loc: ['name'],
            msg: 'Extra inputs are not permitted',
            type: 'extra_forbidden',
          },
        ],
      }),
    })

    await expect(api.updateProfile({})).rejects.toThrow(
      'Please check the formality preference field. Please check the name field'
    )
  })
})
