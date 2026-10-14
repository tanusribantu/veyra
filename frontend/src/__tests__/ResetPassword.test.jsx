import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import React from 'react'
import ResetPassword from '../pages/ResetPassword'
import { ToastProvider } from '../components/Toast'
import * as AuthContextModule from '../context/AuthContext'
import { AppContent } from '../App'

// Mock API
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

describe('ResetPassword Route & Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    window.history.replaceState(null, '', '/')
    window.location.hash = ''
  })

  it('reads token_hash from URL, shows "Continue to reset your password" button, and does NOT call verifyOtp on mount', () => {
    window.history.replaceState(null, '', '/reset-password?token_hash=secret_token_123&type=recovery')

    const mockVerifyOtp = vi.fn().mockResolvedValue({ user: { id: 'usr_1' } })
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      isPasswordRecovery: false,
      verifyOtp: mockVerifyOtp,
      updatePassword: vi.fn(),
      resetPassword: vi.fn(),
    })

    render(
      <ToastProvider>
        <ResetPassword />
      </ToastProvider>
    )

    // Scanner protection: Verify OTP must NOT be called on mount
    expect(mockVerifyOtp).not.toHaveBeenCalled()

    // Must show the friendly click-to-verify button
    expect(screen.getByRole('button', { name: /Continue to reset your password/i })).toBeInTheDocument()
    expect(screen.getByText(/To protect your account against automated link scanners/i)).toBeInTheDocument()
  })

  it('calls verifyOtp only when user clicks "Continue to reset your password", then displays "Set new password" form', async () => {
    window.history.replaceState(null, '', '/reset-password?token_hash=secret_token_123&type=recovery')

    const mockVerifyOtp = vi.fn().mockResolvedValue({ user: { id: 'usr_1' } })
    const mockUpdatePassword = vi.fn().mockResolvedValue({})
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      isPasswordRecovery: false,
      verifyOtp: mockVerifyOtp,
      updatePassword: mockUpdatePassword,
      resetPassword: vi.fn(),
    })

    render(
      <ToastProvider>
        <ResetPassword />
      </ToastProvider>
    )

    const continueBtn = screen.getByRole('button', { name: /Continue to reset your password/i })
    await act(async () => {
      fireEvent.click(continueBtn)
    })

    // verifyOtp called with token_hash and type
    expect(mockVerifyOtp).toHaveBeenCalledWith({
      token_hash: 'secret_token_123',
      type: 'recovery',
    })

    // Now renders the Set New Password form
    expect(screen.getByRole('heading', { name: /Set New Password/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/^New Password$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^Confirm New Password$/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Update Password & Sign In/i })).toBeInTheDocument()
  })

  it('validates password length (min 6) and password matching before submitting', async () => {
    window.history.replaceState(null, '', '/reset-password?token_hash=valid_hash&type=recovery')

    const mockVerifyOtp = vi.fn().mockResolvedValue({})
    const mockUpdatePassword = vi.fn().mockResolvedValue({})
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      isPasswordRecovery: false,
      verifyOtp: mockVerifyOtp,
      updatePassword: mockUpdatePassword,
      resetPassword: vi.fn(),
    })

    render(
      <ToastProvider>
        <ResetPassword />
      </ToastProvider>
    )

    // Click verify
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Continue to reset your password/i }))
    })

    const newPwdInput = screen.getByLabelText(/^New Password$/i)
    const confirmPwdInput = screen.getByLabelText(/^Confirm New Password$/i)
    const submitBtn = screen.getByRole('button', { name: /Update Password & Sign In/i })

    // Test min 6 characters validation
    fireEvent.change(newPwdInput, { target: { value: '123' } })
    fireEvent.change(confirmPwdInput, { target: { value: '123' } })
    await act(async () => {
      fireEvent.click(submitBtn)
    })
    expect(screen.getByText(/Password must be at least 6 characters in length/i)).toBeInTheDocument()
    expect(mockUpdatePassword).not.toHaveBeenCalled()

    // Test mismatch validation
    fireEvent.change(newPwdInput, { target: { value: 'Secret999' } })
    fireEvent.change(confirmPwdInput, { target: { value: 'Different999' } })
    await act(async () => {
      fireEvent.click(submitBtn)
    })
    expect(screen.getByText(/Passwords do not match/i)).toBeInTheDocument()
    expect(mockUpdatePassword).not.toHaveBeenCalled()

    // Test successful submission with matching valid password
    fireEvent.change(newPwdInput, { target: { value: 'ValidSecret123!' } })
    fireEvent.change(confirmPwdInput, { target: { value: 'ValidSecret123!' } })
    await act(async () => {
      fireEvent.click(submitBtn)
    })
    expect(mockUpdatePassword).toHaveBeenCalledWith('ValidSecret123!')
    expect(screen.getByRole('heading', { name: /^Password Updated$/i })).toBeInTheDocument()
  })

  it('shows friendly message and "Send a new link" button for expired or used links without displaying raw error text or JSON', () => {
    // Simulating landing with scanner-consumed error in hash
    window.history.replaceState(null, '', '/reset-password#error=access_denied&error_code=otp_expired&error_description=Email+link+is+invalid+or+has+expired')

    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      isPasswordRecovery: false,
      verifyOtp: vi.fn(),
      updatePassword: vi.fn(),
      resetPassword: vi.fn(),
    })

    const { container } = render(
      <ToastProvider>
        <ResetPassword />
      </ToastProvider>
    )

    // Friendly explanation
    expect(screen.getByText(/Reset Link Expired or Already Used/i)).toBeInTheDocument()
    expect(screen.getByText(/This password reset link is invalid, has expired, or was already used/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Send a new link/i })).toBeInTheDocument()

    // CRITICAL REQUIREMENT: Never show raw error text or JSON
    expect(container.textContent).not.toContain('otp_expired')
    expect(container.textContent).not.toContain('access_denied')
    expect(container.textContent).not.toContain('error_description')
    expect(container.textContent).not.toContain('{"')
  })

  it('transitions to friendly expired state if verifyOtp fails, never showing raw error or JSON', async () => {
    window.history.replaceState(null, '', '/reset-password?token_hash=already_used_token&type=recovery')

    const mockVerifyOtp = vi.fn().mockRejectedValue(new Error('Token has expired or is invalid'))
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      isPasswordRecovery: false,
      verifyOtp: mockVerifyOtp,
      updatePassword: vi.fn(),
      resetPassword: vi.fn(),
    })

    const { container } = render(
      <ToastProvider>
        <ResetPassword />
      </ToastProvider>
    )

    // Click verify
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Continue to reset your password/i }))
    })

    // Transitions to expired view
    expect(screen.getByText(/Reset Link Expired or Already Used/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Send a new link/i })).toBeInTheDocument()
    expect(container.textContent).not.toContain('Token has expired or is invalid')
    expect(container.textContent).not.toContain('{"')
  })

  it('allows requesting a new reset link via "Send a new link" button', async () => {
    window.history.replaceState(null, '', '/reset-password#error=access_denied&error_code=otp_expired')

    const mockResetPassword = vi.fn().mockResolvedValue({})
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      isPasswordRecovery: false,
      verifyOtp: vi.fn(),
      updatePassword: vi.fn(),
      resetPassword: mockResetPassword,
    })

    render(
      <ToastProvider>
        <ResetPassword />
      </ToastProvider>
    )

    // Click "Send a new link"
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Send a new link/i }))
    })

    expect(screen.getByText(/Enter your email address and we will dispatch a fresh/i)).toBeInTheDocument()

    const emailInput = screen.getByLabelText(/Email Address/i)
    fireEvent.change(emailInput, { target: { value: 'member@veyra.style' } })

    const sendBtn = screen.getByRole('button', { name: /Send Reset Link/i })
    await act(async () => {
      fireEvent.click(sendBtn)
    })

    expect(mockResetPassword).toHaveBeenCalledWith('member@veyra.style')
    expect(screen.getByText(/Please check your inbox and click the link to proceed/i)).toBeInTheDocument()
  })

  it('handles the PASSWORD_RECOVERY auth event in AuthContext so any recovery session opens the same form', () => {
    // When an active recovery session exists (e.g. from Supabase auth event)
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      isPasswordRecovery: true,
      verifyOtp: vi.fn(),
      updatePassword: vi.fn(),
      resetPassword: vi.fn(),
    })

    render(
      <ToastProvider>
        <ResetPassword />
      </ToastProvider>
    )

    // Direct transition to Set New Password form
    expect(screen.getByRole('heading', { name: /Set New Password/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/^New Password$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^Confirm New Password$/i)).toBeInTheDocument()
  })

  it('renders ResetPassword in AppContent when URL is /reset-password without bouncing unauthenticated users', () => {
    window.history.replaceState(null, '', '/reset-password?token_hash=abc&type=recovery')

    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: null,
      session: null,
      isAuthenticated: false,
      isLoading: false,
      isFirstLogin: false,
      clearFirstLogin: vi.fn(),
      isPasswordRecovery: false,
      clearPasswordRecovery: vi.fn(),
      login: vi.fn(),
      signUp: vi.fn(),
      logout: vi.fn(),
      deleteAccount: vi.fn(),
      verifyOtp: vi.fn(),
      updatePassword: vi.fn(),
      resetPassword: vi.fn(),
    })

    render(
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    )

    // Renders ResetPassword view instead of landing page or bounce
    expect(screen.getByRole('heading', { name: /Reset Your Password/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Continue to reset your password/i })).toBeInTheDocument()
  })
})
