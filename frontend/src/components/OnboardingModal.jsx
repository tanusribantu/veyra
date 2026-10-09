import React, { useState } from 'react'
import { X, Lock, ArrowRight, ArrowLeft, Check, Sparkles, ShieldCheck } from 'lucide-react'
import { api } from '../services/api'
import { useToast } from './Toast'

const STYLE_OPTIONS = [
  { id: 'minimal', label: 'Minimalist' },
  { id: 'classic', label: 'Classic / Tailored' },
  { id: 'smart_casual', label: 'Smart Casual' },
  { id: 'casual', label: 'Casual Ease' },
  { id: 'streetwear', label: 'Streetwear' },
  { id: 'formal', label: 'Formal / Black Tie' },
  { id: 'preppy', label: 'Preppy / Ivy' },
]

const COLOR_OPTIONS = [
  'navy',
  'white',
  'black',
  'charcoal',
  'beige',
  'camel',
  'cream',
  'olive',
  'burgundy',
  'grey',
  'terracotta',
  'denim',
  'forest-green',
  'tan',
]

const UNDERTONES = [
  { id: 'warm', label: 'Warm (Golden / Peachy)' },
  { id: 'cool', label: 'Cool (Pink / Rosy / Blue)' },
  { id: 'neutral', label: 'Neutral (Balanced)' },
  { id: 'olive', label: 'Olive (Subtle Green)' },
]

const SKIN_DEPTHS = [
  { id: 'fair', label: 'Fair' },
  { id: 'light', label: 'Light' },
  { id: 'medium', label: 'Medium' },
  { id: 'tan', label: 'Tan' },
  { id: 'deep', label: 'Deep' },
]

const FACE_SHAPES = [
  { id: 'oval', label: 'Oval' },
  { id: 'round', label: 'Round' },
  { id: 'square', label: 'Square' },
  { id: 'heart', label: 'Heart' },
  { id: 'diamond', label: 'Diamond' },
  { id: 'oblong', label: 'Oblong' },
]

