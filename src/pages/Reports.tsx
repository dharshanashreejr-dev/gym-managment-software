import { useMembers } from '../context/Members'
import { usePayments } from '../context/Payments'
import { usePlans } from '../context/Plans'
import { useOps } from '../context/Ops'
import { inr, today, lastMonths, downloadCsv } from '../lib'
import BarChart, { HBar } from '../components/BarChart'

export default function Reports() {
  const { members } = useMembers()
  const { payments } = usePayments()
  const { plans } = usePlans()
  const { attendance } = useOps()
  const paid = (p: { fee: number; discount: number; amountPaid?: number }) =>
    p.amountPaid != null ? p.amountPaid : p.fee - p.discount
  const months = lastMonths(6)
  const month = today().slice(0, 7)
  const revenue = months.map(m => ({
    label: m.label,
    value: payments.filter(p => p.date.startsWith(m.key)).reduce((s, p) => s + paid(p), 0),
  }))
  const joinings = months.map(m => ({
    label: m.label,
    value: members.filter(x => x.joined.startsWith(m.key)).length,
  }))
  const planMix = plans.map(p => ({
    label: p.name,
    value: members.filter(m => m.plan === p.name).length,
  }))
  const modes = (['UPI', 'Cash', 'Card'] as const).map(k => ({
    label: k,
    value: payments.filter(p => p.mode === k).reduce((s, p) => s + paid(p), 0),
  }))
  const soon = members.filter(m => {
    const d = Math.ceil((new Date(m.expiry).getTime() - Date.now()) / 86400000)
    return d >= 0 && d <= 30
  }).length
  const cards = [
    ['Revenue this month', inr(revenue[revenue.length - 1]?.value ?? 0)],
    ['New joinings this month', String(members.filter(m => m.joined.startsWith(month)).length)],
    ['Check-ins this month', String(attendance.filter(a => a.date.startsWith(month)).length)],
    ['Expiring in 30 days', String(soon)],
  ]

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3 mb-6 no-print">
        <div>
          <h1 className="font-display text-4xl font-semibold">Reports</h1>
          <p className="text-pine/60 mt-1">Revenue, joinings and membership mix</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            className="border border-line rounded px-4 py-2.5 bg-white hover:border-brass"
            onClick={() =>
              downloadCsv('payments.csv', [
                ['Receipt', 'Date', 'Member', 'Plan', 'Fee', 'Discount', 'Paid', 'Mode'],
                ...payments.map(p => [p.id, p.date, p.memberName, p.plan, p.fee, p.discount, paid(p), p.mode]),
              ])
            }
          >
            Export payments CSV
          </button>
          <button
            className="border border-line rounded px-4 py-2.5 bg-white hover:border-brass"
            onClick={() =>
              downloadCsv('members.csv', [
                ['ID', 'Name', 'Phone', 'Gender', 'Plan', 'Trainer', 'Joined', 'Expiry', 'Status'],
                ...members.map(m => [m.id, m.name, m.phone, m.gender, m.plan, m.trainer, m.joined, m.expiry, m.status]),
              ])
            }
          >
            Export members CSV
          </button>
          <button className="btn" onClick={() => window.print()}>
            Print / Save as PDF
          </button>
        </div>
      </div>

      <div id="report-print">
        <div className="hidden print:block mb-4">
          <div className="font-display text-2xl font-semibold">Muscle &amp; Hustle — Reports</div>
          <div className="text-sm text-pine/60">Generated {today()}</div>
        </div>
        <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
          {cards.map(([l, v]) => (
            <div key={l} className="card p-5">
              <div className="text-sm text-pine/60">{l}</div>
              <div className="font-display text-4xl font-semibold mt-1">{v}</div>
            </div>
          ))}
        </div>
        <div className="grid lg:grid-cols-2 gap-4">
          <div className="card p-6">
            <div className="font-semibold mb-5">Revenue, last 6 months</div>
            <BarChart data={revenue} format={inr} />
          </div>
          <div className="card p-6">
            <div className="font-semibold mb-5">New joinings, last 6 months</div>
            <BarChart data={joinings} />
          </div>
          <div className="card p-6">
            <div className="font-semibold mb-5">Members by plan</div>
            <HBar rows={planMix} />
          </div>
          <div className="card p-6">
            <div className="font-semibold mb-5">Collection by payment mode</div>
            <HBar rows={modes} format={inr} />
          </div>
        </div>
      </div>
    </div>
  )
}
