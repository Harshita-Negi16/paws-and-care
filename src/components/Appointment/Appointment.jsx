import { Link } from 'react-router-dom'
import './Appointment.css'

function Appointment() {
  return (
    <section id="appointment" className="appointment-section">
      <div className="container appointment-shell">
        <div className="appointment-header">
          <span className="appointment-badge">We&apos;re Here for Your Pet</span>
          <h2 className="appointment-title">Let&apos;s make their next visit a little easier.</h2>
          <p className="appointment-subtitle">Tell us a little about your pet and the care they need.</p>
        </div>

        <div className="appointment-card">
          <div className="appointment-success">
            <div className="success-badge" aria-hidden="true">P</div>
            <h3 className="success-title">Thoughtful care starts with a request.</h3>
            <p className="success-message">
              Sign in or create an account to request a visit, choose a pet, and keep their care details together.
            </p>
            <p className="success-note">
              Appointment requests remain pending until clinic staff confirms the time with you.
            </p>
            <Link to="/dashboard/appointments?new=1" className="btn-appointment-submit">
              Request an appointment
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Appointment
