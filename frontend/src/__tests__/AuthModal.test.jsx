import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import React from 'react'
import AuthModal from '../components/AuthModal'
import { ToastProvider } from '../components/Toast'
import * as AuthContextModule from '../context/AuthContext'

describe('AuthModal Component', () => {
  it('renders login modal by default', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      login: vi.fn(),
      signUp: vi.fn(),
      loginWithGoogle: vi.fn(),
      resetPassword: vi.fn(),
    })

    render(
      <ToastProvider>
        <AuthModal isOpen={true} initialMode="login" onClose={() => {}} />
      </ToastProvider>
    )

    expect(screen.getByText(/Welcome Back to Veyra/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Sign In to Atelier/i })).toBeInTheDocument()
  })

  it('renders signup modal and switches between modes', async () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      login: vi.fn(),
      signUp: vi.fn(),
      loginWithGoogle: vi.fn(),
      resetPassword: vi.fn(),
    })

    render(
      <ToastProvider>
        <AuthModal isOpen={true} initialMode="signup" onClose={() => {}} />
      </ToastProvider>
    )

    expect(screen.getByText(/Create Your Atelier Account/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Create Atelier Account/i })).toBeInTheDocument()

    // Switch to Sign In
    const signInTab = screen.getByRole('button', { name: /^Sign In$/i })
    await act(async () => {
      fireEvent.click(signInTab)
    })
    expect(screen.getByText(/Welcome Back to Veyra/i)).toBeInTheDocument()
  })

  it('allows requesting password reset', async () => {
    const mockResetPassword = vi.fn().mockResolvedValue({})
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      login: vi.fn(),
      signUp: vi.fn(),
      loginWithGoogle: vi.fn(),
      resetPassword: mockResetPassword,
    })

    render(
      <ToastProvider>
        <AuthModal isOpen={true} initialMode="forgot_password" onClose={() => {}} />
      </ToastProvider>
    )

    expect(screen.getByText(/Reset Your Password/i)).toBeInTheDocument()

    const emailInput = screen.getByPlaceholderText('you@domain.com')
    fireEvent.change(emailInput, { target: { value: 'reset@example.com' } })

    const submitBtn = screen.getByRole('button', { name: /Send Reset Link/i })
    await act(async () => {
      fireEvent.click(submitBtn)
    })

    expect(mockResetPassword).toHaveBeenCalledWith('reset@example.com')
  })
})
