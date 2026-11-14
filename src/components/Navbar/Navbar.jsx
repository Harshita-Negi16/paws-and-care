import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import brandLogo from '../../assets/Paws and Care Veterinary Clinic Logo.png'
import { useAuth } from '../../context/useAuth'
import './Navbar.css'

const BUILT_SECTIONS = ['home', 'services', 'about', 'doctors', 'articles', 'reviews']

const NAV_LINKS = [
  { id: 'home', label: 'Home' },
  { id: 'services', label: 'Services' },
  { id: 'about', label: 'About Us' },
  { id: 'doctors', label: 'Our Doctors' },
  { id: 'articles', label: 'Articles' },
  { id: 'reviews', label: 'Reviews' },
]

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState('home')
  const [authError, setAuthError] = useState('')
  const { user, signOut } = useAuth()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15)

      if (window.scrollY < 100) {
        setActiveSection('home')
      } else {
        const lastSection = document.getElementById('reviews') || document.getElementById('articles') || document.getElementById('doctors')
        if (lastSection && lastSection.getBoundingClientRect().bottom < 100) {
          setActiveSection('')
        }
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const sectionElements = BUILT_SECTIONS
      .map(id => document.getElementById(id))
      .filter(Boolean)

    if (sectionElements.length === 0) return

    const visibleMap = new Map()
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            visibleMap.set(entry.target.id, entry)
          } else {
            visibleMap.delete(entry.target.id)
          }
        })

        if (visibleMap.size > 0 && window.scrollY >= 100) {
          const sorted = Array.from(visibleMap.values()).sort((a, b) => {
            return Math.abs(a.boundingClientRect.top - 80) - Math.abs(b.boundingClientRect.top - 80)
          })
          const bestId = sorted[0].target.id
          if (BUILT_SECTIONS.includes(bestId)) {
            setActiveSection(bestId)
          }
        }
      },
      {
        rootMargin: '-80px 0px -40% 0px',
        threshold: [0, 0.2, 0.5, 0.8]
      }
    )

    sectionElements.forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  const closeMenu = () => setIsMenuOpen(false)

  const handleNavClick = (sectionId) => {
    closeMenu()
    if (BUILT_SECTIONS.includes(sectionId)) {
      setActiveSection(sectionId)
    }
  }

  const handleSignOut = async () => {
    setAuthError('')
    try {
      await signOut()
      closeMenu()
    } catch {
      setAuthError('Could not sign out. Please try again.')
    }
  }

  return (
    <header className={`navbar-header ${isScrolled ? 'is-scrolled' : ''}`}>
      <div className="container navbar-container">
        <a
          href="#home"
          className="navbar-brand"
          onClick={() => handleNavClick('home')}
        >
          <img className="navbar-logo" src={brandLogo} alt="Paws and Care Veterinary Clinic" />
        </a>

        <button
          type="button"
          className="navbar-toggle"
          onClick={() => setIsMenuOpen(prev => !prev)}
          aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={isMenuOpen}
        >
          <span className={`hamburger-bar ${isMenuOpen ? 'open' : ''}`}></span>
          <span className={`hamburger-bar ${isMenuOpen ? 'open' : ''}`}></span>
          <span className={`hamburger-bar ${isMenuOpen ? 'open' : ''}`}></span>
        </button>

        <nav className={`navbar-nav ${isMenuOpen ? 'is-open' : ''}`}>
          <ul className="nav-links">
            {NAV_LINKS.map(link => {
              const isActive = activeSection === link.id
              return (
                <li key={link.id}>
                  <a
                    href={`#${link.id}`}
                    className={`nav-link ${isActive ? 'active' : ''}`}
                    onClick={() => handleNavClick(link.id)}
                  >
                    {link.label}
                  </a>
                </li>
              )
            })}
          </ul>

          <div className="nav-auth">
            {user ? (
              <>
                <Link to="/dashboard" className="nav-account-link" onClick={closeMenu}>My account</Link>
                <button type="button" className="nav-login-link" onClick={handleSignOut}>Sign out</button>
              </>
            ) : (
              <>
                <Link to="/sign-in" className="nav-login-link" onClick={closeMenu}>Log In</Link>
                <Link to="/sign-up" className="nav-signup-link" onClick={closeMenu}>Sign Up</Link>
              </>
            )}
            {authError && <span className="nav-auth-error" role="alert">{authError}</span>}
          </div>
        </nav>
      </div>
    </header>
  )
}

export default Navbar
