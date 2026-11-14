import { useCallback, useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import brandLogo from '../../assets/Paws and Care Veterinary Clinic Logo.png'
import { useAuth } from '../../context/useAuth'
import { supabase } from '../../lib/supabase'
import './Dashboard.css'

const dashboardLinks = [
  { label: 'Overview', path: '/dashboard', end: true },
  { label: 'My Pets', path: '/dashboard/pets' },
  { label: 'Appointments', path: '/dashboard/appointments' },
  { label: 'Health Records', path: '/dashboard/records' },
  { label: 'Vaccinations', path: '/dashboard/vaccinations' },
  { label: 'My Profile', path: '/dashboard/profile' }
]

function DashboardLayout() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [profileError, setProfileError] = useState('')
  const [isProfileLoading, setIsProfileLoading] = useState(true)
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [signOutError, setSignOutError] = useState('')
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  const loadProfile = useCallback(async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, phone')
      .eq('id', user.id)
      .maybeSingle()

    setProfileError('')
    if (error) {
      setProfileError(error.message)
      setProfile(null)
    } else {
      setProfile(data)
    }
    setIsProfileLoading(false)
  }, [user.id])

  useEffect(() => {
    loadProfile()
  }, [loadProfile])

  const handleSignOut = async () => {
    setIsSigningOut(true)
    setSignOutError('')
    try {
      await signOut()
      navigate('/', { replace: true })
    } catch {
      setSignOutError('Sign out failed. Please try again.')
    } finally {
      setIsSigningOut(false)
    }
  }

  const displayName = profile?.username || user.user_metadata?.username || user.email

  return (
    <div className="dashboard-app">
      <aside id="dashboard-sidebar" className={`dashboard-sidebar ${mobileNavOpen ? 'is-open' : ''}`}>
        <Link to="/" className="dashboard-brand" aria-label="Paws and Care home">
          <img src={brandLogo} alt="Paws and Care Veterinary Clinic" />
        </Link>

        <div className="dashboard-user">
          <span className="dashboard-avatar" aria-hidden="true">
            {(displayName || 'P').slice(0, 1).toUpperCase()}
          </span>
          <div className="dashboard-user-copy">
            <strong>{isProfileLoading ? 'Loading profile…' : displayName}</strong>
            <span>Pet Parent</span>
          </div>
        </div>

        {profileError && (
          <p className="dashboard-sidebar-error" role="alert">
            Profile details could not be loaded. Run the dashboard schema if it has not been applied.
          </p>
        )}

        <nav className="dashboard-nav" aria-label="Dashboard">
          <p className="dashboard-nav-label">Your care space</p>
          {dashboardLinks.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) => `dashboard-nav-link ${isActive ? 'is-active' : ''}`}
              onClick={() => setMobileNavOpen(false)}
            >
              <span className="dashboard-nav-mark" aria-hidden="true"></span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="dashboard-sidebar-bottom">
          {signOutError && <p className="dashboard-sidebar-error" role="alert">{signOutError}</p>}
          <button
            type="button"
            className="dashboard-signout"
            onClick={handleSignOut}
            disabled={isSigningOut}
          >
            <span aria-hidden="true">↗</span>
            {isSigningOut ? 'Signing out…' : 'Sign Out'}
          </button>
          <Link className="dashboard-home-link" to="/">Back to the clinic website</Link>
        </div>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-topbar">
          <button
            type="button"
            className="dashboard-menu-toggle"
            onClick={() => setMobileNavOpen(previous => !previous)}
            aria-expanded={mobileNavOpen}
            aria-controls="dashboard-sidebar"
          >
            {mobileNavOpen ? 'Close menu' : 'Menu'}
          </button>
          <span>Thoughtful care, every step of the way.</span>
          <Link to="/dashboard/profile" className="dashboard-topbar-user">
            {displayName}
          </Link>
        </header>

        <div className="dashboard-content">
          <Outlet context={{ profile, reloadProfile: loadProfile, isProfileLoading, profileError }} />
        </div>
      </main>
    </div>
  )
}

export default DashboardLayout
