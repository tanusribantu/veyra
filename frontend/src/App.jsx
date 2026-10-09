import React, { useState, useEffect } from 'react'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Recommendations from './pages/Recommendations'
import Wardrobe from './pages/Wardrobe'
import StyleProfile from './pages/StyleProfile'
import MeasurementsModal from './components/MeasurementsModal'
import OnboardingModal from './components/OnboardingModal'
import { ToastProvider } from './components/Toast'
import { api } from './services/api'
import './App.css'

function AppContent() {
  const [activeTab, setActiveTab] = useState(() => {
    const hash = window.location.hash.replace('#', '')
    return ['home', 'recommendations', 'wardrobe', 'profile'].includes(hash) ? hash : 'home'
  })

  const [measurementsMissing, setMeasurementsMissing] = useState(true)
  const [isMeasurementsModalOpen, setIsMeasurementsModalOpen] = useState(false)
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

  useEffect(() => {
    // Sync hash changes with navigation
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '')
      if (['home', 'recommendations', 'wardrobe', 'profile'].includes(hash)) {
        setActiveTab(hash)
      }
    }
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  useEffect(() => {
    checkMeasurementsStatus()
  }, [])

  const checkMeasurementsStatus = async () => {
    try {
      const data = await api.getMeasurements()
      setMeasurementsMissing(Boolean(!data || data.measurements_missing))
    } catch {
      setMeasurementsMissing(true)
    }
  }

  const handleNavigate = (tabId) => {
    setActiveTab(tabId)
    window.location.hash = `#${tabId}`
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="app-shell">
      <Navbar
        activeTab={activeTab}
        onNavigate={handleNavigate}
        measurementsMissing={measurementsMissing}
        onOpenMeasurements={() => setIsMeasurementsModalOpen(true)}
      />

      <main className="main-content">
        {activeTab === 'home' && (
          <Home
            onNavigate={handleNavigate}
            onOpenMeasurements={() => setIsMeasurementsModalOpen(true)}
            onOpenOnboarding={() => setIsOnboardingOpen(true)}
            measurementsMissing={measurementsMissing}
          />
        )}

        {activeTab === 'recommendations' && (
          <Recommendations
            onOpenMeasurements={() => setIsMeasurementsModalOpen(true)}
          />
        )}

        {activeTab === 'wardrobe' && (
          <Wardrobe />
        )}

        {activeTab === 'profile' && (
          <StyleProfile
            onOpenMeasurements={() => setIsMeasurementsModalOpen(true)}
            onOpenOnboarding={() => setIsOnboardingOpen(true)}
            measurementsMissing={measurementsMissing}
          />
        )}
      </main>

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
            <button type="button" onClick={() => setIsOnboardingOpen(true)} className="footer-link">
              Onboarding Atelier
            </button>
            <button type="button" onClick={() => setIsMeasurementsModalOpen(true)} className="footer-link">
              Proportion Privacy
            </button>
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
      <AppContent />
    </ToastProvider>
  )
}
