import React, { useState, useEffect } from 'react'
import { ArrowRight, Compass, Shield, Sparkles, SlidersHorizontal } from 'lucide-react'
import GarmentSvg from '../components/GarmentSvg'

const HERO_LOOKS = [
  {
    title: 'The Sartorial Minimalist',
    occasion: 'Smart Casual &bull; Autumn/Winter',
    score: 94,
    harmonyNote: 'Neutral anchor pairing: High-contrast crisp white balanced with deep midnight navy.',
    top: { category: 'top', slot: 'top', color: 'white', name: 'Poplin Button-Down' },
    bottom: { category: 'bottom', slot: 'bottom', color: 'navy', name: 'Pleated Chinos' },
    shoes: { category: 'footwear', slot: 'footwear', color: 'white', name: 'Leather Low-Top' },
    accessory: { category: 'accessory', slot: 'accessory', color: 'charcoal', name: 'Minimal Chronograph' },
  },
  {
    title: 'The Earth-Toned Atelier',
    occasion: 'Creative Studio &bull; Day',
    score: 91,
    harmonyNote: 'Analogous warmth: Muted olive anchored with rich camel and warm sand tones.',
    top: { category: 'top', slot: 'top', color: 'olive', name: 'Tailored Overshirt' },
    bottom: { category: 'bottom', slot: 'bottom', color: 'camel', name: 'Structured Trousers' },
    shoes: { category: 'footwear', slot: 'footwear', color: 'black', name: 'Penny Loafers' },
    accessory: { category: 'accessory', slot: 'accessory', color: 'gold', name: 'Brushed Brass Accent' },
  },
  {
    title: 'The Monochromatic Evening',
    occasion: 'Cocktail &bull; Sartorial',
    score: 96,
    harmonyNote: 'Tonal layering: Rich charcoal over obsidian black for deliberate depth.',
    top: { category: 'outerwear', slot: 'outerwear', color: 'charcoal', name: 'Tailored Wool Blazer' },
    bottom: { category: 'bottom', slot: 'bottom', color: 'black', name: 'Sartorial Slacks' },
    shoes: { category: 'footwear', slot: 'footwear', color: 'black', name: 'Polished Oxfords' },
    accessory: { category: 'accessory', slot: 'accessory', color: 'silver', name: 'Silver Signet' },
  },
]

