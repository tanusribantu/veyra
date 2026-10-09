import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'
import GarmentSvg from '../components/GarmentSvg'

describe('GarmentSvg Component', () => {
  it('renders top category with custom color tinting', () => {
    const { container } = render(
      <GarmentSvg category="top" slot="top" primaryColor="navy" ariaLabel="Navy Poplin Shirt" />
    )
    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
    expect(svg).toHaveAttribute('aria-label', 'Navy Poplin Shirt')
  })

  it('renders bottom trousers category properly', () => {
    const { container } = render(
      <GarmentSvg category="bottom" slot="bottom" primaryColor="beige" ariaLabel="Beige Chinos" />
    )
    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
    expect(svg).toHaveAttribute('aria-label', 'Beige Chinos')
  })

  it('renders footwear category properly', () => {
    const { container } = render(
      <GarmentSvg category="footwear" slot="footwear" primaryColor="white" ariaLabel="White Sneakers" />
    )
    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
    expect(svg).toHaveAttribute('aria-label', 'White Sneakers')
  })

  it('renders outerwear category properly', () => {
    const { container } = render(
      <GarmentSvg category="outerwear" slot="outerwear" primaryColor="charcoal" ariaLabel="Charcoal Blazer" />
    )
    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
    expect(svg).toHaveAttribute('aria-label', 'Charcoal Blazer')
  })

  it('renders accessories category properly', () => {
    const { container } = render(
      <GarmentSvg category="accessory" slot="accessory" primaryColor="black" ariaLabel="Black Watch" />
    )
    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
    expect(svg).toHaveAttribute('aria-label', 'Black Watch')
  })
})
