import { Link } from 'react-router-dom'
import './Footer.css'
import brandLogo from '../../assets/Paws and Care Veterinary Clinic Logo.png'

const quickLinks = [
  { label: 'Home', href: '#home' },
  { label: 'Services', href: '#services' },
  { label: 'About Us', href: '#about' },
  { label: 'Our Doctors', href: '#doctors' },
  { label: 'Articles', href: '#articles' },
  { label: 'Reviews', href: '#reviews' },
  { label: 'Book an Appointment', to: '/dashboard/appointments?new=1' }
]

const services = [
  'Surgery and Medical Care',
  'Dental Care',
  'Bath and Grooming',
  'Pet Daycare',
  'Vaccination and Wellness',
  'Emergency Care'
]

const currentYear = new Date().getFullYear()

function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-container">
        <div className="footer-brand-column">
          <div className="footer-brand">
            <img className="footer-logo" src={brandLogo} alt="Paws and Care Veterinary Clinic" />
          </div>
          <p className="footer-brand-tag">A little extra care for those little paws.</p>
          <p className="footer-description">
            Compassionate veterinary care for pets and families who want gentle guidance, modern treatment and a calm clinic experience.
          </p>
        </div>

        <div className="footer-links-column">
          <h3 className="footer-heading">Quick Links</h3>
          <ul className="footer-list">
            {quickLinks.map(link => (
              <li key={link.label}>
                {link.to
                  ? <Link to={link.to}>{link.label}</Link>
                  : <a href={link.href}>{link.label}</a>}
              </li>
            ))}
          </ul>
        </div>

        <div className="footer-services-column">
          <h3 className="footer-heading">Services</h3>
          <ul className="footer-list">
            {services.map(service => (
              <li key={service}>
                <a href="#services">{service}</a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container footer-bottom-content">
          <p>© {currentYear} Paws and Care. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
