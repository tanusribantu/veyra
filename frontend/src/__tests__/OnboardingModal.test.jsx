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

  it('renders Step 1 styling lane question first with "A mix of both" third and no gender terminology', () => {
    render(
      <ToastProvider>
        <OnboardingModal isOpen={true} onClose={() => {}} onComplete={() => {}} />
      </ToastProvider>
    )

    // Eyebrow and Question
    expect(screen.getByText(/STEP 1 OF 5/i)).toBeInTheDocument()
    expect(screen.getByText(/Which section do you usually shop from\?/i)).toBeInTheDocument()

    // Strictly no "gender" word
    expect(screen.queryByText(/gender/i)).not.toBeInTheDocument()

    // 4 options present
    const menswearOpt = screen.getByText('Menswear')
    const womenswearOpt = screen.getByText('Womenswear')
    const mixedOpt = screen.getByText('A mix of both')
    const preferNotOpt = screen.getByText('Prefer not to say')

    expect(menswearOpt).toBeInTheDocument()
    expect(womenswearOpt).toBeInTheDocument()
    expect(mixedOpt).toBeInTheDocument()
    expect(preferNotOpt).toBeInTheDocument()

    // Verify ordering: "A mix of both" must be the third option
    const buttons = screen.getAllByRole('button')
    const laneButtons = buttons.filter((b) =>
      ['Menswear', 'Womenswear', 'A mix of both', 'Prefer not to say'].some((opt) => b.textContent.includes(opt))
    )
    expect(laneButtons.length).toBe(4)
    expect(laneButtons[0].textContent).toContain('Menswear')
    expect(laneButtons[1].textContent).toContain('Womenswear')
    expect(laneButtons[2].textContent).toContain('A mix of both')
    expect(laneButtons[3].textContent).toContain('Prefer not to say')
  })

  it('navigates through 5 onboarding steps and preserves privacy guarantees while saving styling_lane', async () => {
    api.updateProfile.mockResolvedValue({})
    api.saveMeasurements.mockResolvedValue({})
    const handleComplete = vi.fn()
    const handleClose = vi.fn()

    render(
      <ToastProvider>
        <OnboardingModal isOpen={true} onClose={handleClose} onComplete={handleComplete} />
      </ToastProvider>
    )

    // Step 1: Select Menswear
    const menswearBtn = screen.getByRole('button', { name: /^Menswear/i })
    fireEvent.click(menswearBtn)

    const nextToFoundationsBtn = screen.getByRole('button', { name: /Continue to Style Foundations/i })
    fireEvent.click(nextToFoundationsBtn)

    // Step 2: Foundations (Name, styles, fluid tendencies, colors, fit, formality)
    expect(screen.getByText(/STEP 2 OF 5/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Your Name/i)).toBeInTheDocument()
    expect(screen.getByText(/Closest to My Style/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Structured and sharp/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Relaxed and oversized/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Soft and flowing/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Mix of everything/i })).toBeInTheDocument()

    // Select fluid tendency
    fireEvent.click(screen.getByRole('button', { name: /Relaxed and oversized/i }))

    fireEvent.change(screen.getByLabelText(/Your Name/i), { target: { value: 'Julian' } })

    const nextToQuizBtn = screen.getByRole('button', { name: /Continue to Style Quiz/i })
    fireEvent.click(nextToQuizBtn)

    // Step 3: Style Archetype Quiz (skippable or answerable)
    expect(screen.getByText(/STEP 3 OF 5/i)).toBeInTheDocument()
    expect(screen.getByText(/Calibrate Your Style Archetype/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Skip Quiz/i })).toBeInTheDocument()

    const skipQuizBtn = screen.getByRole('button', { name: /Skip Quiz/i })
    fireEvent.click(skipQuizBtn)

    // Step 4: Complexion (skippable)
    expect(screen.getByText(/STEP 4 OF 5/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Skip Step/i })).toBeInTheDocument()

    const skipComplexionBtn = screen.getByRole('button', { name: /Skip Step/i })
    fireEvent.click(skipComplexionBtn)

    // Step 5: Proportions (skippable with zero photo uploads guarantee)
    expect(screen.getByText(/STEP 5 OF 5/i)).toBeInTheDocument()
    expect(screen.getByText(/Zero photo uploads/i)).toBeInTheDocument()

    const finishBtn = screen.getByRole('button', { name: /Skip Measurements & Finish/i })
    await act(async () => {
      fireEvent.click(finishBtn)
    })

    expect(api.updateProfile).toHaveBeenCalledWith(
      expect.objectContaining({
        styling_lane: 'menswear',
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
