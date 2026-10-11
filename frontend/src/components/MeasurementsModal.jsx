import React, { useState, useEffect } from 'react'
import { X, Lock, Trash2, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react'
import { api } from '../services/api'
import { useToast } from './Toast'

const SHAPES = [
  { id: 'hourglass', label: 'Hourglass', desc: 'Balanced shoulder & hip with defined waist' },
  { id: 'pear', label: 'Pear / Triangle', desc: 'Hips wider than shoulders with defined waist' },
  { id: 'inverted_triangle', label: 'Inverted Triangle', desc: 'Broader shoulder/bust with narrower hips' },
  { id: 'rectangle', label: 'Rectangle', desc: 'Shoulders, waist, and hips in harmonious alignment' },
  { id: 'apple', label: 'Apple / Round', desc: 'Waist measurement broader relative to shoulders & hips' },
  { id: 'athletic', label: 'Athletic / Inverted', desc: 'Linear athletic silhouette with trim hips' },
]

export default function MeasurementsModal({ isOpen, onClose, onMeasurementsUpdated }) {
  const { addToast } = useToast()
  const [unit, setUnit] = useState('cm') // 'cm' or 'in'
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [errorMsg, setErrorMsg] = useState(null)

  // Raw inputs in current display unit
  const [formValues, setFormValues] = useState({
    height: '172',
    shoulder: '44',
    chest: '96',
    waist: '78',
    hips: '98',
  })

  // Analysis state from API
  const [savedData, setSavedData] = useState(null)
  const [customShape, setCustomShape] = useState('')

  useEffect(() => {
    if (isOpen) {
      loadCurrentMeasurements()
    }
  }, [isOpen])

  const loadCurrentMeasurements = async () => {
    setIsLoading(true)
    setErrorMsg(null)
    try {
      const data = await api.getMeasurements()
      if (data && !data.measurements_missing) {
        setSavedData(data)
        setUnit(data.preferred_unit || 'cm')
        setCustomShape(data.custom_body_shape || '')

        // populate inputs according to unit
        const isInch = data.preferred_unit === 'in'
        const factor = isInch ? 0.393701 : 1
        setFormValues({
          height: (data.height_cm * factor).toFixed(1),
          shoulder: (data.shoulder_cm * factor).toFixed(1),
          chest: (data.chest_bust_cm * factor).toFixed(1),
          waist: (data.waist_cm * factor).toFixed(1),
          hips: (data.hips_cm * factor).toFixed(1),
        })
      } else {
        setSavedData(null)
      }
    } catch (err) {
      console.log('No prior measurements:', err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUnitToggle = (newUnit) => {
    if (newUnit === unit) return
    const toInches = newUnit === 'in'
    const factor = toInches ? 0.393701 : 2.54

    setFormValues((prev) => ({
      height: (parseFloat(prev.height || 0) * factor).toFixed(1),
      shoulder: (parseFloat(prev.shoulder || 0) * factor).toFixed(1),
      chest: (parseFloat(prev.chest || 0) * factor).toFixed(1),
      waist: (parseFloat(prev.waist || 0) * factor).toFixed(1),
      hips: (parseFloat(prev.hips || 0) * factor).toFixed(1),
    }))
    setUnit(newUnit)
  }

  const handleInputChange = (field, val) => {
    setFormValues((prev) => ({ ...prev, [field]: val }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMsg(null)
    setIsLoading(true)

    try {
      const payload = {
        height: parseFloat(formValues.height),
        shoulder: parseFloat(formValues.shoulder),
        chest_bust: parseFloat(formValues.chest),
        waist: parseFloat(formValues.waist),
        hips: parseFloat(formValues.hips),
        unit: unit,
      }

      const res = await api.saveMeasurements(payload)
      setSavedData(res)
      addToast('Proportions successfully calibrated with deterministic analysis.', 'success')
      if (onMeasurementsUpdated) onMeasurementsUpdated(false)
    } catch (err) {
      setErrorMsg(err.message || 'Validation error saving measurements.')
      addToast('Could not save measurements. Please verify realistic ranges.', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleShapeOverride = async (shape) => {
    try {
      const shapeToSend = shape === customShape ? null : shape
      const res = await api.overrideBodyShape(shapeToSend)
      setSavedData((prev) => ({
        ...prev,
        custom_body_shape: res.custom_body_shape,
        effective_body_shape: res.effective_body_shape,
      }))
      setCustomShape(res.custom_body_shape || '')
      addToast('Silhouette preference updated.', 'info')
    } catch (err) {
      setErrorMsg(err.message)
    }
  }

  const handleDeletePermanent = async () => {
    setIsDeleting(true)
    try {
      await api.deleteMeasurements()
      setSavedData(null)
      setShowDeleteConfirm(false)
      setFormValues({ height: '172', shoulder: '44', chest: '96', waist: '78', hips: '98' })
      addToast('All measurements permanently purged from local storage.', 'info')
      if (onMeasurementsUpdated) onMeasurementsUpdated(true)
    } catch (err) {
      setErrorMsg(err.message)
    } finally {
      setIsDeleting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal-backdrop animate-fade-in-up" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="modal-container editorial-modal">
        {/* Header */}
        <div className="modal-header">
          <div>
            <span className="eyebrow">Studio Atelier</span>
            <h2 id="modal-title" className="modal-title">
              Proportion Intelligence
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="modal-close-btn"
            aria-label="Close proportions modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Privacy Assurance Banner */}
        <div className="privacy-pill-banner">
          <Lock size={14} className="privacy-icon" />
          <span>
            <strong>Zero photo uploads.</strong> Data is stored locally in your private studio database and can be purged at any time.
          </span>
        </div>

        {errorMsg && (
          <div className="error-callout" role="alert">
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="modal-body-columns">
          {/* Column 1: Input Form */}
          <div className="modal-form-column">
            <div className="unit-toggle-row">
              <span className="unit-label">Display Unit</span>
              <div className="unit-switcher">
                <button
                  type="button"
                  className={`unit-btn ${unit === 'cm' ? 'active' : ''}`}
                  onClick={() => handleUnitToggle('cm')}
                >
                  Centimeters (cm)
                </button>
                <button
                  type="button"
                  className={`unit-btn ${unit === 'in' ? 'active' : ''}`}
                  onClick={() => handleUnitToggle('in')}
                >
                  Inches (in)
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="measurements-form">
              <div className="form-grid">
                <div className="form-field">
                  <label htmlFor="input-height" className="input-label">Height ({unit})</label>
                  <input
                    id="input-height"
                    type="number"
                    step="0.5"
                    className="editorial-input"
                    value={formValues.height}
                    onChange={(e) => handleInputChange('height', e.target.value)}
                    required
                  />
                  <span className="field-hint">e.g. {unit === 'cm' ? '172 cm' : '68 in'}</span>
                </div>

                <div className="form-field">
                  <label htmlFor="input-shoulder" className="input-label">Shoulder Breadth ({unit})</label>
                  <input
                    id="input-shoulder"
                    type="number"
                    step="0.5"
                    className="editorial-input"
                    value={formValues.shoulder}
                    onChange={(e) => handleInputChange('shoulder', e.target.value)}
                    required
                  />
                  <span className="field-hint">Across shoulder points</span>
                </div>

                <div className="form-field">
                  <label htmlFor="input-chest" className="input-label">Chest / Bust ({unit})</label>
                  <input
                    id="input-chest"
                    type="number"
                    step="0.5"
                    className="editorial-input"
                    value={formValues.chest}
                    onChange={(e) => handleInputChange('chest', e.target.value)}
                    required
                  />
                  <span className="field-hint">Fullest circumference</span>
                </div>

                <div className="form-field">
                  <label htmlFor="input-waist" className="input-label">Natural Waist ({unit})</label>
                  <input
                    id="input-waist"
                    type="number"
                    step="0.5"
                    className="editorial-input"
                    value={formValues.waist}
                    onChange={(e) => handleInputChange('waist', e.target.value)}
                    required
                  />
                  <span className="field-hint">Narrowest torso section</span>
                </div>

                <div className="form-field">
                  <label htmlFor="input-hips" className="input-label">Hips ({unit})</label>
                  <input
                    id="input-hips"
                    type="number"
                    step="0.5"
                    className="editorial-input"
                    value={formValues.hips}
                    onChange={(e) => handleInputChange('hips', e.target.value)}
                    required
                  />
                  <span className="field-hint">Fullest point across hips</span>
                </div>
              </div>

              <div className="form-submit-row">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-editorial-primary"
                  style={{ width: '100%' }}
                >
                  {isLoading ? <RefreshCw className="animate-spin" size={15} /> : 'Calibrate Proportions'}
                </button>
              </div>
            </form>
          </div>

          {/* Column 2: Proportion Analysis & Silhouette Insights */}
          <div className="modal-analysis-column">
            {savedData ? (
              <div className="analysis-card">
                <span className="eyebrow">Deterministic Ratios</span>
                <h3 className="shape-derived-title">
                  {savedData.effective_body_shape?.replace('_', ' ').toUpperCase()} SILHOUETTE
                </h3>

                <p className="shape-explanation-text">
                  {savedData.custom_body_shape
                    ? 'Manually selected silhouette preference active.'
                    : 'Classified using deterministic geometric proportions rather than arbitrary sizes.'}
                </p>

                {/* Mathematical Ratios */}
                {savedData.ratios && (
                  <div className="ratios-grid">
                    <div className="ratio-stat">
                      <span className="ratio-label">Shoulder / Hip</span>
                      <span className="ratio-value">{savedData.ratios.shoulder_hip_ratio?.toFixed(2)}</span>
                    </div>
                    <div className="ratio-stat">
                      <span className="ratio-label">Waist / Hip</span>
                      <span className="ratio-value">{savedData.ratios.waist_hip_ratio?.toFixed(2)}</span>
                    </div>
                    <div className="ratio-stat">
                      <span className="ratio-label">Waist / Chest</span>
                      <span className="ratio-value">{savedData.ratios.waist_chest_ratio?.toFixed(2)}</span>
                    </div>
                  </div>
                )}

                {/* Silhouette Override Options */}
                <div className="override-section">
                  <span className="eyebrow" style={{ fontSize: '0.68rem', marginBottom: '8px', display: 'block' }}>
                    Personal Silhouette Override
                  </span>
                  <div className="override-chips">
                    {SHAPES.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => handleShapeOverride(s.id)}
                        className={`chip-editorial ${
                          (customShape || savedData.derived_body_shape) === s.id ? 'active' : ''
                        }`}
                        title={s.desc}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Permanent Delete Privacy Section */}
                <div className="privacy-delete-section">
                  {showDeleteConfirm ? (
                    <div className="delete-confirm-box animate-fade-in-up">
                      <p className="delete-confirm-prompt">
                        Permanently purge all body dimensions and derived proportions from the database?
                      </p>
                      <div className="delete-btn-row">
                        <button
                          type="button"
                          onClick={handleDeletePermanent}
                          disabled={isDeleting}
                          className="btn-danger-confirm"
                        >
                          Confirm Permanent Delete
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowDeleteConfirm(false)}
                          className="btn-editorial-ghost"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(true)}
                      className="btn-purge-link"
                    >
                      <Trash2 size={13} />
                      <span>Permanently Purge Measurements</span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="analysis-empty-placeholder">
                <span className="eyebrow">Standard Personalization</span>
                <h4>No Dimensions Recorded</h4>
                <p>
                  Veyra provides standard recommendations based on color harmony and style. Enter measurements on the left to calibrate silhouette balancing.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
