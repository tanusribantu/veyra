import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import React from 'react'
import MeasurementsModal from '../components/MeasurementsModal'
import { ToastProvider } from '../components/Toast'
import { api } from '../services/api'

vi.mock('../services/api', () => ({
  api: {
    getMeasurements: vi.fn(),
    saveMeasurements: vi.fn(),
    deleteMeasurements: vi.fn(),
    overrideBodyShape: vi.fn(),
  },
}))

describe('MeasurementsModal Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders modal with privacy guarantee and realistic form inputs when open', async () => {
    api.getMeasurements.mockResolvedValue({ measurements_missing: true })

    render(
      <ToastProvider>
        <MeasurementsModal isOpen={true} onClose={() => {}} />
      </ToastProvider>
    )

    expect(screen.getByRole('heading', { name: /Proportion Intelligence/i })).toBeInTheDocument()
    expect(screen.getByText(/Zero photo uploads/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Height/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Shoulder Breadth/i)).toBeInTheDocument()
  })

  it('does not render dialog when isOpen is false', () => {
    render(
      <ToastProvider>
        <MeasurementsModal isOpen={false} onClose={() => {}} />
      </ToastProvider>
    )
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('switches between cm and inches display units', async () => {
    api.getMeasurements.mockResolvedValue({ measurements_missing: true })

    render(
      <ToastProvider>
        <MeasurementsModal isOpen={true} onClose={() => {}} />
      </ToastProvider>
    )

    const inchBtn = screen.getByRole('button', { name: /Inches \(in\)/i })
    fireEvent.click(inchBtn)

    expect(screen.getByLabelText(/Height \(in\)/i)).toBeInTheDocument()
  })
})
