import { useEffect, useState } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import { useAuth } from '../../context/useAuth'
import { supabase } from '../../lib/supabase'
import { formatDate, formatTime, localDateString, schemaErrorMessage, vaccineStatus } from '../../components/Dashboard/dashboardUtils'

function OverviewPage() {
  const { user } = useAuth()
  const { profile } = useOutletContext()
  const [pets, setPets] = useState([])
  const [appointments, setAppointments] = useState([])
  const [vaccinations, setVaccinations] = useState([])
  const [activities, setActivities] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [displayDate] = useState(() => new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  }))

  useEffect(() => {
    let active = true

    const loadOverview = async () => {
      setIsLoading(true)
      setErrorMessage('')
      const [petsResult, appointmentsResult, vaccinationsResult] = await Promise.all([
        supabase.from('pets').select('id, name, created_at').eq('owner_id', user.id),
        supabase.from('appointments')
          .select('id, pet_name, service, appointment_date, appointment_time, status, cancellation_requested_at, created_at')
          .eq('owner_id', user.id)
          .order('appointment_date', { ascending: true }),
        supabase.from('vaccinations')
          .select('id, vaccine_name, next_due_date, created_at')
          .eq('owner_id', user.id)
      ])

      if (!active) return
      const failed = [
        [petsResult.error, 'pets'],
        [appointmentsResult.error, 'appointments'],
        [vaccinationsResult.error, 'vaccinations']
      ].find(([error]) => error)

      if (failed) {
        setErrorMessage(schemaErrorMessage(failed[0], failed[1]))
        setIsLoading(false)
        return
      }

      const nextPets = petsResult.data || []
      const nextAppointments = appointmentsResult.data || []
      const nextVaccinations = vaccinationsResult.data || []
      setPets(nextPets)
      setAppointments(nextAppointments)
      setVaccinations(nextVaccinations)

      const activity = [
        ...nextPets.map(pet => ({
          id: `pet-${pet.id}`,
          label: `Added ${pet.name} to your pets`,
          created_at: pet.created_at,
          type: 'Pet'
        })),
        ...nextAppointments.map(appointment => ({
          id: `appointment-${appointment.id}`,
          label: `Requested ${appointment.service} for ${appointment.pet_name}`,
          created_at: appointment.created_at,
          type: 'Appointment'
        })),
        ...nextVaccinations.map(vaccination => ({
          id: `vaccination-${vaccination.id}`,
          label: `Added ${vaccination.vaccine_name} vaccination information`,
          created_at: vaccination.created_at,
          type: 'Vaccination'
        }))
      ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      setActivities(activity.slice(0, 5))
      setIsLoading(false)
    }

    loadOverview()
    return () => { active = false }
  }, [user.id])

  const today = localDateString()
  const upcomingAppointments = appointments.filter(item =>
    item.appointment_date >= today && ['pending', 'confirmed'].includes(item.status)
  )
  const dueSoon = vaccinations.filter(item => vaccineStatus(item, today) === 'due-soon')
  const overdue = vaccinations.filter(item => vaccineStatus(item, today) === 'overdue')
  const username = profile?.username || user.user_metadata?.username || 'there'

  return (
    <section className="dashboard-page">
      <div className="dashboard-page-heading">
        <div>
          <p className="dashboard-eyebrow">Your care, all in one place</p>
          <h1>Welcome back, {username}.</h1>
          <p>Here&apos;s a little look at what&apos;s happening with your pets.</p>
        </div>
        <span className="dashboard-date">{displayDate}</span>
      </div>

      {errorMessage && <p className="dashboard-alert is-error" role="alert">{errorMessage}</p>}

      {isLoading ? (
        <div className="dashboard-loading" role="status">Gathering your care details…</div>
      ) : (
        <>
          <div className="dashboard-stat-grid">
            <article className="dashboard-stat-card">
              <span className="dashboard-stat-label">Registered pets</span>
              <strong>{pets.length}</strong>
              <Link to="/dashboard/pets">View your pets <span aria-hidden="true">→</span></Link>
            </article>
            <article className="dashboard-stat-card is-accent">
              <span className="dashboard-stat-label">Upcoming appointments</span>
              <strong>{upcomingAppointments.length}</strong>
              <Link to="/dashboard/appointments">See appointments <span aria-hidden="true">→</span></Link>
            </article>
            <article className="dashboard-stat-card">
              <span className="dashboard-stat-label">Vaccines due soon</span>
              <strong>{dueSoon.length}</strong>
              <p>{overdue.length ? `${overdue.length} overdue` : 'Over the next 30 days'}</p>
            </article>
          </div>

          <div className="dashboard-overview-grid">
            <section className="dashboard-panel">
              <div className="dashboard-panel-heading">
                <div>
                  <p className="dashboard-eyebrow">Coming up</p>
                  <h2>Upcoming appointments</h2>
                </div>
                <Link to="/dashboard/appointments">All appointments <span aria-hidden="true">→</span></Link>
              </div>

              {upcomingAppointments.length ? (
                <div className="dashboard-upcoming-list">
                  {upcomingAppointments.slice(0, 4).map(appointment => (
                    <article key={appointment.id} className="dashboard-upcoming-item">
                      <div className="dashboard-upcoming-date">
                        <strong>{new Date(`${appointment.appointment_date}T00:00:00`).toLocaleDateString(undefined, { day: '2-digit' })}</strong>
                        <span>{new Date(`${appointment.appointment_date}T00:00:00`).toLocaleDateString(undefined, { month: 'short' })}</span>
                      </div>
                      <div className="dashboard-upcoming-copy">
                        <strong>{appointment.service}</strong>
                        <span>{appointment.pet_name} · {formatTime(appointment.appointment_time)}</span>
                      </div>
                      <span className={`dashboard-status is-${appointment.status}`}>{appointment.status}</span>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="dashboard-empty-inline">
                  <p>No upcoming appointments yet.</p>
                  <Link to="/dashboard/appointments?new=1">Request a visit</Link>
                </div>
              )}
            </section>

            <section className="dashboard-panel dashboard-activity-panel">
              <div className="dashboard-panel-heading">
                <div>
                  <p className="dashboard-eyebrow">A little history</p>
                  <h2>Recent activity</h2>
                </div>
              </div>
              {activities.length ? (
                <ul className="dashboard-activity-list">
                  {activities.map(activity => (
                    <li key={activity.id}>
                      <span className="dashboard-activity-dot" aria-hidden="true"></span>
                      <div>
                        <strong>{activity.label}</strong>
                        <span>{activity.type} · {formatDate(activity.created_at?.slice(0, 10))}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="dashboard-empty-inline">
                  <p>Your recent pet and appointment activity will appear here.</p>
                </div>
              )}
            </section>
          </div>

          <section className="dashboard-quick-actions">
            <div>
              <p className="dashboard-eyebrow">Make yourself at home</p>
              <h2>What would you like to do?</h2>
            </div>
            <div className="dashboard-quick-links">
              <Link to="/dashboard/pets?new=1" className="dashboard-quick-link">
                <span>＋</span>
                <span><strong>Add a pet</strong><small>Keep their details close</small></span>
              </Link>
              <Link to="/dashboard/appointments?new=1" className="dashboard-quick-link">
                <span>↗</span>
                <span><strong>Book an appointment</strong><small>Request a visit for your pet</small></span>
              </Link>
              <Link to="/dashboard/vaccinations" className="dashboard-quick-link">
                <span>＋</span>
                <span><strong>Add vaccine details</strong><small>Track upcoming care</small></span>
              </Link>
            </div>
          </section>
        </>
      )}
    </section>
  )
}

export default OverviewPage
