
import { useState, FormEvent } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { useAuth } from '../context/Auth'
import { useMembers } from '../context/Members'
import { useOps, streakOf } from '../context/Ops'
import { today, startOfWeek } from '../lib'

type Period = 'daily' | 'weekly' | 'monthly'

type SummaryRow = {
  memberId: string
  memberName: string
  visits: number
  lastIn: string
  lastOut?: string
}

function inPeriod(dateStr: string, period: Period) {
  const d = new Date(dateStr + 'T12:00:00')
  const now = new Date()

  if (period === 'daily') return dateStr === today()

  if (period === 'weekly') {
    const start = startOfWeek(now)
    const end = new Date(start)
    end.setDate(end.getDate() + 7)
    return d >= start && d < end
  }

  return dateStr.startsWith(today().slice(0, 7))
}

export default function Attendance() {
  const { user } = useAuth()
  const { members } = useMembers()
  const { attendance, checkIn, checkOut } = useOps()

  const [code, setCode] = useState('')
  const [res, setRes] = useState<{ ok: boolean; msg: string } | null>(null)
  const [period, setPeriod] = useState<Period>('daily')
  const [memberQ, setMemberQ] = useState('')

  if (user?.role === 'member') {
    const me = members.find(m => m.name === user.name)
    const mine = attendance.filter(a => a.memberId === me?.id)
    const weekVisits = mine.filter(a => inPeriod(a.date, 'weekly')).length
    const monthVisits = mine.filter(a => inPeriod(a.date, 'monthly')).length

    return (
      <div>
        <h1 className="font-display text-4xl font-semibold mb-6">My attendance</h1>

        <div className="grid lg:grid-cols-2 gap-4">
          {me && (
            <div className="bg-pine text-white rounded-md p-7 border border-brass flex items-center justify-between gap-6">
              <div>
                <div className="font-display text-2xl font-semibold">Muscle &amp; Hustle</div>
                <div className="text-xs text-white/60 mb-6">Member card</div>
                <div className="text-xl font-semibold">{me.name}</div>
                <div className="text-sm text-white/70">{me.id} · {me.plan}</div>
                <div className="text-sm text-white/70">Valid till {me.expiry}</div>
              </div>

              <div className="bg-white p-2 rounded shrink-0">
                <QRCodeSVG value={me.id} size={110} />
              </div>
            </div>
          )}

          <div className="grid grid-cols-3 gap-4">
            <div className="card p-5">
              <div className="text-sm text-pine/60">This week</div>
              <div className="font-display text-4xl font-semibold mt-1">{weekVisits}</div>
            </div>

            <div className="card p-5">
              <div className="text-sm text-pine/60">This month</div>
              <div className="font-display text-4xl font-semibold mt-1">{monthVisits}</div>
            </div>

            <div className="card p-5">
              <div className="text-sm text-pine/60">Day streak</div>
              <div className="font-display text-4xl font-semibold mt-1">
                {me ? streakOf(attendance, me.id) : 0}
              </div>
            </div>
          </div>
        </div>

        <div className="card mt-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-pine/60">
                <th className="px-5 py-3 font-medium">Date</th>
                <th className="font-medium">In</th>
                <th className="font-medium">Out</th>
              </tr>
            </thead>

            <tbody>
              {mine.map(a => (
                <tr key={a.id} className="border-t border-line">
                  <td className="px-5 py-3">{a.date}</td>
                  <td>{a.checkIn}</td>
                  <td>{a.checkOut ?? '-'}</td>
                </tr>
              ))}

              {mine.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-5 py-10 text-center text-pine/60">
                    No visits yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  const q = memberQ.toLowerCase()

  // Daily attendance records retain their original Attendance type.
  const todays = attendance.filter(a => inPeriod(a.date, 'daily'))

  const shownDaily = todays.filter(a =>
    !q ||
    a.memberName.toLowerCase().includes(q) ||
    a.memberId.toLowerCase().includes(q)
  )

  // Weekly and monthly records use a separate summary type.
  const summaryMap = new Map<string, SummaryRow>()

  if (period !== 'daily') {
    const filtered = attendance.filter(a => inPeriod(a.date, period))

    for (const a of filtered) {
      const cur = summaryMap.get(a.memberId)

      if (!cur) {
        summaryMap.set(a.memberId, {
          memberId: a.memberId,
          memberName: a.memberName,
          visits: 1,
          lastIn: a.checkIn,
          lastOut: a.checkOut,
        })
      } else {
        cur.visits += 1
        cur.lastIn = a.checkIn
        cur.lastOut = a.checkOut
      }
    }
  }

  const summaryRows = Array.from(summaryMap.values())
    .sort((a, b) => b.visits - a.visits)

  const shownSummary = summaryRows.filter(r =>
    !q ||
    r.memberName.toLowerCase().includes(q) ||
    r.memberId.toLowerCase().includes(q)
  )

  const submit = (e: FormEvent) => {
    e.preventDefault()

    if (code.trim()) {
      setRes(checkIn(code))
      setCode('')
    }
  }

  return (
    <div>
      <h1 className="font-display text-4xl font-semibold mb-6">Attendance</h1>

      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <div className="card p-5">
          <div className="text-sm text-pine/60">Checked in today</div>
          <div className="font-display text-4xl font-semibold mt-1">{todays.length}</div>
        </div>

        <div className="card p-5">
          <div className="text-sm text-pine/60">Inside now</div>
          <div className="font-display text-4xl font-semibold mt-1">
            {todays.filter(a => !a.checkOut).length}
          </div>
        </div>

        <div className="card p-5">
          <div className="text-sm text-pine/60">Active members</div>
          <div className="font-display text-4xl font-semibold mt-1">
            {members.filter(m => m.status !== 'Expired' && m.status !== 'Inactive').length}
          </div>
        </div>
      </div>

      {user?.role !== 'trainer' && (
        <form onSubmit={submit} className="card p-6 mb-6">
          <div className="font-semibold mb-1">Check in</div>

          <p className="text-sm text-pine/60 mb-3">
            Scan the member's QR card, or type the member ID or name, then press Enter.
          </p>

          <div className="flex gap-3">
            <input
              className="input max-w-sm"
              placeholder="Example: MH001"
              value={code}
              onChange={e => setCode(e.target.value)}
              autoFocus
            />

            <button className="btn">Check in</button>
          </div>

          {res && (
            <p className={`text-sm mt-3 ${res.ok ? 'text-green-700' : 'text-red-700'}`}>
              {res.msg}
            </p>
          )}
        </form>
      )}

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="flex rounded border border-line overflow-hidden">
          {(['daily', 'weekly', 'monthly'] as Period[]).map(p => (
            <button
              key={p}
              type="button"
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 text-sm font-semibold capitalize ${
                period === p ? 'bg-brass text-white' : 'bg-white hover:bg-paper'
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        <input
          className="input max-w-xs"
          placeholder="Filter by member name or ID"
          value={memberQ}
          onChange={e => setMemberQ(e.target.value)}
        />

        <span className="text-sm text-pine/60">
          {period === 'daily' ? shownDaily.length : shownSummary.length} records
        </span>
      </div>

      <div className="card overflow-x-auto">
        <div className="px-5 py-4 border-b border-line font-semibold capitalize">
          {period} attendance
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-pine/60">
              {period === 'daily'
                ? ['Member', 'ID', 'In', 'Out', ''].map(h => (
                    <th key={h} className="px-5 py-3 font-medium">{h}</th>
                  ))
                : ['Member', 'ID', 'Visits', 'Last in', 'Last out'].map(h => (
                    <th key={h} className="px-5 py-3 font-medium">{h}</th>
                  ))}
            </tr>
          </thead>

          <tbody>
            {period === 'daily'
              ? shownDaily.map(a => (
                  <tr key={a.id} className="border-t border-line">
                    <td className="px-5 py-3 font-semibold">{a.memberName}</td>
                    <td className="px-5">{a.memberId}</td>
                    <td className="px-5">{a.checkIn}</td>
                    <td className="px-5">{a.checkOut ?? '-'}</td>
                    <td className="px-5">
                      {!a.checkOut && (
                        <button
                          type="button"
                          className="text-brass2 font-semibold"
                          onClick={() => checkOut(a.id)}
                        >
                          Check out
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              : shownSummary.map(r => (
                  <tr key={r.memberId} className="border-t border-line">
                    <td className="px-5 py-3 font-semibold">{r.memberName}</td>
                    <td className="px-5">{r.memberId}</td>
                    <td className="px-5 font-semibold">{r.visits}</td>
                    <td className="px-5">{r.lastIn}</td>
                    <td className="px-5">{r.lastOut ?? '-'}</td>
                  </tr>
                ))}

            {(period === 'daily' ? shownDaily.length : shownSummary.length) === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-pine/60">
                  No attendance in this {period} view.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
