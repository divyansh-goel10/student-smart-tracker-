import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { formatCompactINR } from '@/utils/money'

export function DailyBar({ data }) {
  return (
    <div className="h-56">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
          <XAxis dataKey="day" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={formatCompactINR}
            width={48}
          />
          <Tooltip
            formatter={(value) => formatCompactINR(value)}
            contentStyle={{
              background: '#121a31',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 12,
            }}
          />
          <Bar dataKey="amount" fill="#2ee9c5" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
