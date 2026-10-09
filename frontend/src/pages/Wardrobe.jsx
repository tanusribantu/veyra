import React, { useState, useEffect } from 'react'
import { Plus, Trash2, Filter, Sparkles, AlertCircle } from 'lucide-react'
import GarmentSvg from '../components/GarmentSvg'
import WardrobeItemModal from '../components/WardrobeItemModal'
import { api } from '../services/api'
import { useToast } from '../components/Toast'

const CATEGORY_TABS = [
  { id: 'all', label: 'Complete Archive' },
  { id: 'top', label: 'Tops & Shirts' },
  { id: 'bottom', label: 'Bottoms & Trousers' },
  { id: 'footwear', label: 'Footwear' },
  { id: 'outerwear', label: 'Outerwear' },
  { id: 'accessory', label: 'Accessories' },
]

export default function Wardrobe() {
  const { addToast } = useToast()
  const [items, setItems] = useState([])
  const [activeCategory, setActiveCategory] = useState('all')
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [itemToDelete, setItemToDelete] = useState(null)

  useEffect(() => {
    loadWardrobe()
  }, [activeCategory])

  const loadWardrobe = async () => {
    setIsLoading(true)
    try {
      const params = {}
      if (activeCategory !== 'all') {
        params.slot = activeCategory
      }
      const data = await api.getWardrobe(params)
      setItems(data || [])
    } catch (err) {
      console.error('Failed to load wardrobe:', err)
      addToast('Unable to connect to wardrobe archive.', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteItem = async (itemId, itemName) => {
    try {
      await api.deleteWardrobeItem(itemId)
      setItems((prev) => prev.filter((i) => i.id !== itemId))
      setItemToDelete(null)
      addToast(`"${itemName}" removed from your archive.`, 'info')
    } catch (err) {
      addToast(err.message || 'Failed to remove garment.', 'error')
    }
  }

  const filteredItems = items.filter((item) => {
    if (activeCategory === 'all') return true
    return item.slot === activeCategory || item.category === activeCategory
  })

  return (
    <div className="wardrobe-page container">
      {/* Magazine Header */}
      <div className="wardrobe-header">
        <div className="wardrobe-title-block">
          <span className="eyebrow">DIGITAL WARDROBE ARCHIVE</span>
          <h1 className="wardrobe-headline">The Curated Collection</h1>
          <p className="wardrobe-subtitle">
            Every garment in your rotation, catalogued by architectural silhouette, color warmth, and contextual formality.
          </p>
        </div>

        <div className="wardrobe-header-actions">
          <button
            type="button"
            onClick={() => {
              setEditingItem(null)
              setIsModalOpen(true)
            }}
            className="btn-editorial-primary"
          >
            <Plus size={16} />
            <span>Acquire Garment</span>
          </button>
        </div>
      </div>

      {/* Category Filter Chips */}
      <div className="wardrobe-filter-bar">
        <div className="chip-group">
          {CATEGORY_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`chip-editorial ${activeCategory === tab.id ? 'active' : ''}`}
              onClick={() => setActiveCategory(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <span className="wardrobe-count-label">
          {items.length} {items.length === 1 ? 'Garment' : 'Garments'} in Archive
        </span>
      </div>

      {/* Wardrobe Grid or Loading Shimmer */}
      {isLoading ? (
        <div className="magazine-grid">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="magazine-card skeleton-card">
              <div className="skeleton-image skeleton-shimmer" />
              <div className="skeleton-text skeleton-shimmer" style={{ width: '70%', height: '18px', marginTop: '12px' }} />
              <div className="skeleton-text skeleton-shimmer" style={{ width: '40%', height: '14px', marginTop: '6px' }} />
            </div>
          ))}
        </div>
      ) : filteredItems.length > 0 ? (
        <div className="magazine-grid">
          {filteredItems.map((item, index) => (
            <article
              key={item.id}
              className="magazine-card animate-fade-in-up"
              style={{ animationDelay: `${(index % 6) * 0.08}s` }}
            >
              {/* Garment Visual Canvas */}
              <div className="magazine-image-frame">
                <GarmentSvg
                  category={item.category}
                  slot={item.slot}
                  primaryColor={item.primary_color}
                  silhouette={item.silhouette}
                  size={190}
                />
                <div className="magazine-card-hover-actions">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingItem(item)
                      setIsModalOpen(true)
                    }}
                    className="btn-card-action"
                    aria-label={`Edit ${item.name}`}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setItemToDelete(item)}
                    className="btn-card-action btn-card-delete"
                    aria-label={`Delete ${item.name}`}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              {/* Garment Editorial Metadata */}
              <div className="magazine-card-meta">
                <div className="magazine-card-top-row">
                  <span className="eyebrow" style={{ fontSize: '0.66rem' }}>
                    {item.slot?.toUpperCase() || 'ITEM'} &bull; FORMALITY {item.formality}/5
                  </span>
                </div>
                <h3 className="magazine-item-name">{item.name}</h3>
                <div className="magazine-tags-row">
                  <span className="meta-tag">{item.primary_color}</span>
                  {item.silhouette && <span className="meta-tag">{item.silhouette}</span>}
                  {item.neckline && <span className="meta-tag">{item.neckline}</span>}
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        /* Refined Empty State */
        <div className="magazine-empty-state animate-fade-in-up">
          <div className="empty-state-canvas">
            <GarmentSvg category="top" slot="top" primaryColor="beige" size={140} />
          </div>
          <span className="eyebrow">ARCHIVE REPOSITORY EMPTY</span>
          <h3 className="empty-title">No Garments in this Category</h3>
          <p className="empty-description">
            Your studio archive needs raw material to craft compositions. Add your favorite essentials to begin styling.
          </p>
          <button
            type="button"
            onClick={() => {
              setEditingItem(null)
              setIsModalOpen(true)
            }}
            className="btn-editorial-primary"
          >
            <Plus size={16} />
            <span>Add First Garment</span>
          </button>
        </div>
      )}

      {/* Delete Item Confirmation Modal */}
      {itemToDelete && (
        <div className="modal-backdrop animate-fade-in-up" role="dialog" aria-modal="true">
          <div className="modal-container editorial-modal" style={{ maxWidth: '440px' }}>
            <span className="eyebrow">CONFIRM ARCHIVE REMOVAL</span>
            <h3 style={{ marginTop: '6px', marginBottom: '12px' }}>Remove "{itemToDelete.name}"?</h3>
            <p style={{ marginBottom: '24px' }}>
              This garment will be permanently removed from your wardrobe and future lookbook generations.
            </p>
            <div className="modal-actions-footer">
              <button
                type="button"
                onClick={() => handleDeleteItem(itemToDelete.id, itemToDelete.name)}
                className="btn-danger-confirm"
              >
                Confirm Removal
              </button>
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
                className="btn-editorial-ghost"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Garment Modal */}
      <WardrobeItemModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingItem(null)
        }}
        onItemSaved={loadWardrobe}
        initialItem={editingItem}
      />
    </div>
  )
}
