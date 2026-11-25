import { useOps } from '../context/Ops'
import { today } from '../lib'
const CAPACITY = 30
const blocks = ['5 - 8 AM', '8 - 11 AM', '11 AM - 2 PM', '2 - 5 PM', '5 - 8 PM', '8 - 10 PM']
const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const typical = [[3, 1, 0, 1, 4, 2], [3, 1, 0, 1, 4, 2], [3, 1, 1, 1, 4, 2], [3, 1, 0, 1, 4, 2], [2, 1, 0, 1, 3, 1], [2, 3, 2, 1, 1, 0], [1, 2, 1, 0, 0, 0]]
const shade = ['bg-paper', 'bg-brass/20', 'bg-brass/40', 'bg-brass/70', 'bg-brass']
const words = ['very quiet', 'quiet', 'moderate', 'busy', 'very busy']
export default function Crowd() {
  const { attendance } = useOps()
  const inside = attendance.filter(a => a.date === today() && !a.checkOut).length
  const pct = Math.min(Math.round((inside / CAPACITY) * 100), 100)
  const level = pct < 40 ? 'Quiet' : pct < 75 ? 'Moderate' : 'Busy'
  const col = pct < 40 ? 'bg-green-600' : pct < 75 ? 'bg-amber-500' : 'bg-red-600'
  const todayIdx = (new Date().getDay() + 6) % 7
  const row = typical[todayIdx]
  const best = row.indexOf(Math.min(...row))
  return (
    <div>
      <h1 className="font-display text-4xl font-semibold">Crowd meter</h1>
      <p className="text-pine/60 mt-1 mb-6">How busy the studio is right now</p>
      <div className="card p-7 mb-4">
        <div className="flex items-end justify-between mb-4">
          <div><div className="text-sm text-pine/60">Inside now</div><div className="font-display text-6xl font-semibold">{inside}<span className="text-2xl text-pine/50"> / {CAPACITY}</span></div></div>
          <div className="text-right"><div className="text-sm text-pine/60">Status</div><div className="font-display text-4xl font-semibold">{level}</div></div>
        </div>
        <div className="h-3 bg-paper rounded"><div className={`h-3 rounded ${col}`} style={{ width: pct + '%' }} /></div>
        <p className="text-sm text-pine/70 mt-4">Quietest time today: <span className="font-semibold">{blocks[best]}</span> ({words[row[best]]}).</p>
      </div>
      <div className="card p-7">
        <div className="font-semibold mb-1">Typical week</div>
        <p className="text-sm text-pine/60 mb-4">Sample pattern for the demo. Darker means busier.</p>
        <div className="overflow-x-auto"><table className="text-sm w-full border-separate border-spacing-1">
          <thead><tr><th />{blocks.map(b => <th key={b} className="font-medium text-pine/60 px-2 pb-1 whitespace-nowrap">{b}</th>)}</tr></thead>
          <tbody>{days.map((d, i) => (
            <tr key={d}><td className={`pr-3 ${i === todayIdx ? 'font-semibold' : 'text-pine/60'}`}>{d}</td>
              {typical[i].map((v, j) => <td key={j} title={words[v]} className={`h-9 rounded ${shade[v]} ${i === todayIdx ? 'ring-1 ring-pine/40' : ''}`} />)}</tr>))}</tbody>
        </table></div>
      </div>
    </div>
  )
}
