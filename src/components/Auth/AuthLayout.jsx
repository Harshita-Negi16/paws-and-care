import { Link } from 'react-router-dom'
import brandLogo from '../../assets/Paws and Care Veterinary Clinic Logo.png'
import './AuthLayout.css'

function AuthLayout({ children, eyebrow = 'Paws and Care account' }) {
  return (
    <div className="auth-page">
      <aside className="auth-story">
        <Link className="auth-brand" to="/" aria-label="Paws and Care home">
          <img src={brandLogo} alt="Paws and Care Veterinary Clinic" />
        </Link>

        <div className="auth-story-copy">
          <p className="auth-story-kicker">Care begins with trust</p>
          <h1>A little extra care for those little paws.</h1>
          <p>
            A familiar place for every part of your pet&apos;s care journey.
            Sign in to keep things simple, from the very first visit.
          </p>
        </div>

        <div className="auth-story-footer">
          <span className="auth-story-rule" aria-hidden="true"></span>
          <span>Thoughtful care, every step of the way.</span>
        </div>
        <span className="auth-story-index" aria-hidden="true">01 / PAC</span>
      </aside>

      <main className="auth-panel">
        <div className="auth-panel-top">
          <Link to="/" className="auth-back-link">← Back to the clinic</Link>
          <span className="auth-panel-eyebrow">{eyebrow}</span>
        </div>
        <div className="auth-form-wrap">{children}</div>
        <p className="auth-panel-footnote">
          Your pet&apos;s wellbeing is always at the heart of what we do.
        </p>
      </main>
    </div>
  )
}

export default AuthLayout
