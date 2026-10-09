import React, { useState } from 'react'
import {
  ThumbsUp,
  ThumbsDown,
  Bookmark,
  SkipForward,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import GarmentSvg from './GarmentSvg'

/**
 * RadialScoreRing — An elegant, slim SVG ring showing the outfit compatibility score.
 */
function RadialScoreRing({ score = 85, size = 56, strokeWidth = 3 }) {
  const radius = (size - strokeWidth * 2) / 2
  const circumference = 2 * Math.PI * radius
  const normalizedScore = score > 1 ? score : score * 100
  const clampedScore = Math.min(100, Math.max(0, normalizedScore))
  const strokeDashoffset = circumference - (clampedScore / 100) * circumference

  return (
    <div className="radial-score-container" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="radial-score-svg">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--border-subtle)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--accent-olive)"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.16, 1, 0.3, 1)' }}
        />
      </svg>
      <div className="radial-score-label">
        <span className="score-number">{Math.round(clampedScore)}</span>
        <span className="score-percent">%</span>
      </div>
    </div>
  )
}

/**
 * ScoreBar — Minimalist slim progress bar with human-readable explanation.
 */
function ScoreBar({ label, value, explanation }) {
  if (value === undefined || value === null) return null
  const percentage = Math.min(100, Math.max(0, Math.round(value > 1 ? value : value * 100)))

  return (
    <div className="score-bar-item animate-fade-in-up">
      <div className="score-bar-header">
        <span className="score-bar-label">{label}</span>
        <span className="score-bar-val">{percentage}%</span>
      </div>
      <div className="score-bar-track">
        <div className="score-bar-fill" style={{ width: `${percentage}%` }} />
      </div>
      {explanation && <p className="score-bar-explanation">{explanation}</p>}
    </div>
  )
}

