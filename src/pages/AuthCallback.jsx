import { useEffect } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import AuthLayout from '../components/Auth/AuthLayout'
import { useAuth } from '../context/useAuth'
import { getAuthReturnLocation, getSafeAuthReturnTo } from '../lib/authRedirect'

function AuthCallback() {
  const { user, isLoading, sessionError } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const returnTo = getSafeAuthReturnTo(searchParams.get('next'))
  const returnLocation = getAuthReturnLocation(returnTo)
  const hashParams = new URLSearchParams(location.hash.slice(1))
  const verificationError = searchParams.get('error_description')
    || searchParams.get('error')
    || hashParams.get('error_description')
    || hashParams.get('error')
    || sessionError

  useEffect(() => {
    if (!isLoading && user && !verificationError) {
      navigate(returnTo, { replace: true })
    }
  }, [isLoading, navigate, returnTo, user, verificationError])

  if (isLoading || (user && !verificationError)) {
    return (
      <AuthLayout eyebrow="Email confirmation">
        <div className="auth-heading">
          <p className="auth-eyebrow">{user ? 'Email confirmed' : 'One moment'}</p>
          <h2>{user ? 'Welcome to your care space.' : 'Checking your confirmation…'}</h2>
          <p>{user ? 'We’re taking you to your account now.' : 'We’re securely restoring your account session.'}</p>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout eyebrow="Email confirmation">
      <div className="auth-heading">
        <p className="auth-eyebrow">We couldn&apos;t finish that step</p>
        <h2>Your confirmation needs attention.</h2>
        <p>
          {verificationError
            ? `The verification link could not be completed: ${verificationError}`
            : 'This link may be expired or invalid, or it did not return a signed-in session.'}
        </p>
      </div>
      <div className="auth-alert is-error" role="alert">
        Sign in if your email is already confirmed. If this link expired, try signing up again or contact the clinic for help.
      </div>
      <p className="auth-switch">
        <Link to="/sign-in" state={{ from: returnLocation }}>Go to sign in</Link>
      </p>
    </AuthLayout>
  )
}

export default AuthCallback
