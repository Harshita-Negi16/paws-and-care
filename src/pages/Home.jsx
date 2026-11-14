import Navbar from '../components/Navbar/Navbar'
import Hero from '../components/Hero/Hero'
import Services from '../components/Services/Services'
import About from '../components/About/About'
import Doctors from '../components/Doctors/Doctors'
import Articles from '../components/Articles/Articles'
import Reviews from '../components/Reviews/Reviews'
import Appointment from '../components/Appointment/Appointment'
import Footer from '../components/Footer/Footer'

function Home() {
  return (
    <div className="homepage">
      {/* 1. Navigation Bar */}
      <Navbar />

      <main>
        {/* 2. Hero Section */}
        <Hero />

        {/* 3. Services Section */}
        <Services />

        {/* 4. About Us Section */}
        <About />

        {/* 5. Our Doctors Section */}
        <Doctors />

        {/* 6. Articles Section */}
        <Articles />

        {/* 7. Customer Reviews Section */}
        <Reviews />

        {/* 8. Book an Appointment Section */}
        <Appointment />
      </main>

      {/* 9. Footer */}
      <Footer />
    </div>
  )
}

export default Home
