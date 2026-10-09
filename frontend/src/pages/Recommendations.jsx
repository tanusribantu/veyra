import React, { useState, useEffect } from 'react'
import { Sparkles, SlidersHorizontal, RefreshCw, AlertCircle, BookmarkCheck } from 'lucide-react'
import OutfitLookbookCard from '../components/OutfitLookbookCard'
import { api } from '../services/api'
import { useToast } from '../components/Toast'

const OCCASIONS = [
  { id: 'casual', label: 'Casual', desc: 'Relaxed everyday wear & comfort' },
  { id: 'work', label: 'Work', desc: 'Smart-casual to professional polish' },
  { id: 'formal', label: 'Formal', desc: 'Elevated tailoring & dress footwear' },
  { id: 'college', label: 'College', desc: 'Practical & expressive campus style' },
  { id: 'date_night', label: 'Date Night', desc: 'Sharp, intentional evening aesthetic' },
  { id: 'party', label: 'Party', desc: 'Modern social gatherings & silhouettes' },
]

export default function Recommendations({ onOpenMeasurements }) {
  const { addToast } = useToast()
  const [selectedOccasion, setSelectedOccasion] = useState('casual')
  const [recommendations, setRecommendations] = useState([])
  const [measurementsMissing, setMeasurementsMissing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState(null)

  useEffect(() => {
    generateOutfits(selectedOccasion)
  }, [selectedOccasion])

  const generateOutfits = async (occasion) => {
    setIsLoading(true)
    setErrorMsg(null)
    try {
      const response = await api.generateRecommendations({
        occasion: occasion || selectedOccasion,
        resultLimit: 3,
      })

      setRecommendations(response.recommendations || [])
      setMeasurementsMissing(Boolean(response.measurements_missing))
    } catch (err) {
      console.error('Failed to generate outfits:', err)
      setErrorMsg(err.message || 'Unable to generate outfit combinations.')
      addToast('Recommendation engine could not generate lookbook.', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleFeedback = async (recId, feedbackType) => {
    try {
      await api.submitFeedback(recId, { feedbackType })
      const labelMap = {
        like: 'Added to your stylistic preferences.',
        dislike: 'Understood. We will tune down similar pairings.',
        save: 'Outfit saved to your curated lookbook archive.',
        skip: 'Outfit skipped for today.',
        worn: 'Marked as worn today. Your style journal is updated.',
      }
      addToast(labelMap[feedbackType] || 'Feedback recorded.', 'success')
    } catch (err) {
      addToast(err.message || 'Could not record feedback.', 'error')
      throw err
    }
  }

  return (
    <div className="recommendations-page container">
      {/* Studio Cover Header */}
      <div className="recommendations-header">
        <div className="header-meta-block">
          <span className="eyebrow">STYLING STUDIO &bull; EDITION 01</span>
          <h1 className="recommendations-headline">Lookbook Compositions</h1>
          <p className="recommendations-subtitle">
            Curated outfit combinations synthesized from your wardrobe archive, scored against neutral color anchors, formality synergy, and silhouette balance.
          </p>
        </div>

        <div className="header-action-block">
          <button
            type="button"
            onClick={() => generateOutfits(selectedOccasion)}
            disabled={isLoading}
            className="btn-editorial-primary"
          >
            <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} />
            <span>Generate New Edit</span>
          </button>
        </div>
      </div>

      {/* Occasion Selector: Refined Chips / Editorial List */}
      <div className="occasion-selector-section">
        <span className="editorial-label" style={{ marginBottom: '10px', display: 'block' }}>
          Select Context / Occasion
        </span>
        <div className="occasion-chips-grid">
          {OCCASIONS.map((occ) => (
            <button
              key={occ.id}
              type="button"
              className={`occasion-card-chip ${selectedOccasion === occ.id ? 'active' : ''}`}
              onClick={() => setSelectedOccasion(occ.id)}
            >
              <span className="occasion-chip-title">{occ.label}</span>
              <span className="occasion-chip-desc">{occ.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Measurements Intelligence Banner */}
      {measurementsMissing ? (
        <div className="measurements-studio-banner is-missing animate-fade-in-up">
          <div className="banner-icon-col">
            <SlidersHorizontal size={20} />
          </div>
          <div className="banner-text-col">
            <h4>Personalization Operating in Standard Mode</h4>
            <p>
              Your lookbook is scored on color harmonies and occasion rules. Add your proportion dimensions to calibrate silhouette balance (e.g. inverted triangle, hourglass, rectangle) with zero photo uploads.
            </p>
          </div>
          <div className="banner-btn-col">
            <button
              type="button"
              onClick={onOpenMeasurements}
              className="btn-editorial-secondary"
              style={{ fontSize: '0.78rem' }}
            >
              Configure Proportions
            </button>
          </div>
        </div>
      ) : (
        <div className="measurements-studio-banner is-synced animate-fade-in-up">
          <div className="banner-icon-col">
            <BookmarkCheck size={20} />
          </div>
          <div className="banner-text-col">
            <h4>Proportion Balance Active</h4>
            <p>
              Candidate outfits are weighted against your geometric body proportions and neckline-to-shoulder balance.
            </p>
          </div>
          <div className="banner-btn-col">
            <button
              type="button"
              onClick={onOpenMeasurements}
              className="btn-editorial-ghost"
              style={{ fontSize: '0.75rem' }}
            >
              View Ratios
            </button>
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="error-callout" role="alert">
          <AlertCircle size={16} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Recommendations Feed or Skeleton Shimmer */}
      {isLoading ? (
        <div className="lookbook-feed">
          {[1, 2].map((n) => (
            <div key={n} className="lookbook-skeleton editorial-card">
              <div className="skeleton-line skeleton-shimmer" style={{ width: '35%', height: '24px' }} />
              <div className="skeleton-box skeleton-shimmer" style={{ height: '240px', marginTop: '16px' }} />
              <div className="skeleton-line skeleton-shimmer" style={{ width: '60%', height: '18px', marginTop: '16px' }} />
            </div>
          ))}
        </div>
      ) : recommendations.length > 0 ? (
        <div className="lookbook-feed">
          {recommendations.map((rec, index) => (
            <OutfitLookbookCard
              key={rec.id || index}
              recommendation={rec}
              index={index}
              onFeedback={handleFeedback}
            />
          ))}
        </div>
      ) : (
        <div className="magazine-empty-state animate-fade-in-up">
          <Sparkles size={40} style={{ color: 'var(--accent-olive)', marginBottom: '16px' }} />
          <span className="eyebrow">NO COMBINATIONS DETECTED</span>
          <h3 className="empty-title">Insufficient Wardrobe Pieces</h3>
          <p className="empty-description">
            Veyra needs at least one top, one bottom, and one pair of shoes in your archive matching the {selectedOccasion} occasion to form complete lookbook compositions.
          </p>
          <button
            type="button"
            onClick={() => window.location.hash = '#wardrobe'}
            className="btn-editorial-primary"
          >
            Add Garments to Wardrobe
          </button>
        </div>
      )}
    </div>
  )
}
