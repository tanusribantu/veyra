import React from 'react'
import { SKIN_DEPTH_OPTIONS } from '../config/profileConfig'
import { Check } from 'lucide-react'

export default function SkinDepthSelector({ value, onChange }) {
  const isPreferNotToSay = !value || value === 'prefer_not_to_say'

  return (
    <div className="skin-depth-selector">
      <div className="swatch-row-container" style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', alignItems: 'center', margin: '0.5rem 0 1rem 0' }}>
        {SKIN_DEPTH_OPTIONS.map((swatch) => {
          const isSelected = value === swatch.id
          return (
            <button
              key={swatch.id}
              type="button"
              className={`skin-swatch-btn ${isSelected ? 'active' : ''}`}
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                backgroundColor: swatch.hex,
                border: isSelected ? '3px solid var(--accent-olive)' : `1px solid ${swatch.border}`,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: isSelected ? '0 0 0 2px var(--bg-card), 0 2px 8px rgba(0,0,0,0.18)' : '0 1px 3px rgba(0,0,0,0.1)',
                transition: 'all 0.2s ease',
                position: 'relative',
              }}
              title={`${swatch.label} (${swatch.id})`}
              onClick={() => onChange(swatch.id)}
              aria-label={swatch.label}
            >
              {isSelected && <Check size={16} color={['fair', 'fair_light', 'light'].includes(swatch.id) ? '#333' : '#fff'} />}
            </button>
          )
        })}

        <button
          type="button"
          className={`chip-editorial ${isPreferNotToSay ? 'active' : ''}`}
          onClick={() => onChange('prefer_not_to_say')}
          style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
        >
          Prefer not to say
        </button>
      </div>

      {value && value !== 'prefer_not_to_say' && (
        <span className="selected-depth-hint" style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block' }}>
          Selected complexion depth: <strong>{SKIN_DEPTH_OPTIONS.find((s) => s.id === value)?.label || value}</strong>
        </span>
      )}
    </div>
  )
}
