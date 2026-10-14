import React, { useState, useEffect } from 'react'
import { Lock, ArrowRight, AlertCircle, CheckCircle2, Mail, ShieldCheck } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/Toast'
import { supabase } from '../services/supabase'

export function parseRecoveryParams() {
  if (typeof window === 'undefined') {
    return { token_hash: null, type: 'recovery', error: null, errorCode: null }
  }

  const searchParams = new URLSearchParams(window.location.search || '')

  // Also check hash parameters in case redirect placed them in hash
  const rawHash = window.location.hash || ''
  const hashWithoutPound = rawHash.replace(/^#\/?/, '')
  const hashParams = new URLSearchParams(
    hashWithoutPound.includes('?') ? hashWithoutPound.split('?')[1] : hashWithoutPound
  )

  const token_hash = searchParams.get('token_hash') || hashParams.get('token_hash')
  const type = searchParams.get('type') || hashParams.get('type') || 'recovery'

  const error = searchParams.get('error') || hashParams.get('error')
  const errorCode = searchParams.get('error_code') || hashParams.get('error_code')

  return { token_hash, type, error, errorCode }
}

export default function ResetPassword({ onComplete, onOpenAuth: _onOpenAuth }) {
  const { addToast } = useToast()
  const { isPasswordRecovery, updatePassword, resetPassword, verifyOtp } = useAuth()

  const [params, setParams] = useState(() => parseRecoveryParams())

  // Views: 'verify_prompt' | 'set_new_password' | 'expired' | 'request_link' | 'success'
  const [view, setView] = useState(() => {
    const { token_hash, error, errorCode } = parseRecoveryParams()
    if (error || errorCode) {
      return 'expired'
    }
    if (token_hash) {
      return 'verify_prompt'
    }
    return 'expired'
  })

  const [isVerifying, setIsVerifying] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [requestEmail, setRequestEmail] = useState('')
  const [formError, setFormError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [requestSent, setRequestSent] = useState(false)

  // Listen for active recovery session from AuthContext (e.g. PASSWORD_RECOVERY event)
  useEffect(() => {
    if (isPasswordRecovery) {
      setView((prev) => (prev !== 'success' ? 'set_new_password' : prev))
    }
  }, [isPasswordRecovery])

  // If URL changes with new params
  useEffect(() => {
    const parsed = parseRecoveryParams()
    setParams(parsed)
    if (parsed.error || parsed.errorCode) {
      setView('expired')
    } else if (parsed.token_hash) {
      setView((prev) => (prev !== 'set_new_password' && prev !== 'success' ? 'verify_prompt' : prev))
    }
  }, [])

  // Step 1: User explicitly confirms OTP verification to prevent email scanner consumption
  const handleVerifyOtp = async () => {
    if (!params.token_hash) {
      setView('expired')
      return
    }

    setIsVerifying(true)
    setFormError(null)

    try {
      if (verifyOtp) {
        await verifyOtp({
          token_hash: params.token_hash,
          type: params.type || 'recovery',
        })
      } else {
        const { error } = await supabase.auth.verifyOtp({
          token_hash: params.token_hash,
          type: params.type || 'recovery',
        })
        if (error) throw error
      }

      setView('set_new_password')
      addToast('Reset link verified. Please choose your new password.', 'info')
    } catch {
      // Never show raw error text or JSON; transition cleanly to friendly expired state
      setView('expired')
    } finally {
      setIsVerifying(false)
    }
  }

  // Step 2: Set New Password Form Submission
  const handleSetNewPassword = async (e) => {
    e.preventDefault()
    setFormError(null)

    if (!password || password.length < 6) {
      setFormError('Password must be at least 6 characters in length.')
      return
    }

    if (password !== confirmPassword) {
      setFormError('Passwords do not match. Please verify and try again.')
      return
    }

    setIsSubmitting(true)
    try {
      if (updatePassword) {
        await updatePassword(password)
      } else {
        const { error } = await supabase.auth.updateUser({ password })
        if (error) throw error
      }

      addToast('Password updated successfully! Welcome back to Veyra.', 'success')
      setView('success')

      // Clean URL of recovery tokens
      if (typeof window !== 'undefined') {
        window.history.replaceState(null, '', '/')
      }

      if (onComplete) {
        setTimeout(() => {
          onComplete()
        }, 800)
      }
    } catch {
      // Friendly message on password update failure
      setFormError('Unable to update your password right now. Please request a fresh reset link.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Step 3: Send a new link request
  const handleSendNewLink = async (e) => {
    e.preventDefault()
    setFormError(null)

    if (!requestEmail || !requestEmail.includes('@')) {
      setFormError('Please enter a valid email address.')
      return
    }

    setIsSubmitting(true)
    try {
      const redirectUrl = typeof window !== 'undefined'
        ? `${window.location.origin}/reset-password`
        : undefined

      if (resetPassword) {
        await resetPassword(requestEmail)
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(requestEmail, {
          redirectTo: redirectUrl,
        })
        if (error) throw error
      }

      setRequestSent(true)
      addToast('A fresh reset link has been dispatched to your email.', 'info')
    } catch {
      setFormError('Could not send reset link. Please verify your email and try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="reset-password-page container animate-fade-in-up" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
      <div className="editorial-card" style={{ maxWidth: '480px', width: '100%', padding: '2.5rem 2rem', background: 'var(--surface-card, #ffffff)', border: '1px solid var(--border-color, #e5e5e5)', borderRadius: '12px', boxShadow: '0 8px 30px rgba(0,0,0,0.04)' }}>
        
        {/* Top Eyebrow */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <span className="eyebrow" style={{ color: 'var(--accent-olive)', letterSpacing: '0.12em', display: 'block', marginBottom: '0.5rem', fontSize: '0.72rem' }}>
            {view === 'verify_prompt' && 'SECURITY • PASSWORD RESET'}
            {view === 'set_new_password' && 'SECURITY • SET NEW PASSWORD'}
            {view === 'expired' && 'SECURITY • LINK EXPIRED'}
            {view === 'request_link' && 'SECURITY • REQUEST RESET LINK'}
            {view === 'success' && 'SECURITY • PASSWORD UPDATED'}
          </span>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
            {view === 'verify_prompt' && 'Reset Your Password'}
            {view === 'set_new_password' && 'Set New Password'}
            {view === 'expired' && 'Reset Link Expired or Already Used'}
            {view === 'request_link' && 'Send New Reset Link'}
            {view === 'success' && 'Password Updated'}
          </h2>
        </div>

        {/* View 1: Click-to-Verify Protection against email scanners */}
        {view === 'verify_prompt' && (
          <div className="animate-fade-in-up">
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6, textAlign: 'center', marginBottom: '1.75rem' }}>
              To protect your account against automated link scanners, click the button below to verify your reset link and choose a new password.
            </p>

            <button
              type="button"
              onClick={handleVerifyOtp}
              disabled={isVerifying}
              className="btn-editorial-primary"
              style={{ width: '100%', padding: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.95rem' }}
            >
              <span>{isVerifying ? 'Verifying Link...' : 'Continue to reset your password'}</span>
              <ArrowRight size={16} />
            </button>
          </div>
        )}

        {/* View 2: Set New Password Form */}
        {view === 'set_new_password' && (
          <form onSubmit={handleSetNewPassword} className="animate-fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Enter a secure new password for your Veyra Atelier account.
            </p>

            {formError && (
              <div
                className="auth-alert is-error"
                role="alert"
                style={{
                  display: 'flex',
                  gap: '0.5rem',
                  padding: '0.75rem',
                  background: 'rgba(239, 68, 68, 0.08)',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                  color: '#ef4444',
                  fontSize: '0.84rem',
                }}
              >
                <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>{formError}</span>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="reset-new-password" className="form-label" style={{ fontSize: '0.8rem', display: 'flex', gap: '0.35rem', alignItems: 'center', marginBottom: '0.35rem' }}>
                <Lock size={13} />
                <span>New Password</span>
              </label>
              <input
                id="reset-new-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="form-input"
                style={{ width: '100%', padding: '0.7rem 0.85rem' }}
                disabled={isSubmitting}
                autoFocus
              />
            </div>

            <div className="form-group">
              <label htmlFor="reset-confirm-password" className="form-label" style={{ fontSize: '0.8rem', display: 'flex', gap: '0.35rem', alignItems: 'center', marginBottom: '0.35rem' }}>
                <Lock size={13} />
                <span>Confirm New Password</span>
              </label>
              <input
                id="reset-confirm-password"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password"
                className="form-input"
                style={{ width: '100%', padding: '0.7rem 0.85rem' }}
                disabled={isSubmitting}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-editorial-primary"
              style={{ width: '100%', marginTop: '0.5rem', padding: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
            >
              <span>{isSubmitting ? 'Updating Password...' : 'Update Password & Sign In'}</span>
              <ArrowRight size={16} />
            </button>
          </form>
        )}

        {/* View 3: Expired / Used Link Friendly State */}
        {view === 'expired' && (
          <div className="animate-fade-in-up" style={{ textAlign: 'center' }}>
            <div
              style={{
                padding: '1.25rem',
                background: 'rgba(239, 68, 68, 0.05)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                borderRadius: '8px',
                marginBottom: '1.5rem',
                textAlign: 'left',
              }}
            >
              <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
                <AlertCircle size={18} style={{ color: '#ef4444', flexShrink: 0, marginTop: '2px' }} />
                <div style={{ fontSize: '0.88rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                  This password reset link is invalid, has expired, or was already used. For your security, reset links are single-use and expire after a short period. Please request a fresh reset link.
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setFormError(null)
                setView('request_link')
              }}
              className="btn-editorial-primary"
              style={{ width: '100%', padding: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}
            >
              <span>Send a new link</span>
              <ArrowRight size={16} />
            </button>

            <button
              type="button"
              onClick={() => {
                if (onComplete) onComplete()
                else if (typeof window !== 'undefined') window.location.hash = '#home'
              }}
              className="btn-editorial-ghost"
              style={{ width: '100%', padding: '0.65rem', fontSize: '0.85rem' }}
            >
              Back to Cover Story
            </button>
          </div>
        )}

        {/* View 4: Request Fresh Reset Link */}
        {view === 'request_link' && (
          <div className="animate-fade-in-up">
            {requestSent ? (
              <div style={{ textAlign: 'center' }}>
                <div
                  style={{
                    padding: '1rem',
                    background: 'rgba(34, 197, 94, 0.08)',
                    border: '1px solid rgba(34, 197, 94, 0.25)',
                    borderRadius: '8px',
                    color: '#22c55e',
                    fontSize: '0.88rem',
                    marginBottom: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    textAlign: 'left',
                  }}
                >
                  <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
                  <span>A fresh reset link has been dispatched to <strong>{requestEmail}</strong>. Please check your inbox and click the link to proceed.</span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (onComplete) onComplete()
                    else if (typeof window !== 'undefined') window.location.hash = '#home'
                  }}
                  className="btn-editorial-primary"
                  style={{ width: '100%', padding: '0.75rem' }}
                >
                  Back to Cover Story
                </button>
              </div>
            ) : (
              <form onSubmit={handleSendNewLink} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  Enter your email address and we will dispatch a fresh, single-use password reset link.
                </p>

                {formError && (
                  <div
                    className="auth-alert is-error"
                    role="alert"
                    style={{
                      display: 'flex',
                      gap: '0.5rem',
                      padding: '0.75rem',
                      background: 'rgba(239, 68, 68, 0.08)',
                      border: '1px solid rgba(239, 68, 68, 0.25)',
                      color: '#ef4444',
                      fontSize: '0.84rem',
                    }}
                  >
                    <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span>{formError}</span>
                  </div>
                )}

                <div className="form-group">
                  <label htmlFor="request-reset-email" className="form-label" style={{ fontSize: '0.8rem', display: 'flex', gap: '0.35rem', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <Mail size={13} />
                    <span>Email Address</span>
                  </label>
                  <input
                    id="request-reset-email"
                    type="email"
                    required
                    value={requestEmail}
                    onChange={(e) => setRequestEmail(e.target.value)}
                    placeholder="you@domain.com"
                    className="form-input"
                    style={{ width: '100%', padding: '0.7rem 0.85rem' }}
                    disabled={isSubmitting}
                    autoFocus
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-editorial-primary"
                  style={{ width: '100%', padding: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                >
                  <span>{isSubmitting ? 'Sending Link...' : 'Send Reset Link'}</span>
                  <ArrowRight size={16} />
                </button>

                <button
                  type="button"
                  onClick={() => setView('expired')}
                  className="btn-editorial-ghost"
                  style={{ width: '100%', padding: '0.5rem', fontSize: '0.82rem' }}
                >
                  Cancel
                </button>
              </form>
            )}
          </div>
        )}

        {/* View 5: Success confirmation */}
        {view === 'success' && (
          <div className="animate-fade-in-up" style={{ textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', padding: '1rem', borderRadius: '50%', background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', marginBottom: '1rem' }}>
              <CheckCircle2 size={32} />
            </div>
            <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              Your password has been updated and your atelier session is securely established.
            </p>
            <button
              type="button"
              onClick={() => {
                if (onComplete) onComplete()
                else if (typeof window !== 'undefined') window.location.hash = '#home'
              }}
              className="btn-editorial-primary"
              style={{ width: '100%', padding: '0.85rem' }}
            >
              Enter Atelier
            </button>
          </div>
        )}

        {/* Security / Privacy Badge */}
        <div
          className="auth-privacy-badge"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginTop: '2rem',
            padding: '0.65rem 0.75rem',
            background: 'var(--surface-muted, #f8f8f8)',
            border: '1px solid var(--border-subtle, #e0e0e0)',
            borderRadius: '6px',
            fontSize: '0.74rem',
            color: 'var(--text-muted)',
            lineHeight: 1.4,
          }}
        >
          <ShieldCheck size={16} style={{ flexShrink: 0, color: 'var(--accent-olive)' }} />
          <span>
            Single-Use Verification • Zero Link Burn • Encrypted Session.
          </span>
        </div>
      </div>
    </div>
  )
}