export default function OutfitLookbookCard({
  recommendation,
  index = 0,
  onFeedback,
}) {
  const [showDetails, setShowDetails] = useState(false)
  const [activeFeedback, setActiveFeedback] = useState(
    recommendation?.feedback?.feedback_type || recommendation?.user_feedback || null
  )
  const [isSubmitting, setIsSubmitting] = useState(false)

  const items = recommendation?.items || []
  const rawScore = recommendation?.score ?? recommendation?.overall_score ?? 85
  const breakdown = recommendation?.breakdown || recommendation?.score_breakdown || {}
  const reasons = recommendation?.reasons || []
  const explanation = recommendation?.explanation || {}

  const findReason = (factor) => {
    const found = reasons.find((r) => r.factor === factor || r.factor?.startsWith(factor))
    return found ? found.message : null
  }

  const handleFeedbackClick = async (type) => {
    if (isSubmitting) return
    setIsSubmitting(true)
    try {
      if (onFeedback) {
        await onFeedback(recommendation.id, type)
      }
      setActiveFeedback(type)
    } catch (err) {
      console.error('Feedback error:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Categorize items into composed flat-lay slots
  const topItem = items.find((i) => i.slot === 'top') || items[0]
  const bottomItem = items.find((i) => i.slot === 'bottom')
  const shoesItem = items.find((i) => i.slot === 'footwear')
  const accessoryItems = items.filter((i) => i.slot === 'accessory' || i.slot === 'outerwear')

  // Score component extraction (supporting both backend naming patterns)
  const colorVal = breakdown.color_score ?? breakdown.color_harmony
  const occasionVal = breakdown.occasion_score ?? breakdown.occasion_fit
  const styleVal = breakdown.style_score ?? breakdown.style_cohesion
  const formalityVal = breakdown.formality_score ?? breakdown.formality_cohesion
  const preferenceVal = breakdown.preference_score ?? breakdown.micro_preferences
  const personalAttrVal = breakdown.personal_attribute_score ?? breakdown.personal_attributes

  return (
    <article
      className="lookbook-card animate-fade-in-up"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      {/* Editorial Card Header */}
      <div className="lookbook-header">
        <div className="lookbook-meta">
          <span className="eyebrow">Composition N° {String(index + 1).padStart(2, '0')}</span>
          <h3 className="lookbook-title">
            {recommendation?.occasion ? `${recommendation.occasion.replace('_', ' ').toUpperCase()} EDIT` : 'CURATED LOOK'}
          </h3>
          <p className="lookbook-summary">
            {explanation.summary ||
              findReason('balanced_selection') ||
              findReason('occasion_match') ||
              'A harmonious balance of color warmth and silhouette proportions.'}
          </p>
        </div>

        <div className="lookbook-score-badge">
          <RadialScoreRing score={rawScore} />
          <span className="score-caption">Compatibility</span>
        </div>
      </div>

      {/* Composed Flat-Lay Visual Area */}
      <div className="flatlay-canvas">
        <div className="flatlay-composition">
          {/* Main vertical column: Top over Bottom */}
          <div className="flatlay-main-stack">
            {topItem && (
              <div className="flatlay-item top-slot">
                <GarmentSvg
                  category={topItem.category || 'top'}
                  slot="top"
                  primaryColor={topItem.color || topItem.primary_color}
                  silhouette={topItem.silhouette}
                  size={160}
                />
                <span className="flatlay-item-label">{topItem.name}</span>
              </div>
            )}

            {bottomItem && (
              <div className="flatlay-item bottom-slot">
                <GarmentSvg
                  category={bottomItem.category || 'bottom'}
                  slot="bottom"
                  primaryColor={bottomItem.color || bottomItem.primary_color}
                  silhouette={bottomItem.silhouette}
                  size={160}
                />
                <span className="flatlay-item-label">{bottomItem.name}</span>
              </div>
            )}
          </div>

          {/* Side column: Footwear & Accessories */}
          <div className="flatlay-side-stack">
            {shoesItem && (
              <div className="flatlay-item shoes-slot">
                <GarmentSvg
                  category="footwear"
                  slot="footwear"
                  primaryColor={shoesItem.color || shoesItem.primary_color}
                  size={130}
                />
                <span className="flatlay-item-label">{shoesItem.name}</span>
              </div>
            )}

            {accessoryItems.map((acc, aIdx) => (
              <div key={acc.id || aIdx} className="flatlay-item accessory-slot">
                <GarmentSvg
                  category={acc.category || 'accessory'}
                  slot={acc.slot || 'accessory'}
                  primaryColor={acc.color || acc.primary_color}
                  size={110}
                />
                <span className="flatlay-item-label">{acc.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Expandable Breakdown Drawer */}
      <div className="lookbook-breakdown-section">
        <button
          type="button"
          onClick={() => setShowDetails((prev) => !prev)}
          className="btn-breakdown-toggle"
          aria-expanded={showDetails}
        >
          <span>Score Breakdown & Principles</span>
          {showDetails ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {showDetails && (
          <div className="breakdown-details-panel animate-fade-in-up">
            <div className="breakdown-bars-grid">
              {colorVal !== undefined && colorVal !== null && (
                <ScoreBar
                  label="Color Compatibility"
                  value={colorVal}
                  explanation={findReason('color_compatibility') || explanation.color_rule || 'Harmonious palette anchored by neutral undertones.'}
                />
              )}

              {occasionVal !== undefined && occasionVal !== null && (
                <ScoreBar
                  label="Occasion Suitability"
                  value={occasionVal}
                  explanation={findReason('occasion_match') || explanation.occasion_suitability || 'Formality aligned with contextual social expectations.'}
                />
              )}

              {styleVal !== undefined && styleVal !== null && (
                <ScoreBar
                  label="Style Preference Match"
                  value={styleVal}
                  explanation={findReason('style_alignment') || 'Cohesive aesthetic aligning with personal stylistic direction.'}
                />
              )}

              {formalityVal !== undefined && formalityVal !== null && (
                <ScoreBar
                  label="Formality Cohesion"
                  value={formalityVal}
                  explanation={findReason('formality_cohesion') || 'Piece-to-piece internal formality consistency.'}
                />
              )}

              {preferenceVal !== undefined && preferenceVal !== null && (
                <ScoreBar
                  label="Micro-Preference Adherence"
                  value={preferenceVal}
                  explanation={findReason('personal_preferences') || 'Adherence to favorite colors, fits, and pattern limits.'}
                />
              )}

              {/* Personal Attribute Match: Shown ONLY when active, hidden when skipped */}
              {personalAttrVal !== undefined && personalAttrVal !== null && (
                <ScoreBar
                  label="Personal Attribute Match"
                  value={personalAttrVal}
                  explanation={
                    findReason('body_shape_silhouette') ||
                    findReason('complexion_warmth') ||
                    findReason('neckline_face_shape') ||
                    explanation.silhouette_balance ||
                    'Silhouette and neckline synergy tailored to your natural proportions.'
                  }
                />
              )}
            </div>

            {/* Structured Reasons List */}
            {reasons.length > 0 && (
              <div className="tradeoffs-box" style={{ marginTop: '1.25rem' }}>
                <span className="eyebrow" style={{ fontSize: '0.68rem', marginBottom: '6px', display: 'block' }}>
                  Transparent Scoring Evidence
                </span>
                <ul className="reasons-bullet-list">
                  {reasons.map((r, rIdx) => (
                    <li key={rIdx} className="reason-bullet-item">
                      <strong>{r.factor?.replace(/_/g, ' ').toUpperCase()}:</strong> {r.message}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Lookbook Footer Actions (Feedback Loop: Like, Dislike, Save, Skip, Worn) */}
      <div className="lookbook-actions-footer">
        <div className="feedback-button-group">
          {/* Like */}
          <button
            type="button"
            onClick={() => handleFeedbackClick('like')}
            disabled={isSubmitting}
            className={`btn-feedback-chip ${activeFeedback === 'like' ? 'is-active-like' : ''}`}
            aria-label="Like this look"
          >
            <ThumbsUp size={14} />
            <span>Like</span>
          </button>

          {/* Dislike */}
          <button
            type="button"
            onClick={() => handleFeedbackClick('dislike')}
            disabled={isSubmitting}
            className={`btn-feedback-chip ${activeFeedback === 'dislike' ? 'is-active-dislike' : ''}`}
            aria-label="Dislike this look"
          >
            <ThumbsDown size={14} />
            <span>Dislike</span>
          </button>

          {/* Save */}
          <button
            type="button"
            onClick={() => handleFeedbackClick('save')}
            disabled={isSubmitting}
            className={`btn-feedback-chip ${activeFeedback === 'save' ? 'is-active-save' : ''}`}
            aria-label="Save this look"
          >
            <Bookmark size={14} />
            <span>Save</span>
          </button>

          {/* Skip */}
          <button
            type="button"
            onClick={() => handleFeedbackClick('skip')}
            disabled={isSubmitting}
            className={`btn-feedback-chip ${activeFeedback === 'skip' ? 'is-active-skip' : ''}`}
            aria-label="Skip this look"
          >
            <SkipForward size={14} />
            <span>Skip</span>
          </button>

          {/* Worn */}
          <button
            type="button"
            onClick={() => handleFeedbackClick('worn')}
            disabled={isSubmitting}
            className={`btn-feedback-chip ${activeFeedback === 'worn' ? 'is-active-worn' : ''}`}
            aria-label="Mark as worn today"
          >
            <CheckCircle2 size={14} />
            <span>Worn</span>
          </button>
        </div>
      </div>
    </article>
  )
}
