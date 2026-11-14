import ContactForm from './ContactForm'
import './About.css'

function About() {
  return (
    <section id="about" className="about-section">
      <div className="container">
        <div className="about-grid">
          {/* Left Column: Contact Form */}
          <div className="about-column-form">
            <ContactForm />
          </div>

          {/* Right Column: About Content */}
          <div className="about-column-content">
            <svg className="about-botanical" viewBox="0 0 180 230" fill="none" aria-hidden="true">
              <path d="M26 218C67 166 106 103 151 15" />
              <path d="M52 181C28 174 19 153 24 134C47 136 62 153 52 181Z" />
              <path d="M82 140C63 123 64 100 76 84C95 98 102 119 82 140Z" />
              <path d="M111 93C109 70 123 52 141 46C149 66 138 84 111 93Z" />
              <path d="M63 164C87 163 102 149 108 132" />
              <path d="M90 123C113 119 126 103 132 85" />
            </svg>
            <div className="about-header">
              <span className="about-badge">Who We Are</span>
              <h2 className="about-title">About Paws and Care</h2>
              <p className="about-lead">
                Dedicated to compassionate, comprehensive veterinary medicine with a gentle approach that puts your pet&apos;s comfort and wellbeing first.
              </p>
            </div>

            <div className="about-blocks">
              {/* 1. Our Story */}
              <div className="about-block">
                <h3 className="about-block-title">Our Story</h3>
                <p className="about-block-text">
                  Paws and Care was created from a heartfelt commitment to make veterinary visits unhurried, reassuring, and comforting. Recognizing the unique place pets hold as cherished family members, our clinic is designed to be a safe, quiet haven where animals receive thoughtful medical attention without unnecessary fear or stress.
                </p>
              </div>

              {/* 2. Our Mission */}
              <div className="about-block">
                <h3 className="about-block-title">Our Mission</h3>
                <p className="about-block-text">
                  Our mission is to support the lifelong vitality and happiness of your companions through proactive preventive healthcare, clear communication, and individualized clinical care. We believe in partnering closely with pet owners, offering honest guidance and empowering you to make confident decisions for your pet&apos;s health.
                </p>
              </div>

              {/* 3. Our Approach to Pet Care */}
              <div className="about-block">
                <h3 className="about-block-title">Our Approach to Pet Care</h3>
                <p className="about-block-text">
                  We emphasize gentle handling, calm clinic environments, and responsible treatment plans tailored to each animal&apos;s temperament and life stage. By focusing on preventive wellness examinations, balanced nutrition, and early health screenings, we aim to prevent illness before it arises and promote joyful, active years together.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default About
