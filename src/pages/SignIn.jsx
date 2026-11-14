import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import AuthLayout from '../components/Auth/AuthLayout'
import PasswordField from '../components/Auth/PasswordField'
import { useAuth } from '../context/useAuth'
import { supabase } from '../lib/supabase'

function SignIn() {
  const location = useLocation()
  const { sessionError } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    const nextErrors = {}
    if (!email.trim()) nextErrors.email = 'Enter your email address.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) nextErrors.email = 'Enter a valid email address.'
    if (!password) nextErrors.password = 'Enter your password.'
    setErrors(nextErrors)
    setErrorMessage('')
    setSuccessMessage('')
    if (Object.keys(nextErrors).length > 0) return

    setIsSubmitting(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      })

      if (error) {
        if (error.status === 429) {
          setErrorMessage('Too many attempts. Please wait a moment and try again.')
        } else if (error.message.toLowerCase().includes('email not confirmed')) {
          setErrorMessage('Please confirm your email address using the link in your inbox, then sign in.')
        } else if (error.message.toLowerCase().includes('invalid login credentials')) {
          setErrorMessage('That email and password combination did not match.')
        } else {
          setErrorMessage(error.message)
        }
        return
      }

      setSuccessMessage('Signed in. Opening your account…')
    } catch {
      setErrorMessage('We could not reach the authentication service. Check your connection and try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout eyebrow="Welcome back">
      <div className="auth-heading">
        <p className="auth-eyebrow">Your care, all in one place</p>
        <h2>Good to see you.</h2>
        <p>Sign in to pick up right where you and your pet left off.</p>
      </div>

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <div className="auth-field">
          <label htmlFor="signin-email">Email address</label>
          <input
            id="signin-email"
            name="email"
            type="email"
            value={email}
            onChange={event => {
              setEmail(event.target.value)
              setErrors(previous => ({ ...previous, email: '' }))
              setErrorMessage('')
            }}
            autoComplete="email"
            autoCapitalize="none"
            className={`auth-input ${errors.email ? 'has-error' : ''}`}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? 'signin-email-error' : undefined}
            required
          />
          {errors.email && <span className="auth-field-error" id="signin-email-error">{errors.email}</span>}
        </div>

        <PasswordField
          id="signin-password"
          label="Password"
          value={password}
          onChange={event => {
            setPassword(event.target.value)
            setErrors(previous => ({ ...previous, password: '' }))
            setErrorMessage('')
          }}
          error={errors.password}
          autoComplete="current-password"
        />

        <div className="auth-form-options">
          <span className="auth-session-note">You&apos;ll stay signed in on this device.</span>
          <Link to="/forgot-password" state={location.state}>Forgot password?</Link>
        </div>

        {errorMessage && <p className="auth-alert is-error" role="alert">{errorMessage}</p>}
        {sessionError && (
          <p className="auth-alert is-error" role="alert">
            Your previous session could not be restored: {sessionError} You can still try signing in again.
          </p>
        )}
        {successMessage && <p className="auth-alert is-success" role="status">{successMessage}</p>}

        <button className="auth-submit" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Signing in…' : 'Sign in'}
          {!isSubmitting && <span aria-hidden="true">→</span>}
        </button>
      </form>

      <p className="auth-switch">
        New to Paws and Care? <Link to="/sign-up" state={location.state}>Create an account</Link>
      </p>
    </AuthLayout>
  )
}

export default SignIn