export default function Home({
  onNavigate,
  onOpenMeasurements,
  onOpenAuth,
  isAuthenticated = true,
  measurementsMissing,
}) {
  const [activeLookIndex, setActiveLookIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveLookIndex((prev) => (prev + 1) % HERO_LOOKS.length)
    }, 5500)
    return () => clearInterval(timer)
  }, [])

  const currentLook = HERO_LOOKS[activeLookIndex]

  return (
    <div className="home-editorial-page">
      {/* Editorial Cover / Hero Section */}
      <section className="hero-editorial-section">
        <div className="container hero-editorial-grid">
          {/* Left Column: Confident Editorial Typography */}
          <div className="hero-text-column animate-fade-in-up">
            <div className="hero-edition-badge">
              <span className="editorial-label">VOL. 01 &bull; DIGITAL ATELIER</span>
              <div className="edition-divider" />
            </div>

            <h1 className="hero-headline">
              Style, Understood <br />
              <em className="hero-headline-italic">from Within.</em>
            </h1>

            <p className="hero-description">
              A private styling studio designed like an editorial journal. Veyra pairs the clothes you already cherish into cohesive compositions—evaluating color warmth, silhouette balance, and personal occasion demands with complete mathematical clarity.
            </p>

            <div className="hero-cta-group">
              {isAuthenticated ? (
                <>
                  <button
                    type="button"
                    onClick={() => onNavigate('recommendations')}
                    className="btn-editorial-primary"
                  >
                    <span>Enter Styling Studio</span>
                    <ArrowRight size={16} />
                  </button>

                  <button
                    type="button"
                    onClick={() => onNavigate('wardrobe')}
                    className="btn-editorial-secondary"
                  >
                    <span>Open Wardrobe</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => onOpenAuth && onOpenAuth('signup')}
                    className="btn-editorial-primary"
                  >
                    <span>Create Account</span>
                    <ArrowRight size={16} />
                  </button>

                  <button
                    type="button"
                    onClick={() => onOpenAuth && onOpenAuth('login')}
                    className="btn-editorial-secondary"
                  >
                    <span>Log In</span>
                  </button>
                </>
              )}
            </div>

            {/* Sub-note on privacy & proportion calibration */}
            <div className="hero-privacy-note">
              {isAuthenticated ? (
                <button
                  type="button"
                  onClick={onOpenMeasurements}
                  className="privacy-trigger-link"
                >
                  <SlidersHorizontal size={14} className="privacy-icon" />
                  <span>
                    {measurementsMissing
                      ? 'Proportions uncalibrated — Tap to configure geometric silhouette matching'
                      : 'Proportions calibrated — Deterministic ratios active in styling engine'}
                  </span>
                </button>
              ) : (
                <div
                  className="editorial-privacy-callout"
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.65rem',
                    padding: '0.75rem 0.9rem',
                    background: 'var(--surface-muted, rgba(0,0,0,0.02))',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '0.78rem',
                    color: 'var(--text-muted)',
                    lineHeight: '1.45',
                    marginTop: '0.5rem',
                  }}
                >
                  <Shield size={16} style={{ flexShrink: 0, marginTop: '2px', color: 'var(--accent)' }} />
                  <div>
                    <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '2px' }}>
                      Private &amp; Photo-Free
                    </strong>
                    <span>
                      We store your wardrobe item details, style preferences, and proportion ratios. Photos and camera access are never required. Data is scoped strictly to your account.
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Animated Flat-Lay Outfit Showcase */}
          <div className="hero-visual-column">
            <div className="hero-lookbook-frame">
              {/* Frame Top Header */}
              <div className="frame-top-bar">
                <div className="frame-look-meta">
                  <span className="eyebrow" style={{ fontSize: '0.65rem' }}>STUDIO COMPOSITION</span>
                  <h4 className="frame-look-title">{currentLook.title}</h4>
                  <span
                    className="frame-look-occasion"
                    dangerouslySetInnerHTML={{ __html: currentLook.occasion }}
                  />
                </div>
                <div className="frame-score-pill">
                  <span className="score-num">{currentLook.score}%</span>
                  <span className="score-sub">HARMONY</span>
                </div>
              </div>

              {/* Composed SVG Flat-Lay Demonstration */}
              <div className="frame-flatlay-stage">
                <div className="stage-garment-stack">
                  <div className="stage-item stage-top">
                    <GarmentSvg
                      category={currentLook.top.category}
                      slot={currentLook.top.slot}
                      primaryColor={currentLook.top.color}
                      size={170}
                    />
                    <span className="stage-caption">{currentLook.top.name}</span>
                  </div>

                  <div className="stage-item stage-bottom">
                    <GarmentSvg
                      category={currentLook.bottom.category}
                      slot={currentLook.bottom.slot}
                      primaryColor={currentLook.bottom.color}
                      size={165}
                    />
                    <span className="stage-caption">{currentLook.bottom.name}</span>
                  </div>
                </div>

                <div className="stage-accessories-stack">
                  <div className="stage-item stage-shoes">
                    <GarmentSvg
                      category="footwear"
                      slot="footwear"
                      primaryColor={currentLook.shoes.color}
                      size={120}
                    />
                    <span className="stage-caption">{currentLook.shoes.name}</span>
                  </div>

                  <div className="stage-item stage-acc">
                    <GarmentSvg
                      category={currentLook.accessory.category}
                      slot={currentLook.accessory.slot}
                      primaryColor={currentLook.accessory.color}
                      size={95}
                    />
                    <span className="stage-caption">{currentLook.accessory.name}</span>
                  </div>
                </div>
              </div>

              {/* Harmony Explanation Footer */}
              <div className="frame-harmony-footer">
                <span className="eyebrow" style={{ fontSize: '0.65rem' }}>COLOR & PROPORTION RATIONALE</span>
                <p className="frame-harmony-note">{currentLook.harmonyNote}</p>
              </div>

              {/* Look Selector Pills */}
              <div className="frame-tabs-row">
                {HERO_LOOKS.map((look, idx) => (
                  <button
                    key={look.title}
                    type="button"
                    onClick={() => setActiveLookIndex(idx)}
                    className={`frame-tab-pill ${activeLookIndex === idx ? 'active' : ''}`}
                  >
                    <span>{`LOOK 0${idx + 1}`}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Editorial Philosophy Section */}
      <section className="philosophy-section">
        <div className="container">
          <div className="philosophy-header">
            <span className="eyebrow">THE FOUNDATIONAL PRINCIPLES</span>
            <h2 className="section-title">An Atelier Built on Transparency</h2>
            <p className="section-subtitle">
              We reject black-box algorithms that push fast fashion trends. Veyra was built upon three uncompromised promises.
            </p>
          </div>

          <div className="philosophy-grid">
            <div className="philosophy-card editorial-card">
              <div className="philosophy-number">01</div>
              <Compass size={24} className="philosophy-icon" />
              <h3>Personal, Not Universal</h3>
              <p>
                True elegance is deeply individual. Recommendations reflect your authentic proportions, color warmth, and personal lifestyle—never impersonal runway mandates.
              </p>
            </div>

            <div className="philosophy-card editorial-card">
              <div className="philosophy-number">02</div>
              <Sparkles size={24} className="philosophy-icon" />
              <h3>Explainable, Not Mysterious</h3>
              <p>
                Every score is completely decomposed: neutral color anchors, formality cohesion, and silhouette lines are laid bare so you understand why your outfit works.
              </p>
            </div>

            <div className="philosophy-card editorial-card">
              <div className="philosophy-number">03</div>
              <Shield size={24} className="philosophy-icon" />
              <h3>Private & Proportion-Aware</h3>
              <p>
                Zero photo uploads or cloud biometrics. We evaluate deterministic geometric ratios locally, with complete one-click permanent deletion rights.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Studio Callout */}
      <section className="studio-callout-section">
        <div className="container studio-callout-inner">
          <div className="callout-text">
            <span className="eyebrow">READY TO DRESS</span>
            <h2>Experience Today’s Studio Edit</h2>
            <p>
              Select an occasion and watch Veyra assemble your existing wardrobe into lookbook compositions.
            </p>
          </div>
          <div className="callout-actions">
            <button
              type="button"
              onClick={() => {
                if (isAuthenticated) {
                  onNavigate('recommendations')
                } else if (onOpenAuth) {
                  onOpenAuth('signup')
                }
              }}
              className="btn-editorial-primary"
            >
              <span>{isAuthenticated ? 'Generate Outfits Now' : 'Join Veyra Atelier'}</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
