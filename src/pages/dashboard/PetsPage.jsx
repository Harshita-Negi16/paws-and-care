import { useCallback, useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../context/useAuth'
import { supabase } from '../../lib/supabase'
import { formatDate, initials, localDateString, schemaErrorMessage } from '../../components/Dashboard/dashboardUtils'

const PHOTO_BUCKET = 'pet-photos'
const emptyPet = () => ({
  name: '',
  species: '',
  breed: '',
  date_of_birth: '',
  gender: '',
  weight: '',
  allergies: '',
  medical_conditions: '',
  notes: '',
  photo_path: ''
})

function PetsPage() {
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const [pets, setPets] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [pageError, setPageError] = useState('')
  const [photoNotice, setPhotoNotice] = useState('')
  const [modal, setModal] = useState(() => searchParams.get('new') === '1' ? 'form' : '')
  const [editingPet, setEditingPet] = useState(null)
  const [selectedPet, setSelectedPet] = useState(null)
  const [form, setForm] = useState(emptyPet())
  const [photoFile, setPhotoFile] = useState(null)
  const [fieldErrors, setFieldErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [deletingId, setDeletingId] = useState('')

  const loadPets = useCallback(async () => {
    const { data, error } = await supabase
      .from('pets')
      .select('*')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false })

    setPageError('')
    setPhotoNotice('')
    if (error) {
      setPageError(schemaErrorMessage(error, 'pets'))
      setIsLoading(false)
      return
    }

    let photoErrorOccurred = false
    const petsWithPhotos = await Promise.all((data || []).map(async pet => {
      if (!pet.photo_path) return { ...pet, photo_url: '' }
      const { data: signedImage, error: signedImageError } = await supabase
        .storage.from(PHOTO_BUCKET)
        .createSignedUrl(pet.photo_path, 3600)
      if (signedImageError) {
        photoErrorOccurred = true
        return { ...pet, photo_url: '' }
      }
      return { ...pet, photo_url: signedImage.signedUrl }
    }))

    if (photoErrorOccurred) {
      setPhotoNotice('Pet details loaded, but a photo could not be opened. Check the private pet-photos bucket and its policies.')
    }
    setPets(petsWithPhotos)
    setIsLoading(false)
  }, [user.id])

  useEffect(() => {
    loadPets()
  }, [loadPets])

  const clearModal = () => {
    setModal('')
    setSelectedPet(null)
    setEditingPet(null)
    setPhotoFile(null)
    setFieldErrors({})
    setFormError('')
  }

  const openCreateForm = useCallback(() => {
    setEditingPet(null)
    setForm(emptyPet())
    setPhotoFile(null)
    setFieldErrors({})
    setFormError('')
    setModal('form')
  }, [])

  const openEditForm = (pet) => {
    setEditingPet(pet)
    setForm({
      name: pet.name || '',
      species: pet.species || '',
      breed: pet.breed || '',
      date_of_birth: pet.date_of_birth || '',
      gender: pet.gender || '',
      weight: pet.weight ?? '',
      allergies: pet.allergies || '',
      medical_conditions: pet.medical_conditions || '',
      notes: pet.notes || '',
      photo_path: pet.photo_path || ''
    })
    setPhotoFile(null)
    setFieldErrors({})
    setFormError('')
    setSelectedPet(null)
    setModal('form')
  }

  const updateField = (event) => {
    const { name, value } = event.target
    setForm(previous => ({ ...previous, [name]: value }))
    setFieldErrors(previous => ({ ...previous, [name]: '' }))
    setFormError('')
  }

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0] || null
    setFormError('')
    if (file && !['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setPhotoFile(null)
      setFormError('Choose a JPG, PNG, or WebP image.')
      event.target.value = ''
      return
    }
    if (file && file.size > 5 * 1024 * 1024) {
      setPhotoFile(null)
      setFormError('Pet photos must be 5 MB or smaller.')
      event.target.value = ''
      return
    }
    setPhotoFile(file)
  }

  const validate = () => {
    const errors = {}
    if (!form.name.trim()) errors.name = 'Enter your pet’s name.'
    if (!form.species) errors.species = 'Choose a species.'
    if (form.weight && (!Number.isFinite(Number(form.weight)) || Number(form.weight) <= 0)) {
      errors.weight = 'Enter a weight greater than zero.'
    }
    if (form.date_of_birth && form.date_of_birth > localDateString()) {
      errors.date_of_birth = 'Date of birth cannot be in the future.'
    }
    return errors
  }

  const uploadPhoto = async (file) => {
    const safeName = file.name.replace(/[^\w.-]/g, '_')
    const path = `${user.id}/${crypto.randomUUID()}-${safeName}`
    const { error } = await supabase.storage
      .from(PHOTO_BUCKET)
      .upload(path, file, { contentType: file.type, cacheControl: '3600', upsert: false })
    if (error) throw error
    return path
  }

  const handleSave = async (event) => {
    event.preventDefault()
    const errors = validate()
    setFieldErrors(errors)
    setFormError('')
    if (Object.keys(errors).length) return

    setIsSaving(true)
    let uploadedPath = ''
    try {
      if (photoFile) uploadedPath = await uploadPhoto(photoFile)
      const values = {
        name: form.name.trim(),
        species: form.species,
        breed: form.breed.trim() || null,
        date_of_birth: form.date_of_birth || null,
        gender: form.gender || null,
        weight: form.weight ? Number(form.weight) : null,
        allergies: form.allergies.trim() || null,
        medical_conditions: form.medical_conditions.trim() || null,
        notes: form.notes.trim() || null,
        photo_path: uploadedPath || form.photo_path || null
      }

      const result = editingPet
        ? await supabase.from('pets').update(values).eq('id', editingPet.id).eq('owner_id', user.id)
        : await supabase.from('pets').insert({ ...values, owner_id: user.id })

      if (result.error) {
        if (uploadedPath) {
          await supabase.storage.from(PHOTO_BUCKET).remove([uploadedPath])
        }
        setFormError(schemaErrorMessage(result.error, 'pets'))
        return
      }

      if (uploadedPath && editingPet?.photo_path) {
        const { error: oldPhotoError } = await supabase.storage.from(PHOTO_BUCKET).remove([editingPet.photo_path])
        if (oldPhotoError) {
          setPhotoNotice('Pet details were saved, but the previous photo could not be removed.')
        }
      }

      await loadPets()
      clearModal()
      setSearchParams({}, { replace: true })
    } catch (error) {
      if (uploadedPath) {
        await supabase.storage.from(PHOTO_BUCKET).remove([uploadedPath])
      }
      setFormError(error?.message || 'Your pet could not be saved. Check the Storage setup and try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (pet) => {
    if (!window.confirm(`Remove ${pet.name} from your pets?`)) return
    setDeletingId(pet.id)
    setPageError('')
    const { error } = await supabase
      .from('pets')
      .delete()
      .eq('id', pet.id)
      .eq('owner_id', user.id)

    if (error) {
      setPageError(schemaErrorMessage(error, 'pets'))
      setDeletingId('')
      return
    }

    if (pet.photo_path) {
      const { error: photoError } = await supabase.storage.from(PHOTO_BUCKET).remove([pet.photo_path])
      if (photoError) setPhotoNotice('Pet removed, but its stored photo could not be deleted.')
    }
    setSelectedPet(null)
    await loadPets()
    setDeletingId('')
  }

  const renderPetPhoto = (pet, className = '') => pet.photo_url
    ? <img className={`dashboard-pet-photo ${className}`} src={pet.photo_url} alt={`${pet.name}`} />
    : <span className={`dashboard-pet-placeholder ${className}`} aria-hidden="true">{initials(pet.name)}</span>

  return (
    <section className="dashboard-page">
      <div className="dashboard-page-heading">
        <div>
          <p className="dashboard-eyebrow">Every paw has a story</p>
          <h1>My Pets</h1>
          <p>Keep the little details about your companions together.</p>
        </div>
        <button type="button" className="dashboard-primary-button" onClick={openCreateForm}>＋ Add a pet</button>
      </div>

      {pageError && <p className="dashboard-alert is-error" role="alert">{pageError}</p>}
      {photoNotice && <p className="dashboard-alert" role="status">{photoNotice}</p>}

      {isLoading ? (
        <div className="dashboard-loading" role="status">Loading your pets…</div>
      ) : pets.length ? (
        <div className="dashboard-pet-grid">
          {pets.map(pet => (
            <article className="dashboard-pet-card" key={pet.id}>
              <div className="dashboard-pet-card-heading">
                {renderPetPhoto(pet)}
                <div>
                  <h2>{pet.name}</h2>
                  <p>{pet.species}{pet.breed ? ` · ${pet.breed}` : ''}</p>
                </div>
              </div>
              <div className="dashboard-pet-meta">
                <span>{pet.gender || 'Gender not set'}</span>
                <span>{pet.weight ? `${pet.weight} kg` : 'Weight not set'}</span>
              </div>
              <div className="dashboard-card-actions">
                <button type="button" className="dashboard-text-button" onClick={() => setSelectedPet(pet)}>View details</button>
                <button type="button" className="dashboard-text-button" onClick={() => openEditForm(pet)}>Edit</button>
                <button
                  type="button"
                  className="dashboard-text-button is-danger"
                  onClick={() => handleDelete(pet)}
                  disabled={deletingId === pet.id}
                >
                  {deletingId === pet.id ? 'Removing…' : 'Remove'}
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="dashboard-empty-state">
          <p className="dashboard-eyebrow">No pets added just yet</p>
          <h2>Your pet&apos;s care story starts here.</h2>
          <p>Add a pet to keep their health details and appointments close at hand.</p>
          <button type="button" className="dashboard-primary-button" onClick={openCreateForm}>Add your first pet</button>
        </div>
      )}

      <p className="dashboard-page-footnote">
        <Link to="/dashboard/appointments?new=1">Need a visit? Request an appointment for one of your pets.</Link>
      </p>

      {modal === 'form' && (
        <div className="dashboard-modal-backdrop" onMouseDown={event => {
          if (event.target === event.currentTarget && !isSaving) clearModal()
        }}>
          <section className="dashboard-modal" role="dialog" aria-modal="true" aria-labelledby="pet-form-title">
            <div className="dashboard-modal-header">
              <div>
                <p className="dashboard-eyebrow">{editingPet ? 'Update their details' : 'A new friend'}</p>
                <h2 id="pet-form-title">{editingPet ? `Edit ${editingPet.name}` : 'Add a pet'}</h2>
              </div>
              <button type="button" className="dashboard-modal-close" onClick={clearModal} aria-label="Close form">×</button>
            </div>
            <form className="dashboard-form" onSubmit={handleSave} noValidate>
              <div className="dashboard-form-grid">
                <div className="dashboard-field">
                  <label htmlFor="pet-name">Pet name *</label>
                  <input id="pet-name" name="name" value={form.name} onChange={updateField} aria-invalid={Boolean(fieldErrors.name)} maxLength={80} required />
                  {fieldErrors.name && <span className="dashboard-field-error">{fieldErrors.name}</span>}
                </div>
                <div className="dashboard-field">
                  <label htmlFor="pet-species">Species *</label>
                  <select id="pet-species" name="species" value={form.species} onChange={updateField} aria-invalid={Boolean(fieldErrors.species)} required>
                    <option value="">Select a species</option>
                    <option value="Dog">Dog</option>
                    <option value="Cat">Cat</option>
                    <option value="Other">Other</option>
                  </select>
                  {fieldErrors.species && <span className="dashboard-field-error">{fieldErrors.species}</span>}
                </div>
                <div className="dashboard-field">
                  <label htmlFor="pet-breed">Breed</label>
                  <input id="pet-breed" name="breed" value={form.breed} onChange={updateField} maxLength={100} />
                </div>
                <div className="dashboard-field">
                  <label htmlFor="pet-birth">Date of birth</label>
                  <input id="pet-birth" name="date_of_birth" type="date" value={form.date_of_birth} onChange={updateField} aria-invalid={Boolean(fieldErrors.date_of_birth)} />
                  {fieldErrors.date_of_birth && <span className="dashboard-field-error">{fieldErrors.date_of_birth}</span>}
                </div>
                <div className="dashboard-field">
                  <label htmlFor="pet-gender">Gender</label>
                  <select id="pet-gender" name="gender" value={form.gender} onChange={updateField}>
                    <option value="">Choose if known</option>
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Unknown">Unknown</option>
                  </select>
                </div>
                <div className="dashboard-field">
                  <label htmlFor="pet-weight">Weight (kg)</label>
                  <input id="pet-weight" name="weight" type="number" min="0.1" step="0.1" value={form.weight} onChange={updateField} aria-invalid={Boolean(fieldErrors.weight)} />
                  {fieldErrors.weight && <span className="dashboard-field-error">{fieldErrors.weight}</span>}
                </div>
                <div className="dashboard-field is-full">
                  <label htmlFor="pet-photo">Profile photo</label>
                  <input id="pet-photo" type="file" accept="image/jpeg,image/png,image/webp" onChange={handlePhotoChange} />
                  <span className="dashboard-field-hint">
                    Optional · JPG, PNG, or WebP · up to 5 MB
                    {editingPet?.photo_path && !photoFile ? ' · Current photo will be kept' : ''}
                  </span>
                </div>
                <div className="dashboard-field is-full">
                  <label htmlFor="pet-allergies">Allergies</label>
                  <textarea id="pet-allergies" name="allergies" value={form.allergies} onChange={updateField} maxLength={2000} />
                </div>
                <div className="dashboard-field is-full">
                  <label htmlFor="pet-conditions">Existing medical conditions</label>
                  <textarea id="pet-conditions" name="medical_conditions" value={form.medical_conditions} onChange={updateField} maxLength={4000} />
                </div>
                <div className="dashboard-field is-full">
                  <label htmlFor="pet-notes">Additional notes</label>
                  <textarea id="pet-notes" name="notes" value={form.notes} onChange={updateField} maxLength={4000} />
                </div>
              </div>
              {formError && <p className="dashboard-alert is-error" role="alert">{formError}</p>}
              <div className="dashboard-form-actions">
                <button type="button" className="dashboard-secondary-button" onClick={clearModal} disabled={isSaving}>Cancel</button>
                <button type="submit" className="dashboard-primary-button" disabled={isSaving}>
                  {isSaving ? 'Saving…' : editingPet ? 'Save changes' : 'Add pet'}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {selectedPet && (
        <div className="dashboard-modal-backdrop" onMouseDown={event => {
          if (event.target === event.currentTarget) setSelectedPet(null)
        }}>
          <section className="dashboard-modal dashboard-pet-detail-modal" role="dialog" aria-modal="true" aria-labelledby="pet-detail-title">
            <div className="dashboard-modal-header">
              <div className="dashboard-detail-heading">
                {renderPetPhoto(selectedPet)}
                <div>
                  <p className="dashboard-eyebrow">Pet profile</p>
                  <h2 id="pet-detail-title">{selectedPet.name}</h2>
                  <p>{selectedPet.species}{selectedPet.breed ? ` · ${selectedPet.breed}` : ''}</p>
                </div>
              </div>
              <button type="button" className="dashboard-modal-close" onClick={() => setSelectedPet(null)} aria-label="Close details">×</button>
            </div>
            <dl className="dashboard-detail-list">
              <div><dt>Date of birth</dt><dd>{formatDate(selectedPet.date_of_birth)}</dd></div>
              <div><dt>Gender</dt><dd>{selectedPet.gender || 'Not provided'}</dd></div>
              <div><dt>Weight</dt><dd>{selectedPet.weight ? `${selectedPet.weight} kg` : 'Not provided'}</dd></div>
              <div><dt>Allergies</dt><dd>{selectedPet.allergies || 'None listed'}</dd></div>
              <div><dt>Medical conditions</dt><dd>{selectedPet.medical_conditions || 'None listed'}</dd></div>
              <div><dt>Additional notes</dt><dd>{selectedPet.notes || 'None'}</dd></div>
            </dl>
            <div className="dashboard-form-actions">
              <button type="button" className="dashboard-secondary-button" onClick={() => openEditForm(selectedPet)}>Edit profile</button>
              <button type="button" className="dashboard-primary-button" onClick={() => setSelectedPet(null)}>Done</button>
            </div>
          </section>
        </div>
      )}
    </section>
  )
}

export default PetsPage
