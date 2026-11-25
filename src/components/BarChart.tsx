import {
  BarChart as RBarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'

interface Row { label: string; value: number }

const grid = '#E3DEF0'
const tick = '#6A6283'
const bar = '#F2512D'

export default function BarChart({ data, format = String }: { data: Row[]; format?: (n: number) => string }) {
  return (
    <div className="h-52 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RBarChart data={data} margin={{ top: 10, right: 6, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="mhBar" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FF7A55" />
              <stop offset="100%" stopColor="#7C4DFF" />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="4 6" stroke={grid} vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: tick, fontFamily: 'Manrope' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: tick }} axisLine={false} tickLine={false} width={44} />
          <Tooltip
            formatter={(v: number) => format(v)}
            contentStyle={{
              borderRadius: 16,
              border: '1px solid #E3DEF0',
              fontSize: 13,
              boxShadow: '0 12px 32px rgba(42,26,77,0.14)',
              fontFamily: 'Manrope',
            }}
            cursor={{ fill: 'rgba(124,77,255,0.07)' }}
          />
          <Bar dataKey="value" fill="url(#mhBar)" radius={[6, 6, 0, 0]} maxBarSize={36} />
        </RBarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function HBar({ rows, format = String }: { rows: Row[]; format?: (n: number) => string }) {
  const max = Math.max(...rows.map(r => r.value), 1)
  return (
    <div className="space-y-3.5">
      {rows.map(r => (
        <div key={r.label}>
          <div className="flex justify-between text-sm mb-1.5">
            <span className="font-medium text-ink">{r.label}</span>
            <span className="text-mute tabular-nums">{format(r.value)}</span>
          </div>
          <div className="h-2 rounded-full bg-paper2 overflow-hidden">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-brass to-brass2 transition-all duration-700 ease-out"
              style={{ width: `${(r.value / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
