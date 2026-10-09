import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import Navbar from '../components/Navbar'

describe('Navbar Component', () => {
  it('renders Veyra wordmark and navigates to cover', () => {
    const handleNavigate = vi.fn()
    render(
      <Navbar
        activeTab="home"
        onNavigate={handleNavigate}
        measurementsMissing={true}
        onOpenMeasurements={() => {}}
      />
    )

    const brandBtn = screen.getByRole('button', { name: /Veyra Home/i })
    expect(brandBtn).toBeInTheDocument()
    fireEvent.click(brandBtn)
    expect(handleNavigate).toHaveBeenCalledWith('home')
  })

  it('displays standard mode when measurements are missing', () => {
    render(
      <Navbar
        activeTab="home"
        onNavigate={() => {}}
        measurementsMissing={true}
        onOpenMeasurements={() => {}}
      />
    )

    expect(screen.getByText('Standard Mode')).toBeInTheDocument()
  })

  it('displays proportions calibrated when measurements are present', () => {
    render(
      <Navbar
        activeTab="home"
        onNavigate={() => {}}
        measurementsMissing={false}
        onOpenMeasurements={() => {}}
      />
    )

    expect(screen.getByText('Proportions Calibrated')).toBeInTheDocument()
  })
})
