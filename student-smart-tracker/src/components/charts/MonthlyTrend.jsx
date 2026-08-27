import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { formatCompactINR } from '@/utils/money'

export function MonthlyTrend({ data }) {
  return (
    <div className="h-56">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="spendFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8b7cff" stopOpacity={0.45} />
              <stop offset="100%" stopColor="#8b7cff" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
          <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
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
          <Area type="monotone" dataKey="spent" stroke="#8b7cff" fill="url(#spendFill)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
