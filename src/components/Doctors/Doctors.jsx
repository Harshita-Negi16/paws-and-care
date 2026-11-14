import DoctorCard from './DoctorCard'
import './Doctors.css'

const doctorsData = [
  {
    id: 1,
    name: 'Dr. Ananya Sharma',
    role: 'General Veterinary Care',
    bio: 'Focused on everyday pet wellness, routine examinations and helping pet parents make informed healthcare decisions.',
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=700&q=80',
    imageAlt: 'Professional stock photograph representing Dr. Ananya Sharma'
  },
  {
    id: 2,
    name: 'Dr. Rohan Mehta',
    role: 'Surgical Care',
    bio: 'Represents our commitment to careful medical assessment, responsible treatment and attentive post-procedure care.',
    image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=700&q=80',
    imageAlt: 'Professional stock photograph representing Dr. Rohan Mehta'
  },
  {
    id: 3,
    name: 'Dr. Priyesh Nair',
    role: 'Preventive Healthcare',
    bio: 'He helps pet families stay proactive with vaccinations, routine screenings and preventive care that supports a healthy life at every stage.',
    image: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&w=700&q=80',
    imageAlt: 'Professional stock photograph representing Dr. Priyesh Nair'
  }
]

function Doctors() {
  return (
    <section id="doctors" className="doctors-section">
      <div className="container">
        {/* Section Header */}
        <div className="doctors-header">
          <span className="doctors-badge">Veterinary Team</span>
          <h2 className="doctors-title">Meet Our Doctors</h2>
          <p className="doctors-intro">
            Dedicated professionals, united by a love for animals and a commitment to their wellbeing.
          </p>
        </div>

        {/* Doctors Grid */}
        <div className="doctors-grid">
          {doctorsData.map(doctor => (
            <DoctorCard
              key={doctor.id}
              name={doctor.name}
              role={doctor.role}
              bio={doctor.bio}
              image={doctor.image}
              imageAlt={doctor.imageAlt}
            />
          ))}
        </div>

        {/* Transparency note below the section */}
        <div className="doctors-bottom-note">
          <p>
            These are illustrative demo profiles. Names and roles are fictional, and photographs are stock images used for visual demonstration.
          </p>
        </div>
      </div>
    </section>
  )
}

export default Doctors
