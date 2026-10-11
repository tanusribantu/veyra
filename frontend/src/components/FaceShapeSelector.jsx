import React, { useState } from 'react'
import { FACE_SHAPE_OPTIONS, FACE_SHAPE_GUIDED_QUESTIONS, deriveFaceShape } from '../config/profileConfig'
import { HelpCircle, Sparkles, Check } from 'lucide-react'

export default function FaceShapeSelector({ value, onChange }) {
  const [showGuided, setShowGuided] = useState(false)
  const [guidedAnswers, setGuidedAnswers] = useState({})

  const handleAnswerSelect = (questionId, optionId) => {
    const updated = { ...guidedAnswers, [questionId]: optionId }
    setGuidedAnswers(updated)
    const derived = deriveFaceShape(updated)
    onChange(derived)
  }

  const isPreferNotToSay = !value || value === 'prefer_not_to_say'

  return (
    <div className="face-shape-selector">
      {/* SVG Outline Cards */}
      <div
        className="face-shape-cards-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
          gap: '0.6rem',
          margin: '0.5rem 0 0.75rem 0',
        }}
      >
        {FACE_SHAPE_OPTIONS.map((shape) => {
          const isSelected = value === shape.id
          return (
            <button
              key={shape.id}
              type="button"
              className={`face-shape-card ${isSelected ? 'active' : ''}`}
              onClick={() => onChange(shape.id)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '0.65rem 0.5rem',
                borderRadius: '8px',
                border: isSelected ? '2px solid var(--accent-olive)' : '1px solid var(--border-color, #e2e8f0)',
                backgroundColor: isSelected ? 'var(--bg-card-selected, rgba(92, 107, 78, 0.08))' : 'var(--bg-card, #fff)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <svg width="44" height="60" viewBox="0 0 60 100" style={{ fill: 'none', stroke: isSelected ? 'var(--accent-olive)' : '#666', strokeWidth: 2 }}>
                <path d={shape.svgPath} />
              </svg>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, marginTop: '0.3rem' }}>{shape.label}</span>
              {isSelected && <Check size={14} color="var(--accent-olive)" style={{ marginTop: '0.2rem' }} />}
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
          <span>{showGuided ? 'Hide Guided Questions' : 'Not sure? Guided Face Shape Mode'}</span>
        </button>
      </div>

      {/* Guided Drawer */}
      {showGuided && (
        <div className="guided-face-card" style={{ marginTop: '0.75rem', padding: '1rem', backgroundColor: 'var(--bg-subtle, rgba(0,0,0,0.03))', borderRadius: '8px', border: '1px solid var(--border-color, #e0e0e0)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <Sparkles size={15} color="var(--accent-olive)" />
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Guided Facial Outline Questions</span>
          </div>

          {FACE_SHAPE_GUIDED_QUESTIONS.map((q) => (
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
                      style={{ fontSize: '0.78rem', padding: '0.3rem 0.65rem' }}
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
              Derived Face Shape: <strong>{FACE_SHAPE_OPTIONS.find((f) => f.id === value)?.label || value}</strong> (Click any shape card above to override).
            </div>
          )}
        </div>
      )}
    </div>
  )
}
