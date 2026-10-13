import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import React from 'react'
import { ToastProvider } from '../components/Toast'
import { AppContent } from '../App'
import * as AuthContextModule from '../context/AuthContext'
import { api } from '../services/api'

// Mock api
vi.mock('../services/api', () => ({
  api: {
    getMeasurements: vi.fn().mockResolvedValue({ measurements_missing: true }),
    getProfile: vi.fn().mockResolvedValue({ preferred_styles: ['minimal'] }),
    getWardrobe: vi.fn().mockResolvedValue([]),
    getLatestQuizResult: vi.fn().mockResolvedValue(null),
    deleteAccount: vi.fn().mockResolvedValue({ message: 'Account deleted' }),
  },
  setAccessToken: vi.fn(),
  getAuthHeaders: vi.fn().mockReturnValue({ 'Content-Type': 'application/json' }),
}))

describe('Route Protection & Authentication Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    window.location.hash = '#home'
  })

  it('unauthenticated users see landing page with Create Account / Log In CTAs and privacy note', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: null,
      session: null,
      isAuthenticated: false,
      isLoading: false,
      isFirstLogin: false,
      clearFirstLogin: vi.fn(),
      login: vi.fn(),
      signUp: vi.fn(),
      logout: vi.fn(),
      deleteAccount: vi.fn(),
    })

    render(
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    )

    // Landing page headline
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/Style, Understood/i)

    // Unauthenticated CTAs
    expect(screen.getAllByRole('button', { name: /Create Account/i })[0]).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: /Log In/i })[0]).toBeInTheDocument()

    // Privacy note
    expect(screen.getByText(/Private & Photo-Free/i)).toBeInTheDocument()
    expect(screen.getByText(/Photos and camera access are never required/i)).toBeInTheDocument()
  })

  it('unauthenticated users attempting to navigate to protected tabs are prompted to log in', async () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: null,
      session: null,
      isAuthenticated: false,
      isLoading: false,
      isFirstLogin: false,
      clearFirstLogin: vi.fn(),
      login: vi.fn(),
      signUp: vi.fn(),
      logout: vi.fn(),
      deleteAccount: vi.fn(),
    })

    render(
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    )

    // Click Navbar Log In button
    const loginBtn = screen.getAllByRole('button', { name: /Log In/i })[0]
    await act(async () => {
      fireEvent.click(loginBtn)
    })

    // AuthModal opens
    expect(screen.getByText(/Welcome Back to Veyra/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Sign In to Atelier/i })).toBeInTheDocument()
  })

  it('authenticated users see full navigation and studio access', async () => {
    const mockUser = { id: 'usr_test_123', email: 'member@veyra.style' }
    const mockLogout = vi.fn()

    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: mockUser,
      session: { access_token: 'valid-jwt-token' },
      isAuthenticated: true,
      isLoading: false,
      isFirstLogin: false,
      clearFirstLogin: vi.fn(),
      login: vi.fn(),
      signUp: vi.fn(),
      logout: mockLogout,
      deleteAccount: vi.fn(),
    })

    render(
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    )

    // Authenticated navigation items
    expect(screen.getByRole('button', { name: 'Studio' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Wardrobe' })).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: 'Atelier Profile' })[0]).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Sign Out/i })).toBeInTheDocument()

    // Hero shows studio button
    expect(screen.getByRole('button', { name: /Enter Styling Studio/i })).toBeInTheDocument()

    // Clicking Sign Out calls logout
    fireEvent.click(screen.getByRole('button', { name: /Sign Out/i }))
    expect(mockLogout).toHaveBeenCalledTimes(1)
  })
})
