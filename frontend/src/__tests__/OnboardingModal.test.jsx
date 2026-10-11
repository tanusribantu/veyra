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
    getQuizQuestions: vi.fn(),
    submitQuizAnswers: vi.fn(),
  },
}))

describe('OnboardingModal Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    api.getQuizQuestions.mockResolvedValue({
      questions: [
        {
          id: 'q1',
          scenario: 'Evening Gallery Opening',
          question: 'Which ensemble feels most natural?',
          options: [
            { id: 'q1_a', label: 'Heritage Tailoring', text: 'Charcoal trousers' },
            { id: 'q1_b', label: 'Relaxed Ease', text: 'Chore jacket' },
          ],
        },
      ],
    })
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

    // Step 1: Foundations (Name, styles, colors, fit, formality)
    expect(screen.getByText(/STEP 1 OF 4/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Your Name/i)).toBeInTheDocument()
    expect(screen.getByText(/Favorite Core Colors/i)).toBeInTheDocument()
    expect(screen.getByText(/Avoided \/ Deprioritized Colors/i)).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText(/Your Name/i), { target: { value: 'Julian' } })

    const nextToQuizBtn = screen.getByRole('button', { name: /Continue to Style Quiz/i })
    fireEvent.click(nextToQuizBtn)

    // Step 2: Style Archetype Quiz (skippable or answerable)
    expect(screen.getByText(/STEP 2 OF 4/i)).toBeInTheDocument()
    expect(screen.getByText(/Calibrate Your Style Archetype/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Skip Quiz/i })).toBeInTheDocument()

    const skipQuizBtn = screen.getByRole('button', { name: /Skip Quiz/i })
    fireEvent.click(skipQuizBtn)

    // Step 3: Complexion (skippable)
    expect(screen.getByText(/STEP 3 OF 4/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Skip Step/i })).toBeInTheDocument()

    const skipComplexionBtn = screen.getByRole('button', { name: /Skip Step/i })
    fireEvent.click(skipComplexionBtn)

    // Step 4: Proportions (skippable with zero photo uploads guarantee)
    expect(screen.getByText(/STEP 4 OF 4/i)).toBeInTheDocument()
    expect(screen.getByText(/Zero photo uploads/i)).toBeInTheDocument()

    const finishBtn = screen.getByRole('button', { name: /Skip Measurements & Finish/i })
    await act(async () => {
      fireEvent.click(finishBtn)
    })

    expect(api.updateProfile).toHaveBeenCalledWith(
      expect.objectContaining({
        preferred_styles: expect.any(Array),
      })
    )
    expect(api.updateProfile).not.toHaveBeenCalledWith(
      expect.objectContaining({
        name: expect.anything(),
      })
    )
    expect(localStorage.getItem('veyra_user_name')).toBe('Julian')
    expect(handleComplete).toHaveBeenCalled()
    expect(handleClose).toHaveBeenCalled()
  })
})
