import { useState } from 'react'
import { useMembers } from '../context/Members'
import { useOps } from '../context/Ops'
import { Member } from '../types'
import { birthdays, daysUntilBirthday } from '../data/birthdays'
interface Item { key: string; m: Member; detail: string; text: string }
export default function Reminders() {
  const { members } = useMembers()
  const { attendance } = useOps()
  const [tab, setTab] = useState<'renew' | 'risk' | 'bday'>('renew')
  const [state, setState] = useState<Record<string, string>>({})
  const renew: Item[] = members.filter(m => m.status !== 'Active').sort((a, b) => a.expiry.localeCompare(b.expiry)).map(m => ({
    key: 'r' + m.id, m, detail: `${m.plan} · ${m.status === 'Expired' ? 'expired' : 'expires'} on ${m.expiry}`,
    text: `Hi ${m.name}, your ${m.plan} at Muscle & Hustle Gym Studio ${m.status === 'Expired' ? 'expired' : 'expires'} on ${m.expiry}. Renew at the front desk to keep your training going.`,
  }))
  const risk: Item[] = members.filter(m => m.status !== 'Expired').map(m => {
    const dates = attendance.filter(a => a.memberId === m.id).map(a => a.date).sort()
    const last = dates[dates.length - 1]
    const days = Math.floor((Date.now() - new Date(last ?? m.joined).getTime()) / 86400000)
    return { m, days, last }
  }).filter(x => x.days >= 10).sort((a, b) => b.days - a.days).map(({ m, days, last }) => ({
    key: 'a' + m.id, m, detail: last ? `Last visit ${last} (${days} days ago)` : `No visits since joining on ${m.joined}`,
    text: `Hi ${m.name}, we have missed you at Muscle & Hustle! It has been ${days} days since ${last ? 'your last visit' : 'you joined'}. Come in this week and ${m.trainer} will help you restart.`,
  }))
  const bday: Item[] = members.filter(m => birthdays[m.id]).map(m => ({ m, n: daysUntilBirthday(birthdays[m.id]) }))
    .filter(x => x.n <= 30).sort((a, b) => a.n - b.n).map(({ m, n }) => ({
      key: 'b' + m.id, m, detail: n === 0 ? 'Birthday today' : n === 1 ? 'Birthday tomorrow' : `Birthday in ${n} days`,
      text: `Happy birthday ${m.name}! Everyone at Muscle & Hustle Gym Studio wishes you a strong and healthy year ahead. Enjoy a free protein shake on us this week.`,
    }))
  const items = tab === 'renew' ? renew : tab === 'risk' ? risk : bday
  const mark = (k: string, v: string) => setState({ ...state, [k]: v })
  const copy = (it: Item) => { navigator.clipboard?.writeText(it.text); mark(it.key, 'Copied') }
  return (
    <div>
      <h1 className="font-display text-3xl sm:text-4xl font-semibold">Reminders</h1>
      <p className="text-pine/60 mt-1 mb-6">Ready-made messages for renewals, members who stopped coming and birthdays</p>
      <div className="flex flex-wrap gap-2 mb-4">
        {([['renew', `Renewals (${renew.length})`], ['risk', `At-risk members (${risk.length})`], ['bday', `Birthdays (${bday.length})`]] as const).map(([k, l]) =>
          <button key={k} onClick={() => setTab(k)} className={`px-4 py-2 rounded text-sm font-semibold border ${tab === k ? 'bg-pine text-white border-pine' : 'bg-white border-line hover:border-brass'}`}>{l}</button>)}
      </div>
      <div className="space-y-3">
        {items.map(it => (
          <div key={it.key} className="card p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div><div className="font-semibold">{it.m.name} <span className="text-pine/50 font-normal">· {it.m.phone}</span></div><div className="text-sm text-pine/60">{it.detail}</div></div>
              <div className="flex items-center gap-3 text-sm">
                {state[it.key] === 'Sent' ? <span className="text-green-700 font-semibold">Sent</span> : <>
                  <button className="text-brass2 font-semibold" onClick={() => copy(it)}>{state[it.key] === 'Copied' ? 'Copied' : 'Copy message'}</button>
                  <a className="text-brass2 font-semibold" target="_blank" rel="noreferrer" href={`https://wa.me/91${it.m.phone.replace(/\D/g, '')}?text=${encodeURIComponent(it.text)}`}>Open WhatsApp</a>
                  <button className="border border-line rounded px-3 py-1.5 hover:border-brass" onClick={() => mark(it.key, 'Sent')}>Mark as sent</button></>}
              </div>
            </div>
            <p className="text-sm bg-paper rounded p-3 mt-3 text-pine/80">{it.text}</p>
          </div>
        ))}
        {items.length === 0 && <div className="card p-10 text-pine/60">{tab === 'renew' ? 'No renewals due. All memberships are active.' : tab === 'risk' ? 'No at-risk members. Everyone visited in the last 10 days.' : 'No birthdays in the next 30 days.'}</div>}
      </div>
    </div>
  )
}
