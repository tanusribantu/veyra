import React, { useState } from 'react'
import { X } from 'lucide-react'
import GarmentSvg from './GarmentSvg'
import { api } from '../services/api'
import { useToast } from './Toast'

const QUICK_COLORS = [
  'white',
  'black',
  'charcoal',
  'navy',
  'blue',
  'beige',
  'camel',
  'cream',
  'khaki',
  'olive',
  'burgundy',
  'terracotta',
  'denim',
]

const CATEGORIES = [
  { id: 'shirt', label: 'Tailored Shirt', slot: 'top' },
  { id: 't-shirt', label: 'T-Shirt / Polo', slot: 'top' },
  { id: 'kurta', label: 'Kurta / Bandhgala', slot: 'top' },
  { id: 'kurti', label: 'Kurti / Tunic', slot: 'top' },
  { id: 'blouse', label: 'Blouse / Top', slot: 'top' },
  { id: 'sweater', label: 'Knit / Sweater', slot: 'top' },
  { id: 'jacket', label: 'Jacket / Blazer', slot: 'top' },
  { id: 'dress', label: 'Dress / Gown', slot: 'top' },
  { id: 'saree', label: 'Saree / Draped Garment', slot: 'top' },
  { id: 'trousers', label: 'Trousers / Slacks', slot: 'bottom' },
  { id: 'chinos', label: 'Chinos', slot: 'bottom' },
  { id: 'jeans', label: 'Denim Jeans', slot: 'bottom' },
  { id: 'skirt', label: 'Skirt / Maxi', slot: 'bottom' },
  { id: 'sneakers', label: 'Sneakers', slot: 'footwear' },
  { id: 'loafers', label: 'Loafers / Oxfords', slot: 'footwear' },
  { id: 'boots', label: 'Boots', slot: 'footwear' },
  { id: 'accessory', label: 'Accessory Piece', slot: 'accessory' },
]

const LANE_CATEGORY_SUGGESTIONS = {
  menswear: ['shirt', 't-shirt', 'jacket', 'sweater', 'kurta', 'trousers', 'chinos', 'jeans', 'sneakers', 'loafers', 'boots', 'accessory'],
  womenswear: ['blouse', 'dress', 'saree', 'skirt', 'kurti', 'shirt', 't-shirt', 'sweater', 'jacket', 'trousers', 'jeans', 'sneakers', 'loafers', 'boots', 'accessory'],
  mixed: ['shirt', 'blouse', 'kurta', 'kurti', 'dress', 'saree', 'jacket', 'sweater', 't-shirt', 'trousers', 'chinos', 'jeans', 'skirt', 'sneakers', 'loafers', 'boots', 'accessory'],
  prefer_not_to_say: ['shirt', 't-shirt', 'kurta', 'kurti', 'blouse', 'dress', 'saree', 'sweater', 'jacket', 'trousers', 'chinos', 'jeans', 'skirt', 'sneakers', 'loafers', 'boots', 'accessory'],
}

const LANE_SILHOUETTE_SUGGESTIONS = {
  menswear: ['straight', 'fitted', 'relaxed'],
  womenswear: ['flowy', 'fitted', 'relaxed', 'wide_leg', 'cropped', 'straight'],
  mixed: ['straight', 'relaxed', 'fitted', 'flowy', 'wide_leg', 'cropped'],
  prefer_not_to_say: ['straight', 'relaxed', 'fitted', 'flowy', 'wide_leg', 'cropped'],
}

const SILHOUETTES = [
  { id: 'fitted', label: 'Fitted' },
  { id: 'straight', label: 'Straight' },
  { id: 'relaxed', label: 'Relaxed' },
  { id: 'wide_leg', label: 'Wide Leg' },
  { id: 'cropped', label: 'Cropped' },
  { id: 'flowy', label: 'Flowy' },
]

const NECKLINES = [
  { id: 'crew', label: 'Crew Neck' },
  { id: 'v_neck', label: 'V-Neck' },
  { id: 'collared', label: 'Collared' },
  { id: 'scoop', label: 'Scoop' },
  { id: 'boat', label: 'Boat Neck' },
  { id: 'none', label: 'None / Footwear' },
]

const LENGTHS = [
  { id: 'short', label: 'Short' },
  { id: 'regular', label: 'Regular' },
  { id: 'long', label: 'Long' },
]

const ACCESSORY_TYPES = [
  { id: 'watch', label: 'Watch / Timepiece' },
  { id: 'belt', label: 'Leather Belt' },
  { id: 'bag', label: 'Tote / Bag' },
  { id: 'scarf', label: 'Silk / Wool Scarf' },
  { id: 'glasses', label: 'Eyewear' },
  { id: 'hat', label: 'Hat' },
  { id: 'necklace', label: 'Necklace' },
  { id: 'earrings', label: 'Earrings' },
  { id: 'other', label: 'Other Accent' },
]

