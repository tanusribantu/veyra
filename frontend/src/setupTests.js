import '@testing-library/jest-dom'

const store = {}
const mockLocalStorage = {
  getItem: (key) => (key in store ? store[key] : null),
  setItem: (key, val) => {
    store[key] = String(val)
  },
  removeItem: (key) => {
    delete store[key]
  },
  clear: () => {
    Object.keys(store).forEach((k) => delete store[k])
  },
}

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
})
