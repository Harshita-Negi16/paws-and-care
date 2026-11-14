import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import AuthLayout from '../components/Auth/AuthLayout'
import { getAuthReturnLocation, getSafeAuthReturnTo } from '../lib/authRedirect'
import { supabase } from '../lib/supabase'

function ForgotPassword() {
  const location = useLocation()
  const returnTo = getSafeAuthReturnTo(location.state?.from)
  const returnLocation = getAuthReturnLocation(returnTo)
  const [email, setEmail] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrorMessage('Enter a valid email address to continue.')
      return
    }

    setIsSubmitting(true)
    try {
      const redirectUrl = new URL('/reset-password', window.location.origin)
      redirectUrl.searchParams.set('next', returnTo)
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: redirectUrl.toString()
      })

      if (error) {
        setErrorMessage(error.status === 429
          ? 'Too many requests. Please wait a moment and try again.'
          : error.message)
      } else {
        setSuccessMessage('If an account exists for that email, a password reset link is on its way.')
      }
    } catch {
      setErrorMessage('We could not reach the authentication service. Check your connection and try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout eyebrow="A fresh start">
      <div className="auth-heading">
        <p className="auth-eyebrow">No worries, it happens</p>
        <h2>Let&apos;s get you back in.</h2>
        <p>Enter the email address on your account and we&apos;ll send a secure reset link.</p>
      </div>

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <div className="auth-field">
          <label htmlFor="reset-email">Email address</label>
          <input
            id="reset-email"
            name="email"
            type="email"
            value={email}
            onChange={event => {
              setEmail(event.target.value)
              setErrorMessage('')
              setSuccessMessage('')
            }}
            autoComplete="email"
            autoCapitalize="none"
            className={`auth-input ${errorMessage ? 'has-error' : ''}`}
            aria-invalid={Boolean(errorMessage)}
            required
          />
        </div>

        {errorMessage && <p className="auth-alert is-error" role="alert">{errorMessage}</p>}
        {successMessage && <p className="auth-alert is-success" role="status">{successMessage}</p>}

        <button className="auth-submit" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Sending link…' : 'Send reset link'}
          {!isSubmitting && <span aria-hidden="true">→</span>}
        </button>
      </form>

      <p className="auth-switch">
        Remember your password? <Link to="/sign-in" state={{ from: returnLocation }}>Back to sign in</Link>
      </p>
    </AuthLayout>
  )
}

export default ForgotPassword
