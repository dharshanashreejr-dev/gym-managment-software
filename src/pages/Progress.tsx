import { useState, FormEvent } from 'react'
import { useAuth } from '../context/Auth'
import { useMembers } from '../context/Members'
import { useProgress } from '../context/Progress'
import { today } from '../lib'
import LineChart from '../components/LineChart'
const bmi = (w: number, h: number) => w / ((h / 100) ** 2)
const cat = (b: number) => b < 18.5 ? 'Underweight' : b < 25 ? 'Normal' : b < 30 ? 'Overweight' : 'Obese'
export default function Progress() {
  const { user } = useAuth()
  const { members } = useMembers()
  const { measurements, goals, addMeasurement, setGoal } = useProgress()
  const isMember = user?.role === 'member'
  const [pick, setPick] = useState('MH001')
  const [f, setF] = useState({ date: today(), weight: '', height: '175' })
  const [goalIn, setGoalIn] = useState('')
  const [err, setErr] = useState('')
  const who = isMember ? members.find(m => m.name === user?.name) : members.find(m => m.id === pick)
  if (!who) return <div className="card p-10 text-pine/60">No member profile is linked to this login.</div>
  const list = measurements.filter(x => x.memberId === who.id).sort((a, b) => a.date.localeCompare(b.date))
  const first = list[0], last = list[list.length - 1]
  const goal = goals[who.id]
  const pct = goal && first && last && first.weight !== goal ? Math.min(Math.max((first.weight - last.weight) / (first.weight - goal), 0), 1) : 0
  const submit = (e: FormEvent) => {
    e.preventDefault()
    const w = +f.weight, h = +f.height
    if (!(w >= 20 && w <= 300)) return setErr('Enter a weight between 20 and 300 kg.')
    if (!(h >= 100 && h <= 250)) return setErr('Enter a height between 100 and 250 cm.')
    addMeasurement({ memberId: who.id, date: f.date, weight: w, height: h }); setF({ ...f, weight: '' }); setErr('')
  }
  const saveGoal = () => {
    const g = +goalIn
    if (!(g >= 20 && g <= 300)) return setErr('Enter a goal weight between 20 and 300 kg.')
    setGoal(who.id, g); setGoalIn(''); setErr('')
  }
  const stats: [string, string][] = last ? [
    ['Current weight', last.weight + ' kg'],
    ['Change since start', list.length > 1 ? (last.weight - first.weight > 0 ? '+' : '') + (last.weight - first.weight).toFixed(1) + ' kg' : '-'],
    ['BMI', bmi(last.weight, last.height).toFixed(1) + ' · ' + cat(bmi(last.weight, last.height))],
  ] : []
  return (
    <div>
      <div className="flex items-end justify-between mb-6">
        <div><h1 className="font-display text-4xl font-semibold">Progress</h1><p className="text-pine/60 mt-1">{who.name} · {who.id}</p></div>
        {!isMember && <select className="input max-w-xs" value={pick} onChange={e => { setPick(e.target.value); setErr('') }}>{members.map(m => <option key={m.id} value={m.id}>{m.name} ({m.id})</option>)}</select>}
      </div>
      {last ? <>
        <div className="grid sm:grid-cols-3 gap-4 mb-4">{stats.map(([l, v]) => <div key={l} className="card p-5"><div className="text-sm text-pine/60">{l}</div><div className="font-display text-3xl font-semibold mt-1">{v}</div></div>)}</div>
        <div className="grid lg:grid-cols-3 gap-4 mb-4">
          <div className="card p-6 lg:col-span-2"><div className="font-semibold mb-3">Weight trend</div><LineChart data={list.slice(-8).map(x => ({ label: x.date.slice(5), value: x.weight }))} unit=" kg" /></div>
          <div className="card p-6"><div className="font-semibold mb-3">Goal weight</div>
            {goal ? <><div className="font-display text-4xl font-semibold">{goal} kg</div>
              <div className="h-2 bg-paper rounded mt-4"><div className="h-2 bg-brass rounded" style={{ width: pct * 100 + '%' }} /></div>
              <div className="text-sm text-pine/60 mt-2">{Math.round(pct * 100)}% of the way there</div></> : <p className="text-sm text-pine/60">No goal set yet.</p>}
            <div className="flex gap-2 mt-5"><input className="input !py-2" type="number" placeholder="New goal (kg)" value={goalIn} onChange={e => setGoalIn(e.target.value)} /><button className="btn !py-2" type="button" onClick={saveGoal}>Save</button></div>
          </div>
        </div>
      </> : <div className="card p-10 text-pine/60 mb-4">No measurements yet. Add the first one below.</div>}
      <div className="grid lg:grid-cols-3 gap-4">
        <form onSubmit={submit} className="card p-6">
          <div className="font-semibold mb-3">Add measurement</div>
          <label className="text-sm font-semibold">Date</label><input type="date" className="input mt-1 mb-3" value={f.date} onChange={e => setF({ ...f, date: e.target.value })} />
          <div className="grid grid-cols-2 gap-3"><div><label className="text-sm font-semibold">Weight (kg)</label><input type="number" step="0.1" className="input mt-1" value={f.weight} onChange={e => setF({ ...f, weight: e.target.value })} /></div>
            <div><label className="text-sm font-semibold">Height (cm)</label><input type="number" className="input mt-1" value={f.height} onChange={e => setF({ ...f, height: e.target.value })} /></div></div>
          {err && <p className="text-sm text-red-700 mt-3">{err}</p>}
          <button className="btn w-full mt-4">Save measurement</button>
        </form>
        <div className="card lg:col-span-2 overflow-x-auto"><table className="w-full text-sm">
          <thead><tr className="text-left text-pine/60"><th className="px-5 py-3 font-medium">Date</th><th className="font-medium">Weight</th><th className="font-medium">Height</th><th className="font-medium">BMI</th></tr></thead>
          <tbody>{[...list].reverse().map(x => <tr key={x.id} className="border-t border-line"><td className="px-5 py-3">{x.date}</td><td>{x.weight} kg</td><td>{x.height} cm</td><td>{bmi(x.weight, x.height).toFixed(1)}</td></tr>)}</tbody>
        </table></div>
      </div>
    </div>
  )
}
