import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import React from 'react'
import OnboardingModal from '../components/OnboardingModal'
import { ToastProvider } from '../components/Toast'
import { api } from '../services/api'

vi.mock('../services/api', () => ({
  api: {
    updateProfile: vi.fn(),
    saveMeasurements: vi.fn(),
  },
}))

describe('OnboardingModal Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('navigates through onboarding steps and preserves privacy guarantees', async () => {
    api.updateProfile.mockResolvedValue({})
    api.saveMeasurements.mockResolvedValue({})
    const handleComplete = vi.fn()
    const handleClose = vi.fn()

    render(
      <ToastProvider>
        <OnboardingModal isOpen={true} onClose={handleClose} onComplete={handleComplete} />
      </ToastProvider>
    )

    // Step 1: Foundations
    expect(screen.getByText(/STEP 1 OF 4/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Your Name/i)).toBeInTheDocument()
    fireEvent.change(screen.getByLabelText(/Your Name/i), { target: { value: 'Julian' } })

    const nextToColorBtn = screen.getByRole('button', { name: /Continue to Color Palette/i })
    fireEvent.click(nextToColorBtn)

    // Step 2: Colors
    expect(screen.getByText(/STEP 2 OF 4/i)).toBeInTheDocument()
    expect(screen.getByText(/Favorite Core Colors/i)).toBeInTheDocument()

    const nextToComplexionBtn = screen.getByRole('button', { name: /Next: Complexion & Features/i })
    fireEvent.click(nextToComplexionBtn)

    // Step 3: Complexion (skippable)
    expect(screen.getByText(/STEP 3 OF 4/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Skip Step/i })).toBeInTheDocument()

    const skipComplexionBtn = screen.getByRole('button', { name: /Skip Step/i })
    fireEvent.click(skipComplexionBtn)

    // Step 4: Proportions (skippable)
    expect(screen.getByText(/STEP 4 OF 4/i)).toBeInTheDocument()
    expect(screen.getByText(/Zero photo uploads/i)).toBeInTheDocument()

    const finishBtn = screen.getByRole('button', { name: /Skip Measurements & Finish/i })
    await act(async () => {
      fireEvent.click(finishBtn)
    })

    expect(api.updateProfile).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Julian',
      })
    )
    expect(handleComplete).toHaveBeenCalled()
    expect(handleClose).toHaveBeenCalled()
  })
})
