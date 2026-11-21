export const WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const BY_GETDAY = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export const dayOf = (date) => BY_GETDAY[date.getDay()]

export const initials = (name) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .map((p) => p[0].toUpperCase())
    .join('')

const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`

// whole months between hire date and today, counted on local dates
export function tenureLabel(hiredOn, today) {
  const [y, m, d] = hiredOn.split('-').map(Number)
  const months = (today.getFullYear() - y) * 12 + (today.getMonth() + 1 - m) - (today.getDate() < d ? 1 : 0)
  if (months < 1) return 'New this month'
  const since = new Date(y, m - 1, d).toLocaleString('en-US', { month: 'short', year: 'numeric' })
  const span = months < 12 ? plural(months, 'month') : plural(Math.floor(months / 12), 'year')
  return `With us since ${since} (${span})`
}

export const onShift = (person, today) => person.schedule.includes(dayOf(today))

const firstName = (name) => name.split(/\s+/)[0]

export const weekRoster = (staff) =>
  WEEK.map((day) => {
    const on = (role) => staff.filter((p) => p.role === role && p.schedule.includes(day)).map((p) => firstName(p.name))
    return { day, cashiers: on('cashier'), baristas: on('barista') }
  })
