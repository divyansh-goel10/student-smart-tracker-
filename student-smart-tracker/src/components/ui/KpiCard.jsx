import { cn } from '@/lib/cn'

export function KpiCard({ label, value, hint, icon: Icon, tone = 'mint' }) {
  const tones = {
    mint: 'text-mint bg-mint/10',
    violet: 'text-violet bg-violet/10',
    amber: 'text-amber bg-amber/10',
    rose: 'text-rose bg-rose/10',
  }

  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm text-slate-400">{label}</p>
        {Icon ? (
          <span className={cn('grid size-9 place-items-center rounded-xl', tones[tone])}>
            <Icon className="size-4" />
          </span>
        ) : null}
      </div>
      <p className="mt-3 font-display text-2xl font-semibold tracking-tight text-white">{value}</p>
      {hint ? <p className="mt-1 text-xs text-slate-400">{hint}</p> : null}
    </div>
  )
}
