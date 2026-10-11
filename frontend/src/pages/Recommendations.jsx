import React, { useState, useEffect } from 'react'
import {
  Sparkles,
  SlidersHorizontal,
  RefreshCw,
  AlertCircle,
  AlertTriangle,
  BookmarkCheck,
  ChevronDown,
  ChevronUp,
  Layers,
  X,
  Check,
  Plus,
} from 'lucide-react'
import OutfitLookbookCard from '../components/OutfitLookbookCard'
import { api } from '../services/api'
import { useToast } from '../components/Toast'

export const OCCASIONS = [
  { id: 'casual', label: 'Casual', desc: 'Relaxed everyday wear & comfort' },
  { id: 'college', label: 'College', desc: 'Practical & expressive campus style' },
  { id: 'work', label: 'Work', desc: 'Smart-casual to professional polish' },
  { id: 'smart_casual', label: 'Smart Casual', desc: 'Tailored polish balanced with relaxed ease' },
  { id: 'party', label: 'Party', desc: 'Modern social gatherings & silhouettes' },
  { id: 'formal_event', label: 'Formal Event', desc: 'Elevated tailoring & dress footwear' },
  { id: 'traditional_event', label: 'Traditional Event', desc: 'Celebratory & refined cultural occasions' },
  { id: 'date_night', label: 'Date Night', desc: 'Sharp, intentional evening aesthetic' },
]

const AVOID_CATEGORY_OPTIONS = [
  { id: 'hoodie', label: 'Hoodie' },
  { id: 'shorts', label: 'Shorts' },
  { id: 'jeans', label: 'Jeans' },
  { id: 't-shirt', label: 'T-Shirt' },
  { id: 'sneakers', label: 'Sneakers' },
  { id: 'boots', label: 'Boots' },
  { id: 'jacket', label: 'Jacket' },
  { id: 'sweater', label: 'Sweater' },
]

const AVOID_COLOR_OPTIONS = [
  'black',
  'white',
  'navy',
  'beige',
  'olive',
  'burgundy',
  'charcoal',
  'terracotta',
]

const AVOID_ACCESSORY_OPTIONS = [
  { id: 'hat', label: 'Hat' },
  { id: 'scarf', label: 'Scarf' },
  { id: 'glasses', label: 'Eyewear' },
  { id: 'belt', label: 'Belt' },
  { id: 'bag', label: 'Bag / Tote' },
  { id: 'watch', label: 'Timepiece' },
]

