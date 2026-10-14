import React, { useState, useEffect } from 'react'
import { Sliders, Palette, User, Shield, Compass, Save, RefreshCw, Trash2, KeyRound, LogOut, AlertTriangle, X } from 'lucide-react'
import { api } from '../services/api'
import { useToast } from '../components/Toast'
import { useAuth } from '../context/AuthContext'
import StyleQuizModal, { StyleDimensionChart } from '../components/StyleQuizModal'
import SkinDepthSelector from '../components/SkinDepthSelector'
import SkinUndertoneSelector from '../components/SkinUndertoneSelector'
import FaceShapeSelector from '../components/FaceShapeSelector'
import BodyShapeSelector from '../components/BodyShapeSelector'
import { STYLING_LANE_OPTIONS, FLUID_STYLE_TENDENCIES } from '../config/profileConfig'

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

export default function StyleProfile({ onOpenMeasurements, onOpenOnboarding, measurementsMissing }) {
  const { addToast } = useToast()
  let authContext = null
  try {
    authContext = useAuth()
  } catch {
    // outside provider in unit tests
  }
  const user = authContext?.user
  const logout = authContext?.logout
  const deleteAccount = authContext?.deleteAccount
  const resetPassword = authContext?.resetPassword

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [measurementsData, setMeasurementsData] = useState(null)
  const [quizResult, setQuizResult] = useState(null)
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [isSendingReset, setIsSendingReset] = useState(false)

  const [profile, setProfile] = useState({
    name: '',
    styling_lane: 'mixed',
    style_tendency: 'mix_of_everything',
    preferred_styles: ['minimal', 'casual'],
    favorite_colors: ['navy', 'white', 'charcoal'],
    avoided_colors: [],
    fit_preference: 'regular',
    formality_preference: 3,
    skin_undertone: 'neutral',
    skin_depth: 'medium',
    face_shape: 'oval',
    body_shape_override: 'rectangle',
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
          styling_lane: p.styling_lane || prev.styling_lane || 'mixed',
          preferred_styles: p.preferred_styles || prev.preferred_styles,
          favorite_colors: p.favorite_colors || prev.favorite_colors,
          avoided_colors: p.avoided_colors || prev.avoided_colors,
          fit_preference: p.fit_preference || prev.fit_preference,
          formality_preference: p.formality_preference || prev.formality_preference,
          skin_undertone: p.skin_undertone || prev.skin_undertone,
          skin_depth: p.skin_depth || prev.skin_depth,
          face_shape: p.face_shape || prev.face_shape,
          body_shape_override: p.body_shape_override || prev.body_shape_override,
        }))
      }

      const m = await api.getMeasurements()
      if (m && !m.measurements_missing) {
        setMeasurementsData(m)
      }

      try {
        const q = await api.getLatestQuizResult()
        if (q && q.archetype) {
          setQuizResult(q)
        }
      } catch {
        // no quiz result yet
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
      const { name, ...profilePayload } = profile
      await api.updateProfile(profilePayload)
      if (name) {
        try {
          localStorage.setItem('veyra_user_name', name)
        } catch {
          // ignore
        }
      }
      addToast('Atelier style profile successfully updated.', 'success')
    } catch (err) {
      addToast(err.message || 'Failed to update profile.', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteQuizResult = async () => {
    try {
      await api.deleteQuizResult()
      setQuizResult(null)
      addToast('Style quiz archetype reset.', 'success')
    } catch (err) {
      addToast(err.message || 'Could not reset quiz result.', 'error')
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

        <div className="profile-header-actions" style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setIsQuizModalOpen(true)}
            className="btn-editorial-secondary"
          >
            <Compass size={15} />
            <span>{quizResult ? 'Archetype Quiz' : 'Take Style Quiz'}</span>
          </button>

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
          {/* Wardrobe Department & Tailoring Lane */}
          <section className="profile-section editorial-card">
            <div className="section-title-row">
              <Compass size={18} className="section-icon" />
              <h3>Wardrobe Department &amp; Tailoring Lane</h3>
            </div>
            <p className="section-desc">
              Which section do you usually shop from? Informs garment terminology and silhouette suggestions without restricting what you may explore.
            </p>

            <div className="chip-group" style={{ marginTop: '1rem' }}>
              {STYLING_LANE_OPTIONS.map((lane) => (
                <button
                  key={lane.id}
                  type="button"
                  className={`chip-editorial ${profile.styling_lane === lane.id ? 'active' : ''}`}
                  onClick={() => setProfile({ ...profile, styling_lane: lane.id })}
                >
                  {lane.label}
                </button>
              ))}
            </div>

            <div style={{ marginTop: '1.25rem' }}>
              <span className="eyebrow" style={{ fontSize: '0.68rem', display: 'block', marginBottom: '8px' }}>
                Closest to My Style (Silhouette Tendency)
              </span>
              <div className="chip-group">
                {FLUID_STYLE_TENDENCIES.map((tendency) => (
                  <button
                    key={tendency.id}
                    type="button"
                    className={`chip-editorial ${profile.style_tendency === tendency.id ? 'active' : ''}`}
                    onClick={() => {
                      let newFit = profile.fit_preference
                      if (tendency.id === 'structured_sharp') newFit = 'slim'
                      else if (tendency.id === 'relaxed_oversized') newFit = 'oversized'
                      else if (tendency.id === 'soft_flowing') newFit = 'relaxed'
                      else if (tendency.id === 'mix_of_everything') newFit = 'regular'
                      setProfile({ ...profile, style_tendency: tendency.id, fit_preference: newFit })
                    }}
                  >
                    {tendency.label}
                  </button>
                ))}
              </div>
            </div>
          </section>

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

          {/* Personal Complexion & Facial Harmony */}
          <section className="profile-section editorial-card">
            <div className="section-title-row">
              <Sliders size={18} className="section-icon" />
              <h3>Complexion & Facial Harmony</h3>
            </div>
            <p className="section-desc">Informs neckline, lapel width, and jewelry metal temperature recommendations.</p>

            <div style={{ marginTop: '1.25rem' }}>
              <label className="input-label" style={{ marginBottom: '0.4rem', display: 'block' }}>Skin Depth</label>
              <SkinDepthSelector
                value={profile.skin_depth}
                onChange={(val) => setProfile({ ...profile, skin_depth: val })}
              />
            </div>

            <div style={{ marginTop: '1.5rem' }}>
              <label className="input-label" style={{ marginBottom: '0.4rem', display: 'block' }}>Skin Undertone</label>
              <SkinUndertoneSelector
                value={profile.skin_undertone}
                onChange={(val) => setProfile({ ...profile, skin_undertone: val })}
              />
            </div>

            <div style={{ marginTop: '1.5rem' }}>
              <label className="input-label" style={{ marginBottom: '0.4rem', display: 'block' }}>Face Shape</label>
              <FaceShapeSelector
                value={profile.face_shape}
                onChange={(val) => setProfile({ ...profile, face_shape: val })}
              />
            </div>
          </section>

          {/* Body Silhouette & Proportions */}
          <section className="profile-section editorial-card">
            <div className="section-title-row">
              <Sliders size={18} className="section-icon" />
              <h3>Body Silhouette & Proportions</h3>
            </div>
            <p className="section-desc">Calculates proportion recommendations without requiring photos or mandatory measurements.</p>

            <div style={{ marginTop: '1rem' }}>
              <BodyShapeSelector
                value={profile.body_shape_override}
                onChange={(val) => setProfile({ ...profile, body_shape_override: val })}
                stylingLane={profile.styling_lane}
                onOpenTapeMeasurements={onOpenMeasurements}
              />
            </div>
          </section>
        </div>

        {/* Side Column: Style Archetype & Proportion Intelligence */}
        <div className="profile-side-col">
          {/* Style Archetype Card */}
          <div className="archetype-profile-card editorial-card" style={{ marginBottom: '1.5rem' }}>
            <div className="card-top-icon">
              <Compass size={22} className="shield-icon" />
            </div>
            <span className="eyebrow">SARTORIAL ARCHETYPE INTELLIGENCE</span>
            <h3>Style Archetype</h3>

            {quizResult ? (
              <div className="archetype-summary-content animate-fade-in-up">
                <div className="shape-badge" style={{ backgroundColor: 'rgba(92, 107, 78, 0.12)', color: 'var(--accent-olive)' }}>
                  <span>{quizResult.archetype}</span>
                </div>
                <p className="shape-desc" style={{ marginTop: '8px', fontSize: '0.86rem', lineHeight: '1.5' }}>
                  {quizResult.archetype_description}
                </p>

                <div style={{ marginTop: '1.25rem' }}>
                  <span className="eyebrow" style={{ fontSize: '0.66rem', marginBottom: '8px', display: 'block' }}>
                    5D Vector Blueprint
                  </span>
                  <StyleDimensionChart vector={quizResult.vector} />
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem' }}>
                  <button
                    type="button"
                    onClick={() => setIsQuizModalOpen(true)}
                    className="btn-editorial-secondary"
                    style={{ flex: 1, fontSize: '0.78rem' }}
                  >
                    <RefreshCw size={13} />
                    <span>Retake Quiz</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDeleteQuizResult}
                    className="btn-editorial-ghost"
                    style={{ fontSize: '0.78rem', color: 'var(--accent-terracotta)' }}
                    title="Reset archetype"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="archetype-empty-summary">
                <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', lineHeight: '1.5', marginTop: '8px' }}>
                  Calibrate your personal aesthetic archetype across 10 scenario choices. Scores normalize into a 5-dimension continuous style vector.
                </p>
                <button
                  type="button"
                  onClick={() => setIsQuizModalOpen(true)}
                  className="btn-editorial-primary"
                  style={{ width: '100%', marginTop: '1.25rem' }}
                >
                  <Compass size={14} />
                  <span>Take Archetype Quiz</span>
                </button>
              </div>
            )}
          </div>

          {/* Geometric Proportion Intelligence Card */}
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

          {/* Account Security & Identity Card */}
          <div className="account-security-card editorial-card">
            <div className="card-top-icon">
              <KeyRound size={22} className="shield-icon" />
            </div>
            <span className="eyebrow">ACCOUNT &amp; DATA SECURITY</span>
            <h3>Atelier Identity &amp; Privacy</h3>

            <div className="account-details-block" style={{ marginTop: '0.75rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '1.25rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Authenticated As
                </span>
                <strong style={{ fontSize: '0.95rem', color: 'var(--text-primary)', wordBreak: 'break-all' }}>
                  {user?.email || 'Authenticated Atelier Member'}
                </strong>
                {user?.id && (
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                    UID: {user.id}
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <button
                  type="button"
                  disabled={isSendingReset || !user?.email}
                  onClick={async () => {
                    if (!user?.email || !resetPassword) return
                    setIsSendingReset(true)
                    try {
                      await resetPassword(user.email)
                      addToast('Password reset link sent to your email', 'success')
                    } catch (err) {
                      addToast(err?.message || 'Failed to send reset link', 'error')
                    } finally {
                      setIsSendingReset(false)
                    }
                  }}
                  className="btn-editorial-secondary"
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.82rem' }}
                >
                  <KeyRound size={14} />
                  <span>{isSendingReset ? 'Sending Link...' : 'Send Password Reset Email'}</span>
                </button>

                {logout && (
                  <button
                    type="button"
                    onClick={() => {
                      logout()
                      addToast('Signed out of Atelier', 'info')
                    }}
                    className="btn-editorial-ghost"
                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.82rem' }}
                  >
                    <LogOut size={14} />
                    <span>Sign Out</span>
                  </button>
                )}

                <div style={{ height: '1px', background: 'var(--border-subtle)', margin: '0.5rem 0' }} />

                <button
                  type="button"
                  onClick={() => {
                    setDeleteConfirmationText('')
                    setIsDeleteModalOpen(true)
                  }}
                  className="btn-editorial-ghost"
                  style={{
                    width: '100%',
                    color: '#ef4444',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    fontSize: '0.8rem',
                    padding: '0.65rem',
                  }}
                >
                  <Trash2 size={14} style={{ marginRight: '6px' }} />
                  <span>Delete My Account &amp; All Data</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Style Quiz Modal */}
      <StyleQuizModal
        isOpen={isQuizModalOpen}
        onClose={() => setIsQuizModalOpen(false)}
        initialResult={quizResult}
        stylingLane={profile.styling_lane}
        onComplete={(res) => {
          setQuizResult(res)
          setIsQuizModalOpen(false)
        }}
      />

      {/* Permanent Account Deletion Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="modal-backdrop animate-fade-in-up" role="dialog" aria-modal="true" aria-labelledby="delete-account-title">
          <div className="modal-container editorial-modal" style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <div>
                <span className="eyebrow" style={{ color: '#ef4444' }}>CRITICAL ACTION &bull; PERMANENT DATA REMOVAL</span>
                <h2 className="modal-title" id="delete-account-title">Delete Account &amp; All Data</h2>
              </div>
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="modal-close-btn"
                aria-label="Close dialog"
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '1rem 0' }}>
              <div
                style={{
                  display: 'flex',
                  gap: '0.75rem',
                  padding: '0.85rem',
                  background: 'rgba(239, 68, 68, 0.08)',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                  marginBottom: '1.25rem',
                }}
              >
                <AlertTriangle size={20} style={{ color: '#ef4444', flexShrink: 0, marginTop: '2px' }} />
                <div style={{ fontSize: '0.82rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                  This action is <strong>irreversible</strong>. We will permanently delete your style profile, all wardrobe items, body measurements, style quiz vectors, outfit constraints, and historical recommendations.
                </div>
              </div>

              <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                To confirm permanent deletion, please type <strong>DELETE</strong> below:
              </p>

              <input
                type="text"
                value={deleteConfirmationText}
                onChange={(e) => setDeleteConfirmationText(e.target.value)}
                placeholder="Type DELETE to confirm"
                className="form-input"
                style={{ width: '100%', padding: '0.65rem 0.75rem', marginBottom: '1.25rem' }}
                disabled={isDeleting}
              />

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setIsDeleteModalOpen(false)}
                  disabled={isDeleting}
                  className="btn-editorial-ghost"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={deleteConfirmationText.trim().toUpperCase() !== 'DELETE' || isDeleting}
                  onClick={async () => {
                    setIsDeleting(true)
                    try {
                      if (deleteAccount) {
                        await deleteAccount()
                      } else {
                        await api.deleteAccount()
                      }
                      addToast('Your account and all associated data have been permanently deleted.', 'info')
                      setIsDeleteModalOpen(false)
                      window.location.hash = '#home'
                    } catch (err) {
                      addToast(err?.message || 'Failed to delete account', 'error')
                    } finally {
                      setIsDeleting(false)
                    }
                  }}
                  className="btn-editorial-primary"
                  style={{ background: '#ef4444', borderColor: '#ef4444', color: '#ffffff' }}
                >
                  <span>{isDeleting ? 'Deleting Everything...' : 'Permanently Delete Everything'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
