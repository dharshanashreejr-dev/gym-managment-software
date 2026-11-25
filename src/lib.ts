export const inr = (n: number) => '₹' + n.toLocaleString('en-IN')
export const today = () => new Date().toISOString().slice(0, 10)

export function lastDays(n: number) {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(Date.now() - (n - 1 - i) * 86400000)
    return { key: d.toISOString().slice(0, 10), label: d.toLocaleDateString('en', { weekday: 'short', timeZone: 'UTC' }) }
  })
}

export function lastMonths(n: number) {
  const now = new Date()
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (n - 1 - i), 1)
    return { key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`, label: d.toLocaleDateString('en', { month: 'short' }) }
  })
}

export function downloadCsv(name: string, rows: (string | number)[][]) {
  const csv = rows.map(r => r.map(c => '"' + String(c).replace(/"/g, '""') + '"').join(',')).join('\n')
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
  a.download = name
  a.click()
  URL.revokeObjectURL(a.href)
}

/** Persist mock-demo state across refresh (optional browser storage). */
export function loadState<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (raw == null) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function saveState(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* storage full or unavailable */
  }
}

export function startOfWeek(d = new Date()) {
  const x = new Date(d)
  const day = x.getDay() // 0 Sun
  const diff = day === 0 ? 6 : day - 1 // Monday start
  x.setDate(x.getDate() - diff)
  x.setHours(0, 0, 0, 0)
  return x
}
