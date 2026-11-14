import { useEffect, useState } from 'react'
import { useAuth } from '../../context/useAuth'
import { supabase } from '../../lib/supabase'
import { formatDate, schemaErrorMessage } from '../../components/Dashboard/dashboardUtils'

function HealthRecordsPage() {
  const { user } = useAuth()
  const [records, setRecords] = useState([])
  const [petNames, setPetNames] = useState({})
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    let active = true

    const loadRecords = async () => {
      setIsLoading(true)
      setErrorMessage('')
      const [recordsResult, petsResult] = await Promise.all([
        supabase.from('health_records').select('*').eq('owner_id', user.id)
          .order('consultation_date', { ascending: false }),
        supabase.from('pets').select('id, name').eq('owner_id', user.id)
      ])

      if (!active) return
      if (recordsResult.error || petsResult.error) {
        const error = recordsResult.error || petsResult.error
        setErrorMessage(schemaErrorMessage(error, recordsResult.error ? 'health_records' : 'pets'))
      } else {
        setRecords(recordsResult.data || [])
        setPetNames(Object.fromEntries((petsResult.data || []).map(pet => [pet.id, pet.name])))
      }
      setIsLoading(false)
    }

    loadRecords()
    return () => { active = false }
  }, [user.id])

  return (
    <section className="dashboard-page">
      <div className="dashboard-page-heading">
        <div>
          <p className="dashboard-eyebrow">A trusted record of their care</p>
          <h1>Health Records</h1>
          <p>Clinical diagnoses and veterinarian notes are read-only here.</p>
        </div>
      </div>

      <div className="dashboard-alert">
        Clinic-entered records are clearly identified. Pet parents can view these records, but cannot create or edit diagnoses, treatments, medications, or veterinarian notes.
      </div>
      {errorMessage && <p className="dashboard-alert is-error" role="alert">{errorMessage}</p>}

      {isLoading ? (
        <div className="dashboard-loading" role="status">Loading health records…</div>
      ) : records.length ? (
        <div className="dashboard-record-grid">
          {records.map(record => {
            const isOwnerRecord = record.record_source === 'owner'
            return (
              <article className={`dashboard-record-card ${isOwnerRecord ? 'is-owner-record' : ''}`} key={record.id}>
                <span className={`dashboard-source-badge ${isOwnerRecord ? 'is-owner' : record.verified_at ? 'is-verified' : ''}`}>
                  {isOwnerRecord
                    ? 'Pet parent-provided · unverified'
                    : record.verified_at ? 'Clinic verified' : 'Clinic-entered'}
                </span>
                <h2>{petNames[record.pet_id] || 'Pet record'}</h2>
                <p><strong>Consultation date:</strong> {formatDate(record.consultation_date)}</p>
                <p><strong>Reason for visit:</strong> {record.reason_for_visit || 'Not recorded'}</p>
                {record.diagnosis && <p><strong>Diagnosis:</strong> {record.diagnosis}</p>}
                {record.treatment && <p><strong>Treatment:</strong> {record.treatment}</p>}
                {record.medication && <p><strong>Medication:</strong> {record.medication}</p>}
                {record.veterinarian_notes && <p><strong>Veterinarian notes:</strong> {record.veterinarian_notes}</p>}
                {record.weight_recorded && <p><strong>Weight recorded:</strong> {record.weight_recorded} kg</p>}
              </article>
            )
          })}
        </div>
      ) : (
        <div className="dashboard-empty-state">
          <p className="dashboard-eyebrow">A clear record, when you need one</p>
          <h2>No health records have been shared yet.</h2>
          <p>Clinic-entered visit details will appear here when they are added to your account.</p>
        </div>
      )}
    </section>
  )
}

export default HealthRecordsPage
