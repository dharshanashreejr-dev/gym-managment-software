import { useState } from 'react'
import { useMembers } from '../context/Members'
import { usePlans } from '../context/Plans'
import { usePayments } from '../context/Payments'
import { inr, today, downloadCsv } from '../lib'
import StatusBadge from '../components/StatusBadge'

export default function Dues() {
  const { members, renewMember, setBalanceDue } = useMembers()
  const { plans } = usePlans()
  const { recordPayment } = usePayments()
  const [msg, setMsg] = useState('')

  const rows = members
    .map(m => {
      const price = plans.find(p => p.name === m.plan)?.price ?? 0
      // Real balances: expired members owe full plan price; others use balanceDue from partial payments
      const due = m.status === 'Expired' ? price + (m.balanceDue || 0) : m.balanceDue || 0
      const reason =
        m.status === 'Expired'
          ? 'Membership expired, renewal fee pending'
          : m.balanceDue > 0
            ? 'Balance left from partial payment'
            : ''
      const days = Math.max(0, Math.floor((Date.now() - new Date(m.expiry).getTime()) / 86400000))
      return { m, due, reason, days }
    })
    .filter(r => r.due > 0)
    .sort((a, b) => b.due - a.due)

  const total = rows.reduce((s, r) => s + r.due, 0)

  const collect = (id: string, mode: 'Cash' | 'UPI' | 'Card') => {
    const r = rows.find(x => x.m.id === id)
    if (!r) return
    recordPayment({
      memberId: r.m.id,
      memberName: r.m.name,
      plan: r.m.plan,
      fee: r.due,
      discount: 0,
      amountPaid: r.due,
      mode,
      date: today(),
      note: r.m.status === 'Expired' ? 'Renewal / dues clearance' : 'Balance clearance',
    })
    setBalanceDue(r.m.id, 0)
    if (r.m.status === 'Expired') renewMember(r.m.id, r.m.plan)
    setMsg(`${inr(r.due)} collected from ${r.m.name} by ${mode}. Receipt added in Payments.`)
  }

  const exportCsv = () =>
    downloadCsv('pending-dues.csv', [
      ['Member ID', 'Name', 'Phone', 'Plan', 'Due', 'Reason'],
      ...rows.map(r => [r.m.id, r.m.name, r.m.phone, r.m.plan, r.due, r.reason]),
    ])

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold">Pending dues</h1>
          <p className="text-pine/60 mt-1">Defaulters list from expired memberships and partial payments</p>
        </div>
        <button className="border border-line rounded px-4 py-2.5 text-sm hover:border-brass disabled:opacity-50" disabled={!rows.length} onClick={exportCsv}>
          Export CSV
        </button>
      </div>
      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        <div className="card p-5">
          <div className="text-sm text-pine/60">Total pending</div>
          <div className="font-display text-3xl font-semibold mt-1">{inr(total)}</div>
        </div>
        <div className="card p-5">
          <div className="text-sm text-pine/60">Members with dues</div>
          <div className="font-display text-3xl font-semibold mt-1">{rows.length}</div>
        </div>
      </div>
      {msg && <p className="text-sm text-green-700 bg-green-50 rounded px-4 py-3 mb-4">{msg}</p>}
      <div className="card overflow-x-auto">
        <table className="w-full text-sm min-w-[720px]">
          <thead>
            <tr className="text-left text-pine/60">
              {['Member', 'Plan', 'Status', 'Reason', 'Due', 'Collect'].map(h => (
                <th key={h} className="px-5 py-3 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.m.id} className="border-t border-line hover:bg-paper">
                <td className="px-5 py-3">
                  <div className="font-semibold">{r.m.name}</div>
                  <div className="text-xs text-pine/60">{r.m.id} · {r.m.phone}</div>
                </td>
                <td className="px-5">{r.m.plan}</td>
                <td className="px-5">
                  <StatusBadge status={r.m.status} />
                  {r.days > 0 && <div className="text-xs text-pine/60 mt-1">{r.days} days overdue</div>}
                </td>
                <td className="px-5 text-pine/70">{r.reason}</td>
                <td className="px-5 font-semibold">{inr(r.due)}</td>
                <td className="px-5">
                  <div className="flex gap-2">
                    {(['Cash', 'UPI', 'Card'] as const).map(mo => (
                      <button key={mo} onClick={() => collect(r.m.id, mo)} className="border border-line rounded px-2.5 py-1 text-xs font-semibold hover:border-brass">
                        {mo}
                      </button>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-pine/60">
                  No pending dues. Every member is paid up.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