export default function WardrobeItemModal({ isOpen, onClose, onItemSaved, initialItem = null, stylingLane = null }) {
  const { addToast } = useToast()
  const isEditing = Boolean(initialItem)

  const [form, setForm] = useState(() => ({
    name: initialItem?.name || '',
    category: initialItem?.category || 'shirt',
    slot: initialItem?.slot || 'top',
    primary_color: initialItem?.color || initialItem?.primary_color || 'navy',
    formality: initialItem?.formality || 2,
    silhouette: initialItem?.silhouette || 'straight',
    neckline: initialItem?.neckline || 'collared',
    length: initialItem?.length || 'regular',
    accessory_type: initialItem?.accessory_type || '',
    fit: initialItem?.fit || 'regular',
    pattern: initialItem?.pattern || 'solid',
  }))

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState(null)

  const suggestedCategoryIds = LANE_CATEGORY_SUGGESTIONS[stylingLane] || []
  const suggestedSilhouettes = LANE_SILHOUETTE_SUGGESTIONS[stylingLane] || []

  const displayedCategories = [...CATEGORIES].sort((a, b) => {
    if (stylingLane === 'menswear' || stylingLane === 'womenswear') {
      const aSug = suggestedCategoryIds.includes(a.id)
      const bSug = suggestedCategoryIds.includes(b.id)
      if (aSug && !bSug) return -1
      if (!aSug && bSug) return 1
    }
    return 0
  })

  if (!isOpen) return null

  const handleCategoryChange = (catId) => {
    const matched = CATEGORIES.find((c) => c.id === catId)
    const newSlot = matched ? matched.slot : 'top'
    setForm((prev) => ({
      ...prev,
      category: catId,
      slot: newSlot,
      accessory_type: newSlot === 'accessory' ? (prev.accessory_type || 'watch') : prev.accessory_type,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrorMsg(null)

    try {
      const payload = {
        name: form.name.trim(),
        category: form.category,
        slot: form.slot,
        color: form.primary_color.trim().toLowerCase(),
        primary_color: form.primary_color.trim().toLowerCase(),
        formality: Number(form.formality),
        fit: form.fit,
        pattern: form.pattern,
        silhouette: form.silhouette || null,
        neckline: form.neckline || null,
        length: form.length || null,
        accessory_type: form.slot === 'accessory' || form.accessory_type ? (form.accessory_type || 'other') : null,
      }

      if (isEditing) {
        await api.updateWardrobeItem(initialItem.id, payload)
        addToast(`Updated "${form.name}" in your collection.`, 'success')
      } else {
        await api.createWardrobeItem(payload)
        addToast(`Added "${form.name}" to your digital wardrobe.`, 'success')
      }
      if (onItemSaved) onItemSaved()
      onClose()
    } catch (err) {
      setErrorMsg(err.message || 'Error saving wardrobe item.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="modal-backdrop animate-fade-in-up" role="dialog" aria-modal="true" aria-labelledby="wardrobe-modal-title">
      <div className="modal-container editorial-modal" style={{ maxWidth: '860px' }}>
        <div className="modal-header">
          <div>
            <span className="eyebrow">Digital Atelier</span>
            <h2 id="wardrobe-modal-title" className="modal-title">
              {isEditing ? 'Refine Garment' : 'Acquire Garment to Wardrobe'}
            </h2>
          </div>
          <button type="button" onClick={onClose} className="modal-close-btn" aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        {errorMsg && <div className="error-callout" role="alert">{errorMsg}</div>}

        <div className="garment-modal-layout">
          {/* Live Architectural SVG Preview */}
          <div className="garment-preview-column">
            <span className="eyebrow" style={{ textAlign: 'center', display: 'block' }}>Architectural Draft</span>
            <div className="garment-preview-box">
              <GarmentSvg
                category={form.category}
                slot={form.slot}
                primaryColor={form.primary_color}
                silhouette={form.silhouette}
                size={180}
              />
            </div>
            <div className="preview-caption">
              <strong>{form.name || 'Untitled Garment'}</strong>
              <span>
                {form.primary_color} • {form.silhouette} • Formality {form.formality}/5
              </span>
            </div>
          </div>

          {/* Garment Form Fields */}
          <form onSubmit={handleSubmit} className="garment-form-column">
            <div className="form-field">
              <label htmlFor="garment-name" className="input-label">Garment Title</label>
              <input
                id="garment-name"
                type="text"
                className="editorial-input"
                placeholder="e.g. Crisp Oxford Poplin Shirt"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>

            <div className="form-field">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <span className="input-label" style={{ marginBottom: 0 }}>Garment Classification</span>
                {stylingLane && (
                  <span className="eyebrow" style={{ fontSize: '0.68rem', color: 'var(--accent-olive)' }}>
                    All garments available
                  </span>
                )}
              </div>
              <div className="chip-group">
                {displayedCategories.map((cat) => {
                  const isSuggested = suggestedCategoryIds.includes(cat.id)
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      className={`chip-editorial ${form.category === cat.id ? 'active' : ''}`}
                      onClick={() => handleCategoryChange(cat.id)}
                      title={isSuggested ? 'Suggested for your styling lane' : ''}
                    >
                      {cat.label}
                      {isSuggested && (stylingLane === 'menswear' || stylingLane === 'womenswear') && (
                        <span style={{ fontSize: '0.68rem', opacity: 0.75, marginLeft: '4px' }}>★</span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Primary Color Swatches */}
            <div className="form-field">
              <label htmlFor="primary-color-input" className="input-label">Color Tint</label>
              <div className="swatches-container">
                {QUICK_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setForm({ ...form, primary_color: c })}
                    className={`color-swatch-chip ${form.primary_color === c ? 'is-selected' : ''}`}
                    title={c}
                  >
                    <span className="swatch-disc" style={{ backgroundColor: c === 'white' ? '#FFFFFF' : c }} />
                    <span className="swatch-name">{c}</span>
                  </button>
                ))}
              </div>
              <input
                id="primary-color-input"
                type="text"
                className="editorial-input"
                placeholder="Or custom color / hex code..."
                value={form.primary_color}
                onChange={(e) => setForm({ ...form, primary_color: e.target.value })}
                style={{ marginTop: '8px' }}
              />
            </div>

            {/* Formality and Silhouette */}
            <div className="form-row-2">
              <div className="form-field">
                <label htmlFor="formality-select" className="input-label">Formality (1–5)</label>
                <select
                  id="formality-select"
                  className="editorial-select"
                  value={form.formality}
                  onChange={(e) => setForm({ ...form, formality: parseInt(e.target.value, 10) })}
                >
                  <option value={1}>1 — Ultra Casual / Lounge</option>
                  <option value={2}>2 — Casual / Weekend</option>
                  <option value={3}>3 — Smart Casual / Office</option>
                  <option value={4}>4 — Sartorial / Evening</option>
                  <option value={5}>5 — Black Tie / Formal</option>
                </select>
              </div>

              <div className="form-field">
                <label htmlFor="silhouette-select" className="input-label">Silhouette</label>
                <select
                  id="silhouette-select"
                  className="editorial-select"
                  value={form.silhouette}
                  onChange={(e) => setForm({ ...form, silhouette: e.target.value })}
                >
                  {SILHOUETTES.map((s) => {
                    const isSuggested = suggestedSilhouettes.includes(s.id)
                    return (
                      <option key={s.id} value={s.id}>
                        {s.label} {isSuggested && (stylingLane === 'menswear' || stylingLane === 'womenswear') ? '(Suggested)' : ''}
                      </option>
                    )
                  })}
                </select>
              </div>
            </div>

            {/* Neckline and Length */}
            <div className="form-row-2">
              <div className="form-field">
                <label htmlFor="neckline-select" className="input-label">Neckline</label>
                <select
                  id="neckline-select"
                  className="editorial-select"
                  value={form.neckline}
                  onChange={(e) => setForm({ ...form, neckline: e.target.value })}
                >
                  {NECKLINES.map((n) => (
                    <option key={n.id} value={n.id}>{n.label}</option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <label htmlFor="length-select" className="input-label">Length</label>
                <select
                  id="length-select"
                  className="editorial-select"
                  value={form.length}
                  onChange={(e) => setForm({ ...form, length: e.target.value })}
                >
                  {LENGTHS.map((l) => (
                    <option key={l.id} value={l.id}>{l.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Accessory Type (Visible for accessory slot or optional for any piece) */}
            <div className="form-field">
              <label htmlFor="accessory-type-select" className="input-label">
                Accessory Type {form.slot === 'accessory' ? '(Required for accessories)' : '(Optional)'}
              </label>
              <select
                id="accessory-type-select"
                className="editorial-select"
                value={form.accessory_type}
                onChange={(e) => setForm({ ...form, accessory_type: e.target.value })}
              >
                <option value="">None / Standard Apparel</option>
                {ACCESSORY_TYPES.map((a) => (
                  <option key={a.id} value={a.id}>{a.label}</option>
                ))}
              </select>
            </div>

            <div className="modal-actions-footer">
              <button type="submit" disabled={isSubmitting} className="btn-editorial-primary">
                {isSubmitting ? 'Recording...' : isEditing ? 'Update Garment' : 'Add to Collection'}
              </button>
              <button type="button" onClick={onClose} className="btn-editorial-ghost">
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
