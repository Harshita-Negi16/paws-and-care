import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/useAuth'
import { supabase } from '../../lib/supabase'
import { formatDate, localDateString, schemaErrorMessage, vaccineStatus } from '../../components/Dashboard/dashboardUtils'

const blankVaccination = () => ({
  pet_id: '',
  vaccine_name: '',
  administered_on: '',
  next_due_date: '',
  veterinarian: ''
})

function VaccinationsPage() {
  const { user } = useAuth()
  const [vaccinations, setVaccinations] = useState([])
  const [pets, setPets] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [pageError, setPageError] = useState('')
  const [notice, setNotice] = useState('')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(blankVaccination())
  const [fieldErrors, setFieldErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const loadData = useCallback(async () => {
    const [vaccinationsResult, petsResult] = await Promise.all([
      supabase.from('vaccinations').select('*').eq('owner_id', user.id)
        .order('next_due_date', { ascending: true, nullsFirst: false }),
      supabase.from('pets').select('id, name, species').eq('owner_id', user.id)
    ])
    setPageError('')
    if (vaccinationsResult.error || petsResult.error) {
      const error = vaccinationsResult.error || petsResult.error
      setPageError(schemaErrorMessage(error, vaccinationsResult.error ? 'vaccinations' : 'pets'))
    } else {
      setVaccinations(vaccinationsResult.data || [])
      setPets(petsResult.data || [])
    }
    setIsLoading(false)
  }, [user.id])

  useEffect(() => {
    loadData()
  }, [loadData])

  const openNewForm = () => {
    setEditing(null)
    setForm({ ...blankVaccination(), pet_id: pets.length === 1 ? pets[0].id : '' })
    setFieldErrors({})
    setFormError('')
    setIsFormOpen(true)
  }

  const openEditForm = (vaccination) => {
    setEditing(vaccination)
    setForm({
      pet_id: vaccination.pet_id || '',
      vaccine_name: vaccination.vaccine_name || '',
      administered_on: vaccination.administered_on || '',
      next_due_date: vaccination.next_due_date || '',
      veterinarian: vaccination.veterinarian || ''
    })
    setFieldErrors({})
    setFormError('')
    setIsFormOpen(true)
  }

  const closeForm = () => {
    setIsFormOpen(false)
    setEditing(null)
    setFormError('')
    setFieldErrors({})
  }

  const updateField = (event) => {
    const { name, value } = event.target
    setForm(previous => ({ ...previous, [name]: value }))
    setFieldErrors(previous => ({ ...previous, [name]: '' }))
    setFormError('')
  }

  const validate = () => {
    const errors = {}
    if (!form.pet_id) errors.pet_id = 'Choose a pet.'
    if (!form.vaccine_name.trim()) errors.vaccine_name = 'Enter a vaccine name.'
    if (!form.administered_on) errors.administered_on = 'Enter the date it was administered.'
    else if (form.administered_on > localDateString()) errors.administered_on = 'Administration date cannot be in the future.'
    if (form.next_due_date && form.administered_on && form.next_due_date < form.administered_on) {
      errors.next_due_date = 'Next due date cannot be before the administration date.'
    }
    return errors
  }

  const saveVaccination = async (event) => {
    event.preventDefault()
    const errors = validate()
    setFieldErrors(errors)
    setFormError('')
    if (Object.keys(errors).length) return

    setIsSaving(true)
    const values = {
      pet_id: form.pet_id,
      vaccine_name: form.vaccine_name.trim(),
      administered_on: form.administered_on,
      next_due_date: form.next_due_date || null,
      veterinarian: form.veterinarian.trim() || null
    }
    const result = editing
      ? await supabase.from('vaccinations').update(values).eq('id', editing.id).eq('owner_id', user.id)
      : await supabase.from('vaccinations').insert({ ...values, owner_id: user.id })

    if (result.error) {
      setFormError(schemaErrorMessage(result.error, 'vaccinations'))
    } else {
      closeForm()
      setNotice(editing
        ? 'Vaccination details updated. This information remains marked as pet parent-provided until verified.'
        : 'Vaccination information saved and marked as pet parent-provided until the clinic verifies it.')
      await loadData()
    }
    setIsSaving(false)
  }

  const deleteVaccination = async (vaccination) => {
    if (!window.confirm(`Remove ${vaccination.vaccine_name} from your vaccination list?`)) return
    setPageError('')
    const { error } = await supabase.from('vaccinations').delete()
      .eq('id', vaccination.id)
      .eq('owner_id', user.id)
    if (error) {
      setPageError(schemaErrorMessage(error, 'vaccinations'))
      return
    }
    setNotice('Vaccination entry removed.')
    await loadData()
  }

  const petNameById = Object.fromEntries(pets.map(pet => [pet.id, pet.name]))
  const today = localDateString()

  return (
    <section className="dashboard-page">
      <div className="dashboard-page-heading">
        <div>
          <p className="dashboard-eyebrow">Stay a step ahead</p>
          <h1>Vaccinations</h1>
          <p>Keep past doses and upcoming due dates in one easy place.</p>
        </div>
        <button type="button" className="dashboard-primary-button" onClick={openNewForm} disabled={!pets.length}>＋ Add vaccination</button>
      </div>

      <div className="dashboard-alert">
        Entries you add are labeled <strong>Pet parent-provided · unverified</strong> until clinic staff verifies them.
      </div>
      {pageError && <p className="dashboard-alert is-error" role="alert">{pageError}</p>}
      {notice && <p className="dashboard-alert is-success" role="status">{notice}</p>}
      {!pets.length && !isLoading && (
        <p className="dashboard-alert">Add a pet before recording vaccinations. <Link to="/dashboard/pets?new=1">Add a pet</Link></p>
      )}

      {isLoading ? (
        <div className="dashboard-loading" role="status">Loading vaccination details…</div>
      ) : vaccinations.length ? (
        <div className="dashboard-vaccine-grid">
          {vaccinations.map(vaccination => {
            const status = vaccineStatus(vaccination, today)
            return (
              <article className="dashboard-vaccine-card" key={vaccination.id}>
                <span className={`dashboard-source-badge ${vaccination.owner_provided ? 'is-owner' : 'is-verified'}`}>
                  {vaccination.owner_provided ? 'Pet parent-provided · unverified' : 'Clinic verified'}
                </span>
                <h2>{vaccination.vaccine_name}</h2>
                <p>{petNameById[vaccination.pet_id] || 'Pet record'}</p>
                <div className="dashboard-vaccine-meta">
                  <p><strong>Administered:</strong> {formatDate(vaccination.administered_on)}</p>
                  <p><strong>Next due:</strong> {formatDate(vaccination.next_due_date)}</p>
                  <p><strong>Veterinarian:</strong> {vaccination.veterinarian || 'Not provided'}</p>
                </div>
                <span className={`dashboard-vaccine-status is-${status}`}>
                  {status.replace('-', ' ')}
                </span>
                {vaccination.owner_provided && (
                  <div className="dashboard-card-actions">
                    <button type="button" className="dashboard-text-button" onClick={() => openEditForm(vaccination)}>Edit</button>
                    <button type="button" className="dashboard-text-button is-danger" onClick={() => deleteVaccination(vaccination)}>Remove</button>
                  </div>
                )}
              </article>
            )
          })}
        </div>
      ) : (
        <div className="dashboard-empty-state">
          <p className="dashboard-eyebrow">A clearer picture of their care</p>
          <h2>No vaccinations recorded yet.</h2>
          <p>Add existing vaccination details to keep track of the next due date.</p>
          {pets.length > 0 && <button type="button" className="dashboard-primary-button" onClick={openNewForm}>Add vaccination details</button>}
        </div>
      )}

      {isFormOpen && (
        <div className="dashboard-modal-backdrop" onMouseDown={event => {
          if (event.target === event.currentTarget && !isSaving) closeForm()
        }}>
          <section className="dashboard-modal" role="dialog" aria-modal="true" aria-labelledby="vaccination-form-title">
            <div className="dashboard-modal-header">
              <div>
                <p className="dashboard-eyebrow">Your entry is not yet verified</p>
                <h2 id="vaccination-form-title">{editing ? 'Edit vaccination' : 'Add vaccination'}</h2>
              </div>
              <button type="button" className="dashboard-modal-close" onClick={closeForm} aria-label="Close form">×</button>
            </div>
            <form className="dashboard-form" onSubmit={saveVaccination} noValidate>
              <div className="dashboard-form-grid">
                <div className="dashboard-field is-full">
                  <label htmlFor="vaccine-pet">Pet *</label>
                  <select id="vaccine-pet" name="pet_id" value={form.pet_id} onChange={updateField} aria-invalid={Boolean(fieldErrors.pet_id)} required>
                    <option value="">Choose a pet</option>
                    {pets.map(pet => <option value={pet.id} key={pet.id}>{pet.name}</option>)}
                  </select>
                  {fieldErrors.pet_id && <span className="dashboard-field-error">{fieldErrors.pet_id}</span>}
                </div>
                <div className="dashboard-field">
                  <label htmlFor="vaccine-name">Vaccine name *</label>
                  <input id="vaccine-name" name="vaccine_name" value={form.vaccine_name} onChange={updateField} maxLength={120} required />
                  {fieldErrors.vaccine_name && <span className="dashboard-field-error">{fieldErrors.vaccine_name}</span>}
                </div>
                <div className="dashboard-field">
                  <label htmlFor="vaccine-veterinarian">Veterinarian</label>
                  <input id="vaccine-veterinarian" name="veterinarian" value={form.veterinarian} onChange={updateField} maxLength={120} />
                </div>
                <div className="dashboard-field">
                  <label htmlFor="vaccine-administered">Date administered *</label>
                  <input id="vaccine-administered" name="administered_on" type="date" max={today} value={form.administered_on} onChange={updateField} aria-invalid={Boolean(fieldErrors.administered_on)} required />
                  {fieldErrors.administered_on && <span className="dashboard-field-error">{fieldErrors.administered_on}</span>}
                </div>
                <div className="dashboard-field">
                  <label htmlFor="vaccine-due">Next due date</label>
                  <input id="vaccine-due" name="next_due_date" type="date" value={form.next_due_date} onChange={updateField} aria-invalid={Boolean(fieldErrors.next_due_date)} />
                  {fieldErrors.next_due_date && <span className="dashboard-field-error">{fieldErrors.next_due_date}</span>}
                </div>
              </div>
              {formError && <p className="dashboard-alert is-error" role="alert">{formError}</p>}
              <div className="dashboard-form-actions">
                <button type="button" className="dashboard-secondary-button" onClick={closeForm} disabled={isSaving}>Cancel</button>
                <button type="submit" className="dashboard-primary-button" disabled={isSaving}>
                  {isSaving ? 'Saving…' : editing ? 'Save changes' : 'Add vaccination'}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </section>
  )
}

export default VaccinationsPage
