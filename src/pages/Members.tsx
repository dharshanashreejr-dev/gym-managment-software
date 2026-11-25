import { useState, FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/Auth'
import { useMembers, NewMember } from '../context/Members'
import { useOps } from '../context/Ops'
import { usePlans } from '../context/Plans'
import StatusBadge from '../components/StatusBadge'
import { Member } from '../types'

const emptyForm = (plan: string, trainer: string, joined: string): NewMember => ({
  name: '',
  phone: '',
  email: '',
  age: 25,
  gender: 'Male',
  address: '',
  emergencyContact: '',
  photo: '',
  birthday: '',
  plan,
  joined,
  trainer,
})

export default function Members() {
  const { user } = useAuth()
  const { members, addMember, updateMember, deactivateMember } = useMembers()
  const { plans } = usePlans()
  const trainerNames = useOps().trainers.map(t => t.name)
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('All')
  const [planFilter, setPlanFilter] = useState('All')
  const [trainerFilter, setTrainerFilter] = useState('All')
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Member | null>(null)
  const [err, setErr] = useState('')
  const today = new Date().toISOString().slice(0, 10)
  const [f, setF] = useState<NewMember>(emptyForm(plans[0]?.name ?? '', trainerNames[0] ?? '', today))
  const canManage = user?.role === 'admin' || user?.role === 'staff'

  const list = members.filter(m => {
    if (status !== 'All' && m.status !== status) return false
    if (planFilter !== 'All' && m.plan !== planFilter) return false
    if (trainerFilter !== 'All' && m.trainer !== trainerFilter) return false
    const hay = (m.name + m.phone + m.id + m.email).toLowerCase()
    return hay.includes(q.toLowerCase())
  })

  const openAdd = () => {
    setEditing(null)
    setF(emptyForm(plans[0]?.name ?? '', trainerNames[0] ?? '', today))
    setErr('')
    setOpen(true)
  }

  const openEdit = (m: Member) => {
    setEditing(m)
    setF({
      name: m.name,
      phone: m.phone,
      email: m.email || '',
      age: m.age || 0,
      gender: m.gender,
      address: m.address || '',
      emergencyContact: m.emergencyContact || '',
      photo: m.photo || '',
      birthday: m.birthday || '',
      plan: m.plan,
      joined: m.joined,
      trainer: m.trainer,
    })
    setErr('')
    setOpen(true)
  }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (f.name.trim().length < 2) return setErr('Enter the member name.')
    if (!/^\d{10}$/.test(f.phone.replace(/\s/g, ''))) return setErr('Enter a 10 digit phone number.')
    if (f.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) return setErr('Enter a valid email address.')
    if (f.age && (f.age < 12 || f.age > 90)) return setErr('Enter a realistic age (12–90).')

    if (editing) {
      updateMember(editing.id, {
        name: f.name.trim(),
        phone: f.phone,
        email: f.email.trim(),
        age: Number(f.age) || 0,
        gender: f.gender,
        address: f.address.trim(),
        emergencyContact: f.emergencyContact.trim(),
        photo: f.photo.trim(),
        birthday: f.birthday,
        plan: f.plan,
        joined: f.joined,
        trainer: f.trainer,
      })
    } else {
      addMember({ ...f, name: f.name.trim(), email: f.email.trim(), address: f.address.trim(), emergencyContact: f.emergencyContact.trim() })
    }
    setOpen(false)
    setErr('')
    setEditing(null)
    setF(emptyForm(plans[0]?.name ?? '', trainerNames[0] ?? '', today))
  }

  const set = (k: keyof NewMember) => (e: { target: { value: string } }) => {
    const v = e.target.value
    setF({ ...f, [k]: k === 'age' ? Number(v) || 0 : v })
  }

  const onDeactivate = (m: Member) => {
    if (!confirm(`Deactivate ${m.name}? They will be marked Inactive.`)) return
    deactivateMember(m.id)
  }

  return (
    <div>
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="font-display text-4xl font-semibold">Members</h1>
          <p className="text-pine/60 mt-1">{list.length} of {members.length} members</p>
        </div>
        {canManage && <button className="btn" onClick={openAdd}>Add member</button>}
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <input
          className="input max-w-xs"
          placeholder="Search by name, phone, email or ID"
          value={q}
          onChange={e => setQ(e.target.value)}
        />
        <select className="input max-w-[11rem]" value={status} onChange={e => setStatus(e.target.value)}>
          {['All', 'Active', 'Expiring', 'Expired', 'Frozen', 'Inactive'].map(s => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <select className="input max-w-[14rem]" value={planFilter} onChange={e => setPlanFilter(e.target.value)}>
          <option value="All">All plans</option>
          {plans.map(p => (
            <option key={p.name} value={p.name}>{p.name}</option>
          ))}
        </select>
        <select className="input max-w-[12rem]" value={trainerFilter} onChange={e => setTrainerFilter(e.target.value)}>
          <option value="All">All trainers</option>
          {trainerNames.map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-pine/60">
              {['ID', 'Member', 'Phone', 'Plan', 'Trainer', 'Expiry', 'Status', ''].map(h => (
                <th key={h} className="px-5 py-3 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {list.map(m => (
              <tr key={m.id} className="border-t border-line hover:bg-paper">
                <td className="px-5 py-3 text-pine/60">{m.id}</td>
                <td className="px-5">
                  <Link to={`/members/${m.id}`} className="font-semibold hover:text-brass2">{m.name}</Link>
                  {m.email && <div className="text-xs text-pine/50">{m.email}</div>}
                </td>
                <td className="px-5">{m.phone}</td>
                <td className="px-5">{m.plan}</td>
                <td className="px-5">{m.trainer}</td>
                <td className="px-5">{m.expiry}</td>
                <td className="px-5"><StatusBadge status={m.status} /></td>
                <td className="px-5 whitespace-nowrap">
                  {canManage && (
                    <div className="flex gap-2">
                      <button type="button" className="text-brass2 font-semibold" onClick={() => openEdit(m)}>Edit</button>
                      {m.status !== 'Inactive' && (
                        <button type="button" className="text-red-700 font-semibold" onClick={() => onDeactivate(m)}>Deactivate</button>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {list.length === 0 && (
              <tr>
                <td colSpan={8} className="px-5 py-10 text-center text-pine/60">
                  No members match this search or filters. Clear filters or change status / plan / trainer.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {open && (
        <div className="fixed inset-0 bg-pine/60 grid place-items-center p-4 z-10">
          <form onSubmit={submit} className="bg-white rounded-md w-full max-w-lg p-7 max-h-[95vh] overflow-y-auto">
            <h2 className="font-display text-3xl font-semibold mb-5">{editing ? 'Edit member' : 'Add member'}</h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-semibold">Full name</label>
                <input className="input mt-1" value={f.name} onChange={set('name')} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-semibold">Phone</label>
                  <input className="input mt-1" value={f.phone} onChange={set('phone')} placeholder="10 digits" />
                </div>
                <div>
                  <label className="text-sm font-semibold">Email</label>
                  <input className="input mt-1" type="email" value={f.email} onChange={set('email')} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-semibold">Age</label>
                  <input className="input mt-1" type="number" min={12} max={90} value={f.age || ''} onChange={set('age')} />
                </div>
                <div>
                  <label className="text-sm font-semibold">Gender</label>
                  <select className="input mt-1" value={f.gender} onChange={set('gender')}>
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold">Address</label>
                <input className="input mt-1" value={f.address} onChange={set('address')} />
              </div>
              <div>
                <label className="text-sm font-semibold">Emergency contact</label>
                <input className="input mt-1" value={f.emergencyContact} onChange={set('emergencyContact')} placeholder="Name or phone" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-semibold">Birthday</label>
                  <input className="input mt-1" type="date" value={f.birthday} onChange={set('birthday')} />
                </div>
                <div>
                  <label className="text-sm font-semibold">Photo URL</label>
                  <input className="input mt-1" value={f.photo} onChange={set('photo')} placeholder="Optional image URL" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-semibold">Joining date</label>
                  <input type="date" className="input mt-1" value={f.joined} onChange={set('joined')} disabled={!!editing} />
                </div>
                <div>
                  <label className="text-sm font-semibold">Plan</label>
                  <select className="input mt-1" value={f.plan} onChange={set('plan')} disabled={!!editing}>
                    {plans.map(p => (
                      <option key={p.name}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold">Trainer</label>
                <select className="input mt-1" value={f.trainer} onChange={set('trainer')}>
                  {trainerNames.map(t => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>
            {err && <p className="text-sm text-red-700 mt-3">{err}</p>}
            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                className="border border-line rounded px-4 py-2.5"
                onClick={() => { setOpen(false); setErr(''); setEditing(null) }}
              >
                Cancel
              </button>
              <button className="btn">{editing ? 'Save changes' : 'Save member'}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
