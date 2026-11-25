import { useState, FormEvent } from 'react'
import { useAuth } from '../context/Auth'
import { usePlans } from '../context/Plans'
import { useMembers } from '../context/Members'
import { inr } from '../lib'
import { Plan } from '../types'
export default function Plans() {
  const { user } = useAuth()
  const { plans, addPlan, updatePlan } = usePlans()
  const { members } = useMembers()
  const [edit, setEdit] = useState<{ plan: Plan; isNew: boolean } | null>(null)
  const [err, setErr] = useState('')
  const isAdmin = user?.role === 'admin'
  const save = (e: FormEvent) => {
    e.preventDefault()
    if (!edit) return
    const p = edit.plan
    if (p.name.trim().length < 3) return setErr('Enter a plan name.')
    if (edit.isNew && plans.some(x => x.name.toLowerCase() === p.name.trim().toLowerCase())) return setErr('A plan with this name already exists.')
    if (p.months < 1 || p.price < 1) return setErr('Duration and fee must be more than zero.')
    ;(edit.isNew ? addPlan : updatePlan)({ ...p, name: p.name.trim() })
    setEdit(null); setErr('')
  }
  return (
    <div>
      <div className="flex items-end justify-between mb-6">
        <div><h1 className="font-display text-4xl font-semibold">Membership plans</h1><p className="text-pine/60 mt-1">{plans.length} plans offered</p></div>
        {isAdmin && <button className="btn" onClick={() => setEdit({ plan: { name: '', months: 1, price: 0 }, isNew: true })}>Add plan</button>}
      </div>
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {plans.map(p => (
          <div key={p.name} className="card p-6">
            <div className="font-display text-2xl font-semibold">{p.name}</div>
            <div className="font-display text-4xl font-semibold text-brass2 mt-3">{inr(p.price)}</div>
            <div className="text-sm text-pine/60 mt-1">for {p.months} {p.months === 1 ? 'month' : 'months'}</div>
            <div className="border-t border-line mt-5 pt-4 flex items-center justify-between text-sm">
              <span>{members.filter(m => m.plan === p.name).length} members on this plan</span>
              {isAdmin && <button className="text-brass2 font-semibold" onClick={() => setEdit({ plan: p, isNew: false })}>Edit</button>}
            </div>
          </div>
        ))}
      </div>
      {edit && (
        <div className="fixed inset-0 bg-pine/60 grid place-items-center p-4 z-10">
          <form onSubmit={save} className="bg-white rounded-md w-full max-w-sm p-7">
            <h2 className="font-display text-3xl font-semibold mb-5">{edit.isNew ? 'Add plan' : 'Edit plan'}</h2>
            <label className="text-sm font-semibold">Plan name</label>
            <input className="input mt-1 mb-3 disabled:bg-paper" disabled={!edit.isNew} value={edit.plan.name} onChange={e => setEdit({ ...edit, plan: { ...edit.plan, name: e.target.value } })} />
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-sm font-semibold">Months</label><input type="number" className="input mt-1" value={edit.plan.months} onChange={e => setEdit({ ...edit, plan: { ...edit.plan, months: +e.target.value } })} /></div>
              <div><label className="text-sm font-semibold">Fee (₹)</label><input type="number" className="input mt-1" value={edit.plan.price} onChange={e => setEdit({ ...edit, plan: { ...edit.plan, price: +e.target.value } })} /></div>
            </div>
            {err && <p className="text-sm text-red-700 mt-3">{err}</p>}
            <div className="flex justify-end gap-3 mt-6">
              <button type="button" className="border border-line rounded px-4 py-2.5" onClick={() => { setEdit(null); setErr('') }}>Cancel</button>
              <button className="btn">Save plan</button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
