import React, { useState, useEffect } from 'react'
import { Sliders, Palette, User, Shield, Check, Save } from 'lucide-react'
import { api } from '../services/api'
import { useToast } from '../components/Toast'

const STYLE_OPTIONS = [
  { id: 'minimal', label: 'Minimalist' },
  { id: 'classic', label: 'Classic / Tailored' },
  { id: 'casual', label: 'Smart Casual' },
  { id: 'streetwear', label: 'Streetwear / Contemporary' },
  { id: 'formal', label: 'Formal / Black Tie' },
  { id: 'old_money', label: 'Quiet Luxury' },
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

const FACE_SHAPES = [
  { id: 'oval', label: 'Oval' },
  { id: 'round', label: 'Round' },
  { id: 'square', label: 'Square' },
  { id: 'heart', label: 'Heart' },
  { id: 'diamond', label: 'Diamond' },
  { id: 'oblong', label: 'Oblong' },
]

export default function StyleProfile({ onOpenMeasurements, onOpenOnboarding, measurementsMissing }) {
  const { addToast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [measurementsData, setMeasurementsData] = useState(null)

  const [profile, setProfile] = useState({
    name: '',
    preferred_styles: ['minimal', 'casual'],
    favorite_colors: ['navy', 'white', 'charcoal'],
    avoided_colors: [],
    fit_preference: 'regular',
    formality_preference: 3,
    skin_undertone: 'neutral',
    skin_depth: 'medium',
    face_shape: 'oval',
  })

  useEffect(() => {
    loadProfileData()
  }, [])

  const loadProfileData = async () => {
    setIsLoading(true)
    try {
      const p = await api.getProfile()
      if (p) {
        setProfile((prev) => ({
          ...prev,
          name: p.name || prev.name,
          preferred_styles: p.preferred_styles || prev.preferred_styles,
          favorite_colors: p.favorite_colors || prev.favorite_colors,
          avoided_colors: p.avoided_colors || prev.avoided_colors,
          fit_preference: p.fit_preference || prev.fit_preference,
          formality_preference: p.formality_preference || prev.formality_preference,
          skin_undertone: p.skin_undertone || prev.skin_undertone,
          skin_depth: p.skin_depth || prev.skin_depth,
          face_shape: p.face_shape || prev.face_shape,
        }))
      }

      const m = await api.getMeasurements()
      if (m && !m.measurements_missing) {
        setMeasurementsData(m)
      }
    } catch (err) {
      console.log('Error loading profile:', err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleArrayItem = (field, item) => {
    setProfile((prev) => {
      const current = prev[field] || []
      const exists = current.includes(item)
      return {
        ...prev,
        [field]: exists ? current.filter((x) => x !== item) : [...current, item],
      }
    })
  }

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      await api.updateProfile(profile)
      addToast('Atelier style profile successfully updated.', 'success')
    } catch (err) {
      addToast(err.message || 'Failed to update profile.', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="style-profile-page container">
      <div className="profile-header">
        <div className="profile-title-block">
          <span className="eyebrow">PRIVATE ATELIER SETTINGS</span>
          <h1 className="profile-headline">Personal Style Blueprint</h1>
          <p className="profile-subtitle">
            Configure your aesthetic leanings, color affinities, and geometric proportions. Veyra uses these parameters as foundational scoring weights.
          </p>
        </div>

        <div className="profile-header-actions" style={{ display: 'flex', gap: '0.75rem' }}>
          {onOpenOnboarding && (
            <button
              type="button"
              onClick={onOpenOnboarding}
              className="btn-editorial-secondary"
            >
              <span>Atelier Wizard</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleSaveProfile}
            disabled={isSaving}
            className="btn-editorial-primary"
          >
            <Save size={15} />
            <span>{isSaving ? 'Preserving...' : 'Save Blueprint'}</span>
          </button>
        </div>
      </div>

      <div className="profile-content-grid">
        {/* Main Column: Style & Color Preferences */}
        <div className="profile-main-col">
          {/* Aesthetic Philosophy */}
          <section className="profile-section editorial-card">
            <div className="section-title-row">
              <User size={18} className="section-icon" />
              <h3>Aesthetic Directions</h3>
            </div>
            <p className="section-desc">Select the aesthetic vocabularies that resonate with your personal rotation.</p>

            <div className="chip-group" style={{ marginTop: '1rem' }}>
              {STYLE_OPTIONS.map((style) => (
                <button
                  key={style.id}
                  type="button"
                  className={`chip-editorial ${profile.preferred_styles.includes(style.id) ? 'active' : ''}`}
                  onClick={() => toggleArrayItem('preferred_styles', style.id)}
                >
                  {style.label}
                </button>
              ))}
            </div>
          </section>

          {/* Color Palettes */}
          <section className="profile-section editorial-card">
            <div className="section-title-row">
              <Palette size={18} className="section-icon" />
              <h3>Harmonious Palette Affinity</h3>
            </div>
            <p className="section-desc">Designate your foundational core colors and shades you prefer to avoid.</p>

            <div className="color-section-block">
              <span className="eyebrow" style={{ fontSize: '0.68rem', display: 'block', marginBottom: '8px' }}>
                Preferred Core Colors
              </span>
              <div className="chip-group">
                {COLOR_OPTIONS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={`chip-editorial ${profile.favorite_colors.includes(c) ? 'active' : ''}`}
                    onClick={() => toggleArrayItem('favorite_colors', c)}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div className="color-section-block" style={{ marginTop: '1.25rem' }}>
              <span className="eyebrow" style={{ fontSize: '0.68rem', display: 'block', marginBottom: '8px', color: 'var(--accent-terracotta)' }}>
                Avoided / Deprioritized Colors
              </span>
              <div className="chip-group">
                {COLOR_OPTIONS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={`chip-editorial ${profile.avoided_colors.includes(c) ? 'active' : ''}`}
                    onClick={() => toggleArrayItem('avoided_colors', c)}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Personal Undertone & Facial Silhouette */}
          <section className="profile-section editorial-card">
            <div className="section-title-row">
              <Sliders size={18} className="section-icon" />
              <h3>Complexion & Facial Harmony</h3>
            </div>
            <p className="section-desc">Informs neckline and jewelry metal temperature recommendations.</p>

            <div className="form-row-2" style={{ marginTop: '1rem' }}>
              <div className="form-field">
                <label htmlFor="undertone-select" className="input-label">Skin Undertone</label>
                <select
                  id="undertone-select"
                  className="editorial-select"
                  value={profile.skin_undertone}
                  onChange={(e) => setProfile({ ...profile, skin_undertone: e.target.value })}
                >
                  {UNDERTONES.map((u) => (
                    <option key={u.id} value={u.id}>{u.label}</option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <label htmlFor="face-shape-select" className="input-label">Face Shape</label>
                <select
                  id="face-shape-select"
                  className="editorial-select"
                  value={profile.face_shape}
                  onChange={(e) => setProfile({ ...profile, face_shape: e.target.value })}
                >
                  {FACE_SHAPES.map((f) => (
                    <option key={f.id} value={f.id}>{f.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </section>
        </div>

        {/* Side Column: Proportion Intelligence Overview */}
        <div className="profile-side-col">
          <div className="proportion-atelier-card editorial-card">
            <div className="card-top-icon">
              <Shield size={22} className="shield-icon" />
            </div>
            <span className="eyebrow">GEOMETRIC PROPORTION INTELLIGENCE</span>
            <h3>Body Proportion Model</h3>

            {measurementsData ? (
              <div className="proportion-data-summary">
                <div className="shape-badge">
                  <span>{measurementsData.effective_body_shape?.replace('_', ' ').toUpperCase()}</span>
                </div>
                <p className="shape-desc">
                  Proportion ratios are currently active in candidate outfit scoring, ensuring balanced visual weighting across lapels, waist, and hems.
                </p>

                <div className="summary-ratios-list">
                  <div className="summary-ratio-row">
                    <span>Shoulder to Hip</span>
                    <strong>{measurementsData.ratios?.shoulder_hip_ratio?.toFixed(2)}</strong>
                  </div>
                  <div className="summary-ratio-row">
                    <span>Waist to Hip</span>
                    <strong>{measurementsData.ratios?.waist_hip_ratio?.toFixed(2)}</strong>
                  </div>
                  <div className="summary-ratio-row">
                    <span>Waist to Chest</span>
                    <strong>{measurementsData.ratios?.waist_chest_ratio?.toFixed(2)}</strong>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onOpenMeasurements}
                  className="btn-editorial-secondary"
                  style={{ width: '100%', marginTop: '1.25rem' }}
                >
                  Adjust Measurements & Privacy
                </button>
              </div>
            ) : (
              <div className="proportion-empty-summary">
                <p>
                  No body measurements recorded. Personalization is currently running in standard mode (weights smoothly redistributed across color and occasion).
                </p>
                <button
                  type="button"
                  onClick={onOpenMeasurements}
                  className="btn-editorial-primary"
                  style={{ width: '100%', marginTop: '1.25rem' }}
                >
                  Calibrate Proportions
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
