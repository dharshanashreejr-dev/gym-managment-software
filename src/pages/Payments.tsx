import { useState, FormEvent } from 'react'
import { useAuth } from '../context/Auth'
import { useMembers } from '../context/Members'
import { usePlans } from '../context/Plans'
import { usePayments } from '../context/Payments'
import { inr, today } from '../lib'
import { Payment } from '../types'
import { couponDiscount } from '../data/offers'

export default function Payments() {
  const { user } = useAuth()
  const { members, renewMember, setBalanceDue } = useMembers()
  const { plans } = usePlans()
  const { payments, recordPayment } = usePayments()
  const [open, setOpen] = useState(false)
  const [receipt, setReceipt] = useState<Payment | null>(null)
  const [err, setErr] = useState('')
  const first = members[0]
  const feeOf = (plan: string) => plans.find(p => p.name === plan)?.price ?? 0
  const [f, setF] = useState({
    memberId: first?.id ?? '',
    fee: feeOf(first?.plan ?? ''),
    amountPaid: feeOf(first?.plan ?? ''),
    discount: 0,
    mode: 'UPI' as Payment['mode'],
    renew: true,
    coupon: '',
  })
  const canAdd = user?.role === 'admin' || user?.role === 'staff'
  const list = user?.role === 'member' ? payments.filter(p => p.memberName === user.name) : payments
  const paidAmt = (p: Payment) => p.amountPaid ?? Math.max(0, p.fee - p.discount)
  const month = today().slice(0, 7)

  const pickMember = (id: string) => {
    const m = members.find(x => x.id === id)
    const fee = feeOf(m?.plan ?? '')
    const alreadyDue = m?.balanceDue ?? 0
    // Suggest collecting remaining balance if any, else full fee
    const suggest = alreadyDue > 0 ? alreadyDue : fee
    setF({ ...f, memberId: id, fee, amountPaid: suggest, discount: 0 })
  }

  const cp = f.coupon.trim() ? couponDiscount(f.coupon, f.fee) : undefined
  const extra = cp?.amount ?? 0
  const netFee = Math.max(f.fee - f.discount - extra, 0)
  const collecting = Math.min(Math.max(f.amountPaid, 0), netFee)
  const remainder = Math.max(netFee - collecting, 0)
  const selected = members.find(m => m.id === f.memberId)

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const m = members.find(x => x.id === f.memberId)
    if (!m) return setErr('Select a member.')
    if (f.fee < 1) return setErr('Enter the plan fee amount.')
    if (f.coupon.trim() && !cp) return setErr('This coupon code is not valid.')
    if (f.discount < 0 || f.discount + extra > f.fee) return setErr('Discount cannot be more than the fee.')
    if (collecting < 1) return setErr('Enter the amount collecting now (partial payments allowed).')

    const note = remainder > 0 ? `Partial payment · balance due ₹${remainder}` : undefined
    const rec = recordPayment({
      memberId: m.id,
      memberName: m.name,
      plan: m.plan,
      fee: f.fee,
      discount: f.discount + extra,
      amountPaid: collecting,
      mode: f.mode,
      date: today(),
      note,
    })

    // Update outstanding balance: previous balance was included in amountPaid suggestion when opening form
    // New balance = remainder after this payment (and clear old balance if they paid toward it)
    setBalanceDue(m.id, remainder)

    // Only renew when fully paid (or user forces renew and paid full net fee)
    if (f.renew && remainder === 0) renewMember(m.id, m.plan)

    setOpen(false)
    setErr('')
    setReceipt(rec)
  }

  const cards = [
    ["Today's collection", inr(list.filter(p => p.date === today()).reduce((s, p) => s + paidAmt(p), 0))],
    ['This month', inr(list.filter(p => p.date.startsWith(month)).reduce((s, p) => s + paidAmt(p), 0))],
    ['Receipts issued', String(list.length)],
  ]

  return (
    <div>
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="font-display text-4xl font-semibold">Payments</h1>
          <p className="text-pine/60 mt-1">Fee collection, partial payments and receipts</p>
        </div>
        {canAdd && (
          <button className="btn" onClick={() => { setOpen(true); setErr(''); pickMember(f.memberId || first?.id || '') }}>
            Record payment
          </button>
        )}
      </div>
      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        {cards.map(([l, v]) => (
          <div key={l} className="card p-5">
            <div className="text-sm text-pine/60">{l}</div>
            <div className="font-display text-3xl font-semibold mt-1">{v}</div>
          </div>
        ))}
      </div>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-pine/60">
              {['Receipt', 'Date', 'Member', 'Plan', 'Mode', 'Paid', ''].map(h => (
                <th key={h} className="px-5 py-3 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {list.map(p => (
              <tr key={p.id} className="border-t border-line hover:bg-paper">
                <td className="px-5 py-3 text-pine/60">{p.id}</td>
                <td className="px-5">{p.date}</td>
                <td className="px-5 font-semibold">{p.memberName}</td>
                <td className="px-5">{p.plan}</td>
                <td className="px-5">{p.mode}</td>
                <td className="px-5">
                  {inr(paidAmt(p))}
                  {p.note && <div className="text-xs text-amber-700">{p.note}</div>}
                </td>
                <td className="px-5">
                  <button className="text-brass2 font-semibold" onClick={() => setReceipt(p)}>View receipt</button>
                </td>
              </tr>
            ))}
            {list.length === 0 && (
              <tr><td colSpan={7} className="px-5 py-10 text-center text-pine/60">No payments recorded yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {open && (
        <div className="fixed inset-0 bg-pine/60 grid place-items-center p-4 z-10">
          <form onSubmit={submit} className="bg-white rounded-md w-full max-w-md p-5 sm:p-7 max-h-[95vh] overflow-y-auto">
            <h2 className="font-display text-3xl font-semibold mb-5">Record payment</h2>
            <label className="text-sm font-semibold">Member</label>
            <select className="input mt-1 mb-3" value={f.memberId} onChange={e => pickMember(e.target.value)}>
              {members.slice(0, 80).map(m => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.id}) — {m.plan}{m.balanceDue ? ` · due ₹${m.balanceDue}` : ''}
                </option>
              ))}
            </select>
            {selected && selected.balanceDue > 0 && (
              <p className="text-xs text-amber-700 mb-3">Existing balance due: {inr(selected.balanceDue)}</p>
            )}
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="text-sm font-semibold">Plan fee (₹)</label>
                <input type="number" className="input mt-1" value={f.fee} onChange={e => setF({ ...f, fee: +e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-semibold">Discount (₹)</label>
                <input type="number" className="input mt-1" value={f.discount} onChange={e => setF({ ...f, discount: +e.target.value })} />
              </div>
            </div>
            <label className="text-sm font-semibold">Amount collecting now (₹) — partial OK</label>
            <input
              type="number"
              className="input mt-1 mb-1"
              value={f.amountPaid}
              onChange={e => setF({ ...f, amountPaid: +e.target.value })}
            />
            <p className="text-xs text-pine/60 mb-3">
              Net fee {inr(netFee)} · collecting {inr(collecting)}
              {remainder > 0 ? ` · remaining balance ${inr(remainder)}` : ' · fully paid'}
            </p>
            <label className="text-sm font-semibold">Coupon code (optional)</label>
            <input className="input mt-1 mb-1 uppercase" value={f.coupon} onChange={e => setF({ ...f, coupon: e.target.value })} placeholder="PONGAL10" />
            {f.coupon.trim() && (
              <p className={`text-xs mb-3 ${cp ? 'text-green-700' : 'text-red-700'}`}>
                {cp ? `${cp.coupon.label}: -${inr(cp.amount)}` : 'Not a valid code'}
              </p>
            )}
            {!f.coupon.trim() && <div className="mb-2" />}
            <label className="text-sm font-semibold">Mode</label>
            <select className="input mt-1 mb-3" value={f.mode} onChange={e => setF({ ...f, mode: e.target.value as Payment['mode'] })}>
              <option>UPI</option>
              <option>Cash</option>
              <option>Card</option>
            </select>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={f.renew}
                onChange={e => setF({ ...f, renew: e.target.checked })}
                disabled={remainder > 0}
              />
              Extend membership by one plan period {remainder > 0 ? '(requires full payment)' : ''}
            </label>
            <div className="mt-4 flex justify-between border-t border-line pt-3">
              <span className="text-pine/60">Amount to collect</span>
              <span className="font-display text-2xl font-semibold">{inr(collecting)}</span>
            </div>
            {err && <p className="text-sm text-red-700 mt-3">{err}</p>}
            <div className="flex justify-end gap-3 mt-5">
              <button type="button" className="border border-line rounded px-4 py-2.5" onClick={() => { setOpen(false); setErr('') }}>Cancel</button>
              <button className="btn">Save payment</button>
            </div>
          </form>
        </div>
      )}

      {receipt && (
        <div className="fixed inset-0 bg-pine/60 grid place-items-center p-4 z-10">
          <div className="bg-white rounded-md w-full max-w-sm p-7">
            <div id="receipt">
              <div className="text-center border-b border-line pb-4">
                <div className="font-display text-3xl font-semibold">Muscle &amp; Hustle</div>
                <div className="text-xs text-pine/60">Gym Studio, Coimbatore</div>
              </div>
              <div className="text-sm py-4 space-y-2">
                {(
                  [
                    ['Receipt no', receipt.id],
                    ['Date', receipt.date],
                    ['Member', `${receipt.memberName} (${receipt.memberId})`],
                    ['Plan', receipt.plan],
                    ['Fee', inr(receipt.fee)],
                    ['Discount', inr(receipt.discount)],
                    ['Amount paid', inr(paidAmt(receipt))],
                    ['Mode', receipt.mode],
                  ] as [string, string][]
                ).map(([k, v]) => (
                  <div key={k} className="flex justify-between">
                    <span className="text-pine/60">{k}</span>
                    <span>{v}</span>
                  </div>
                ))}
                {receipt.note && <p className="text-xs text-amber-700 pt-1">{receipt.note}</p>}
              </div>
              <div className="flex justify-between border-t border-line pt-3">
                <span className="font-semibold">Amount paid</span>
                <span className="font-display text-2xl font-semibold">{inr(paidAmt(receipt))}</span>
              </div>
              <p className="text-center text-xs text-pine/50 mt-5">Thank you for training with us.</p>
            </div>
            <div className="no-print flex justify-end gap-3 mt-6">
              <button className="border border-line rounded px-4 py-2.5" onClick={() => setReceipt(null)}>Close</button>
              <button className="btn" onClick={() => window.print()}>Print receipt</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
