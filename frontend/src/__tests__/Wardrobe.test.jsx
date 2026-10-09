import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import React from 'react'
import Wardrobe from '../pages/Wardrobe'
import { ToastProvider } from '../components/Toast'
import { api } from '../services/api'

vi.mock('../services/api', () => ({
  api: {
    getWardrobe: vi.fn(),
    deleteWardrobeItem: vi.fn(),
    createWardrobeItem: vi.fn(),
    updateWardrobeItem: vi.fn(),
  },
}))

describe('Wardrobe Page Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders garments fetched from archive API', async () => {
    const mockItems = [
      {
        id: 'w_01',
        name: 'Poplin Tailored Shirt',
        category: 'top',
        slot: 'top',
        primary_color: 'white',
        silhouette: 'regular',
        formality: 2,
      },
      {
        id: 'w_02',
        name: 'Pleated Chinos',
        category: 'bottom',
        slot: 'bottom',
        primary_color: 'navy',
        silhouette: 'regular',
        formality: 3,
      },
    ]

    api.getWardrobe.mockResolvedValue(mockItems)

    render(
      <ToastProvider>
        <Wardrobe />
      </ToastProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('Poplin Tailored Shirt')).toBeInTheDocument()
      expect(screen.getByText('Pleated Chinos')).toBeInTheDocument()
    })
  })

  it('renders empty archive state when items list is empty', async () => {
    api.getWardrobe.mockResolvedValue([])

    render(
      <ToastProvider>
        <Wardrobe />
      </ToastProvider>
    )

    await waitFor(() => {
      expect(screen.getByText(/No Garments in this Category/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Add First Garment/i })).toBeInTheDocument()
    })
  })
})
