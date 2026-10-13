import React, { useState, useEffect } from 'react'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Recommendations from './pages/Recommendations'
import Wardrobe from './pages/Wardrobe'
import StyleProfile from './pages/StyleProfile'
import MeasurementsModal from './components/MeasurementsModal'
import OnboardingModal from './components/OnboardingModal'
import AuthModal from './components/AuthModal'
import { ToastProvider } from './components/Toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import { api } from './services/api'
import './App.css'

export function AppContent() {
  const { isAuthenticated, isLoading, isFirstLogin, clearFirstLogin, logout } = useAuth()

  const [activeTab, setActiveTab] = useState(() => {
    const hash = typeof window !== 'undefined' ? window.location.hash.replace('#', '') : ''
    return ['home', 'recommendations', 'wardrobe', 'profile'].includes(hash) ? hash : 'home'
  })

  const [measurementsMissing, setMeasurementsMissing] = useState(true)
  const [isMeasurementsModalOpen, setIsMeasurementsModalOpen] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [authModalMode, setAuthModalMode] = useState('login')
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage && typeof window.localStorage.getItem === 'function') {
        return window.localStorage.getItem('veyra_onboarding_completed') !== 'true'
      }
    } catch {
      // ignore
    }
    return false
  })

  // Route protection: If unauthenticated, redirect any protected hash to home
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      if (activeTab !== 'home') {
        setActiveTab('home')
        if (typeof window !== 'undefined') {
          window.location.hash = '#home'
        }
      }
    }
  }, [isAuthenticated, isLoading, activeTab])

  // First-time login triggers onboarding modal
  useEffect(() => {
    if (isAuthenticated && isFirstLogin) {
      setIsOnboardingOpen(true)
      clearFirstLogin()
    }
  }, [isAuthenticated, isFirstLogin, clearFirstLogin])

  useEffect(() => {
    // Sync hash changes with navigation
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '')
      if (['home', 'recommendations', 'wardrobe', 'profile'].includes(hash)) {
        if (!isAuthenticated && hash !== 'home') {
          setAuthModalMode('login')
          setIsAuthModalOpen(true)
          window.location.hash = '#home'
          setActiveTab('home')
          return
        }
        setActiveTab(hash)
      }
    }
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [isAuthenticated])

  useEffect(() => {
    if (isAuthenticated) {
      checkMeasurementsStatus()
    }
  }, [isAuthenticated])

  const checkMeasurementsStatus = async () => {
    try {
      const data = await api.getMeasurements()
      setMeasurementsMissing(Boolean(!data || data.measurements_missing))
    } catch {
      setMeasurementsMissing(true)
    }
  }

  const handleNavigate = (tabId) => {
    if (!isAuthenticated && tabId !== 'home') {
      setAuthModalMode('login')
      setIsAuthModalOpen(true)
      return
    }
    setActiveTab(tabId)
    window.location.hash = `#${tabId}`
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleOpenAuth = (mode = 'login') => {
    setAuthModalMode(mode)
    setIsAuthModalOpen(true)
  }

  if (isLoading) {
    return (
      <div className="app-shell" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ textAlign: 'center' }}>
          <span className="wordmark" style={{ fontSize: '2rem' }}>VEYRA</span>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', letterSpacing: '0.1em', marginTop: '0.5rem' }}>
            CALIBRATING ATELIER...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="app-shell">
      <Navbar
        activeTab={activeTab}
        onNavigate={handleNavigate}
        measurementsMissing={measurementsMissing}
        onOpenMeasurements={() => setIsMeasurementsModalOpen(true)}
        isAuthenticated={isAuthenticated}
        onOpenAuth={handleOpenAuth}
        onLogout={logout}
      />

      <main className="main-content">
        {/* Unauthenticated users only see the landing page */}
        {(!isAuthenticated || activeTab === 'home') && (
          <Home
            onNavigate={handleNavigate}
            onOpenMeasurements={() => setIsMeasurementsModalOpen(true)}
            onOpenOnboarding={() => setIsOnboardingOpen(true)}
            onOpenAuth={handleOpenAuth}
            isAuthenticated={isAuthenticated}
            measurementsMissing={measurementsMissing}
          />
        )}

        {/* Protected routes accessible only when authenticated */}
        {isAuthenticated && activeTab === 'recommendations' && (
          <Recommendations
            onOpenMeasurements={() => setIsMeasurementsModalOpen(true)}
          />
        )}

        {isAuthenticated && activeTab === 'wardrobe' && (
          <Wardrobe />
        )}

        {isAuthenticated && activeTab === 'profile' && (
          <StyleProfile
            onOpenMeasurements={() => setIsMeasurementsModalOpen(true)}
            onOpenOnboarding={() => setIsOnboardingOpen(true)}
            measurementsMissing={measurementsMissing}
          />
        )}
      </main>

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        initialMode={authModalMode}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={(mode) => {
          checkMeasurementsStatus()
          if (mode === 'signup') {
            setIsOnboardingOpen(true)
          }
        }}
      />

      {/* Measurements Intelligence Modal */}
      <MeasurementsModal
        isOpen={isMeasurementsModalOpen}
        onClose={() => setIsMeasurementsModalOpen(false)}
        onMeasurementsUpdated={(missing) => {
          setMeasurementsMissing(missing)
        }}
      />

      {/* First-Time Atelier Onboarding Modal */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        onComplete={() => {
          checkMeasurementsStatus()
        }}
      />

      {/* Editorial Studio Footer */}
      <footer className="editorial-footer">
        <div className="container footer-inner">
          <div className="footer-brand-col">
            <span className="wordmark" style={{ fontSize: '1.4rem' }}>VEYRA</span>
            <p className="footer-desc">
              Personal style intelligence atelier. Crafted with mindful color harmony, deterministic silhouette balance, and absolute local privacy.
            </p>
          </div>

          <nav className="footer-nav" aria-label="Footer Navigation">
            <button type="button" onClick={() => handleNavigate('home')} className="footer-link">
              Cover Story
            </button>
            <button type="button" onClick={() => handleNavigate('recommendations')} className="footer-link">
              Lookbook Studio
            </button>
            <button type="button" onClick={() => handleNavigate('wardrobe')} className="footer-link">
              Wardrobe Archive
            </button>
            <button type="button" onClick={() => handleNavigate('profile')} className="footer-link">
              Atelier Profile
            </button>
            {isAuthenticated && (
              <>
                <button type="button" onClick={() => setIsOnboardingOpen(true)} className="footer-link">
                  Onboarding Atelier
                </button>
                <button type="button" onClick={() => setIsMeasurementsModalOpen(true)} className="footer-link">
                  Proportion Privacy
                </button>
              </>
            )}
            {!isAuthenticated && (
              <button type="button" onClick={() => handleOpenAuth('signup')} className="footer-link">
                Join Atelier
              </button>
            )}
          </nav>
        </div>

        <div className="container footer-bottom-bar">
          <span>&copy; {new Date().getFullYear()} Veyra Studio &bull; Issue N° 01</span>
          <span>Zero Photo Uploads &bull; Offline Vector Art &bull; Deterministic Harmony</span>
        </div>
      </footer>
    </div>
  )
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ToastProvider>
  )
}
