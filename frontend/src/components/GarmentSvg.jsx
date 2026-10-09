import React from 'react'
import { getGarmentColorTokens } from '../utils/colors'

/**
 * GarmentSvg — Refined, category-specific offline SVG illustrations
 * Tinted dynamically using the garment's primary color with tailored architectural line work.
 */
export default function GarmentSvg({
  category = 'top',
  slot = 'top',
  primaryColor = 'navy',
  silhouette = 'regular',
  className = '',
  size = 180,
  ariaLabel,
}) {
  const colors = getGarmentColorTokens(primaryColor)
  const resolvedCategory = String(category || slot || 'top').toLowerCase()

  // Base stroke styling
  const strokeColor = colors.stroke
  const fillColor = colors.fill
  const accentColor = colors.accent
  const detailColor = colors.isLight ? 'rgba(28, 27, 25, 0.45)' : 'rgba(255, 255, 255, 0.45)'
  const stitchColor = colors.isLight ? 'rgba(28, 27, 25, 0.25)' : 'rgba(255, 255, 255, 0.25)'

  const title = ariaLabel || `${primaryColor} ${resolvedCategory}`

  // TOP: Tailored Oxford / T-Shirt / Blouse
  if (resolvedCategory === 'top' || resolvedCategory === 'shirt' || resolvedCategory === 't-shirt') {
    return (
      <svg
        viewBox="0 0 200 220"
        width={size}
        height={size * 1.1}
        className={className}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label={title}
      >
        <title>{title}</title>
        <defs>
          <linearGradient id={`top-grad-${primaryColor}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={accentColor} />
            <stop offset="100%" stopColor={fillColor} />
          </linearGradient>
        </defs>

        {/* Garment Body & Sleeves */}
        <path
          d="M 68 32 
             C 80 40 120 40 132 32 
             L 182 58 
             L 165 92 
             L 142 82 
             L 142 195 
             C 142 198 138 200 134 200 
             L 66 200 
             C 62 200 58 198 58 195 
             L 58 82 
             L 35 92 
             L 18 58 
             Z"
          fill={`url(#top-grad-${primaryColor})`}
          stroke={strokeColor}
          strokeWidth="1.5"
          strokeLinejoin="round"
        />

        {/* Folded Collar Structure */}
        <path
          d="M 68 32 L 88 56 L 100 48 L 112 56 L 132 32 C 122 36 78 36 68 32 Z"
          fill={accentColor}
          stroke={strokeColor}
          strokeWidth="1.5"
          strokeLinejoin="round"
        />

        {/* Center Placket Line */}
        <line x1="100" y1="48" x2="100" y2="198" stroke={detailColor} strokeWidth="1.2" />

        {/* Delicate Placket Buttons */}
        <circle cx="100" cy="74" r="1.8" fill={detailColor} />
        <circle cx="100" cy="102" r="1.8" fill={detailColor} />
        <circle cx="100" cy="130" r="1.8" fill={detailColor} />
        <circle cx="100" cy="158" r="1.8" fill={detailColor} />

        {/* Subtle Breast Pocket */}
        <path
          d="M 112 85 L 128 85 L 128 102 L 120 108 L 112 102 Z"
          fill="none"
          stroke={stitchColor}
          strokeWidth="1"
          strokeDasharray="2 1.5"
        />

        {/* Sleeve Cuff Stitches */}
        <line x1="165" y1="92" x2="142" y2="82" stroke={stitchColor} strokeWidth="1" strokeDasharray="2 1.5" />
        <line x1="35" y1="92" x2="18" y2="58" stroke={stitchColor} strokeWidth="1" strokeDasharray="2 1.5" />

        {/* Bottom Hem Seam */}
        <line x1="60" y1="192" x2="140" y2="192" stroke={stitchColor} strokeWidth="1" strokeDasharray="2 1.5" />
      </svg>
    )
  }

  // BOTTOM: Tailored Chinos / Denim / Pleated Trousers
  if (
    resolvedCategory === 'bottom' ||
    resolvedCategory === 'pants' ||
    resolvedCategory === 'trousers' ||
    resolvedCategory === 'jeans' ||
    resolvedCategory === 'chinos' ||
    resolvedCategory === 'skirt'
  ) {
    return (
      <svg
        viewBox="0 0 200 230"
        width={size}
        height={size * 1.15}
        className={className}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label={title}
      >
        <title>{title}</title>
        <defs>
          <linearGradient id={`bottom-grad-${primaryColor}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={accentColor} />
            <stop offset="100%" stopColor={fillColor} />
          </linearGradient>
        </defs>

        {/* Trousers Silhouette */}
        <path
          d="M 52 28 
             L 148 28 
             L 144 54 
             L 138 214 
             L 108 214 
             L 100 96 
             L 92 214 
             L 62 214 
             L 56 54 
             Z"
          fill={`url(#bottom-grad-${primaryColor})`}
          stroke={strokeColor}
          strokeWidth="1.5"
          strokeLinejoin="round"
        />

        {/* Tailored Waistband */}
        <path d="M 52 28 L 148 28 L 147 42 L 53 42 Z" fill={accentColor} stroke={strokeColor} strokeWidth="1.2" />

        {/* Belt Loops */}
        <line x1="66" y1="28" x2="66" y2="42" stroke={detailColor} strokeWidth="1.5" />
        <line x1="100" y1="28" x2="100" y2="42" stroke={detailColor} strokeWidth="1.5" />
        <line x1="134" y1="28" x2="134" y2="42" stroke={detailColor} strokeWidth="1.5" />

        {/* Trouser Fly */}
        <path d="M 100 42 L 100 78 C 96 78 92 74 92 68" stroke={detailColor} strokeWidth="1.2" fill="none" />

        {/* Slant Side Pockets */}
        <line x1="57" y1="48" x2="72" y2="76" stroke={stitchColor} strokeWidth="1" strokeDasharray="2 1.5" />
        <line x1="143" y1="48" x2="128" y2="76" stroke={stitchColor} strokeWidth="1" strokeDasharray="2 1.5" />

        {/* Sharp Sartorial Creases */}
        <line x1="77" y1="78" x2="80" y2="208" stroke={stitchColor} strokeWidth="0.8" />
        <line x1="123" y1="78" x2="120" y2="208" stroke={stitchColor} strokeWidth="0.8" />

        {/* Hem Cuffs */}
        <line x1="62" y1="206" x2="92" y2="206" stroke={stitchColor} strokeWidth="1" strokeDasharray="2 1.5" />
        <line x1="108" y1="206" x2="138" y2="206" stroke={stitchColor} strokeWidth="1" strokeDasharray="2 1.5" />
      </svg>
    )
  }

  // FOOTWEAR: Minimalist Leather Sneakers / Loafers / Derbies
  if (
    resolvedCategory === 'footwear' ||
    resolvedCategory === 'shoes' ||
    resolvedCategory === 'sneakers' ||
    resolvedCategory === 'loafers' ||
    resolvedCategory === 'boots'
  ) {
    return (
      <svg
        viewBox="0 0 200 170"
        width={size}
        height={size * 0.85}
        className={className}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label={title}
      >
        <title>{title}</title>
        <defs>
          <linearGradient id={`shoe-grad-${primaryColor}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={accentColor} />
            <stop offset="100%" stopColor={fillColor} />
          </linearGradient>
        </defs>

        {/* Sole Base */}
        <path
          d="M 24 130 
             C 24 130 55 132 100 132 
             C 145 132 176 130 176 130 
             L 174 144 
             C 174 146 166 148 100 148 
             C 34 148 26 146 26 144 
             Z"
          fill="#FAF8F5"
          stroke={strokeColor}
          strokeWidth="1.4"
        />

        {/* Shoe Upper Profile */}
        <path
          d="M 28 130 
             C 26 100 32 78 54 74 
             C 66 72 74 84 88 88 
             C 114 96 148 104 172 118 
             C 176 120 176 126 174 130 
             Z"
          fill={`url(#shoe-grad-${primaryColor})`}
          stroke={strokeColor}
          strokeWidth="1.5"
          strokeLinejoin="round"
        />

        {/* Heel Collar Padding */}
        <path d="M 44 76 C 50 68 62 68 70 76" stroke={strokeColor} strokeWidth="1.2" fill="none" />

        {/* Lacing Eyestay Panel */}
        <path
          d="M 76 80 L 118 96 L 114 104 L 72 88 Z"
          fill={accentColor}
          stroke={stitchColor}
          strokeWidth="1"
          strokeDasharray="2 1.5"
        />

        {/* Eyelet Dots & Minimal Laces */}
        <circle cx="82" cy="85" r="1.5" fill={detailColor} />
        <circle cx="94" cy="90" r="1.5" fill={detailColor} />
        <circle cx="106" cy="95" r="1.5" fill={detailColor} />
        <line x1="82" y1="85" x2="90" y2="82" stroke={detailColor} strokeWidth="1.2" />
        <line x1="94" y1="90" x2="102" y2="87" stroke={detailColor} strokeWidth="1.2" />

        {/* Toe Cap Seam */}
        <path d="M 148 106 C 158 114 164 122 168 128" stroke={stitchColor} strokeWidth="1" strokeDasharray="2 1.5" />
      </svg>
    )
  }

  // OUTERWEAR: Structured Blazer / Overcoat / Trench
  if (
    resolvedCategory === 'outerwear' ||
    resolvedCategory === 'blazer' ||
    resolvedCategory === 'jacket' ||
    resolvedCategory === 'coat'
  ) {
    return (
      <svg
        viewBox="0 0 200 230"
        width={size}
        height={size * 1.15}
        className={className}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label={title}
      >
        <title>{title}</title>
        <defs>
          <linearGradient id={`outer-grad-${primaryColor}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={accentColor} />
            <stop offset="100%" stopColor={fillColor} />
          </linearGradient>
        </defs>

        {/* Structured Body Silhouette */}
        <path
          d="M 64 26 
             L 136 26 
             L 186 64 
             L 168 118 
             L 146 106 
             L 146 208 
             L 54 208 
             L 54 106 
             L 32 118 
             L 14 64 
             Z"
          fill={`url(#outer-grad-${primaryColor})`}
          stroke={strokeColor}
          strokeWidth="1.5"
          strokeLinejoin="round"
        />

        {/* Tailored Lapels (Notch Lapel) */}
        <path
          d="M 78 26 L 68 84 L 92 108 L 100 26 L 108 108 L 132 84 L 122 26 Z"
          fill={accentColor}
          stroke={strokeColor}
          strokeWidth="1.3"
        />

        {/* Center Closure Line */}
        <line x1="100" y1="108" x2="100" y2="208" stroke={detailColor} strokeWidth="1.2" />

        {/* Horn Buttons */}
        <circle cx="106" cy="126" r="2.2" fill={detailColor} />
        <circle cx="106" cy="154" r="2.2" fill={detailColor} />

        {/* Welt Flap Pockets */}
        <line x1="60" y1="146" x2="84" y2="146" stroke={strokeColor} strokeWidth="1.5" />
        <line x1="116" y1="146" x2="140" y2="146" stroke={strokeColor} strokeWidth="1.5" />

        {/* Chest Welt Pocket */}
        <line x1="68" y1="92" x2="84" y2="92" stroke={detailColor} strokeWidth="1.2" />

        {/* Sleeve Cuffs */}
        <line x1="168" y1="118" x2="146" y2="106" stroke={stitchColor} strokeWidth="1" strokeDasharray="2 1.5" />
        <line x1="32" y1="118" x2="54" y2="106" stroke={stitchColor} strokeWidth="1" strokeDasharray="2 1.5" />
      </svg>
    )
  }

  // ACCESSORIES: Minimalist Watch / Scarf / Leather Goods
  return (
    <svg
      viewBox="0 0 200 180"
      width={size}
      height={size * 0.9}
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={title}
    >
      <title>{title}</title>
      <defs>
        <linearGradient id={`acc-grad-${primaryColor}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={accentColor} />
          <stop offset="100%" stopColor={fillColor} />
        </linearGradient>
      </defs>

      {/* Modern Minimalist Timepiece */}
      {/* Upper Strap */}
      <rect
        x="88"
        y="18"
        width="24"
        height="46"
        rx="2"
        fill={`url(#acc-grad-${primaryColor})`}
        stroke={strokeColor}
        strokeWidth="1.2"
      />
      {/* Lower Strap */}
      <rect
        x="88"
        y="116"
        width="24"
        height="46"
        rx="2"
        fill={`url(#acc-grad-${primaryColor})`}
        stroke={strokeColor}
        strokeWidth="1.2"
      />

      {/* Watch Case */}
      <circle cx="100" cy="90" r="32" fill="#FAF8F5" stroke={strokeColor} strokeWidth="1.8" />
      {/* Inner Dial Ring */}
      <circle cx="100" cy="90" r="27" fill={accentColor} stroke={stitchColor} strokeWidth="0.8" />

      {/* Minimal Watch Hands */}
      <line x1="100" y1="90" x2="100" y2="72" stroke={detailColor} strokeWidth="1.4" strokeLinecap="round" />
      <line x1="100" y1="90" x2="114" y2="90" stroke={detailColor} strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="100" cy="90" r="1.5" fill={detailColor} />

      {/* Hour Indices */}
      <circle cx="100" cy="68" r="0.8" fill={detailColor} />
      <circle cx="122" cy="90" r="0.8" fill={detailColor} />
      <circle cx="100" cy="112" r="0.8" fill={detailColor} />
      <circle cx="78" cy="90" r="0.8" fill={detailColor} />
    </svg>
  )
}
