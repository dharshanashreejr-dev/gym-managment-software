import { useState } from 'react'
import { useAuth } from '../context/Auth'
import { useMembers } from '../context/Members'
import { today } from '../lib'
interface Machine { id: string; name: string; status: 'Working' | 'Under maintenance'; next: string; issue?: string }
const seed: Machine[] = [
  { id: 'E1', name: 'Treadmill 1', status: 'Working', next: '2026-12-15' },
  { id: 'E2', name: 'Treadmill 2', status: 'Under maintenance', next: '2026-11-28', issue: 'Belt slipping' },
  { id: 'E3', name: 'Leg press', status: 'Working', next: '2027-01-10' },
  { id: 'E4', name: 'Cable crossover', status: 'Working', next: '2026-12-02' },
  { id: 'E5', name: 'Spin bike 3', status: 'Under maintenance', next: '2026-11-30', issue: 'Pedal loose' },
]
const LOCKERS = 12
export default function Facilities() {
  const { user } = useAuth()
  const { members } = useMembers()
  const [machines, setMachines] = useState(seed)
  const [lockers, setLockers] = useState<Record<number, string>>({ 2: 'MH001', 5: 'MH004', 9: 'MH006' })
  const [issueFor, setIssueFor] = useState<string | null>(null)
  const [issue, setIssue] = useState('')
  const [pick, setPick] = useState<number | null>(null)
  const [who, setWho] = useState(members[0]?.id ?? '')
  const [msg, setMsg] = useState('')
  const canEdit = user?.role === 'admin' || user?.role === 'staff'
  const nameOf = (id: string) => members.find(m => m.id === id)?.name ?? id
  const setStatus = (id: string, status: Machine['status']) => setMachines(machines.map(m => m.id === id ? { ...m, status, issue: status === 'Working' ? undefined : m.issue } : m))
  const report = () => {
    if (issue.trim().length < 3) return setMsg('Describe the issue first.')
    setMachines(machines.map(m => m.id === issueFor ? { ...m, status: 'Under maintenance', issue: issue.trim(), next: today() } : m))
    setIssueFor(null); setIssue(''); setMsg('Issue reported. Machine marked under maintenance.')
  }
  const allot = () => {
    if (pick === null) return
    if (Object.values(lockers).includes(who)) return setMsg(nameOf(who) + ' already has a locker.')
    setLockers({ ...lockers, [pick]: who }); setPick(null); setMsg(`Locker ${pick} allotted to ${nameOf(who)}.`)
  }
  const release = (n: number) => { const l = { ...lockers }; delete l[n]; setLockers(l); setPick(null); setMsg(`Locker ${n} is free now.`) }
  return (
    <div>
      <h1 className="font-display text-3xl sm:text-4xl font-semibold">Equipment and lockers</h1>
      <p className="text-pine/60 mt-1 mb-6">Machine status, maintenance schedule and locker allocation</p>
      {msg && <p className="text-sm text-green-700 bg-green-50 rounded px-4 py-3 mb-4">{msg}</p>}
      <div className="card overflow-x-auto mb-8">
        <table className="w-full text-sm min-w-[640px]">
          <thead><tr className="text-left text-pine/60">{['Machine', 'Status', 'Next maintenance', 'Issue', ''].map(h => <th key={h} className="px-5 py-3 font-medium">{h}</th>)}</tr></thead>
          <tbody>{machines.map(m => (
            <tr key={m.id} className="border-t border-line">
              <td className="px-5 py-3 font-semibold">{m.name}</td>
              <td className="px-5"><span className={`px-2 py-0.5 rounded text-xs font-semibold ${m.status === 'Working' ? 'text-green-700 bg-green-50' : 'text-amber-700 bg-amber-50'}`}>{m.status}</span></td>
              <td className="px-5">{m.next}</td><td className="px-5 text-pine/70">{m.issue ?? '-'}</td>
              <td className="px-5"><div className="flex gap-3">
                <button className="text-brass2 font-semibold" onClick={() => { setIssueFor(m.id); setMsg('') }}>Report issue</button>
                {canEdit && m.status !== 'Working' && <button className="text-brass2 font-semibold" onClick={() => setStatus(m.id, 'Working')}>Mark working</button>}</div></td>
            </tr>))}</tbody>
        </table>
      </div>
      {issueFor && (
        <div className="fixed inset-0 bg-pine/60 grid place-items-center p-4 z-40">
          <div className="bg-white rounded-md w-full max-w-md p-7">
            <h2 className="font-display text-3xl font-semibold mb-4">Report issue</h2>
            <input className="input" placeholder="What is wrong with the machine?" value={issue} onChange={e => setIssue(e.target.value)} />
            <div className="flex justify-end gap-3 mt-5"><button className="border border-line rounded px-4 py-2.5" onClick={() => setIssueFor(null)}>Cancel</button><button className="btn" onClick={report}>Submit</button></div>
          </div>
        </div>
      )}
      <h2 className="font-display text-2xl font-semibold mb-3">Lockers</h2>
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3 mb-4">
        {Array.from({ length: LOCKERS }, (_, i) => i + 1).map(n => (
          <button key={n} disabled={!canEdit} onClick={() => { setPick(n); setMsg('') }}
            className={`card p-3 text-left ${pick === n ? '!border-brass' : ''} ${lockers[n] ? 'bg-paper' : ''}`}>
            <div className="text-xs text-pine/60">Locker {n}</div>
            <div className={`text-sm font-semibold ${lockers[n] ? '' : 'text-green-700'}`}>{lockers[n] ? nameOf(lockers[n]) : 'Free'}</div>
          </button>))}
      </div>
      {canEdit && pick !== null && (
        <div className="card p-5 flex flex-wrap items-center gap-3">
          <span className="text-sm font-semibold">Locker {pick}</span>
          {lockers[pick] ? <button className="border border-line rounded px-4 py-2 text-sm hover:border-brass" onClick={() => release(pick)}>Release from {nameOf(lockers[pick])}</button> : <>
            <select className="input max-w-xs" value={who} onChange={e => setWho(e.target.value)}>{members.map(m => <option key={m.id} value={m.id}>{m.name} ({m.id})</option>)}</select>
            <button className="btn" onClick={allot}>Allot locker</button></>}
        </div>)}
      {!canEdit && <p className="text-xs text-pine/50">Only admin and staff can change locker allocation.</p>}
    </div>
  )
}
