import { useAuth } from '../context/Auth'
import { useMembers } from '../context/Members'
import { useOps, streakOf } from '../context/Ops'
const defs = [
  { name: 'First visit', kind: 'visits', n: 1 }, { name: '5 visits', kind: 'visits', n: 5 }, { name: '20 visits', kind: 'visits', n: 20 },
  { name: '3-day streak', kind: 'streak', n: 3 }, { name: '7-day streak', kind: 'streak', n: 7 },
] as const
export default function Rewards() {
  const { user } = useAuth()
  const { members } = useMembers()
  const { attendance } = useOps()
  const rows = members.map(m => {
    const visits = attendance.filter(a => a.memberId === m.id).length
    const streak = streakOf(attendance, m.id)
    const val = (k: 'visits' | 'streak') => k === 'visits' ? visits : streak
    return { m, visits, streak, points: visits * 10 + streak * 5, earned: defs.filter(b => val(b.kind) >= b.n), next: defs.find(b => val(b.kind) < b.n), val }
  }).sort((a, b) => b.points - a.points)
  const me = rows.find(r => r.m.name === user?.name && user?.role === 'member')
  return (
    <div>
      <h1 className="font-display text-4xl font-semibold">Rewards</h1>
      <p className="text-pine/60 mt-1 mb-6">10 points for every visit and 5 points for each day of your current streak</p>
      {me && (
        <div className="bg-pine text-white rounded-md border border-brass p-7 mb-6">
          <div className="flex flex-wrap gap-10 items-end">
            <div><div className="text-sm text-white/60">Your points</div><div className="font-display text-6xl font-semibold text-brass">{me.points}</div></div>
            <div><div className="text-sm text-white/60">Day streak</div><div className="font-display text-4xl font-semibold">{me.streak}</div></div>
            <div><div className="text-sm text-white/60">Visits</div><div className="font-display text-4xl font-semibold">{me.visits}</div></div>
          </div>
          <div className="flex flex-wrap gap-2 mt-5">{me.earned.length ? me.earned.map(b => <span key={b.name} className="border border-brass text-brass rounded px-3 py-1 text-sm">{b.name}</span>) : <span className="text-sm text-white/60">No badges yet. Check in to earn your first.</span>}</div>
          {me.next && <p className="text-sm text-white/70 mt-4">Next badge: {me.next.name}, {me.next.n - me.val(me.next.kind)} to go.</p>}
        </div>
      )}
      <div className="card overflow-x-auto"><div className="px-5 py-4 border-b border-line font-semibold">Leaderboard</div>
        <table className="w-full text-sm">
          <thead><tr className="text-left text-pine/60">{['Rank', 'Member', 'Visits', 'Streak', 'Points', 'Badges'].map(h => <th key={h} className="px-5 py-3 font-medium">{h}</th>)}</tr></thead>
          <tbody>{rows.map((r, i) => (
            <tr key={r.m.id} className={`border-t border-line ${r === me ? 'bg-paper' : ''}`}>
              <td className="px-5 py-3 font-display text-xl">{i + 1}</td><td className="px-5 font-semibold">{r.m.name}</td><td className="px-5">{r.visits}</td><td className="px-5">{r.streak}</td><td className="px-5 font-semibold">{r.points}</td>
              <td className="px-5 text-pine/70">{r.earned.length ? r.earned.map(b => b.name).join(', ') : '-'}</td></tr>))}</tbody>
        </table></div>
    </div>
  )
}
