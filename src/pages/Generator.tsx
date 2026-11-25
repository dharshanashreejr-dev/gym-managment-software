import { useState, FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/Auth'
import { useMembers } from '../context/Members'
import { useOps } from '../context/Ops'
import { generatePlan, GenOut, Goal, Level, Food } from '../generator'
export default function Generator() {
  const { user } = useAuth()
  const { members } = useMembers()
  const { addWorkout } = useOps()
  const isMember = user?.role === 'member'
  const [memberId, setMemberId] = useState('MH001')
  const [f, setF] = useState({ goal: 'Fat loss' as Goal, level: 'Beginner' as Level, days: 4, food: 'Vegetarian' as Food, weight: '70', age: '25' })
  const [out, setOut] = useState<GenOut | null>(null)
  const [err, setErr] = useState('')
  const [saved, setSaved] = useState(false)
  const who = isMember ? members.find(m => m.name === user?.name) : members.find(m => m.id === memberId)
  const submit = (e: FormEvent) => {
    e.preventDefault()
    const weight = +f.weight, age = +f.age
    if (!(weight >= 30 && weight <= 250)) return setErr('Enter a weight between 30 and 250 kg.')
    if (!(age >= 14 && age <= 80)) return setErr('Enter an age between 14 and 80.')
    setErr(''); setSaved(false); setOut(generatePlan({ goal: f.goal, level: f.level, days: f.days, food: f.food, weight, age }))
  }
  const save = () => {
    if (!who || !out) return
    addWorkout({ memberId: who.id, memberName: who.name, goal: f.goal, workout: out.workout, diet: out.diet }); setSaved(true)
  }
  const sel = (k: keyof typeof f, opts: (string | number)[]) => (
    <select className="input mt-1" value={f[k]} onChange={e => setF({ ...f, [k]: typeof f[k] === 'number' ? +e.target.value : e.target.value })}>{opts.map(o => <option key={o}>{o}</option>)}</select>
  )
  return (
    <div>
      <h1 className="font-display text-4xl font-semibold">Plan generator</h1>
      <p className="text-pine/60 mt-1 mb-6">Answer a few questions and get a weekly workout and daily diet plan</p>
      <div className="grid lg:grid-cols-3 gap-4">
        <form onSubmit={submit} className="card p-6 space-y-3 self-start">
          {!isMember && <div><label className="text-sm font-semibold">Member</label><select className="input mt-1" value={memberId} onChange={e => { setMemberId(e.target.value); setSaved(false) }}>{members.map(m => <option key={m.id} value={m.id}>{m.name} ({m.id})</option>)}</select></div>}
          <div><label className="text-sm font-semibold">Goal</label>{sel('goal', ['Fat loss', 'Muscle gain', 'General fitness'])}</div>
          <div><label className="text-sm font-semibold">Experience level</label>{sel('level', ['Beginner', 'Intermediate', 'Advanced'])}</div>
          <div><label className="text-sm font-semibold">Training days per week</label>{sel('days', [3, 4, 5, 6])}</div>
          <div><label className="text-sm font-semibold">Food preference</label>{sel('food', ['Vegetarian', 'Egg and vegetarian', 'Non-vegetarian'])}</div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-sm font-semibold">Age</label><input type="number" className="input mt-1" value={f.age} onChange={e => setF({ ...f, age: e.target.value })} /></div>
            <div><label className="text-sm font-semibold">Weight (kg)</label><input type="number" className="input mt-1" value={f.weight} onChange={e => setF({ ...f, weight: e.target.value })} /></div>
          </div>
          {err && <p className="text-sm text-red-700">{err}</p>}
          <button className="btn w-full">Generate plan</button>
        </form>
        <div className="lg:col-span-2">
          {out ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="card p-5"><div className="text-sm text-pine/60">Daily calories (estimate)</div><div className="font-display text-4xl font-semibold mt-1">{out.calories}</div></div>
                <div className="card p-5"><div className="text-sm text-pine/60">Daily protein</div><div className="font-display text-4xl font-semibold mt-1">{out.protein} g</div></div>
              </div>
              <div className="card p-6 grid md:grid-cols-2 gap-6 text-sm">
                <div><div className="font-semibold mb-2">Weekly workout</div>{out.workout.map(x => <div key={x} className="py-1.5 border-t border-line">{x}</div>)}</div>
                <div><div className="font-semibold mb-2">Daily diet</div>{out.diet.map(x => <div key={x} className="py-1.5 border-t border-line">{x}</div>)}</div>
              </div>
              <div className="flex items-center gap-4">
                <button className="btn" onClick={save} disabled={!who}>{isMember ? 'Save as my plan' : 'Save to ' + (who?.name ?? 'member')}</button>
                {saved && <span className="text-sm text-green-700">Saved. <Link to="/workouts" className="underline">View in Workout and diet</Link></span>}
              </div>
            </div>
          ) : <div className="card p-10 text-pine/60">Your plan will appear here. Fill in the form and select Generate plan.</div>}
        </div>
      </div>
    </div>
  )
}
