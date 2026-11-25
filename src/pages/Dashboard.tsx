import { useAuth } from '../context/Auth'
import { useMembers } from '../context/Members'
import { usePayments } from '../context/Payments'
import { useOps } from '../context/Ops'
import { inr, today, lastDays } from '../lib'
import StatusBadge from '../components/StatusBadge'
import BarChart from '../components/BarChart'
import { Link } from 'react-router-dom'
import { birthdays, daysUntilBirthday } from '../data/birthdays'
export default function Dashboard() {
  const { user } = useAuth()
  const { members } = useMembers()
  const { payments } = usePayments()
  const { attendance } = useOps()
  const collected = payments.filter(p => p.date === today()).reduce((s, p) => s + (p.amountPaid ?? p.fee - p.discount), 0)
  const stats = [
    ['Active members', String(members.filter(m => m.status !== 'Expired').length)],
    ["Today's check-ins", String(attendance.filter(a => a.date === today()).length)],
    ["Today's collection", inr(collected)],
    ['Expiring this week', String(members.filter(m => m.status === 'Expiring').length)],
  ]
  const bdays = members.filter(m => birthdays[m.id]).map(m => ({ m, n: daysUntilBirthday(birthdays[m.id]) })).filter(x => x.n <= 7).sort((a, b) => a.n - b.n)
  const staffView = user?.role === 'admin' || user?.role === 'staff'
  const week = lastDays(7).map(d => ({ label: d.label, value: attendance.filter(a => a.date === d.key).length }))
  return (
    <div>
      <h1 className="font-display text-2xl sm:text-3xl font-semibold text-ink dark:text-[#F3EFFC]">Welcome, {user?.name.split(' ')[0]}</h1>
      <p className="text-pine/60 dark:text-white/70 mt-1 mb-5">Here is how the studio is doing today.</p>
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 mb-4">
        {stats.map(([l, v]) => (
          <div key={l} className="card p-4">
            <div className="text-sm text-pine/60 dark:text-white/70">{l}</div>
            <div className="font-display text-3xl font-semibold mt-0.5 text-ink dark:text-[#F3EFFC]">{v}</div>
          </div>
        ))}
      </div>
      {staffView && bdays.length > 0 && (
        <div className="card p-4 mb-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="font-semibold text-ink dark:text-[#F3EFFC]">Birthdays this week</div>
            <div className="text-sm text-pine/70 dark:text-white/70 mt-0.5">
              {bdays.map(b => `${b.m.name} (${b.n === 0 ? 'today' : b.n === 1 ? 'tomorrow' : 'in ' + b.n + ' days'})`).join(', ')}
            </div>
          </div>
          <Link to="/reminders" className="text-brass2 font-semibold text-sm">Send wishes</Link>
        </div>
      )}
      <div className="grid xl:grid-cols-2 gap-3">
        <div className="card p-4">
          <div className="font-semibold mb-3 text-ink dark:text-[#F3EFFC]">Check-ins, last 7 days</div>
          <BarChart data={week} />
        </div>
        <div className="card overflow-x-auto">
          <div className="px-4 py-3 border-b border-line font-semibold text-ink dark:text-[#F3EFFC]">Memberships to follow up</div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-pine/60 dark:text-white/70">
                <th className="px-4 py-2.5 font-medium">Member</th>
                <th className="font-medium">Plan</th>
                <th className="font-medium">Expiry</th>
                <th className="font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {members.filter(m => m.status !== 'Active').map(m => (
                <tr key={m.id} className="border-t border-line">
                  <td className="px-4 py-2.5 text-ink dark:text-[#F3EFFC]">{m.name}</td>
                  <td className="text-ink dark:text-[#F3EFFC]">{m.plan}</td>
                  <td className="text-ink dark:text-[#F3EFFC]">{m.expiry}</td>
                  <td><StatusBadge status={m.status} /></td>
                </tr>
              ))}
              {members.every(m => m.status === 'Active') && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-pine/60 dark:text-white/70">No memberships need follow-up.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
