import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import React from 'react'
import Recommendations from '../pages/Recommendations'
import { ToastProvider } from '../components/Toast'
import { api } from '../services/api'

vi.mock('../services/api', () => ({
  api: {
    generateRecommendations: vi.fn(),
    submitFeedback: vi.fn(),
  },
}))

describe('Recommendations Page Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders exact 6 backend-supported occasions as selectable chips', async () => {
    api.generateRecommendations.mockResolvedValue({
      recommendations: [],
      measurements_missing: false,
    })

    render(
      <ToastProvider>
        <Recommendations onOpenMeasurements={() => {}} />
      </ToastProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('Casual')).toBeInTheDocument()
      expect(screen.getByText('Work')).toBeInTheDocument()
      expect(screen.getByText('Formal')).toBeInTheDocument()
      expect(screen.getByText('College')).toBeInTheDocument()
      expect(screen.getByText('Date Night')).toBeInTheDocument()
      expect(screen.getByText('Party')).toBeInTheDocument()
    })
  })
})
