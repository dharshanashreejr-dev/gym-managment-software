import { useState } from 'react'
import { useAuth } from '../context/Auth'
import { useMembers } from '../context/Members'
import { useClasses } from '../context/Classes'
export default function Classes() {
  const { user } = useAuth()
  const { members } = useMembers()
  const { classes, book, cancel } = useClasses()
  const isMember = user?.role === 'member'
  const canBook = user?.role !== 'trainer'
  const [pick, setPick] = useState(members[0]?.id ?? '')
  const [msg, setMsg] = useState('')
  const who = isMember ? members.find(m => m.name === user?.name) : members.find(m => m.id === pick)
  const nameOf = (id: string) => members.find(m => m.id === id)?.name ?? id
  return (
    <div>
      <h1 className="font-display text-4xl font-semibold">Classes</h1>
      <p className="text-pine/60 mt-1 mb-6">Weekly group sessions with limited spots</p>
      {canBook && !isMember && (
        <div className="card p-4 mb-4 flex items-center gap-3 text-sm"><span className="font-semibold">Booking for</span>
          <select className="input max-w-xs !py-2" value={pick} onChange={e => { setPick(e.target.value); setMsg('') }}>{members.map(m => <option key={m.id} value={m.id}>{m.name} ({m.id})</option>)}</select></div>
      )}
      {msg && <p className="text-sm text-green-700 mb-4">{msg}</p>}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {classes.map(c => {
          const left = c.capacity - c.booked.length
          const isBooked = !!who && c.booked.includes(who.id)
          const wlPos = who ? c.waitlist.indexOf(who.id) : -1
          const blocked = who?.status === 'Expired'
          return (
            <div key={c.id} className="card p-6 flex flex-col">
              <div className="font-display text-2xl font-semibold">{c.name}</div>
              <div className="text-sm text-pine/60">{c.slot} · with {c.trainer}</div>
              <div className="mt-4 text-sm"><span className={`font-semibold ${left > 0 ? 'text-green-700' : 'text-red-700'}`}>{left > 0 ? left + ' of ' + c.capacity + ' spots left' : 'Full'}</span>{c.waitlist.length > 0 && <span className="text-pine/60"> · {c.waitlist.length} waiting</span>}</div>
              <p className="text-xs text-pine/60 mt-2 flex-1">{c.booked.length ? 'Booked: ' + c.booked.map(nameOf).join(', ') : 'No bookings yet.'}</p>
              {canBook && who && (
                <div className="mt-4">
                  {isBooked || wlPos >= 0
                    ? <button className="border border-line rounded px-4 py-2 w-full hover:border-brass" onClick={() => { cancel(c.id, who.id); setMsg(isBooked ? 'Booking cancelled.' : 'Removed from the waitlist.') }}>{isBooked ? 'Cancel booking' : `Leave waitlist (position ${wlPos + 1})`}</button>
                    : <button className="btn w-full disabled:opacity-40" disabled={blocked} onClick={() => setMsg(book(c.id, who.id))}>{left > 0 ? 'Book a spot' : 'Join waitlist'}</button>}
                  {blocked && <p className="text-xs text-red-700 mt-2">Membership expired. Renew to book classes.</p>}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