export default function OnboardingModal({ isOpen, onClose, onComplete }) {
  const { addToast } = useToast()
  const [step, setStep] = useState(1) // 1 to 4
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Step 1: Identity & Style Vocabulary
  const [name, setName] = useState('')
  const [preferredStyles, setPreferredStyles] = useState(['minimal', 'casual'])
  const [fitPreference, setFitPreference] = useState('regular')
  const [formalityPreference, setFormalityPreference] = useState(3)

  // Step 2: Colors
  const [favoriteColors, setFavoriteColors] = useState(['navy', 'white', 'charcoal'])
  const [avoidedColors, setAvoidedColors] = useState([])

  // Step 3 (Skippable): Complexion & Face
  const [skinUndertone, setSkinUndertone] = useState('neutral')
  const [skinDepth, setSkinDepth] = useState('medium')
  const [faceShape, setFaceShape] = useState('oval')
  const [skipComplexion, setSkipComplexion] = useState(false)

  // Step 4 (Skippable): Body Dimensions
  const [unit, setUnit] = useState('cm')
  const [measurements, setMeasurements] = useState({
    height: '172',
    shoulder: '44',
    chest: '96',
    waist: '78',
    hips: '98',
  })
  const [skipMeasurements, setSkipMeasurements] = useState(false)

  if (!isOpen) return null

  const toggleArrayItem = (list, setList, item) => {
    if (list.includes(item)) {
      setList(list.filter((x) => x !== item))
    } else {
      setList([...list, item])
    }
  }

  const handleFinish = async (measurementsSkipped = false) => {
    setIsSubmitting(true)
    try {
      // 1. Save style profile
      const profilePayload = {
        name: name.trim() || undefined,
        preferred_styles: preferredStyles,
        favorite_colors: favoriteColors,
        avoided_colors: avoidedColors,
        fit_preference: fitPreference,
        formality_preference: Number(formalityPreference),
      }

      if (!skipComplexion) {
        profilePayload.skin_undertone = skinUndertone
        profilePayload.skin_depth = skinDepth
        profilePayload.face_shape = faceShape
      }

      await api.updateProfile(profilePayload)

      // 2. Save measurements if provided and not skipped
      if (!measurementsSkipped && !skipMeasurements) {
        const isInch = unit === 'in'
        const toCm = (val) => (isInch ? parseFloat(val) * 2.54 : parseFloat(val))
        try {
          await api.saveMeasurements({
            height_cm: toCm(measurements.height),
            shoulder_cm: toCm(measurements.shoulder),
            chest_bust_cm: toCm(measurements.chest),
            waist_cm: toCm(measurements.waist),
            hips_cm: toCm(measurements.hips),
            preferred_unit: unit,
          })
        } catch (mErr) {
          console.warn('Measurement save optional warning:', mErr)
        }
      }

      try {
        localStorage.setItem('veyra_onboarding_completed', 'true')
      } catch {
        // ignore
      }

      addToast('Welcome to Veyra Atelier. Your style blueprint is now calibrated.', 'success')
      if (onComplete) onComplete()
      onClose()
    } catch (err) {
      addToast(err.message || 'Failed to complete onboarding.', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="modal-backdrop animate-fade-in-up" role="dialog" aria-modal="true" aria-labelledby="onboarding-title">
      <div className="modal-container editorial-modal" style={{ maxWidth: '780px' }}>
        {/* Onboarding Header */}
        <div className="modal-header">
          <div>
            <span className="eyebrow">WELCOME TO VEYRA &bull; STEP {step} OF 4</span>
            <h2 id="onboarding-title" className="modal-title">
              {step === 1 && 'Establish Your Style Foundations'}
              {step === 2 && 'Calibrate Your Color Affinity'}
              {step === 3 && 'Complexion & Facial Harmony'}
              {step === 4 && 'Proportions & Silhouette Balance'}
            </h2>
          </div>
          <button type="button" onClick={onClose} className="modal-close-btn" aria-label="Close onboarding">
            <X size={20} />
          </button>
        </div>

        {/* Step 1: Name, Styles, Fit, Formality */}
        {step === 1 && (
          <div className="onboarding-step-content animate-fade-in-up">
            <p className="onboarding-step-intro">
              Tell us how you would like your private styling studio configured.
            </p>

            <div className="form-field" style={{ marginBottom: '1.5rem' }}>
              <label htmlFor="onboarding-name" className="input-label">Your Name / Atelier Alias</label>
              <input
                id="onboarding-name"
                type="text"
                className="editorial-input"
                placeholder="e.g. Alexandra / Julian"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="form-field" style={{ marginBottom: '1.5rem' }}>
              <span className="input-label">Aesthetic Vocabularies</span>
              <div className="chip-group" style={{ marginTop: '0.4rem' }}>
                {STYLE_OPTIONS.map((style) => (
                  <button
                    key={style.id}
                    type="button"
                    className={`chip-editorial ${preferredStyles.includes(style.id) ? 'active' : ''}`}
                    onClick={() => toggleArrayItem(preferredStyles, setPreferredStyles, style.id)}
                  >
                    {style.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-row-2" style={{ marginBottom: '1.5rem' }}>
              <div className="form-field">
                <label htmlFor="onboarding-fit" className="input-label">Preferred Fit</label>
                <select
                  id="onboarding-fit"
                  className="editorial-select"
                  value={fitPreference}
                  onChange={(e) => setFitPreference(e.target.value)}
                >
                  <option value="slim">Slim / Structured</option>
                  <option value="regular">Regular / Balanced</option>
                  <option value="relaxed">Relaxed / Fluid</option>
                  <option value="oversized">Oversized / Avant-Garde</option>
                </select>
              </div>

              <div className="form-field">
                <label htmlFor="onboarding-formality" className="input-label">Base Formality (1–5)</label>
                <select
                  id="onboarding-formality"
                  className="editorial-select"
                  value={formalityPreference}
                  onChange={(e) => setFormalityPreference(parseInt(e.target.value, 10))}
                >
                  <option value={1}>1 — Ultra Casual</option>
                  <option value={2}>2 — Casual Weekend</option>
                  <option value={3}>3 — Smart Casual / Studio</option>
                  <option value={4}>4 — Sartorial / Evening</option>
                  <option value={5}>5 — Black Tie</option>
                </select>
              </div>
            </div>

            <div className="modal-actions-footer">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="btn-editorial-primary"
              >
                <span>Continue to Color Palette</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Favorite & Avoided Colors */}
        {step === 2 && (
          <div className="onboarding-step-content animate-fade-in-up">
            <p className="onboarding-step-intro">
              Define your core harmonious colors and shades you prefer to deprioritize.
            </p>

            <div className="form-field" style={{ marginBottom: '1.5rem' }}>
              <span className="input-label">Favorite Core Colors</span>
              <div className="chip-group" style={{ marginTop: '0.4rem' }}>
                {COLOR_OPTIONS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={`chip-editorial ${favoriteColors.includes(c) ? 'active' : ''}`}
                    onClick={() => toggleArrayItem(favoriteColors, setFavoriteColors, c)}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-field" style={{ marginBottom: '1.5rem' }}>
              <span className="input-label" style={{ color: 'var(--accent-terracotta)' }}>
                Avoided / Deprioritized Colors
              </span>
              <div className="chip-group" style={{ marginTop: '0.4rem' }}>
                {COLOR_OPTIONS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={`chip-editorial ${avoidedColors.includes(c) ? 'active' : ''}`}
                    onClick={() => toggleArrayItem(avoidedColors, setAvoidedColors, c)}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div className="modal-actions-footer" style={{ justifyContent: 'space-between' }}>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="btn-editorial-ghost"
              >
                <ArrowLeft size={15} />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="btn-editorial-primary"
              >
                <span>Next: Complexion & Features</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        )}

        {/* Step 3 (Skippable): Skin Undertone, Depth, Face Shape */}
        {step === 3 && (
          <div className="onboarding-step-content animate-fade-in-up">
            <div className="step-optional-banner">
              <span className="eyebrow" style={{ color: 'var(--accent-olive)' }}>OPTIONAL ENHANCEMENT</span>
              <p style={{ fontSize: '0.86rem', marginTop: '4px' }}>
                Informs neckline framing and metal temperature harmony. You can skip this step at any time.
              </p>
            </div>

            <div className="form-row-2" style={{ marginBottom: '1.25rem' }}>
              <div className="form-field">
                <label htmlFor="onboarding-undertone" className="input-label">Skin Undertone</label>
                <select
                  id="onboarding-undertone"
                  className="editorial-select"
                  value={skinUndertone}
                  onChange={(e) => setSkinUndertone(e.target.value)}
                >
                  {UNDERTONES.map((u) => (
                    <option key={u.id} value={u.id}>{u.label}</option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <label htmlFor="onboarding-depth" className="input-label">Skin Depth</label>
                <select
                  id="onboarding-depth"
                  className="editorial-select"
                  value={skinDepth}
                  onChange={(e) => setSkinDepth(e.target.value)}
                >
                  {SKIN_DEPTHS.map((d) => (
                    <option key={d.id} value={d.id}>{d.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-field" style={{ marginBottom: '1.75rem' }}>
              <label htmlFor="onboarding-face-shape" className="input-label">Face Shape</label>
              <select
                id="onboarding-face-shape"
                className="editorial-select"
                value={faceShape}
                onChange={(e) => setFaceShape(e.target.value)}
              >
                {FACE_SHAPES.map((f) => (
                  <option key={f.id} value={f.id}>{f.label}</option>
                ))}
              </select>
            </div>

            <div className="modal-actions-footer" style={{ justifyContent: 'space-between' }}>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="btn-editorial-ghost"
              >
                <ArrowLeft size={15} />
                <span>Back</span>
              </button>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => {
                    setSkipComplexion(true)
                    setStep(4)
                  }}
                  className="btn-editorial-secondary"
                >
                  Skip Step
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSkipComplexion(false)
                    setStep(4)
                  }}
                  className="btn-editorial-primary"
                >
                  <span>Next: Proportions</span>
                  <ArrowRight size={15} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 4 (Skippable): Body Dimensions with Strict Privacy Wording */}
        {step === 4 && (
          <div className="onboarding-step-content animate-fade-in-up">
            {/* Privacy Assurance Callout */}
            <div className="privacy-pill-banner" style={{ marginBottom: '1.5rem' }}>
              <Lock size={15} className="privacy-icon" />
              <span>
                <strong>Zero photo uploads.</strong> Dimensions are stored locally in your private atelier database and evaluated purely via deterministic geometric ratios. You can skip this or permanently delete it at any time.
              </span>
            </div>

            <div className="unit-toggle-row">
              <span className="unit-label">Display Unit</span>
              <div className="unit-switcher">
                <button
                  type="button"
                  className={`unit-btn ${unit === 'cm' ? 'active' : ''}`}
                  onClick={() => setUnit('cm')}
                >
                  Centimeters (cm)
                </button>
                <button
                  type="button"
                  className={`unit-btn ${unit === 'in' ? 'active' : ''}`}
                  onClick={() => setUnit('in')}
                >
                  Inches (in)
                </button>
              </div>
            </div>

            <div className="form-grid" style={{ marginBottom: '1.5rem' }}>
              <div className="form-field">
                <label htmlFor="ob-height" className="input-label">Height ({unit})</label>
                <input
                  id="ob-height"
                  type="number"
                  step="0.5"
                  className="editorial-input"
                  value={measurements.height}
                  onChange={(e) => setMeasurements({ ...measurements, height: e.target.value })}
                />
              </div>

              <div className="form-field">
                <label htmlFor="ob-shoulder" className="input-label">Shoulder Breadth ({unit})</label>
                <input
                  id="ob-shoulder"
                  type="number"
                  step="0.5"
                  className="editorial-input"
                  value={measurements.shoulder}
                  onChange={(e) => setMeasurements({ ...measurements, shoulder: e.target.value })}
                />
              </div>

              <div className="form-field">
                <label htmlFor="ob-chest" className="input-label">Chest / Bust ({unit})</label>
                <input
                  id="ob-chest"
                  type="number"
                  step="0.5"
                  className="editorial-input"
                  value={measurements.chest}
                  onChange={(e) => setMeasurements({ ...measurements, chest: e.target.value })}
                />
              </div>

              <div className="form-field">
                <label htmlFor="ob-waist" className="input-label">Natural Waist ({unit})</label>
                <input
                  id="ob-waist"
                  type="number"
                  step="0.5"
                  className="editorial-input"
                  value={measurements.waist}
                  onChange={(e) => setMeasurements({ ...measurements, waist: e.target.value })}
                />
              </div>

              <div className="form-field">
                <label htmlFor="ob-hips" className="input-label">Hips ({unit})</label>
                <input
                  id="ob-hips"
                  type="number"
                  step="0.5"
                  className="editorial-input"
                  value={measurements.hips}
                  onChange={(e) => setMeasurements({ ...measurements, hips: e.target.value })}
                />
              </div>
            </div>

            <div className="modal-actions-footer" style={{ justifyContent: 'space-between' }}>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="btn-editorial-ghost"
              >
                <ArrowLeft size={15} />
                <span>Back</span>
              </button>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleFinish(true)}
                  className="btn-editorial-secondary"
                >
                  Skip Measurements & Finish
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleFinish(false)}
                  className="btn-editorial-primary"
                >
                  <Sparkles size={15} />
                  <span>{isSubmitting ? 'Calibrating...' : 'Complete Studio Calibration'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
