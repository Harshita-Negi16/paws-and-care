import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import PasswordField from '../../components/Auth/PasswordField'
import { useAuth } from '../../context/useAuth'
import { supabase } from '../../lib/supabase'

const USERNAME_PATTERN = /^[A-Za-z0-9_]{3,24}$/

function ProfilePage() {
  const { profile, reloadProfile, isProfileLoading, profileError } = useOutletContext()

  if (isProfileLoading) {
    return <div className="dashboard-loading" role="status">Loading your profile…</div>
  }

  if (!profile) {
    return (
      <section className="dashboard-page">
        <div className="dashboard-page-heading">
          <div>
            <p className="dashboard-eyebrow">A few details about you</p>
            <h1>My Profile</h1>
          </div>
        </div>
        <p className="dashboard-alert is-error" role="alert">
          {profileError || 'Your profile could not be found. Please contact the clinic for help.'}
        </p>
      </section>
    )
  }

  return <ProfileForm key={profile.id} profile={profile} reloadProfile={reloadProfile} />
}

function ProfileForm({ profile, reloadProfile }) {
  const { user } = useAuth()
  const [username, setUsername] = useState(profile.username || '')
  const [phone, setPhone] = useState(profile.phone || '')
  const [profileError, setProfileError] = useState('')
  const [profileNotice, setProfileNotice] = useState('')
  const [profileFieldErrors, setProfileFieldErrors] = useState({})
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordErrors, setPasswordErrors] = useState({})
  const [passwordError, setPasswordError] = useState('')
  const [passwordNotice, setPasswordNotice] = useState('')
  const [isSavingPassword, setIsSavingPassword] = useState(false)

  const saveProfile = async (event) => {
    event.preventDefault()
    setProfileError('')
    setProfileNotice('')
    const errors = {}
    const nextUsername = username.trim()
    const nextPhone = phone.trim()

    if (!USERNAME_PATTERN.test(nextUsername)) errors.username = 'Use 3–24 letters, numbers, or underscores.'
    if (nextPhone && (!/^[+()\d.\-\s]+$/.test(nextPhone) || nextPhone.replace(/\D/g, '').length < 7)) {
      errors.phone = 'Enter a valid phone number, or leave this field empty.'
    }
    setProfileFieldErrors(errors)
    if (Object.keys(errors).length) return

    setIsSavingProfile(true)
    if (nextUsername.toLowerCase() !== (profile?.username || '').toLowerCase()) {
      const { data: available, error: availabilityError } = await supabase.rpc('is_username_available', {
        candidate_username: nextUsername
      })
      if (availabilityError || typeof available !== 'boolean') {
        setProfileError('Username availability could not be checked. Try again after confirming the dashboard SQL has been run.')
        setIsSavingProfile(false)
        return
      }
      if (!available) {
        setProfileFieldErrors({ username: 'That username is already taken.' })
        setIsSavingProfile(false)
        return
      }
    }

    const { error } = await supabase.from('profiles')
      .update({ username: nextUsername, phone: nextPhone || null })
      .eq('id', user.id)

    if (error) {
      setProfileError(error.message.includes('duplicate key')
        ? 'That username was just claimed. Choose another one.'
        : error.message)
    } else {
      setProfileNotice('Your profile details have been saved.')
      await reloadProfile()
    }
    setIsSavingProfile(false)
  }

  const updatePassword = async (event) => {
    event.preventDefault()
    setPasswordError('')
    setPasswordNotice('')
    const errors = {}
    if (password.length < 8 || !/\d/.test(password)) {
      errors.password = 'Use at least 8 characters and include a number.'
    }
    if (!confirmPassword) errors.confirmPassword = 'Confirm your new password.'
    else if (password !== confirmPassword) errors.confirmPassword = 'Passwords do not match.'
    setPasswordErrors(errors)
    if (Object.keys(errors).length) return

    setIsSavingPassword(true)
    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      setPasswordError(error.message)
    } else {
      setPassword('')
      setConfirmPassword('')
      setPasswordNotice('Your password has been updated.')
    }
    setIsSavingPassword(false)
  }

  return (
    <section className="dashboard-page">
      <div className="dashboard-page-heading">
        <div>
          <p className="dashboard-eyebrow">A few details about you</p>
          <h1>My Profile</h1>
          <p>Keep your account information up to date.</p>
        </div>
      </div>

      <div className="dashboard-profile-grid">
        <section className="dashboard-profile-panel">
          <p className="dashboard-eyebrow">Your account</p>
          <h2>Profile details</h2>
          <form className="dashboard-form" onSubmit={saveProfile} noValidate>
            <div className="dashboard-field">
              <label htmlFor="profile-username">Username *</label>
              <input
                id="profile-username"
                value={username}
                onChange={event => {
                  setUsername(event.target.value)
                  setProfileFieldErrors(previous => ({ ...previous, username: '' }))
                }}
                autoComplete="username"
                maxLength={24}
                aria-invalid={Boolean(profileFieldErrors.username)}
                required
              />
              {profileFieldErrors.username && <span className="dashboard-field-error">{profileFieldErrors.username}</span>}
            </div>
            <div className="dashboard-field">
              <label htmlFor="profile-email">Email address</label>
              <p id="profile-email" className="dashboard-profile-email">{user.email}</p>
              <span className="dashboard-field-hint">Email is managed by Supabase Auth and is read-only here.</span>
            </div>
            <div className="dashboard-field">
              <label htmlFor="profile-phone">Phone number</label>
              <input
                id="profile-phone"
                type="tel"
                value={phone}
                onChange={event => {
                  setPhone(event.target.value)
                  setProfileFieldErrors(previous => ({ ...previous, phone: '' }))
                }}
                autoComplete="tel"
                maxLength={40}
                aria-invalid={Boolean(profileFieldErrors.phone)}
              />
              {profileFieldErrors.phone && <span className="dashboard-field-error">{profileFieldErrors.phone}</span>}
              <span className="dashboard-field-hint">Optional. Used for appointment follow-up.</span>
            </div>
            {profileError && <p className="dashboard-alert is-error" role="alert">{profileError}</p>}
            {profileNotice && <p className="dashboard-alert is-success" role="status">{profileNotice}</p>}
            <button type="submit" className="dashboard-primary-button" disabled={isSavingProfile || !profile}>
              {isSavingProfile ? 'Saving profile…' : 'Save profile'}
            </button>
          </form>
        </section>

        <section className="dashboard-profile-panel">
          <p className="dashboard-eyebrow">Account security</p>
          <h2>Change password</h2>
          <form className="dashboard-form" onSubmit={updatePassword} noValidate>
            <PasswordField
              id="dashboard-new-password"
              label="New password"
              value={password}
              onChange={event => {
                setPassword(event.target.value)
                setPasswordErrors(previous => ({ ...previous, password: '' }))
                setPasswordError('')
              }}
              error={passwordErrors.password}
            />
            <PasswordField
              id="dashboard-confirm-password"
              label="Confirm new password"
              value={confirmPassword}
              onChange={event => {
                setConfirmPassword(event.target.value)
                setPasswordErrors(previous => ({ ...previous, confirmPassword: '' }))
                setPasswordError('')
              }}
              error={passwordErrors.confirmPassword}
            />
            {passwordError && <p className="dashboard-alert is-error" role="alert">{passwordError}</p>}
            {passwordNotice && <p className="dashboard-alert is-success" role="status">{passwordNotice}</p>}
            <p className="dashboard-profile-help">Use at least 8 characters and include a number. Your password is changed through Supabase Auth and is never stored in your profile.</p>
            <button type="submit" className="dashboard-primary-button" disabled={isSavingPassword}>
              {isSavingPassword ? 'Updating password…' : 'Update password'}
            </button>
          </form>
        </section>
      </div>
    </section>
  )
}

export default ProfilePage
