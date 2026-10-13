import React, { useState, useEffect } from 'react'
import { X, Lock, Mail, ArrowRight, ShieldCheck, AlertCircle, CheckCircle2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from './Toast'

export default function AuthModal({
  isOpen,
  onClose,
  initialMode = 'login',
  onSuccess,
}) {
  const { login, signUp, loginWithGoogle, resetPassword } = useAuth()
  const { addToast } = useToast()

  const [mode, setMode] = useState(initialMode) // 'login' | 'signup' | 'forgot_password'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode)
      setErrorMessage(null)
      setSuccessMessage(null)
      setEmail('')
      setPassword('')
    }
  }, [isOpen, initialMode])

  if (!isOpen) return null

  const formatAuthError = (err) => {
    const raw = err?.message || String(err)
    if (raw.toLowerCase().includes('invalid login credentials')) {
      return 'Incorrect email or password. Please verify and try again.'
    }
    if (raw.toLowerCase().includes('already registered')) {
      return 'An account already exists with this email address. Please sign in instead.'
    }
    if (raw.toLowerCase().includes('at least 6 characters')) {
      return 'Password must be at least 6 characters in length.'
    }
    if (raw.toLowerCase().includes('valid email')) {
      return 'Please enter a valid email address.'
    }
    return raw
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMessage(null)
    setSuccessMessage(null)
    setLoading(true)

    try {
      if (mode === 'login') {
        await login({ email, password })
        addToast('Signed in to Atelier successfully', 'success')
        if (onSuccess) onSuccess('login')
        onClose()
      } else if (mode === 'signup') {
        const res = await signUp({ email, password })
        if (res?.session) {
          addToast('Account created! Welcome to Veyra Atelier.', 'success')
          if (onSuccess) onSuccess('signup')
          onClose()
        } else {
          setSuccessMessage(
            'Account created! If email confirmation is enabled on your project, please check your inbox.'
          )
          addToast('Confirmation link sent to your email.', 'info')
        }
      } else if (mode === 'forgot_password') {
        await resetPassword(email)
        setSuccessMessage('Password reset link sent! Please check your inbox.')
        addToast('Password reset link sent to your email.', 'info')
      }
    } catch (err) {
      setErrorMessage(formatAuthError(err))
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setErrorMessage(null)
    setLoading(true)
    try {
      await loginWithGoogle()
    } catch (err) {
      setErrorMessage(formatAuthError(err))
      setLoading(false)
    }
  }

  return (
    <div
      className="modal-backdrop animate-fade-in-up"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div className="modal-container editorial-modal auth-modal-container" style={{ maxWidth: '480px' }}>
        {/* Modal Header */}
        <div className="modal-header">
          <div>
            <span className="eyebrow">
              {mode === 'login'
                ? 'ATELIER AUTHENTICATION &bull; SIGN IN'
                : mode === 'signup'
                ? 'ATELIER MEMBERSHIP &bull; JOIN'
                : 'SECURITY &bull; PASSWORD RESET'}
            </span>
            <h2 className="modal-title" id="auth-modal-title">
              {mode === 'login'
                ? 'Welcome Back to Veyra'
                : mode === 'signup'
                ? 'Create Your Atelier Account'
                : 'Reset Your Password'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="modal-close-btn"
            aria-label="Close authentication dialog"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="auth-modal-body" style={{ padding: '0.5rem 0' }}>
          {/* Tabs for Mode Switching */}
          {mode !== 'forgot_password' && (
            <div className="auth-mode-tabs" style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <button
                type="button"
                className={`btn-editorial-ghost ${mode === 'login' ? 'active-tab' : ''}`}
                style={{
                  flex: 1,
                  borderBottom: mode === 'login' ? '2px solid var(--accent)' : '1px solid var(--border-subtle)',
                  borderRadius: 0,
                  padding: '0.65rem 0.5rem',
                  fontSize: '0.85rem',
                  fontWeight: mode === 'login' ? 600 : 400,
                }}
                onClick={() => {
                  setMode('login')
                  setErrorMessage(null)
                }}
              >
                Sign In
              </button>
              <button
                type="button"
                className={`btn-editorial-ghost ${mode === 'signup' ? 'active-tab' : ''}`}
                style={{
                  flex: 1,
                  borderBottom: mode === 'signup' ? '2px solid var(--accent)' : '1px solid var(--border-subtle)',
                  borderRadius: 0,
                  padding: '0.65rem 0.5rem',
                  fontSize: '0.85rem',
                  fontWeight: mode === 'signup' ? 600 : 400,
                }}
                onClick={() => {
                  setMode('signup')
                  setErrorMessage(null)
                }}
              >
                Create Account
              </button>
            </div>
          )}

          {/* Social / Google Auth Button */}
          {mode !== 'forgot_password' && (
            <div style={{ marginBottom: '1.25rem' }}>
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="btn-google-auth"
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  border: '1px solid var(--border)',
                  background: 'var(--surface-raised, #ffffff)',
                  color: 'var(--text-primary)',
                  fontFamily: 'inherit',
                  fontSize: '0.88rem',
                  letterSpacing: '0.02em',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  margin: '1.25rem 0',
                  gap: '0.75rem',
                }}
              >
                <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }} />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  or with email
                </span>
                <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }} />
              </div>
            </div>
          )}

          {/* Error & Success Messages */}
          {errorMessage && (
            <div
              className="auth-alert is-error"
              style={{
                display: 'flex',
                gap: '0.5rem',
                padding: '0.75rem',
                background: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                color: '#ef4444',
                fontSize: '0.84rem',
                marginBottom: '1rem',
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div
              className="auth-alert is-success"
              style={{
                display: 'flex',
                gap: '0.5rem',
                padding: '0.75rem',
                background: 'rgba(34, 197, 94, 0.08)',
                border: '1px solid rgba(34, 197, 94, 0.25)',
                color: '#22c55e',
                fontSize: '0.84rem',
                marginBottom: '1rem',
              }}
            >
              <CheckCircle2 size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="auth-form" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label htmlFor="auth-email-input" className="form-label" style={{ fontSize: '0.8rem', display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                <Mail size={13} />
                <span>Email Address</span>
              </label>
              <input
                id="auth-email-input"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                className="form-input"
                style={{ width: '100%', padding: '0.65rem 0.75rem' }}
                disabled={loading}
              />
            </div>

            {mode !== 'forgot_password' && (
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                  <label htmlFor="auth-password-input" className="form-label" style={{ fontSize: '0.8rem', display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                    <Lock size={13} />
                    <span>Password</span>
                  </label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => {
                        setMode('forgot_password')
                        setErrorMessage(null)
                        setSuccessMessage(null)
                      }}
                      className="text-link-subtle"
                      style={{ background: 'none', border: 'none', fontSize: '0.75rem', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <input
                  id="auth-password-input"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="form-input"
                  style={{ width: '100%', padding: '0.65rem 0.75rem' }}
                  disabled={loading}
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-editorial-primary"
              style={{ width: '100%', marginTop: '0.5rem', padding: '0.75rem' }}
            >
              <span>
                {loading
                  ? 'Verifying...'
                  : mode === 'login'
                  ? 'Sign In to Atelier'
                  : mode === 'signup'
                  ? 'Create Atelier Account'
                  : 'Send Reset Link'}
              </span>
              <ArrowRight size={15} />
            </button>

            {mode === 'forgot_password' && (
              <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => {
                    setMode('login')
                    setErrorMessage(null)
                    setSuccessMessage(null)
                  }}
                  className="text-link-subtle"
                  style={{ background: 'none', border: 'none', fontSize: '0.8rem', color: 'var(--accent)', cursor: 'pointer' }}
                >
                  &larr; Back to Sign In
                </button>
              </div>
            )}
          </form>

          {/* Privacy Note in Modal */}
          <div
            className="auth-privacy-badge"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginTop: '1.5rem',
              padding: '0.65rem 0.75rem',
              background: 'var(--surface-muted, #f8f8f8)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.74rem',
              color: 'var(--text-muted)',
              lineHeight: 1.4,
            }}
          >
            <ShieldCheck size={16} style={{ flexShrink: 0, color: 'var(--accent)' }} />
            <span>
              Zero Photo Uploads &bull; Biometric Free &bull; Encrypted Session. Data isolated strictly to your account.
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
