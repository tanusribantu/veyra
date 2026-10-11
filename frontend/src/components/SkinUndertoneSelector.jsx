import React, { useState } from 'react'
import { UNDERTONE_OPTIONS, UNDERTONE_GUIDED_QUESTIONS, deriveUndertone } from '../config/profileConfig'
import { HelpCircle, Check, Sparkles } from 'lucide-react'

export default function SkinUndertoneSelector({ value, onChange }) {
  const [showGuided, setShowGuided] = useState(false)
  const [guidedAnswers, setGuidedAnswers] = useState({})

  const handleAnswerSelect = (questionId, optionId) => {
    const updated = { ...guidedAnswers, [questionId]: optionId }
    setGuidedAnswers(updated)
    const derived = deriveUndertone(updated)
    onChange(derived)
  }

  const isPreferNotToSay = !value || value === 'prefer_not_to_say'

  return (
    <div className="skin-undertone-selector">
      {/* Top direct choices */}
      <div className="undertone-direct-grid" style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
        {UNDERTONE_OPTIONS.map((u) => {
          const isSelected = value === u.id
          return (
            <button
              key={u.id}
              type="button"
              className={`chip-editorial ${isSelected ? 'active' : ''}`}
              onClick={() => {
                onChange(u.id)
                setShowGuided(false)
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.45rem 0.9rem',
              }}
            >
              <span
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  backgroundColor: u.color,
                  display: 'inline-block',
                }}
              />
              <span>{u.label}</span>
              {isSelected && <Check size={14} />}
            </button>
          )
        })}

        <button
          type="button"
          className={`chip-editorial ${isPreferNotToSay ? 'active' : ''}`}
          onClick={() => {
            onChange('prefer_not_to_say')
            setShowGuided(false)
          }}
        >
          Prefer not to say
        </button>
      </div>

      {/* Guided checks toggle */}
      <div style={{ marginTop: '0.5rem' }}>
        <button
          type="button"
          onClick={() => setShowGuided(!showGuided)}
          className="btn-editorial-ghost"
          style={{ fontSize: '0.8rem', padding: '0.2rem 0', color: 'var(--accent-olive)', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
        >
          <HelpCircle size={14} />
          <span>{showGuided ? 'Hide Guided Undertone Quiz' : 'Not sure? Take Guided Undertone Check'}</span>
        </button>
      </div>

      {/* Guided Questions Drawer */}
      {showGuided && (
        <div className="guided-undertone-card" style={{ marginTop: '0.75rem', padding: '1rem', backgroundColor: 'var(--bg-subtle, rgba(0,0,0,0.03))', borderRadius: '8px', border: '1px solid var(--border-color, #e0e0e0)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <Sparkles size={15} color="var(--accent-olive)" />
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Guided Undertone Evaluation</span>
          </div>

          {UNDERTONE_GUIDED_QUESTIONS.map((q) => (
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
              Derived Undertone: <strong>{UNDERTONE_OPTIONS.find((u) => u.id === value)?.label || value}</strong> (You can click any button above to override).
            </div>
          )}
        </div>
      )}
    </div>
  )
}
