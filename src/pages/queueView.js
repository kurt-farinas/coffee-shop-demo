const minutes = (createdAt, now) => Math.floor((now - new Date(createdAt)) / 60000)

// open orders by status, oldest first; done orders are off the board
export function columns(orders) {
  const cols = { new: [], brewing: [], ready: [] }
  for (const o of [...orders].sort((a, b) => a.createdAt.localeCompare(b.createdAt))) cols[o.status]?.push(o)
  return cols
}

export const waitLabel = (createdAt, now) => {
  const m = minutes(createdAt, now)
  return m < 1 ? 'Just now' : `${m} min`
}

export const isLate = (createdAt, now) => minutes(createdAt, now) >= 10
