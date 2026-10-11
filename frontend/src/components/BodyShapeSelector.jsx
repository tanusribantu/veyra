import React, { useState } from 'react'
import { BODY_SHAPE_OPTIONS, FIT_GUIDED_QUESTIONS, deriveBodyShapeFromFit } from '../config/profileConfig'
import { HelpCircle, Sparkles, Check, Ruler } from 'lucide-react'

export default function BodyShapeSelector({ value, onChange, onOpenTapeMeasurements }) {
  const [showGuided, setShowGuided] = useState(false)
  const [guidedAnswers, setGuidedAnswers] = useState({})

  const handleAnswerSelect = (questionId, optionId) => {
    const updated = { ...guidedAnswers, [questionId]: optionId }
    setGuidedAnswers(updated)
    const derived = deriveBodyShapeFromFit(updated)
    onChange(derived)
  }

  const isPreferNotToSay = !value || value === 'prefer_not_to_say'

  return (
    <div className="body-shape-selector">
      {/* Top action row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
        <span className="eyebrow" style={{ fontSize: '0.72rem' }}>SILHOUETTE & FIT BALANCE</span>
        {onOpenTapeMeasurements && (
          <button
            type="button"
            onClick={onOpenTapeMeasurements}
            className="btn-editorial-ghost"
            style={{ fontSize: '0.78rem', color: 'var(--accent-olive)', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <Ruler size={13} />
            <span>Tape Measurements (Optional)</span>
          </button>
        )}
      </div>

      {/* Illustrated Figure Cards (No-tape option) */}
      <div
        className="body-shape-cards-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
          gap: '0.6rem',
          marginBottom: '0.75rem',
        }}
      >
        {BODY_SHAPE_OPTIONS.map((shape) => {
          const isSelected = value === shape.id
          return (
            <button
              key={shape.id}
              type="button"
              className={`body-shape-card ${isSelected ? 'active' : ''}`}
              onClick={() => onChange(shape.id)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                padding: '0.75rem',
                borderRadius: '8px',
                border: isSelected ? '2px solid var(--accent-olive)' : '1px solid var(--border-color, #e2e8f0)',
                backgroundColor: isSelected ? 'var(--bg-card-selected, rgba(92, 107, 78, 0.08))' : 'var(--bg-card, #fff)',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                <span style={{ fontSize: '0.84rem', fontWeight: 600 }}>{shape.label}</span>
                {isSelected && <Check size={14} color="var(--accent-olive)" />}
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem', lineHeight: '1.3' }}>
                {shape.desc}
              </span>
            </button>
          )
        })}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
        <button
          type="button"
          className={`chip-editorial ${isPreferNotToSay ? 'active' : ''}`}
          onClick={() => onChange('prefer_not_to_say')}
          style={{ fontSize: '0.8rem' }}
        >
          Prefer not to say
        </button>

        <button
          type="button"
          onClick={() => setShowGuided(!showGuided)}
          className="btn-editorial-ghost"
          style={{ fontSize: '0.8rem', padding: '0.2rem 0', color: 'var(--accent-olive)', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
        >
          <HelpCircle size={14} />
          <span>{showGuided ? 'Hide Clothes Fit Questions' : 'How clothes usually fit me (No Tape)'}</span>
        </button>
      </div>

      {/* Guided Clothes Fit Drawer */}
      {showGuided && (
        <div className="guided-fit-card" style={{ marginTop: '0.75rem', padding: '1rem', backgroundColor: 'var(--bg-subtle, rgba(0,0,0,0.03))', borderRadius: '8px', border: '1px solid var(--border-color, #e0e0e0)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <Sparkles size={15} color="var(--accent-olive)" />
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Garment Fit & Balance Evaluation</span>
          </div>

          {FIT_GUIDED_QUESTIONS.map((q) => (
            <div key={q.id} style={{ marginBottom: '1rem' }}>
              <p style={{ fontSize: '0.82rem', marginBottom: '0.4rem', fontWeight: 500 }}>{q.question}</p>
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                {q.options.map((opt) => {
                  const isOptSelected = guidedAnswers[q.id] === opt.id
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      className={`chip-editorial ${isOptSelected ? 'active' : ''}`}
                      onClick={() => handleAnswerSelect(q.id, opt.id)}
                      style={{ fontSize: '0.78rem', padding: '0.35rem 0.7rem' }}
                    >
                      {opt.label}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}

          {value && (
            <div style={{ marginTop: '0.75rem', fontSize: '0.82rem', color: 'var(--accent-olive)', fontWeight: 500 }}>
              Derived Silhouette Preference: <strong>{BODY_SHAPE_OPTIONS.find((b) => b.id === value)?.label || value}</strong> (Click any card above to override).
            </div>
          )}
        </div>
      )}
    </div>
  )
}
