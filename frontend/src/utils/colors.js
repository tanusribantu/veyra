/**
 * Color mapper for editorial garment visualization.
 * Maps fashion color descriptors and hex codes to refined, calibrated HSL/hex palettes.
 */

const FASHION_PALETTE = {
  white: { bg: '#F8F7F4', fill: '#FFFFFF', stroke: '#DDD8CE', accent: '#EDE8DF', isLight: true },
  black: { bg: '#252422', fill: '#1E1D1B', stroke: '#141312', accent: '#383633', isLight: false },
  charcoal: { bg: '#363839', fill: '#2B2D2F', stroke: '#1F2022', accent: '#46494B', isLight: false },
  navy: { bg: '#1E293B', fill: '#15202E', stroke: '#0F172A', accent: '#27384E', isLight: false },
  blue: { bg: '#4A6984', fill: '#3E5C77', stroke: '#2A435B', accent: '#5B7C9C', isLight: false },
  'light-blue': { bg: '#E2E8F0', fill: '#D5DFEB', stroke: '#B2C4D8', accent: '#EDF2F7', isLight: true },
  beige: { bg: '#EBE5D8', fill: '#E3DC run', stroke: '#D0C7B5', accent: '#F2EDE2', isLight: true },
  camel: { bg: '#C49D6B', fill: '#B58E5C', stroke: '#9A7443', accent: '#D6AF7E', isLight: false },
  cream: { bg: '#F9F7F1', fill: '#F5F2E8', stroke: '#DDD7C7', accent: '#FCFAF5', isLight: true },
  tan: { bg: '#CEB293', fill: '#BE9F7E', stroke: '#A68664', accent: '#DFC6AD', isLight: true },
  khaki: { bg: '#BDB395', fill: '#AEA383', stroke: '#948968', accent: '#CDC4A9', isLight: true },
  olive: { bg: '#5D6B50', fill: '#4E5C41', stroke: '#3C4931', accent: '#6E7D61', isLight: false },
  'forest-green': { bg: '#334839', fill: '#273A2D', stroke: '#1B291F', accent: '#425A49', isLight: false },
  sage: { bg: '#B3BEAE', fill: '#A2B09C', stroke: '#889881', accent: '#C8D2C3', isLight: true },
  grey: { bg: '#9E9C98', fill: '#8D8A85', stroke: '#73706B', accent: '#B3B0AB', isLight: true },
  gray: { bg: '#9E9C98', fill: '#8D8A85', stroke: '#73706B', accent: '#B3B0AB', isLight: true },
  burgundy: { bg: '#5E2B38', fill: '#4C1F2B', stroke: '#3B151F', accent: '#783A4A', isLight: false },
  terracotta: { bg: '#B86548', fill: '#A55437', stroke: '#8E4327', accent: '#CC7B5F', isLight: false },
  brown: { bg: '#5C4434', fill: '#4C3729', stroke: '#3A291D', accent: '#735743', isLight: false },
  denim: { bg: '#43586C', fill: '#364757', stroke: '#273441', accent: '#556D85', isLight: false },
  sand: { bg: '#E4DDD0', fill: '#D8CFBF', stroke: '#C1B6A3', accent: '#EEE8DC', isLight: true },
  silver: { bg: '#E5E7EB', fill: '#D9DCE1', stroke: '#B6BBC4', accent: '#F3F4F6', isLight: true },
  gold: { bg: '#D4AF37', fill: '#C59E27', stroke: '#A68218', accent: '#E4C358', isLight: false },
}

export function getGarmentColorTokens(colorName) {
  if (!colorName) {
    return {
      fill: '#E8E3DA',
      stroke: '#C8C1B3',
      accent: '#F3EFEA',
      shadow: 'rgba(28, 27, 25, 0.08)',
      isLight: true,
    }
  }

  const normalized = String(colorName).trim().toLowerCase().replace(/\s+/g, '-')
  if (FASHION_PALETTE[normalized]) {
    const p = FASHION_PALETTE[normalized]
    return {
      fill: p.fill,
      stroke: p.stroke,
      accent: p.accent,
      shadow: p.isLight ? 'rgba(28, 27, 25, 0.07)' : 'rgba(0, 0, 0, 0.25)',
      isLight: p.isLight,
    }
  }

  // If it's a raw hex code:
  if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(normalized)) {
    return {
      fill: normalized,
      stroke: '#1C1B19',
      accent: normalized,
      shadow: 'rgba(0,0,0,0.15)',
      isLight: false,
    }
  }

  // Fallback for unknown color string
  return {
    fill: '#D8D2C5',
    stroke: '#B8B0A0',
    accent: '#ECE7DD',
    shadow: 'rgba(28, 27, 25, 0.08)',
    isLight: true,
  }
}
