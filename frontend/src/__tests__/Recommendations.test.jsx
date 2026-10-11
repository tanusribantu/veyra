import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react'
import React from 'react'
import Recommendations from '../pages/Recommendations'
import { ToastProvider } from '../components/Toast'
import { api } from '../services/api'

vi.mock('../services/api', () => ({
  api: {
    generateRecommendations: vi.fn(),
    submitFeedback: vi.fn(),
    getWardrobe: vi.fn(),
    getConstraints: vi.fn(),
    saveConstraint: vi.fn(),
  },
}))

describe('Recommendations Page Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    api.getWardrobe.mockResolvedValue({
      items: [
        { id: 'item_1', name: 'Oxford Shirt', category: 'shirt', slot: 'top', color: 'white' },
        { id: 'item_2', name: 'Navy Chinos', category: 'chinos', slot: 'bottom', color: 'navy' },
      ],
    })
    api.getConstraints.mockResolvedValue({ constraints: [] })
    api.generateRecommendations.mockResolvedValue({
      recommendations: [],
      measurements_missing: false,
    })
  })

  it('renders exact 8 master prompt occasions matching backend values', async () => {
    render(
      <ToastProvider>
        <Recommendations onOpenMeasurements={() => {}} />
      </ToastProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('Casual')).toBeInTheDocument()
      expect(screen.getByText('College')).toBeInTheDocument()
      expect(screen.getByText('Work')).toBeInTheDocument()
      expect(screen.getByText('Smart Casual')).toBeInTheDocument()
      expect(screen.getByText('Party')).toBeInTheDocument()
      expect(screen.getByText('Formal Event')).toBeInTheDocument()
      expect(screen.getByText('Traditional Event')).toBeInTheDocument()
      expect(screen.getByText('Date Night')).toBeInTheDocument()
    })
  })

  it('supports Build My Look step with item inclusions and avoids', async () => {
    render(
      <ToastProvider>
        <Recommendations onOpenMeasurements={() => {}} />
      </ToastProvider>
    )

    expect(screen.getByText('Build My Look')).toBeInTheDocument()

    // Open Build My Look
    const toggleBtn = screen.getByText('Configure Constraints')
    fireEvent.click(toggleBtn)

    await waitFor(() => {
      expect(screen.getByText(/FEATURE WARDROBE ITEMS/i)).toBeInTheDocument()
      expect(screen.getByText(/AVOID STYLING ELEMENTS/i)).toBeInTheDocument()
      expect(screen.getByText('Oxford Shirt')).toBeInTheDocument()
    })

    // Click Oxford Shirt to include
    const shirtBtn = screen.getByText('Oxford Shirt')
    fireEvent.click(shirtBtn)

    // Verify Apply & Generate button sends constraints
    const applyBtn = screen.getByRole('button', { name: /Apply & Generate/i })
    await act(async () => {
      fireEvent.click(applyBtn)
    })

    expect(api.generateRecommendations).toHaveBeenCalledWith(
      expect.objectContaining({
        occasion: 'casual',
        constraints: expect.arrayContaining([
          expect.objectContaining({
            constraint_type: 'must_include',
            target_type: 'item_id',
            target_value: 'item_1',
            strength: 'hard',
          }),
        ]),
      })
    )
  })

  it('displays block explanation when hard constraints cannot be met', async () => {
    api.generateRecommendations.mockResolvedValue({
      recommendations: [],
      measurements_missing: false,
      constraint_blocked: true,
      block_explanation: 'Your requested item cannot form a full outfit while avoiding trousers.',
    })

    render(
      <ToastProvider>
        <Recommendations onOpenMeasurements={() => {}} />
      </ToastProvider>
    )

    await waitFor(() => {
      expect(screen.getByText(/Hard Constraints Cannot Be Satisfied/i)).toBeInTheDocument()
      expect(
        screen.getByText('Your requested item cannot form a full outfit while avoiding trousers.')
      ).toBeInTheDocument()
    })
  })
})
