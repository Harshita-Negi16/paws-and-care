import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useOutletContext, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../context/useAuth'
import { supabase } from '../../lib/supabase'
import { formatDate, formatTime, localDateString, schemaErrorMessage } from '../../components/Dashboard/dashboardUtils'

const serviceOptions = [
  'Surgery and Medical Care',
  'Dental Care',
  'Bath and Grooming',
  'Pet Daycare',
  'Vaccination and Wellness',
  'Emergency Care'
]

const emptyRequest = () => ({
  pet_id: '',
  service: '',
  preferred_veterinarian: '',
  appointment_date: '',
  appointment_time: '',
  notes: ''
})

function AppointmentsPage() {
  const { user } = useAuth()
  const { profile } = useOutletContext()
  const [searchParams, setSearchParams] = useSearchParams()
  const [appointments, setAppointments] = useState([])
  const [pets, setPets] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [pageError, setPageError] = useState('')
  const [notice, setNotice] = useState('')
  const [filter, setFilter] = useState('upcoming')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [form, setForm] = useState(emptyRequest())
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [cancellingId, setCancellingId] = useState('')

  const loadData = useCallback(async () => {
    const [appointmentsResult, petsResult] = await Promise.all([
      supabase.from('appointments').select('*').eq('owner_id', user.id)
        .order('appointment_date', { ascending: false })
        .order('appointment_time', { ascending: true }),
      supabase.from('pets').select('id, name, species, breed').eq('owner_id', user.id)
        .order('name', { ascending: true })
    ])

    setPageError('')
    if (appointmentsResult.error || petsResult.error) {
      const error = appointmentsResult.error || petsResult.error
      const table = appointmentsResult.error ? 'appointments' : 'pets'
      setPageError(schemaErrorMessage(error, table))
      setIsLoading(false)
      return
    }

    setAppointments(appointmentsResult.data || [])
    setPets(petsResult.data || [])
    setIsLoading(false)
  }, [user.id])

  useEffect(() => {
    loadData()
  }, [loadData])

  useEffect(() => {
    if (searchParams.get('new') === '1') setIsFormOpen(true)
  }, [searchParams])

  const clearForm = () => {
    setIsFormOpen(false)
    setForm(emptyRequest())
    setErrors({})
    setFormError('')
    setSearchParams({}, { replace: true })
  }

  const updateField = (event) => {
    const { name, value } = event.target
    setForm(previous => ({ ...previous, [name]: value }))
    setErrors(previous => ({ ...previous, [name]: '' }))
    setFormError('')
  }

  const selectedPet = pets.find(pet => pet.id === form.pet_id)

  const validate = () => {
    const nextErrors = {}
    if (!form.pet_id) nextErrors.pet_id = 'Choose a pet for this visit.'
    if (!form.service) nextErrors.service = 'Choose the care your pet needs.'
    if (!form.appointment_date) nextErrors.appointment_date = 'Choose a preferred date.'
    else if (form.appointment_date < localDateString()) nextErrors.appointment_date = 'Choose today or a future date.'
    if (!form.appointment_time) nextErrors.appointment_time = 'Choose a preferred time.'
    return nextErrors
  }

  const submitRequest = async (event) => {
    event.preventDefault()
    const nextErrors = validate()
    setErrors(nextErrors)
    setFormError('')
    setNotice('')
    if (Object.keys(nextErrors).length) return

    setIsSaving(true)
    const { error } = await supabase.from('appointments').insert({
      owner_id: user.id,
      pet_id: selectedPet.id,
      contact_name: profile?.username || user.user_metadata?.username || 'Pet parent',
      contact_email: user.email,
      contact_phone: profile?.phone || null,
      pet_name: selectedPet.name,
      pet_species: selectedPet.species,
      pet_breed: selectedPet.breed,
      service: form.service,
      preferred_veterinarian: form.preferred_veterinarian.trim() || null,
      appointment_date: form.appointment_date,
      appointment_time: form.appointment_time,
      notes: form.notes.trim() || null
    })

    if (error) {
      setFormError(schemaErrorMessage(error, 'appointments'))
    } else {
      clearForm()
      setNotice('Your appointment request is saved as pending. The clinic will confirm the time with you.')
      await loadData()
    }
    setIsSaving(false)
  }

  const requestCancellation = async (appointment) => {
    setCancellingId(appointment.id)
    setPageError('')
    setNotice('')
    const { data, error } = await supabase.from('appointments')
      .update({ cancellation_requested_at: new Date().toISOString() })
      .eq('id', appointment.id)
      .eq('owner_id', user.id)
      .is('cancellation_requested_at', null)
      .select('id')
      .maybeSingle()

    if (error || !data) {
      setPageError(error
        ? schemaErrorMessage(error, 'appointments')
        : 'This request can no longer be cancelled from your account. Refresh the page to see its latest status.')
    } else {
      setNotice('Cancellation requested. The appointment remains active until the clinic reviews your request.')
      await loadData()
    }
    setCancellingId('')
  }

  const today = localDateString()
  const groupedAppointments = useMemo(() => ({
    upcoming: appointments.filter(item =>
      ['pending', 'confirmed'].includes(item.status) && item.appointment_date >= today
    ),
    past: appointments.filter(item =>
      item.status === 'completed' || (item.status !== 'cancelled' && item.appointment_date < today)
    ),
    cancelled: appointments.filter(item => item.status === 'cancelled')
  }), [appointments, today])

  const visibleAppointments = groupedAppointments[filter]

  return (
    <section className="dashboard-page">
      <div className="dashboard-page-heading">
        <div>
          <p className="dashboard-eyebrow">A little time for their wellbeing</p>
          <h1>Appointments</h1>
          <p>Requests stay pending until the clinic confirms them.</p>
        </div>
        <button type="button" className="dashboard-primary-button" onClick={() => setIsFormOpen(true)} disabled={!pets.length}>
          ＋ Request a visit
        </button>
      </div>

      {pageError && <p className="dashboard-alert is-error" role="alert">{pageError}</p>}
      {notice && <p className="dashboard-alert is-success" role="status">{notice}</p>}
      {!pets.length && !isLoading && (
        <p className="dashboard-alert">
          Add a pet before requesting an appointment. <Link to="/dashboard/pets?new=1">Add a pet</Link>
        </p>
      )}

      <div className="dashboard-filter-tabs" role="tablist" aria-label="Appointment history">
        {[
          ['upcoming', 'Upcoming'],
          ['past', 'Past'],
          ['cancelled', 'Cancelled']
        ].map(([value, label]) => (
          <button key={value} type="button" role="tab" aria-selected={filter === value} aria-pressed={filter === value} onClick={() => setFilter(value)}>
            {label} <span>({groupedAppointments[value].length})</span>
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="dashboard-loading" role="status">Loading your appointments…</div>
      ) : visibleAppointments.length ? (
        <div className="dashboard-appointment-list">
          {visibleAppointments.map(appointment => (
            <article key={appointment.id} className={`dashboard-appointment-card is-${appointment.status}`}>
              <div>
                <span className={`dashboard-status is-${appointment.status}`}>{appointment.status}</span>
                <h2>{appointment.service}</h2>
                <p><strong>{appointment.pet_name}</strong>{appointment.pet_species ? ` · ${appointment.pet_species}` : ''}</p>
                <p>{formatDate(appointment.appointment_date)} · {formatTime(appointment.appointment_time)}</p>
                <p>Preferred veterinarian: {appointment.preferred_veterinarian || 'No preference'}</p>
                {appointment.cancellation_requested_at && (
                  <p className="dashboard-cancel-note">Cancellation requested · awaiting clinic review</p>
                )}
              </div>
              {['pending', 'confirmed'].includes(appointment.status) && !appointment.cancellation_requested_at && (
                <div>
                  <button
                    type="button"
                    className="dashboard-danger-button"
                    onClick={() => requestCancellation(appointment)}
                    disabled={cancellingId === appointment.id}
                  >
                    {cancellingId === appointment.id ? 'Requesting…' : 'Request cancellation'}
                  </button>
                </div>
              )}
            </article>
          ))}
        </div>
      ) : (
        <div className="dashboard-empty-state">
          <p className="dashboard-eyebrow">Nothing on the calendar</p>
          <h2>{filter === 'upcoming' ? 'No upcoming appointments.' : `No ${filter} appointments.`}</h2>
          {filter === 'upcoming' && pets.length > 0 && (
            <button type="button" className="dashboard-primary-button" onClick={() => setIsFormOpen(true)}>Request an appointment</button>
          )}
        </div>
      )}

      {isFormOpen && (
        <div className="dashboard-modal-backdrop" onMouseDown={event => {
          if (event.target === event.currentTarget && !isSaving) clearForm()
        }}>
          <section className="dashboard-modal" role="dialog" aria-modal="true" aria-labelledby="appointment-form-title">
            <div className="dashboard-modal-header">
              <div>
                <p className="dashboard-eyebrow">A request, not yet a confirmation</p>
                <h2 id="appointment-form-title">Request a visit</h2>
              </div>
              <button type="button" className="dashboard-modal-close" onClick={clearForm} aria-label="Close form">×</button>
            </div>
            <form className="dashboard-form" onSubmit={submitRequest} noValidate>
              <div className="dashboard-form-grid">
                <div className="dashboard-field is-full">
                  <label htmlFor="request-pet">Pet *</label>
                  <select id="request-pet" name="pet_id" value={form.pet_id} onChange={updateField} aria-invalid={Boolean(errors.pet_id)} required>
                    <option value="">Choose one of your pets</option>
                    {pets.map(pet => <option key={pet.id} value={pet.id}>{pet.name} · {pet.species}</option>)}
                  </select>
                  {errors.pet_id && <span className="dashboard-field-error">{errors.pet_id}</span>}
                </div>
                <div className="dashboard-field">
                  <label htmlFor="request-service">Service *</label>
                  <select id="request-service" name="service" value={form.service} onChange={updateField} aria-invalid={Boolean(errors.service)} required>
                    <option value="">Select a service</option>
                    {serviceOptions.map(service => <option key={service} value={service}>{service}</option>)}
                  </select>
                  {errors.service && <span className="dashboard-field-error">{errors.service}</span>}
                </div>
                <div className="dashboard-field">
                  <label htmlFor="request-veterinarian">Preferred veterinarian</label>
                  <input id="request-veterinarian" name="preferred_veterinarian" value={form.preferred_veterinarian} onChange={updateField} maxLength={120} placeholder="Optional" />
                </div>
                <div className="dashboard-field">
                  <label htmlFor="request-date">Preferred date *</label>
                  <input id="request-date" name="appointment_date" type="date" min={today} value={form.appointment_date} onChange={updateField} aria-invalid={Boolean(errors.appointment_date)} required />
                  {errors.appointment_date && <span className="dashboard-field-error">{errors.appointment_date}</span>}
                </div>
                <div className="dashboard-field">
                  <label htmlFor="request-time">Preferred time *</label>
                  <input id="request-time" name="appointment_time" type="time" value={form.appointment_time} onChange={updateField} aria-invalid={Boolean(errors.appointment_time)} required />
                  {errors.appointment_time && <span className="dashboard-field-error">{errors.appointment_time}</span>}
                </div>
                <div className="dashboard-field is-full">
                  <label htmlFor="request-notes">Anything you&apos;d like us to know?</label>
                  <textarea id="request-notes" name="notes" value={form.notes} onChange={updateField} maxLength={4000} />
                </div>
              </div>
              {formError && <p className="dashboard-alert is-error" role="alert">{formError}</p>}
              <p className="dashboard-field-hint">Your request is pending until the clinic confirms it. We&apos;ll follow up using your account email{profile?.phone ? ' and phone number' : ''}.</p>
              <div className="dashboard-form-actions">
                <button type="button" className="dashboard-secondary-button" onClick={clearForm} disabled={isSaving}>Cancel</button>
                <button type="submit" className="dashboard-primary-button" disabled={isSaving}>
                  {isSaving ? 'Sending request…' : 'Send appointment request'}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </section>
  )
}

export default AppointmentsPage
