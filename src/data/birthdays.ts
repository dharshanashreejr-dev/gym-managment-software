// Demo birthdays (month-day only), keyed by member id. Set relative to today so the demo always has upcoming birthdays.
const md = (offsetDays: number) => { const d = new Date(Date.now() + offsetDays * 86400000); return String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0') }
export const birthdays: Record<string, string> = {
  MH001: md(0), MH002: md(3), MH003: md(12), MH004: md(6), MH005: md(25), MH006: md(-2),
}
export function daysUntilBirthday(mmdd: string) {
  const now = new Date(); const t = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const [m, d] = mmdd.split('-').map(Number)
  let n = new Date(t.getFullYear(), m - 1, d)
  if (n < t) n = new Date(t.getFullYear() + 1, m - 1, d)
  return Math.round((n.getTime() - t.getTime()) / 86400000)
}
