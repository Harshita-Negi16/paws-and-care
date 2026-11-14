import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import AuthLayout from '../components/Auth/AuthLayout'
import PasswordField from '../components/Auth/PasswordField'
import { useAuth } from '../context/useAuth'
import { getAuthReturnLocation } from '../lib/authRedirect'
import { supabase } from '../lib/supabase'

function ResetPassword() {
  const [searchParams] = useSearchParams()
  const returnLocation = getAuthReturnLocation(searchParams.get('next'))
  const { user, isLoading } = useAuth()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [errorMessage, setErrorMessage] = useState('')
  const [success, setSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    const nextErrors = {}
    if (password.length < 8 || !/\d/.test(password)) {
      nextErrors.password = 'Use at least 8 characters and include a number.'
    }
    if (!confirmPassword) nextErrors.confirmPassword = 'Confirm your new password.'
    else if (confirmPassword !== password) nextErrors.confirmPassword = 'Passwords do not match.'
    setErrors(nextErrors)
    setErrorMessage('')
    if (Object.keys(nextErrors).length > 0) return
    if (!user) {
      setErrorMessage('This reset link is missing or has expired. Request a new link to continue.')
      return
    }

    setIsSubmitting(true)
    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) {
        setErrorMessage(error.message)
      } else {
        setSuccess(true)
      }
    } catch {
      setErrorMessage('We could not reach the authentication service. Check your connection and try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <AuthLayout eyebrow="Password reset">
        <div className="auth-heading"><h2>Checking your reset link…</h2></div>
      </AuthLayout>
    )
  }

  if (success) {
    return (
      <AuthLayout eyebrow="Password reset">
        <div className="auth-heading">
          <p className="auth-eyebrow">All set</p>
          <h2>Your password is updated.</h2>
          <p>You can now sign in with your new password.</p>
        </div>
        <Link className="auth-submit auth-submit-link" to="/sign-in" state={{ from: returnLocation }}>
          Return to sign in <span aria-hidden="true">→</span>
        </Link>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout eyebrow="Choose a new password">
      <div className="auth-heading">
        <p className="auth-eyebrow">One more step</p>
        <h2>Make it a good one.</h2>
        <p>Choose a new password for your Paws and Care account.</p>
      </div>

      {user ? (
        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <PasswordField
            id="reset-password"
            label="New password"
            value={password}
            onChange={event => {
              setPassword(event.target.value)
              setErrors(previous => ({ ...previous, password: '' }))
              setErrorMessage('')
            }}
            error={errors.password}
          />
          <PasswordField
            id="reset-confirm-password"
            label="Confirm new password"
            value={confirmPassword}
            onChange={event => {
              setConfirmPassword(event.target.value)
              setErrors(previous => ({ ...previous, confirmPassword: '' }))
              setErrorMessage('')
            }}
            error={errors.confirmPassword}
          />
          {errorMessage && <p className="auth-alert is-error" role="alert">{errorMessage}</p>}
          <button className="auth-submit" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Updating password…' : 'Update password'}
            {!isSubmitting && <span aria-hidden="true">→</span>}
          </button>
        </form>
      ) : (
        <div className="auth-alert is-error" role="alert">
          This reset link is missing or has expired. <Link to="/forgot-password" state={{ from: returnLocation }}>Request a new link</Link>.
        </div>
      )}
    </AuthLayout>
  )
}

export default ResetPassword
