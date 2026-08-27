import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { formatINR } from '@/utils/money'

export function CategoryPie({ data }) {
  return (
    <div className="h-56">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="amount" nameKey="label" innerRadius={52} outerRadius={80} paddingAngle={3}>
            {data.map((entry) => (
              <Cell key={entry.id} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => formatINR(value)}
            contentStyle={{
              background: '#121a31',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 12,
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
