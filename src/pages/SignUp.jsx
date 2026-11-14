import { useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import AuthLayout from '../components/Auth/AuthLayout'
import PasswordField from '../components/Auth/PasswordField'
import { getAuthCallbackUrl, getAuthReturnLocation, getSafeAuthReturnTo } from '../lib/authRedirect'
import { supabase } from '../lib/supabase'

const USERNAME_PATTERN = /^[A-Za-z0-9_]{3,24}$/

function SignUp() {
  const location = useLocation()
  const returnTo = getSafeAuthReturnTo(location.state?.from)
  const returnLocation = getAuthReturnLocation(returnTo)
  const checkSequence = useRef(0)
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState({})
  const [availability, setAvailability] = useState('idle')
  const [availabilityMessage, setAvailabilityMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [confirmationRequired, setConfirmationRequired] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const updateField = (event) => {
    const { name, value } = event.target
    if (name === 'username') {
      checkSequence.current += 1
      setAvailability('idle')
      setAvailabilityMessage('')
    }
    setForm(previous => ({ ...previous, [name]: value }))
    setErrors(previous => ({ ...previous, [name]: '' }))
    setErrorMessage('')
    setSuccessMessage('')
    setConfirmationRequired(false)
  }

  const checkUsername = async (value) => {
    const username = value.trim()
    if (!USERNAME_PATTERN.test(username)) {
      setAvailability('invalid')
      setAvailabilityMessage('Use 3–24 letters, numbers, or underscores.')
      return false
    }

    const sequence = ++checkSequence.current
    setAvailability('checking')
    setAvailabilityMessage('Checking username…')

    try {
      const { data, error } = await supabase.rpc('is_username_available', {
        candidate_username: username
      })

      if (sequence !== checkSequence.current) return false
      if (error || typeof data !== 'boolean') {
        setAvailability('error')
        setAvailabilityMessage('Username availability could not be checked. Please try again.')
        return false
      }

      setAvailability(data ? 'available' : 'taken')
      setAvailabilityMessage(data ? 'This username is available.' : 'That username is already taken.')
      return data
    } catch {
      if (sequence === checkSequence.current) {
        setAvailability('error')
        setAvailabilityMessage('Username availability could not be checked. Please try again.')
      }
      return false
    }
  }

  const validate = () => {
    const nextErrors = {}
    if (!USERNAME_PATTERN.test(form.username.trim())) {
      nextErrors.username = 'Use 3–24 letters, numbers, or underscores.'
    }
    if (!form.email.trim()) {
      nextErrors.email = 'Enter your email address.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      nextErrors.email = 'Enter a valid email address.'
    }
    if (form.password.length < 8 || !/\d/.test(form.password)) {
      nextErrors.password = 'Use at least 8 characters and include a number.'
    }
    if (!form.confirmPassword) {
      nextErrors.confirmPassword = 'Confirm your password.'
    } else if (form.password !== form.confirmPassword) {
      nextErrors.confirmPassword = 'Passwords do not match.'
    }
    return nextErrors
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')
    const nextErrors = validate()
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setIsSubmitting(true)
    const isUsernameAvailable = await checkUsername(form.username)
    if (!isUsernameAvailable) {
      setIsSubmitting(false)
      return
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: form.email.trim(),
        password: form.password,
        options: {
          data: { username: form.username.trim() },
          emailRedirectTo: getAuthCallbackUrl(returnTo)
        }
      })

      if (error) {
        if (error.status === 429) {
          setErrorMessage('Too many attempts. Please wait a moment and try again.')
        } else if (error.message.includes('Database error saving new user')) {
          setErrorMessage('We could not create that profile. The username may have just been claimed; check it and try again.')
        } else {
          setErrorMessage(error.message)
        }
      } else if (data.session) {
        setSuccessMessage('Account created. Opening your account…')
      } else {
        setConfirmationRequired(true)
      }
    } catch {
      setErrorMessage('We could not reach the authentication service. Check your connection and try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (confirmationRequired) {
    return (
      <AuthLayout eyebrow="Check your inbox">
        <div className="auth-heading">
          <p className="auth-eyebrow">One little step</p>
          <h2>Confirm your email.</h2>
          <p>
            We sent a confirmation link to <strong>{form.email}</strong>. Open it to verify your email;
            we&apos;ll securely return you to your account.
          </p>
        </div>
        <div className="auth-alert is-success" role="status">
          Keep this page open if you like. Once you confirm your email, the link will finish signing you in automatically.
        </div>
        <p className="auth-switch">
          Already confirmed? <Link to="/sign-in" state={{ from: returnLocation }}>Sign in to continue</Link>
        </p>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout eyebrow="Create your account">
      <div className="auth-heading">
        <p className="auth-eyebrow">A good place to begin</p>
        <h2>Join the family.</h2>
        <p>Create an account to make your Paws and Care experience feel a little more personal.</p>
      </div>

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <div className="auth-field">
          <label htmlFor="signup-username">Username</label>
          <input
            id="signup-username"
            name="username"
            type="text"
            value={form.username}
            onChange={updateField}
            onBlur={() => checkUsername(form.username)}
            autoComplete="username"
            autoCapitalize="none"
            maxLength={24}
            className={`auth-input ${errors.username ? 'has-error' : ''}`}
            aria-invalid={Boolean(errors.username)}
            aria-describedby="signup-username-hint"
            required
          />
          <span
            id="signup-username-hint"
            className={`auth-field-hint ${availability === 'available' ? 'is-success' : ''} ${availability === 'taken' || availability === 'error' || errors.username ? 'is-error' : ''}`}
            role={availability === 'taken' || availability === 'error' ? 'status' : undefined}
          >
            {errors.username || availabilityMessage || '3–24 letters, numbers, or underscores.'}
          </span>
        </div>

        <div className="auth-field">
          <label htmlFor="signup-email">Email address</label>
          <input
            id="signup-email"
            name="email"
            type="email"
            value={form.email}
            onChange={updateField}
            autoComplete="email"
            autoCapitalize="none"
            className={`auth-input ${errors.email ? 'has-error' : ''}`}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? 'signup-email-error' : undefined}
            required
          />
          {errors.email && <span className="auth-field-error" id="signup-email-error">{errors.email}</span>}
        </div>

        <PasswordField
          id="signup-password"
          name="password"
          label="Password"
          value={form.password}
          onChange={updateField}
          error={errors.password}
        />
        <PasswordField
          id="signup-confirm-password"
          name="confirmPassword"
          label="Confirm password"
          value={form.confirmPassword}
          onChange={updateField}
          error={errors.confirmPassword}
        />

        {errorMessage && <p className="auth-alert is-error" role="alert">{errorMessage}</p>}
        {successMessage && <p className="auth-alert is-success" role="status">{successMessage}</p>}

        <button className="auth-submit" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating your account…' : 'Create account'}
          {!isSubmitting && <span aria-hidden="true">→</span>}
        </button>
      </form>

      <p className="auth-switch">
        Already have an account? <Link to="/sign-in" state={{ from: returnLocation }}>Sign in</Link>
      </p>
    </AuthLayout>
  )
}

export default SignUp