export default function Recommendations({ onOpenMeasurements }) {
  const { addToast } = useToast()
  const [selectedOccasion, setSelectedOccasion] = useState('casual')
  const [recommendations, setRecommendations] = useState([])
  const [measurementsMissing, setMeasurementsMissing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState(null)
  const [constraintBlocked, setConstraintBlocked] = useState(false)
  const [blockExplanation, setBlockExplanation] = useState(null)

  // Wardrobe Items for Must-Include
  const [wardrobeItems, setWardrobeItems] = useState([])
  const [isBuildMyLookOpen, setIsBuildMyLookOpen] = useState(false)

  // Active Constraint State
  const [includedItemIds, setIncludedItemIds] = useState([])
  const [includeStrengths, setIncludeStrengths] = useState({}) // itemId -> 'hard' | 'soft'

  const [avoidCategories, setAvoidCategories] = useState([])
  const [avoidCategoryStrengths, setAvoidCategoryStrengths] = useState({}) // category -> 'hard' | 'soft'

  const [avoidColors, setAvoidColors] = useState([])
  const [avoidColorStrengths, setAvoidColorStrengths] = useState({}) // color -> 'hard' | 'soft'

  const [avoidAccessories, setAvoidAccessories] = useState([])
  const [avoidAccessoryStrengths, setAvoidAccessoryStrengths] = useState({}) // acc -> 'hard' | 'soft'

  const [saveAsDefaults, setSaveAsDefaults] = useState(false)

  useEffect(() => {
    loadWardrobe()
    loadDefaultConstraints()
  }, [])

  useEffect(() => {
    generateOutfits(selectedOccasion)
  }, [selectedOccasion])

  const loadWardrobe = async () => {
    try {
      const data = await api.getWardrobe()
      setWardrobeItems(data.items || [])
    } catch {
      // ignore
    }
  }

  const loadDefaultConstraints = async () => {
    try {
      const data = await api.getConstraints({ is_saved_default: true })
      const defaults = data.constraints || []
      defaults.forEach((c) => {
        if (c.constraint_type === 'must_include' && c.target_type === 'item_id') {
          setIncludedItemIds((prev) => [...new Set([...prev, c.target_value])])
          setIncludeStrengths((prev) => ({ ...prev, [c.target_value]: c.strength }))
        } else if (c.constraint_type === 'avoid' && c.target_type === 'category') {
          setAvoidCategories((prev) => [...new Set([...prev, c.target_value])])
          setAvoidCategoryStrengths((prev) => ({ ...prev, [c.target_value]: c.strength }))
        } else if (c.constraint_type === 'avoid' && c.target_type === 'color') {
          setAvoidColors((prev) => [...new Set([...prev, c.target_value])])
          setAvoidColorStrengths((prev) => ({ ...prev, [c.target_value]: c.strength }))
        } else if (c.constraint_type === 'avoid' && c.target_type === 'accessory_type') {
          setAvoidAccessories((prev) => [...new Set([...prev, c.target_value])])
          setAvoidAccessoryStrengths((prev) => ({ ...prev, [c.target_value]: c.strength }))
        }
      })
    } catch {
      // ignore
    }
  }

  const buildConstraintsPayload = () => {
    const list = []
    includedItemIds.forEach((id) => {
      list.push({
        constraint_type: 'must_include',
        target_type: 'item_id',
        target_value: id,
        strength: includeStrengths[id] || 'hard',
      })
    })
    avoidCategories.forEach((cat) => {
      list.push({
        constraint_type: 'avoid',
        target_type: 'category',
        target_value: cat,
        strength: avoidCategoryStrengths[cat] || 'hard',
      })
    })
    avoidColors.forEach((col) => {
      list.push({
        constraint_type: 'avoid',
        target_type: 'color',
        target_value: col,
        strength: avoidColorStrengths[col] || 'hard',
      })
    })
    avoidAccessories.forEach((acc) => {
      list.push({
        constraint_type: 'avoid',
        target_type: 'accessory_type',
        target_value: acc,
        strength: avoidAccessoryStrengths[acc] || 'hard',
      })
    })
    return list
  }

  const generateOutfits = async (occasion) => {
    setIsLoading(true)
    setErrorMsg(null)
    setConstraintBlocked(false)
    setBlockExplanation(null)

    const constraints = buildConstraintsPayload()

    try {
      // If saveAsDefaults is selected, persist defaults to backend
      if (saveAsDefaults && constraints.length > 0) {
        for (const c of constraints) {
          try {
            await api.saveConstraint({ ...c, is_saved_default: true })
          } catch {
            // ignore duplicates
          }
        }
      }

      const response = await api.generateRecommendations({
        occasion: occasion || selectedOccasion,
        constraints: constraints.length > 0 ? constraints : null,
        resultLimit: 3,
      })

      setRecommendations(response.recommendations || [])
      setMeasurementsMissing(Boolean(response.measurements_missing))
      if (response.constraint_blocked) {
        setConstraintBlocked(true)
        setBlockExplanation(response.block_explanation)
      }
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

  const toggleIncludeItem = (itemId) => {
    if (includedItemIds.includes(itemId)) {
      setIncludedItemIds(includedItemIds.filter((id) => id !== itemId))
    } else {
      setIncludedItemIds([...includedItemIds, itemId])
      if (!includeStrengths[itemId]) {
        setIncludeStrengths((prev) => ({ ...prev, [itemId]: 'hard' }))
      }
    }
  }

  const toggleAvoidCategory = (catId) => {
    if (avoidCategories.includes(catId)) {
      setAvoidCategories(avoidCategories.filter((c) => c !== catId))
    } else {
      setAvoidCategories([...avoidCategories, catId])
      if (!avoidCategoryStrengths[catId]) {
        setAvoidCategoryStrengths((prev) => ({ ...prev, [catId]: 'hard' }))
      }
    }
  }

  const toggleAvoidColor = (color) => {
    if (avoidColors.includes(color)) {
      setAvoidColors(avoidColors.filter((c) => c !== color))
    } else {
      setAvoidColors([...avoidColors, color])
      if (!avoidColorStrengths[color]) {
        setAvoidColorStrengths((prev) => ({ ...prev, [color]: 'hard' }))
      }
    }
  }

  const toggleAvoidAccessory = (accId) => {
    if (avoidAccessories.includes(accId)) {
      setAvoidAccessories(avoidAccessories.filter((a) => a !== accId))
    } else {
      setAvoidAccessories([...avoidAccessories, accId])
      if (!avoidAccessoryStrengths[accId]) {
        setAvoidAccessoryStrengths((prev) => ({ ...prev, [accId]: 'hard' }))
      }
    }
  }

  const totalConstraintsCount =
    includedItemIds.length +
    avoidCategories.length +
    avoidColors.length +
    avoidAccessories.length

  const clearAllConstraints = () => {
    setIncludedItemIds([])
    setIncludeStrengths({})
    setAvoidCategories([])
    setAvoidCategoryStrengths({})
    setAvoidColors([])
    setAvoidColorStrengths({})
    setAvoidAccessories([])
    setAvoidAccessoryStrengths({})
    setSaveAsDefaults(false)
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

      {/* Occasion Selector: Exact Master Prompt 8 Occasions */}
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

      {/* Build My Look Control Panel */}
      <div className="build-my-look-container editorial-card" style={{ marginBottom: '2rem' }}>
        <div
          className="build-my-look-header"
          onClick={() => setIsBuildMyLookOpen((prev) => !prev)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') setIsBuildMyLookOpen((prev) => !prev)
          }}
          aria-expanded={isBuildMyLookOpen}
        >
          <div className="build-header-left">
            <Layers size={18} className="section-icon" />
            <div>
              <h3 style={{ fontSize: '1.05rem', margin: 0, fontWeight: 600 }}>
                Build My Look
                {totalConstraintsCount > 0 && (
                  <span className="active-constraints-badge">
                    {totalConstraintsCount} active
                  </span>
                )}
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>
                Pick wardrobe items to feature, set categories or colors to avoid, and toggle hard vs soft requirements.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span className="editorial-link" style={{ fontSize: '0.8rem' }}>
              {isBuildMyLookOpen ? 'Close Controls' : 'Configure Constraints'}
            </span>
            {isBuildMyLookOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        </div>

        {isBuildMyLookOpen && (
          <div className="build-my-look-body animate-fade-in-up" style={{ marginTop: '1.25rem' }}>
            {/* 1. Pick Wardrobe Items to Include */}
            <div className="constraint-section-group" style={{ marginBottom: '1.5rem' }}>
              <span className="eyebrow" style={{ color: 'var(--accent-olive)', marginBottom: '6px', display: 'block' }}>
                1. FEATURE WARDROBE ITEMS (MUST INCLUDE)
              </span>
              <p className="section-desc" style={{ fontSize: '0.84rem', marginBottom: '8px' }}>
                Select garments from your collection that must be anchored into this look.
              </p>

              {wardrobeItems.length > 0 ? (
                <div className="wardrobe-picker-chips">
                  {wardrobeItems.map((item) => {
                    const isSelected = includedItemIds.includes(item.id)
                    const strength = includeStrengths[item.id] || 'hard'
                    return (
                      <div
                        key={item.id}
                        className={`item-picker-chip ${isSelected ? 'is-picked' : ''}`}
                      >
                        <button
                          type="button"
                          className="chip-select-btn"
                          onClick={() => toggleIncludeItem(item.id)}
                        >
                          {isSelected && <Check size={12} style={{ marginRight: '4px' }} />}
                          <span>{item.name}</span>
                          <span className="chip-sub">({item.category})</span>
                        </button>

                        {isSelected && (
                          <div className="strength-toggle-pills">
                            <button
                              type="button"
                              className={`pill-btn ${strength === 'hard' ? 'active-hard' : ''}`}
                              onClick={() => setIncludeStrengths({ ...includeStrengths, [item.id]: 'hard' })}
                              title="Hard constraint (mandatory candidate filter)"
                            >
                              Hard
                            </button>
                            <button
                              type="button"
                              className={`pill-btn ${strength === 'soft' ? 'active-soft' : ''}`}
                              onClick={() => setIncludeStrengths({ ...includeStrengths, [item.id]: 'soft' })}
                              title="Soft constraint (scoring weight bonus)"
                            >
                              Soft
                            </button>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                  No garments found in wardrobe archive. Add pieces in the Wardrobe tab to anchor items here.
                </p>
              )}
            </div>

            {/* 2. Choose Elements to Avoid */}
            <div className="constraint-section-group" style={{ marginBottom: '1.5rem' }}>
              <span className="eyebrow" style={{ color: 'var(--accent-terracotta)', marginBottom: '6px', display: 'block' }}>
                2. AVOID STYLING ELEMENTS
              </span>

              {/* Categories */}
              <div style={{ marginBottom: '1rem' }}>
                <span className="input-label" style={{ fontSize: '0.8rem' }}>Avoid Categories</span>
                <div className="wardrobe-picker-chips" style={{ marginTop: '4px' }}>
                  {AVOID_CATEGORY_OPTIONS.map((cat) => {
                    const isSelected = avoidCategories.includes(cat.id)
                    const strength = avoidCategoryStrengths[cat.id] || 'hard'
                    return (
                      <div key={cat.id} className={`item-picker-chip ${isSelected ? 'is-avoided' : ''}`}>
                        <button
                          type="button"
                          className="chip-select-btn"
                          onClick={() => toggleAvoidCategory(cat.id)}
                        >
                          {isSelected && <X size={12} style={{ marginRight: '4px' }} />}
                          <span>{cat.label}</span>
                        </button>
                        {isSelected && (
                          <div className="strength-toggle-pills">
                            <button
                              type="button"
                              className={`pill-btn ${strength === 'hard' ? 'active-hard' : ''}`}
                              onClick={() => setAvoidCategoryStrengths({ ...avoidCategoryStrengths, [cat.id]: 'hard' })}
                            >
                              Hard
                            </button>
                            <button
                              type="button"
                              className={`pill-btn ${strength === 'soft' ? 'active-soft' : ''}`}
                              onClick={() => setAvoidCategoryStrengths({ ...avoidCategoryStrengths, [cat.id]: 'soft' })}
                            >
                              Soft
                            </button>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Colors */}
              <div style={{ marginBottom: '1rem' }}>
                <span className="input-label" style={{ fontSize: '0.8rem' }}>Avoid Colors</span>
                <div className="wardrobe-picker-chips" style={{ marginTop: '4px' }}>
                  {AVOID_COLOR_OPTIONS.map((color) => {
                    const isSelected = avoidColors.includes(color)
                    const strength = avoidColorStrengths[color] || 'hard'
                    return (
                      <div key={color} className={`item-picker-chip ${isSelected ? 'is-avoided' : ''}`}>
                        <button
                          type="button"
                          className="chip-select-btn"
                          onClick={() => toggleAvoidColor(color)}
                        >
                          {isSelected && <X size={12} style={{ marginRight: '4px' }} />}
                          <span>{color}</span>
                        </button>
                        {isSelected && (
                          <div className="strength-toggle-pills">
                            <button
                              type="button"
                              className={`pill-btn ${strength === 'hard' ? 'active-hard' : ''}`}
                              onClick={() => setAvoidColorStrengths({ ...avoidColorStrengths, [color]: 'hard' })}
                            >
                              Hard
                            </button>
                            <button
                              type="button"
                              className={`pill-btn ${strength === 'soft' ? 'active-soft' : ''}`}
                              onClick={() => setAvoidColorStrengths({ ...avoidColorStrengths, [color]: 'soft' })}
                            >
                              Soft
                            </button>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Accessories */}
              <div>
                <span className="input-label" style={{ fontSize: '0.8rem' }}>Avoid Accessory Types</span>
                <div className="wardrobe-picker-chips" style={{ marginTop: '4px' }}>
                  {AVOID_ACCESSORY_OPTIONS.map((acc) => {
                    const isSelected = avoidAccessories.includes(acc.id)
                    const strength = avoidAccessoryStrengths[acc.id] || 'hard'
                    return (
                      <div key={acc.id} className={`item-picker-chip ${isSelected ? 'is-avoided' : ''}`}>
                        <button
                          type="button"
                          className="chip-select-btn"
                          onClick={() => toggleAvoidAccessory(acc.id)}
                        >
                          {isSelected && <X size={12} style={{ marginRight: '4px' }} />}
                          <span>{acc.label}</span>
                        </button>
                        {isSelected && (
                          <div className="strength-toggle-pills">
                            <button
                              type="button"
                              className={`pill-btn ${strength === 'hard' ? 'active-hard' : ''}`}
                              onClick={() => setAvoidAccessoryStrengths({ ...avoidAccessoryStrengths, [acc.id]: 'hard' })}
                            >
                              Hard
                            </button>
                            <button
                              type="button"
                              className={`pill-btn ${strength === 'soft' ? 'active-soft' : ''}`}
                              onClick={() => setAvoidAccessoryStrengths({ ...avoidAccessoryStrengths, [acc.id]: 'soft' })}
                            >
                              Soft
                            </button>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Bottom Actions for Build My Look */}
            <div className="build-my-look-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
              <label className="save-defaults-checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
                <input
                  type="checkbox"
                  checked={saveAsDefaults}
                  onChange={(e) => setSaveAsDefaults(e.target.checked)}
                />
                <span>Save active constraints as default atelier rules</span>
              </label>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                {totalConstraintsCount > 0 && (
                  <button
                    type="button"
                    onClick={clearAllConstraints}
                    className="btn-editorial-ghost"
                    style={{ fontSize: '0.8rem' }}
                  >
                    Reset Constraints
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => generateOutfits(selectedOccasion)}
                  disabled={isLoading}
                  className="btn-editorial-primary"
                  style={{ fontSize: '0.82rem' }}
                >
                  <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
                  <span>Apply & Generate</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Hard Constraint Blocked Alert (Phase 3 Requirement 4) */}
      {constraintBlocked && blockExplanation && (
        <div className="constraint-blocked-alert animate-fade-in-up" role="alert" style={{ marginBottom: '1.5rem' }}>
          <div className="alert-header" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-terracotta)', fontWeight: 600, marginBottom: '6px' }}>
            <AlertTriangle size={18} />
            <span>Hard Constraints Cannot Be Satisfied</span>
          </div>
          <p style={{ fontSize: '0.88rem', lineHeight: '1.5', margin: '0 0 8px 0' }}>
            {blockExplanation}
          </p>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block' }}>
            Showing closest fallback candidate below. You can toggle constraints from "Hard" to "Soft" in the Build My Look controls above to allow more flexible pairings.
          </span>
        </div>
      )}

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
              wardrobeItems={wardrobeItems}
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
            onClick={() => (window.location.hash = '#wardrobe')}
            className="btn-editorial-primary"
          >
            Add Garments to Wardrobe
          </button>
        </div>
      )}
    </div>
  )
}
