import { useState } from 'react'

function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  })
  const [errors, setErrors] = useState({})
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error for field being edited
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validate = () => {
    const newErrors = {}
    if (!formData.name.trim()) {
      newErrors.name = 'Please enter your full name.'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Please enter your email address.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address.'
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Please enter a message.'
    } else if (formData.message.trim().length < 5) {
      newErrors.message = 'Message must be at least 5 characters.'
    }

    return newErrors
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    // Mark as submitted (demo mode without live backend)
    setIsSubmitted(true)
  }

  const handleReset = () => {
    setFormData({ name: '', email: '', message: '' })
    setErrors({})
    setIsSubmitted(false)
  }

  return (
    <div className="about-form-card">
      <div className="about-form-header">
        <h3 className="about-form-title">Send Us a Message</h3>
        <p className="about-form-subtitle">
          Have a question about our care or need guidance? Send us a note below.
        </p>
      </div>

      {isSubmitted ? (
        <div className="about-form-success" role="alert">
          <div className="success-icon-badge" aria-hidden="true">✓</div>
          <h4 className="success-title">Message Received</h4>
          <p className="success-message">
            Thank you, <strong>{formData.name}</strong>. Your message has been received in demonstration mode.
          </p>
          <p className="success-notice">
            <em>Note: The clinic backend messaging system is not yet connected. Live messages will be routed once the backend is activated.</em>
          </p>
          <button 
            type="button" 
            className="btn-form-reset" 
            onClick={handleReset}
          >
            Send Another Message
          </button>
        </div>
      ) : (
        <form className="about-contact-form" onSubmit={handleSubmit} noValidate>
          {/* Full Name */}
          <div className="form-group">
            <label htmlFor="about-name" className="form-label">
              Full Name <span className="required-star">*</span>
            </label>
            <input
              type="text"
              id="about-name"
              name="name"
              className={`form-input ${errors.name ? 'is-invalid' : ''}`}
              placeholder="e.g. Sarah Jenkins"
              value={formData.name}
              onChange={handleChange}
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? 'about-name-error' : undefined}
            />
            {errors.name && (
              <span id="about-name-error" className="form-error">
                {errors.name}
              </span>
            )}
          </div>

          {/* Email Address */}
          <div className="form-group">
            <label htmlFor="about-email" className="form-label">
              Email Address <span className="required-star">*</span>
            </label>
            <input
              type="email"
              id="about-email"
              name="email"
              className={`form-input ${errors.email ? 'is-invalid' : ''}`}
              placeholder="e.g. sarah@example.com"
              value={formData.email}
              onChange={handleChange}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'about-email-error' : undefined}
            />
            {errors.email && (
              <span id="about-email-error" className="form-error">
                {errors.email}
              </span>
            )}
          </div>

          {/* Message */}
          <div className="form-group">
            <label htmlFor="about-message" className="form-label">
              Message <span className="required-star">*</span>
            </label>
            <textarea
              id="about-message"
              name="message"
              rows="4"
              className={`form-textarea ${errors.message ? 'is-invalid' : ''}`}
              placeholder="How can we help you and your pet?"
              value={formData.message}
              onChange={handleChange}
              aria-invalid={!!errors.message}
              aria-describedby={errors.message ? 'about-message-error' : undefined}
            ></textarea>
            {errors.message && (
              <span id="about-message-error" className="form-error">
                {errors.message}
              </span>
            )}
          </div>

          {/* Submit Button */}
          <button type="submit" className="btn-form-submit">
            Send Message
          </button>
        </form>
      )}
    </div>
  )
}

export default ContactForm
