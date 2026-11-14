import { useState } from 'react'

function PasswordField({ id, name = id, label, value, onChange, error, autoComplete = 'new-password' }) {
  const [isVisible, setIsVisible] = useState(false)

  return (
    <div className="auth-field">
      <label htmlFor={id}>{label}</label>
      <div className="auth-password-wrap">
        <input
          id={id}
          name={name}
          type={isVisible ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          className={`auth-input ${error ? 'has-error' : ''}`}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          required
        />
        <button
          type="button"
          className="auth-password-toggle"
          onClick={() => setIsVisible(previous => !previous)}
          aria-label={isVisible ? 'Hide password' : 'Show password'}
          aria-pressed={isVisible}
        >
          {isVisible ? 'Hide' : 'Show'}
        </button>
      </div>
      {error && <span className="auth-field-error" id={`${id}-error`}>{error}</span>}
    </div>
  )
}

export default PasswordField
