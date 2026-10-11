/**
 * Veyra API Service Client
 * Handles communication with the Flask REST backend endpoints (/api/v1).
 */

const API_BASE = '/api/v1'

const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'X-User-ID': 'user_001',
}

async function handleResponse(response) {
  if (!response.ok) {
    let errorDetail = `HTTP ${response.status}: ${response.statusText}`
    try {
      const errorJson = await response.json()
      if (errorJson.details && Array.isArray(errorJson.details) && errorJson.details.length > 0) {
        const friendlyMsgs = errorJson.details.map((d) => {
          const locArr = d.loc || []
          const field = locArr.filter((x) => x !== 'body').pop() || 'field'
          const readableField = field.replace(/_/g, ' ')
          return `Please check the ${readableField} field`
        })
        errorDetail = friendlyMsgs.join('. ')
      } else {
        errorDetail = errorJson.error || errorJson.message || JSON.stringify(errorJson)
      }
    } catch {
      // response wasn't JSON
    }
    const error = new Error(errorDetail)
    error.status = response.status
    throw error
  }
  return response.json()
}

export const api = {
  // System & Metadata
  getHealth: () => fetch(`${API_BASE}/health`).then(handleResponse),
  getMetadata: () => fetch(`${API_BASE}/meta`).then(handleResponse),

  // Wardrobe Items
  getWardrobe: (params = {}) => {
    const query = new URLSearchParams()
    if (params.slot) query.append('slot', params.slot)
    if (params.category) query.append('category', params.category)
    const qs = query.toString() ? `?${query.toString()}` : ''
    return fetch(`${API_BASE}/wardrobe${qs}`, { headers: DEFAULT_HEADERS }).then(handleResponse)
  },

  createWardrobeItem: (itemData) =>
    fetch(`${API_BASE}/wardrobe`, {
      method: 'POST',
      headers: DEFAULT_HEADERS,
      body: JSON.stringify(itemData),
    }).then(handleResponse),

  updateWardrobeItem: (itemId, updates) =>
    fetch(`${API_BASE}/wardrobe/${itemId}`, {
      method: 'PATCH',
      headers: DEFAULT_HEADERS,
      body: JSON.stringify(updates),
    }).then(handleResponse),

  deleteWardrobeItem: (itemId) =>
    fetch(`${API_BASE}/wardrobe/${itemId}`, {
      method: 'DELETE',
      headers: DEFAULT_HEADERS,
    }).then(handleResponse),

  // Recommendations & Feedback
  generateRecommendations: ({ occasion = 'casual', wardrobeItemIds = null, constraints = null, resultLimit = 3 }) => {
    const payload = {
      occasion,
      result_limit: resultLimit,
    }
    if (wardrobeItemIds && wardrobeItemIds.length > 0) {
      payload.wardrobe_item_ids = wardrobeItemIds
    }
    if (constraints && constraints.length > 0) {
      payload.constraints = constraints
    }
    return fetch(`${API_BASE}/recommendations`, {
      method: 'POST',
      headers: DEFAULT_HEADERS,
      body: JSON.stringify(payload),
    }).then(handleResponse)
  },

  getRecommendationHistory: (limit = 10) =>
    fetch(`${API_BASE}/recommendations?limit=${limit}`, { headers: DEFAULT_HEADERS }).then(handleResponse),

  submitFeedback: (recommendationId, { feedbackType, reason = '' }) =>
    fetch(`${API_BASE}/recommendations/${recommendationId}/feedback`, {
      method: 'POST',
      headers: DEFAULT_HEADERS,
      body: JSON.stringify({
        feedback_type: feedbackType,
        reason,
      }),
    }).then(handleResponse),

  // Style Archetype Quiz (Phase 3)
  getQuizQuestions: () => fetch(`${API_BASE}/style-quiz`, { headers: DEFAULT_HEADERS }).then(handleResponse),

  submitQuizAnswers: (answers) =>
    fetch(`${API_BASE}/style-quiz`, {
      method: 'POST',
      headers: DEFAULT_HEADERS,
      body: JSON.stringify({ answers }),
    }).then(handleResponse),

  getLatestQuizResult: () => fetch(`${API_BASE}/style-quiz/result`, { headers: DEFAULT_HEADERS }).then(handleResponse),

  deleteQuizResult: () =>
    fetch(`${API_BASE}/style-quiz/result`, {
      method: 'DELETE',
      headers: DEFAULT_HEADERS,
    }).then(handleResponse),

  // Constraints (Phase 3)
  getConstraints: (params = {}) => {
    const query = new URLSearchParams()
    if (params.is_saved_default !== undefined && params.is_saved_default !== null) {
      query.append('is_saved_default', params.is_saved_default)
    }
    const qs = query.toString() ? `?${query.toString()}` : ''
    return fetch(`${API_BASE}/constraints${qs}`, { headers: DEFAULT_HEADERS }).then(handleResponse)
  },

  saveConstraint: (constraintData) =>
    fetch(`${API_BASE}/constraints`, {
      method: 'POST',
      headers: DEFAULT_HEADERS,
      body: JSON.stringify(constraintData),
    }).then(handleResponse),

  deleteConstraint: (constraintId) =>
    fetch(`${API_BASE}/constraints/${constraintId}`, {
      method: 'DELETE',
      headers: DEFAULT_HEADERS,
    }).then(handleResponse),

  // Style Profile
  getProfile: () => fetch(`${API_BASE}/profile`, { headers: DEFAULT_HEADERS }).then(handleResponse),

  updateProfile: (profileData) =>
    fetch(`${API_BASE}/profile`, {
      method: 'PUT',
      headers: DEFAULT_HEADERS,
      body: JSON.stringify(profileData),
    }).then(handleResponse),

  // Measurements & Body Intelligence (Phase 1.5)
  getMeasurements: (unit = null) => {
    const qs = unit ? `?unit=${unit}` : ''
    return fetch(`${API_BASE}/measurements${qs}`, { headers: DEFAULT_HEADERS }).then(handleResponse)
  },

  saveMeasurements: (measurementData) =>
    fetch(`${API_BASE}/measurements`, {
      method: 'POST',
      headers: DEFAULT_HEADERS,
      body: JSON.stringify(measurementData),
    }).then(handleResponse),

  deleteMeasurements: () =>
    fetch(`${API_BASE}/measurements`, {
      method: 'DELETE',
      headers: DEFAULT_HEADERS,
    }).then(handleResponse),

  overrideBodyShape: (customBodyShape = null) =>
    fetch(`${API_BASE}/measurements/shape-override`, {
      method: 'PATCH',
      headers: DEFAULT_HEADERS,
      body: JSON.stringify({ custom_body_shape: customBodyShape }),
    }).then(handleResponse),
}
