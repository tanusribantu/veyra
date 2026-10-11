import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react'
import React from 'react'
import StyleQuizModal from '../components/StyleQuizModal'
import { ToastProvider } from '../components/Toast'
import { api } from '../services/api'

vi.mock('../services/api', () => ({
  api: {
    getQuizQuestions: vi.fn(),
    submitQuizAnswers: vi.fn(),
  },
}))

describe('StyleQuizModal Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    api.getQuizQuestions.mockResolvedValue({
      questions: [
        {
          id: 'q1',
          scenario: 'Evening Gallery Opening',
          question: 'Which ensemble feels most natural to you?',
          options: [
            { id: 'q1_a', label: 'Heritage Tailoring', text: 'Charcoal tailored trousers' },
            { id: 'q1_b', label: 'Relaxed Ease', text: 'Chore jacket' },
          ],
        },
        {
          id: 'q2',
          scenario: 'Weekend Studio Morning',
          question: 'How do you compose your base layers?',
          options: [
            { id: 'q2_a', label: 'Refined Anchor', text: 'Fine-gauge merino crewneck' },
            { id: 'q2_b', label: 'Utilitarian Comfort', text: 'Heavyweight organic cotton tee' },
          ],
        },
      ],
    })
  })

  it('renders one scenario question per screen with progress indicator', async () => {
    render(
      <ToastProvider>
        <StyleQuizModal isOpen={true} onClose={() => {}} />
      </ToastProvider>
    )

    await waitFor(() => {
      expect(screen.getByText(/SCENARIO 01 OF/i)).toBeInTheDocument()
      expect(screen.getByText('Evening Gallery Opening')).toBeInTheDocument()
      expect(screen.getByText('Heritage Tailoring')).toBeInTheDocument()
    })
  })

  it('selects option, navigates through scenarios, submits answers, and renders 5D archetype result', async () => {
    const mockResult = {
      id: 'quiz_123',
      archetype: 'The Architectural Purist',
      archetype_description: 'Defined by disciplined monochrome palettes and sharp lines.',
      vector: {
        classic_expressive: 0.25,
        comfort_polish: 0.85,
        subtle_bold: 0.15,
        timeless_trend: 0.20,
        structured_relaxed: 0.20,
      },
    }
    api.submitQuizAnswers.mockResolvedValue(mockResult)
    const handleComplete = vi.fn()

    render(
      <ToastProvider>
        <StyleQuizModal isOpen={true} onClose={() => {}} onComplete={handleComplete} />
      </ToastProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('Heritage Tailoring')).toBeInTheDocument()
    })

    // Answer Q1
    const optionA = screen.getByText('Heritage Tailoring')
    fireEvent.click(optionA)

    const nextBtn = screen.getByRole('button', { name: /Next Scenario/i })
    fireEvent.click(nextBtn)

    // Q2 should now be visible
    await waitFor(() => {
      expect(screen.getByText('Weekend Studio Morning')).toBeInTheDocument()
      expect(screen.getByText('Refined Anchor')).toBeInTheDocument()
    })

    // Answer Q2
    const optionB = screen.getByText('Refined Anchor')
    fireEvent.click(optionB)

    // Submit
    const submitBtn = screen.getByRole('button', { name: /Discover Archetype/i })
    await act(async () => {
      fireEvent.click(submitBtn)
    })

    expect(api.submitQuizAnswers).toHaveBeenCalledWith({
      q1: 'q1_a',
      q2: 'q2_a',
    })

    // Result screen
    expect(screen.getByText('The Architectural Purist')).toBeInTheDocument()
    expect(screen.getByText(/Defined by disciplined monochrome palettes/i)).toBeInTheDocument()
    expect(screen.getByText('Classic / Heritage')).toBeInTheDocument()
    expect(screen.getByText('Comfort / Ease')).toBeInTheDocument()
    expect(handleComplete).toHaveBeenCalledWith(mockResult)
  })

  it('allows retaking the quiz from the result view', () => {
    const initialResult = {
      archetype: 'The Relaxed Naturalist',
      archetype_description: 'Earthy ease.',
      vector: {
        classic_expressive: 0.4,
        comfort_polish: 0.3,
        subtle_bold: 0.3,
        timeless_trend: 0.5,
        structured_relaxed: 0.8,
      },
    }

    render(
      <ToastProvider>
        <StyleQuizModal isOpen={true} onClose={() => {}} initialResult={initialResult} />
      </ToastProvider>
    )

    expect(screen.getByText('The Relaxed Naturalist')).toBeInTheDocument()

    const retakeBtn = screen.getByRole('button', { name: /Retake Quiz/i })
    fireEvent.click(retakeBtn)

    // Returns to questions
    expect(screen.getByText(/SCENARIO 01 OF/i)).toBeInTheDocument()
  })

  it('supports selecting None of these feel like me option', async () => {
    api.getQuizQuestions.mockResolvedValue({
      questions: [
        {
          id: 'q1',
          scenario: 'A College Day',
          question: 'What outfit feels most natural?',
          options: [
            { id: 'q1_a', label: 'Crisp Tailored Classics', text: 'Collared shirt' },
            { id: 'q1_e', label: 'None of these feel like me', text: 'None of these feel like me' },
          ],
        },
      ],
    })

    const mockResult = {
      id: 'quiz_none',
      archetype: 'The Effortless Naturalist',
      archetype_description: 'Breathable ease.',
      vector: {
        classic_expressive: 0.5,
        comfort_polish: 0.5,
        subtle_bold: 0.5,
        timeless_trend: 0.5,
        structured_relaxed: 0.5,
      },
    }
    api.submitQuizAnswers.mockResolvedValue(mockResult)

    render(
      <ToastProvider>
        <StyleQuizModal isOpen={true} onClose={() => {}} />
      </ToastProvider>
    )

    await waitFor(() => {
      expect(screen.getAllByText('None of these feel like me')[0]).toBeInTheDocument()
    })

    fireEvent.click(screen.getAllByText('None of these feel like me')[0])

    const submitBtn = screen.getByRole('button', { name: /Discover Archetype/i })
    await act(async () => {
      fireEvent.click(submitBtn)
    })

    expect(api.submitQuizAnswers).toHaveBeenCalledWith({
      q1: 'q1_e',
    })
  })
})
