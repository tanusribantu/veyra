import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import React from 'react'
import OutfitLookbookCard from '../components/OutfitLookbookCard'

describe('OutfitLookbookCard Component', () => {
  const mockRecommendationWithAttributes = {
    id: 'rec_test_123',
    occasion: 'casual',
    score: 88,
    items: [
      { id: 'item_1', name: 'White Poplin Shirt', category: 'shirt', slot: 'top', color: 'white' },
      { id: 'item_2', name: 'Navy Chinos', category: 'chinos', slot: 'bottom', color: 'navy' },
      { id: 'item_3', name: 'White Sneakers', category: 'sneakers', slot: 'footwear', color: 'white' },
    ],
    breakdown: {
      color_score: 95,
      occasion_score: 90,
      style_score: 85,
      formality_score: 92,
      preference_score: 80,
      personal_attribute_score: 88,
    },
    reasons: [
      { factor: 'color_compatibility', message: 'Neutral anchor pairing.' },
      { factor: 'occasion_match', message: 'Ideal for relaxed weekend outings.' },
      { factor: 'body_shape_silhouette', message: 'Tends to balance vertical proportion lines.' },
    ],
  }

  const mockRecommendationWithoutAttributes = {
    id: 'rec_test_456',
    occasion: 'work',
    score: 84,
    items: [
      { id: 'item_1', name: 'Oxford Shirt', category: 'shirt', slot: 'top', color: 'white' },
      { id: 'item_2', name: 'Charcoal Trousers', category: 'trousers', slot: 'bottom', color: 'charcoal' },
    ],
    breakdown: {
      color_score: 90,
      occasion_score: 85,
      style_score: 80,
      formality_score: 90,
      preference_score: 75,
      // personal_attribute_score is omitted/skipped
    },
    reasons: [
      { factor: 'color_compatibility', message: 'Classic monochrome balance.' },
    ],
  }

  it('renders the lookbook card with title, score, and items', () => {
    render(<OutfitLookbookCard recommendation={mockRecommendationWithAttributes} index={0} />)

    expect(screen.getByText(/CASUAL EDIT/i)).toBeInTheDocument()
    expect(screen.getByText('White Poplin Shirt')).toBeInTheDocument()
    expect(screen.getByText('Navy Chinos')).toBeInTheDocument()
    expect(screen.getByText('White Sneakers')).toBeInTheDocument()
    expect(screen.getByText('88')).toBeInTheDocument()
  })

  it('supports all feedback actions: Like, Dislike, Save, Skip, Worn', async () => {
    const handleFeedback = vi.fn().mockResolvedValue({})
    render(
      <OutfitLookbookCard
        recommendation={mockRecommendationWithAttributes}
        index={0}
        onFeedback={handleFeedback}
      />
    )

    // Like
    const likeBtn = screen.getByRole('button', { name: /^Like this look$/i })
    await act(async () => {
      fireEvent.click(likeBtn)
    })
    expect(handleFeedback).toHaveBeenCalledWith('rec_test_123', 'like')

    // Dislike
    const dislikeBtn = screen.getByRole('button', { name: /Dislike this look/i })
    await act(async () => {
      fireEvent.click(dislikeBtn)
    })
    expect(handleFeedback).toHaveBeenCalledWith('rec_test_123', 'dislike')

    // Save
    const saveBtn = screen.getByRole('button', { name: /Save this look/i })
    await act(async () => {
      fireEvent.click(saveBtn)
    })
    expect(handleFeedback).toHaveBeenCalledWith('rec_test_123', 'save')

    // Skip
    const skipBtn = screen.getByRole('button', { name: /Skip this look/i })
    await act(async () => {
      fireEvent.click(skipBtn)
    })
    expect(handleFeedback).toHaveBeenCalledWith('rec_test_123', 'skip')

    // Worn
    const wornBtn = screen.getByRole('button', { name: /Mark as worn today/i })
    await act(async () => {
      fireEvent.click(wornBtn)
    })
    expect(handleFeedback).toHaveBeenCalledWith('rec_test_123', 'worn')
  })

  it('shows every score component including personal attribute match when present', () => {
    render(<OutfitLookbookCard recommendation={mockRecommendationWithAttributes} index={0} />)

    const toggleBtn = screen.getByRole('button', { name: /Score Breakdown & Principles/i })
    fireEvent.click(toggleBtn)

    expect(screen.getByText('Color Compatibility')).toBeInTheDocument()
    expect(screen.getByText('Occasion Suitability')).toBeInTheDocument()
    expect(screen.getByText('Style Preference Match')).toBeInTheDocument()
    expect(screen.getByText('Formality Cohesion')).toBeInTheDocument()
    expect(screen.getByText('Micro-Preference Adherence')).toBeInTheDocument()
    expect(screen.getByText('Personal Attribute Match')).toBeInTheDocument()
  })

  it('hides personal attribute match when skipped/missing', () => {
    render(<OutfitLookbookCard recommendation={mockRecommendationWithoutAttributes} index={0} />)

    const toggleBtn = screen.getByRole('button', { name: /Score Breakdown & Principles/i })
    fireEvent.click(toggleBtn)

    expect(screen.getByText('Color Compatibility')).toBeInTheDocument()
    expect(screen.queryByText('Personal Attribute Match')).not.toBeInTheDocument()
  })
})
