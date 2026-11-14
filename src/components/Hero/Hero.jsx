import { Link } from 'react-router-dom'
import './Hero.css'

function Hero() {
  return (
    <section id="home" className="hero-section">
      <div className="container hero-container">
        {/* Left Column: Content */}
        <div className="hero-content">
          <div className="hero-badge">
            <span className="badge-dot"></span>
            <span>Welcoming New Patients</span>
          </div>

          <h1 className="hero-title">
            <span className="hero-brand">Paws and Care</span>
            <span className="hero-tagline">A little extra care for those little paws.</span>
          </h1>

          <p className="hero-intro">
            Providing compassionate, comprehensive veterinary medicine with a gentle touch. 
            From routine wellness examinations and preventive care to advanced diagnostics, 
            our dedicated team ensures your cherished companions lead happy, healthy, and vibrant lives.
          </p>

          <div className="hero-actions">
            <Link to="/dashboard/appointments?new=1" className="btn-hero btn-hero-primary">
              Book an Appointment
            </Link>
            <a href="#services" className="btn-hero btn-hero-secondary">
              Explore Our Services
            </a>
          </div>

          <div className="hero-highlights">
            <div className="highlight-item">
              <span className="highlight-number">Compassionate</span>
              <span className="highlight-label">Veterinary Team</span>
            </div>
            <div className="highlight-divider"></div>
            <div className="highlight-item">
              <span className="highlight-number">Modern</span>
              <span className="highlight-label">Diagnostic Facility</span>
            </div>
            <div className="highlight-divider"></div>
            <div className="highlight-item">
              <span className="highlight-number">Fear-Free</span>
              <span className="highlight-label">Gentle Handling</span>
            </div>
          </div>
        </div>

        {/* Right Column: Genuine Dog & Cat Photograph */}
        <div className="hero-media">
          <span className="hero-spark hero-spark-one" aria-hidden="true">✦</span>
          <span className="hero-spark hero-spark-two" aria-hidden="true">♥</span>
          <svg className="hero-paw-print" viewBox="0 0 64 64" aria-hidden="true">
            <ellipse cx="32" cy="42" rx="14" ry="11" />
            <ellipse cx="14" cy="26" rx="6" ry="8" transform="rotate(-25 14 26)" />
            <ellipse cx="28" cy="17" rx="6" ry="8" transform="rotate(-8 28 17)" />
            <ellipse cx="43" cy="19" rx="6" ry="8" transform="rotate(12 43 19)" />
            <ellipse cx="53" cy="30" rx="6" ry="8" transform="rotate(28 53 30)" />
          </svg>
          <svg className="hero-botanical" viewBox="0 0 150 220" fill="none" aria-hidden="true">
            <path d="M17 204C63 161 105 99 129 16" />
            <path d="M41 171C19 162 12 141 17 123C38 126 51 142 41 171Z" />
            <path d="M68 132C48 112 51 90 62 75C80 89 87 108 68 132Z" />
            <path d="M91 91C87 68 101 49 118 42C127 62 117 81 91 91Z" />
            <path d="M47 164C70 165 86 153 94 137" />
            <path d="M75 119C96 116 111 101 116 84" />
          </svg>
          <div className="hero-image-wrapper">
            <img 
              src="https://images.unsplash.com/photo-1623387641168-d9803ddd3f35?auto=format&fit=crop&w=1200&q=80" 
              alt="A dog and cat resting peacefully together" 
              className="hero-image"
              loading="eager"
            />
            <div className="hero-image-accent"></div>
          </div>
          <span className="photo-credit">
            Photo by Andrew S via Unsplash
          </span>
        </div>
      </div>
    </section>
  )
}

export default Hero
