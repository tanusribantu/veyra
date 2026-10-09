import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import React from 'react'
import WardrobeItemModal from '../components/WardrobeItemModal'
import { ToastProvider } from '../components/Toast'
import { api } from '../services/api'

vi.mock('../services/api', () => ({
  api: {
    createWardrobeItem: vi.fn(),
    updateWardrobeItem: vi.fn(),
  },
}))

describe('WardrobeItemModal Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders required Phase 1.5 styling attribute fields: silhouette, neckline, length, accessory_type', () => {
    render(
      <ToastProvider>
        <WardrobeItemModal isOpen={true} onClose={() => {}} />
      </ToastProvider>
    )

    expect(screen.getByLabelText(/Garment Title/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Silhouette/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Neckline/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Length/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Accessory Type/i)).toBeInTheDocument()
  })

  it('submits form with all attributes to api.createWardrobeItem', async () => {
    api.createWardrobeItem.mockResolvedValue({ id: 'item_999' })
    const handleSaved = vi.fn()
    const handleClose = vi.fn()

    render(
      <ToastProvider>
        <WardrobeItemModal isOpen={true} onClose={handleClose} onItemSaved={handleSaved} />
      </ToastProvider>
    )

    fireEvent.change(screen.getByLabelText(/Garment Title/i), { target: { value: 'Linen Summer Shirt' } })
    fireEvent.change(screen.getByLabelText(/Silhouette/i), { target: { value: 'relaxed' } })
    fireEvent.change(screen.getByLabelText(/Neckline/i), { target: { value: 'collared' } })
    fireEvent.change(screen.getByLabelText(/Length/i), { target: { value: 'regular' } })

    const submitBtn = screen.getByRole('button', { name: /Add to Collection/i })
    await act(async () => {
      fireEvent.click(submitBtn)
    })

    expect(api.createWardrobeItem).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Linen Summer Shirt',
        silhouette: 'relaxed',
        neckline: 'collared',
        length: 'regular',
      })
    )
    expect(handleSaved).toHaveBeenCalled()
    expect(handleClose).toHaveBeenCalled()
  })
})
