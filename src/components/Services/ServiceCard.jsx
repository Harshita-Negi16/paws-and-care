import { Link } from 'react-router-dom'

function ServiceCard({ title, description, image, imageAlt }) {
  return (
    <article className="service-card">
      <div className="service-image-wrapper">
        <img 
          src={image} 
          alt={imageAlt} 
          className="service-image" 
          loading="lazy"
        />
      </div>
      <div className="service-body">
        <h3 className="service-title">{title}</h3>
        <p className="service-description">{description}</p>
        <div className="service-footer">
          <Link to="/dashboard/appointments?new=1" className="service-btn">
            Book Appointment
            <svg 
              className="service-btn-arrow" 
              viewBox="0 0 20 20" 
              fill="currentColor" 
              width="16" 
              height="16" 
              aria-hidden="true"
            >
              <path 
                fillRule="evenodd" 
                d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" 
                clipRule="evenodd" 
              />
            </svg>
          </Link>
        </div>
      </div>
    </article>
  )
}

export default ServiceCard
