function DoctorCard({ name, role, bio, image, imageAlt }) {
  return (
    <article className="doctor-card">
      <div className="doctor-image-wrapper">
        <img 
          src={image} 
          alt={imageAlt} 
          className="doctor-image" 
          loading="lazy"
        />
        <span className="demo-badge-overlay">Demo Profile</span>
      </div>

      <div className="doctor-body">
        <div className="doctor-meta">
          <div className="doctor-badge-row">
            <span className="demo-profile-tag">Demo Profile</span>
          </div>

          <h3 className="doctor-name">{name}</h3>

          <span className="doctor-role-tag">
            <span className="role-prefix">Illustrative Role:</span> {role}
          </span>
        </div>

        <p className="doctor-bio">{bio}</p>

        <div className="doctor-card-footer">
          <span className="doctor-disclaimer">
            Illustrative stock photo &bull; Fictional profile
          </span>
        </div>
      </div>
    </article>
  )
}

export default DoctorCard
