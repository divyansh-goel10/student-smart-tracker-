import { cn } from '@/lib/cn'

const styles = {
  safe: 'border-mint/25 bg-mint/8 text-mint',
  watch: 'border-amber/30 bg-amber/10 text-amber',
  caution: 'border-amber/30 bg-amber/10 text-amber',
  high_risk: 'border-rose/30 bg-rose/10 text-rose',
  over_budget: 'border-rose/30 bg-rose/10 text-rose',
}

export function AlertBanner({ alert }) {
  return (
    <div className={cn('rounded-2xl border px-4 py-3', styles[alert.level] || styles.watch)}>
      <p className="text-sm font-semibold">{alert.title}</p>
      <p className="mt-1 text-xs text-slate-200/80">{alert.body}</p>
    </div>
  )
}
