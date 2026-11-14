import ServiceCard from './ServiceCard'
import './Services.css'

const servicesData = [
  {
    id: 1,
    title: 'Surgery and Medical Care',
    description: 'From routine procedures to advanced medical treatment, we provide attentive care to help your pets recover and thrive.',
    image: 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&w=800&q=80',
    imageAlt: 'Veterinarian carefully examining a dog in clinic'
  },
  {
    id: 2,
    title: 'Dental Care',
    description: "Keep your pet's smile healthy with dental examinations, professional cleaning and preventive oral care.",
    image: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80',
    imageAlt: 'Happy dog with healthy teeth and bright smile'
  },
  {
    id: 3,
    title: 'Bath and Grooming',
    description: 'Give your pets the care they deserve with bathing, coat maintenance, nail trimming and gentle grooming.',
    image: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&w=800&q=80',
    imageAlt: 'Well-groomed dog receiving coat care and gentle attention'
  },
  {
    id: 4,
    title: 'Pet Daycare',
    description: 'A safe and welcoming environment where your pets can play, socialise and receive attentive supervision.',
    image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=800&q=80',
    imageAlt: 'Dogs playing together outdoors in an active daycare setting'
  },
  {
    id: 5,
    title: 'Vaccination and Wellness',
    description: 'Protect your companions with routine vaccinations, wellness examinations and preventive health care.',
    image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=800&q=80',
    imageAlt: 'Healthy companion receiving routine wellness examination'
  },
  {
    id: 6,
    title: 'Emergency Care',
    description: 'Timely veterinary attention for urgent health concerns, with compassionate care when your pet needs it most.',
    image: 'https://images.unsplash.com/photo-1535930891776-0c2dfb7fda1a?auto=format&fit=crop&w=800&q=80',
    imageAlt: 'Attentive, compassionate veterinary care in a clinic environment'
  }
]

function Services() {
  return (
    <section id="services" className="services-section">
      <div className="container">
        {/* Section Header */}
        <div className="services-header">
          <span className="services-badge">What We Offer</span>
          <h2 className="services-title">Our Services</h2>
          <p className="services-intro">
            Comprehensive care for every stage of your pet&apos;s life, delivered with compassion and expertise.
          </p>
        </div>

        {/* Services Grid */}
        <div className="services-grid">
          {servicesData.map(service => (
            <ServiceCard
              key={service.id}
              title={service.title}
              description={service.description}
              image={service.image}
              imageAlt={service.imageAlt}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

export default Services
