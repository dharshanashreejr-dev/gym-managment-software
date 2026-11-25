import { useState, FormEvent } from 'react'
import { useAuth } from '../context/Auth'
import { useMembers } from '../context/Members'
import { useOps } from '../context/Ops'
const tpl: Record<string, { workout: string; diet: string }> = {
  'Fat loss': { workout: 'Mon: Full body circuit, 40 min\nTue: Cardio intervals and core\nWed: Upper body strength\nThu: Lower body strength\nFri: HIIT, 25 min\nSat: Walk or yoga\nSun: Rest', diet: 'Breakfast: Oats, fruit, boiled eggs\nMid-morning: Buttermilk or green tea\nLunch: Brown rice, dal, vegetables, curd\nEvening: Sprouts or roasted chana\nDinner: Grilled chicken or paneer, salad' },
  'Muscle gain': { workout: 'Mon: Chest and triceps\nTue: Back and biceps\nWed: Legs and core\nThu: Shoulders and abs\nFri: Full body strength\nSat: Light cardio, 20 min\nSun: Rest', diet: 'Breakfast: Egg omelette, oats, banana\nLunch: Rice, chicken curry, vegetables\nEvening: Peanut butter toast, milk\nDinner: Chapati, paneer or fish, salad' },
  'General fitness': { workout: 'Mon: Full body strength\nTue: Cardio, 30 min\nWed: Yoga and mobility\nThu: Full body strength\nFri: Cardio and core\nSat: Sport or long walk\nSun: Rest', diet: 'Breakfast: Idli or dosa with sambar\nLunch: Rice, dal, vegetables, curd\nEvening: Fruit and nuts\nDinner: Chapati, vegetable curry, salad' },
}
export default function Workouts() {
  const { user } = useAuth()
  const { members } = useMembers()
  const { workouts, addWorkout } = useOps()
  const [open, setOpen] = useState(false)
  const [err, setErr] = useState('')
  const [f, setF] = useState({ memberId: members[0]?.id ?? '', goal: 'Fat loss', workout: tpl['Fat loss'].workout, diet: tpl['Fat loss'].diet })
  const canAdd = user?.role === 'admin' || user?.role === 'trainer'
  const list = user?.role === 'member' ? workouts.filter(w => w.memberName === user.name) : workouts
  const lines = (s: string) => s.split('\n').map(x => x.trim()).filter(Boolean)
  const submit = (e: FormEvent) => {
    e.preventDefault()
    const m = members.find(x => x.id === f.memberId)
    if (!m) return setErr('Select a member.')
    if (!lines(f.workout).length || !lines(f.diet).length) return setErr('Add at least one workout line and one diet line.')
    addWorkout({ memberId: m.id, memberName: m.name, goal: f.goal, workout: lines(f.workout), diet: lines(f.diet) }); setOpen(false); setErr('')
  }
  return (
    <div>
      <div className="flex items-end justify-between mb-6">
        <div><h1 className="font-display text-4xl font-semibold">Workout and diet</h1><p className="text-pine/60 mt-1">{list.length} plans</p></div>
        {canAdd && <button className="btn" onClick={() => setOpen(true)}>Create plan</button>}
      </div>
      <div className="space-y-4">
        {list.map(w => (
          <div key={w.id} className="card p-6">
            <div className="flex items-baseline justify-between mb-4"><div className="font-display text-2xl font-semibold">{w.memberName} · {w.goal}</div><div className="text-sm text-pine/60">{w.date}</div></div>
            <div className="grid md:grid-cols-2 gap-6 text-sm">
              <div><div className="font-semibold mb-2">Weekly workout</div>{w.workout.map(x => <div key={x} className="py-1.5 border-t border-line">{x}</div>)}</div>
              <div><div className="font-semibold mb-2">Daily diet</div>{w.diet.map(x => <div key={x} className="py-1.5 border-t border-line">{x}</div>)}</div>
            </div>
          </div>
        ))}
        {list.length === 0 && <div className="card p-10 text-pine/60">No plan assigned yet. Ask your trainer to create one.</div>}
      </div>
      {open && (
        <div className="fixed inset-0 bg-pine/60 grid place-items-center p-4 z-10 overflow-y-auto">
          <form onSubmit={submit} className="bg-white rounded-md w-full max-w-2xl p-7">
            <h2 className="font-display text-3xl font-semibold mb-5">Create plan</h2>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div><label className="text-sm font-semibold">Member</label><select className="input mt-1" value={f.memberId} onChange={e => setF({ ...f, memberId: e.target.value })}>{members.map(m => <option key={m.id} value={m.id}>{m.name} ({m.id})</option>)}</select></div>
              <div><label className="text-sm font-semibold">Goal (fills a starter plan)</label><select className="input mt-1" value={f.goal} onChange={e => setF({ ...f, goal: e.target.value, ...tpl[e.target.value] })}>{Object.keys(tpl).map(g => <option key={g}>{g}</option>)}</select></div>
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              <div><label className="text-sm font-semibold">Weekly workout (one line per day)</label><textarea className="input mt-1 h-48" value={f.workout} onChange={e => setF({ ...f, workout: e.target.value })} /></div>
              <div><label className="text-sm font-semibold">Daily diet (one line per meal)</label><textarea className="input mt-1 h-48" value={f.diet} onChange={e => setF({ ...f, diet: e.target.value })} /></div>
            </div>
            {err && <p className="text-sm text-red-700 mt-3">{err}</p>}
            <div className="flex justify-end gap-3 mt-5"><button type="button" className="border border-line rounded px-4 py-2.5" onClick={() => { setOpen(false); setErr('') }}>Cancel</button><button className="btn">Save plan</button></div>
          </form>
        </div>
      )}
    </div>
  )
}
