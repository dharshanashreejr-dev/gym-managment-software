import { useState, FormEvent } from 'react'
import { useAuth } from '../context/Auth'
import { useOps } from '../context/Ops'
import { today } from '../lib'
interface Review { id: string; trainer: string; member: string; rating: number; comment: string; date: string }
const seed: Review[] = [
  { id: 'F1', trainer: 'Karthik', member: 'Sanjay M', rating: 5, comment: 'Great form correction and very motivating.', date: '2026-11-10' },
  { id: 'F2', trainer: 'Meena', member: 'Harini K', rating: 5, comment: 'Yoga sessions are calm and well planned.', date: '2026-11-12' },
  { id: 'F3', trainer: 'Ravi', member: 'Lakshmi T', rating: 4, comment: 'Good HIIT classes, a little crowded in the evening.', date: '2026-11-19' },
]
const stars = (n: number) => '★'.repeat(Math.round(n)) + '☆'.repeat(5 - Math.round(n))
export default function Feedback() {
  const { user } = useAuth()
  const { trainers } = useOps()
  const [reviews, setReviews] = useState(seed)
  const [f, setF] = useState({ trainer: trainers[0]?.name ?? '', rating: 5, comment: '' })
  const [err, setErr] = useState('')
  const isMember = user?.role === 'member'
  const avg = (t: string) => { const r = reviews.filter(x => x.trainer === t); return r.length ? r.reduce((s, x) => s + x.rating, 0) / r.length : 0 }
  const shown = user?.role === 'trainer' ? reviews.filter(r => user.name.includes(r.trainer)) : reviews
  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (f.comment.trim().length < 5) return setErr('Write a short comment (at least 5 characters).')
    setReviews([{ id: 'F' + Date.now(), trainer: f.trainer, member: user?.name ?? 'Member', rating: f.rating, comment: f.comment.trim(), date: today() }, ...reviews])
    setF({ ...f, comment: '' }); setErr('')
  }
  return (
    <div>
      <h1 className="font-display text-3xl sm:text-4xl font-semibold">Trainer feedback</h1>
      <p className="text-pine/60 mt-1 mb-6">Ratings and comments from members</p>
      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        {trainers.map(t => <div key={t.id} className="card p-5"><div className="font-semibold">{t.name}</div><div className="text-xs text-pine/60">{t.specialization}</div>
          <div className="text-brass2 text-xl mt-2">{stars(avg(t.name))}</div><div className="text-sm text-pine/60">{avg(t.name) ? avg(t.name).toFixed(1) : 'No ratings'} · {reviews.filter(r => r.trainer === t.name).length} reviews</div></div>)}
      </div>
      <div className={isMember ? 'grid lg:grid-cols-2 gap-4' : ''}>
        {isMember && (
          <form onSubmit={submit} className="card p-6 h-fit">
            <div className="font-semibold mb-4">Rate your trainer</div>
            <label className="text-sm font-semibold">Trainer</label>
            <select className="input mt-1 mb-3" value={f.trainer} onChange={e => setF({ ...f, trainer: e.target.value })}>{trainers.map(t => <option key={t.id}>{t.name}</option>)}</select>
            <label className="text-sm font-semibold">Rating</label>
            <div className="flex gap-1 mt-1 mb-3">{[1, 2, 3, 4, 5].map(n => <button type="button" key={n} aria-label={n + ' stars'} onClick={() => setF({ ...f, rating: n })} className={`text-3xl ${n <= f.rating ? 'text-brass' : 'text-pine/20'}`}>★</button>)}</div>
            <label className="text-sm font-semibold">Comment</label>
            <textarea className="input mt-1 mb-3" rows={3} value={f.comment} onChange={e => setF({ ...f, comment: e.target.value })} />
            {err && <p className="text-sm text-red-700 mb-3">{err}</p>}
            <button className="btn">Submit feedback</button>
          </form>
        )}
        <div className="card">
          <div className="px-5 py-4 border-b border-line font-semibold">Feedback report</div>
          {shown.map(r => <div key={r.id} className="px-5 py-4 border-t border-line first:border-t-0">
            <div className="flex flex-wrap justify-between gap-2 text-sm"><span className="font-semibold">{r.trainer} <span className="text-brass2">{stars(r.rating)}</span></span><span className="text-pine/50">{r.member} · {r.date}</span></div>
            <p className="text-sm text-pine/80 mt-1">{r.comment}</p></div>)}
          {shown.length === 0 && <div className="px-5 py-10 text-center text-pine/60">No feedback yet.</div>}
        </div>
      </div>
    </div>
  )
}
