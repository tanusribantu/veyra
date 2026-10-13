import React, { useState, useEffect } from 'react'
import { Moon, Sun, Sliders, Menu, X, ShieldCheck } from 'lucide-react'

export default function Navbar({
  activeTab,
  onNavigate,
  measurementsMissing,
  onOpenMeasurements,
  isAuthenticated = true,
  onOpenAuth,
  onLogout,
}) {
  const [theme, setTheme] = useState(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage && typeof window.localStorage.getItem === 'function') {
        return window.localStorage.getItem('veyra_theme') || 'light'
      }
    } catch {
      // ignore
    }
    return 'light'
  })
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme)
    }
    try {
      if (typeof window !== 'undefined' && window.localStorage && typeof window.localStorage.setItem === 'function') {
        window.localStorage.setItem('veyra_theme', theme)
      }
    } catch {
      // ignore
    }
  }, [theme])

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))
  }

  const navItems = isAuthenticated
    ? [
        { id: 'home', label: 'Cover' },
        { id: 'recommendations', label: 'Studio' },
        { id: 'wardrobe', label: 'Wardrobe' },
        { id: 'profile', label: 'Atelier Profile' },
      ]
    : [{ id: 'home', label: 'Cover' }]

  const handleNavClick = (id) => {
    onNavigate(id)
    setMobileMenuOpen(false)
  }

  return (
    <header className="navbar-root">
      <div className="container navbar-inner">
        {/* Left: Custom Spaced Serif Wordmark */}
        <div className="navbar-brand">
          <button
            type="button"
            onClick={() => handleNavClick('home')}
            className="wordmark"
            aria-label="Veyra Home"
          >
            VEYRA
          </button>
          <span className="brand-edition">N° 01 &bull; STUDIO</span>
        </div>

        {/* Center: Desktop Navigation */}
        <nav className="desktop-nav" aria-label="Main Navigation">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleNavClick(item.id)}
              className={`nav-link ${activeTab === item.id ? 'active' : ''}`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Right: Actions */}
        <div className="navbar-actions">
          {isAuthenticated ? (
            <>
              <button
                type="button"
                onClick={onOpenMeasurements}
                className={`measurements-status-pill ${measurementsMissing ? 'is-missing' : 'is-synced'}`}
                title={measurementsMissing ? 'Add body measurements for proportion intelligence' : 'Proportions calibrated'}
              >
                <ShieldCheck size={14} className="pill-icon" />
                <span className="pill-text">
                  {measurementsMissing ? 'Standard Mode' : 'Proportions Calibrated'}
                </span>
              </button>

              <button
                type="button"
                onClick={toggleTheme}
                className="theme-toggle-btn"
                aria-label={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
              >
                {theme === 'light' ? <Moon size={17} /> : <Sun size={17} />}
              </button>

              <button
                type="button"
                onClick={onLogout}
                className="btn-editorial-ghost nav-auth-btn"
                style={{ fontSize: '0.78rem', padding: '0.4rem 0.75rem' }}
                title="Sign out of Atelier"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={toggleTheme}
                className="theme-toggle-btn"
                aria-label={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
              >
                {theme === 'light' ? <Moon size={17} /> : <Sun size={17} />}
              </button>

              <button
                type="button"
                onClick={() => onOpenAuth && onOpenAuth('login')}
                className="btn-editorial-ghost nav-auth-btn"
                style={{ fontSize: '0.78rem', padding: '0.4rem 0.75rem' }}
              >
                Log In
              </button>

              <button
                type="button"
                onClick={() => onOpenAuth && onOpenAuth('signup')}
                className="btn-editorial-primary nav-auth-btn"
                style={{ fontSize: '0.78rem', padding: '0.4rem 0.85rem' }}
              >
                Create Account
              </button>
            </>
          )}

          {/* Mobile Menu Hamburger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="mobile-menu-btn"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-nav-drawer animate-fade-in-up">
          <div className="container mobile-nav-content">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                className={`mobile-nav-link ${activeTab === item.id ? 'active' : ''}`}
              >
                {item.label}
              </button>
            ))}
            <div className="mobile-drawer-footer">
              {isAuthenticated ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      onOpenMeasurements()
                      setMobileMenuOpen(false)
                    }}
                    className="btn-editorial-secondary"
                    style={{ width: '100%', fontSize: '0.78rem', marginBottom: '0.5rem' }}
                  >
                    <Sliders size={14} style={{ marginRight: '6px' }} />
                    {measurementsMissing ? 'Configure Proportions' : 'Adjust Proportions'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onLogout()
                      setMobileMenuOpen(false)
                    }}
                    className="btn-editorial-ghost"
                    style={{ width: '100%', fontSize: '0.78rem' }}
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%' }}>
                  <button
                    type="button"
                    onClick={() => {
                      onOpenAuth && onOpenAuth('login')
                      setMobileMenuOpen(false)
                    }}
                    className="btn-editorial-ghost"
                    style={{ width: '100%', fontSize: '0.8rem' }}
                  >
                    Log In
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onOpenAuth && onOpenAuth('signup')
                      setMobileMenuOpen(false)
                    }}
                    className="btn-editorial-primary"
                    style={{ width: '100%', fontSize: '0.8rem' }}
                  >
                    Create Account
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
