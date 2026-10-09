import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import Home from '../pages/Home'

describe('Home Page Component', () => {
  it('renders confident headline and philosophy principles', () => {
    const handleNavigate = vi.fn()
    const handleOpenMeasurements = vi.fn()

    render(
      <Home
        onNavigate={handleNavigate}
        onOpenMeasurements={handleOpenMeasurements}
        measurementsMissing={true}
      />
    )

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/Style, Understood/i)
    expect(screen.getByText(/Personal, Not Universal/i)).toBeInTheDocument()
    expect(screen.getByText(/Explainable, Not Mysterious/i)).toBeInTheDocument()
    expect(screen.getByText(/Private & Proportion-Aware/i)).toBeInTheDocument()
  })

  it('triggers navigation to studio when Enter Styling Studio is clicked', () => {
    const handleNavigate = vi.fn()
    render(
      <Home
        onNavigate={handleNavigate}
        onOpenMeasurements={() => {}}
        measurementsMissing={false}
      />
    )

    const studioBtn = screen.getByRole('button', { name: /Enter Styling Studio/i })
    fireEvent.click(studioBtn)
    expect(handleNavigate).toHaveBeenCalledWith('recommendations')
  })
})
