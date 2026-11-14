export function localDateString(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function formatDate(value) {
  if (!value) return 'Not provided'
  return new Date(`${value}T00:00:00`).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export function formatTime(value) {
  if (!value) return 'Not provided'
  const [hours, minutes] = value.slice(0, 5).split(':').map(Number)
  return new Date(2000, 0, 1, hours, minutes).toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit'
  })
}

export function vaccineStatus(vaccination, today = localDateString()) {
  if (!vaccination.next_due_date) return 'completed'
  if (vaccination.next_due_date < today) return 'overdue'

  const dueDate = new Date(`${vaccination.next_due_date}T00:00:00`)
  const todayDate = new Date(`${today}T00:00:00`)
  const daysUntilDue = Math.ceil((dueDate - todayDate) / 86400000)
  return daysUntilDue <= 30 ? 'due-soon' : 'completed'
}

export function isMissingTableError(error) {
  return error?.code === '42P01' || error?.message?.includes('does not exist')
}

export function schemaErrorMessage(error, tableName) {
  if (isMissingTableError(error)) {
    return `The ${tableName} table is not set up yet. Run supabase-dashboard-schema.sql in the Supabase SQL Editor.`
  }
  return error?.message || 'Something went wrong while loading your information.'
}

export function initials(value = '') {
  return value.trim().split(/\s+/).slice(0, 2).map(part => part[0] || '').join('').toUpperCase() || 'P'
}
