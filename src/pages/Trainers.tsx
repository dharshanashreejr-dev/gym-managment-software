import { useState, FormEvent } from 'react'
import { useAuth } from '../context/Auth'
import { useMembers } from '../context/Members'
import { useOps } from '../context/Ops'
export default function Trainers() {
  const { user } = useAuth()
  const { members } = useMembers()
  const { trainers, addTrainer } = useOps()
  const [open, setOpen] = useState(false)
  const [err, setErr] = useState('')
  const [f, setF] = useState({ name: '', specialization: '', timings: '', phone: '' })
  const set = (k: string) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value })
  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (f.name.trim().length < 2 || !f.specialization.trim()) return setErr('Enter the trainer name and specialization.')
    if (trainers.some(t => t.name.toLowerCase() === f.name.trim().toLowerCase())) return setErr('A trainer with this name already exists.')
    addTrainer({ ...f, name: f.name.trim() }); setOpen(false); setErr(''); setF({ name: '', specialization: '', timings: '', phone: '' })
  }
  return (
    <div>
      <div className="flex items-end justify-between mb-6">
        <div><h1 className="font-display text-4xl font-semibold">Trainers</h1><p className="text-pine/60 mt-1">{trainers.length} trainers on the team</p></div>
        {user?.role === 'admin' && <button className="btn" onClick={() => setOpen(true)}>Add trainer</button>}
      </div>
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {trainers.map(t => {
          const mine = members.filter(m => m.trainer === t.name)
          return (
            <div key={t.id} className="card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-pine text-brass grid place-items-center font-display text-2xl font-semibold">{t.name[0]}</div>
                <div><div className="font-display text-2xl font-semibold leading-6">{t.name}</div><div className="text-sm text-pine/60">{t.specialization}</div></div>
              </div>
              {[['Timings', t.timings || '-'], ['Phone', t.phone || '-'], ['Rating', t.rating.toFixed(1) + ' / 5'], ['Members', String(mine.length)]].map(([k, v]) =>
                <div key={k} className="flex justify-between py-2 border-t border-line text-sm"><span className="text-pine/60">{k}</span><span>{v}</span></div>)}
              <p className="text-xs text-pine/60 mt-3">{mine.length ? mine.map(m => m.name).join(', ') : 'No members assigned yet.'}</p>
            </div>
          )
        })}
      </div>
      {open && (
        <div className="fixed inset-0 bg-pine/60 grid place-items-center p-4 z-10">
          <form onSubmit={submit} className="bg-white rounded-md w-full max-w-sm p-7">
            <h2 className="font-display text-3xl font-semibold mb-5">Add trainer</h2>
            <div className="space-y-3">
              {([['name', 'Name'], ['specialization', 'Specialization'], ['timings', 'Timings'], ['phone', 'Phone']] as [string, string][]).map(([k, l]) =>
                <div key={k}><label className="text-sm font-semibold">{l}</label><input className="input mt-1" value={f[k as keyof typeof f]} onChange={set(k)} /></div>)}
            </div>
            {err && <p className="text-sm text-red-700 mt-3">{err}</p>}
            <div className="flex justify-end gap-3 mt-6"><button type="button" className="border border-line rounded px-4 py-2.5" onClick={() => { setOpen(false); setErr('') }}>Cancel</button><button className="btn">Save trainer</button></div>
          </form>
        </div>
      )}
    </div>
  )
}
