import {
  LineChart as RLineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'

export default function LineChart({ data, unit = '' }: { data: { label: string; value: number }[]; unit?: string }) {
  return (
    <div className="h-52 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RLineChart data={data} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="mhLine" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F2512D" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#F2512D" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="mhLineStroke" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#F2512D" />
              <stop offset="100%" stopColor="#7C4DFF" />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="4 6" stroke="#E3DEF0" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#6A6283' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: '#6A6283' }} axisLine={false} tickLine={false} width={40} unit={unit} />
          <Tooltip
            formatter={(v: number) => [`${v}${unit}`, 'Value']}
            contentStyle={{
              borderRadius: 16,
              border: '1px solid #E3DEF0',
              fontSize: 13,
              boxShadow: '0 12px 32px rgba(42,26,77,0.14)',
            }}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="url(#mhLineStroke)"
            strokeWidth={2.5}
            dot={{ r: 3.5, fill: '#F2512D', strokeWidth: 0 }}
            activeDot={{ r: 6, fill: '#7C4DFF', strokeWidth: 0 }}
          />
        </RLineChart>
      </ResponsiveContainer>
    </div>
  )
}
