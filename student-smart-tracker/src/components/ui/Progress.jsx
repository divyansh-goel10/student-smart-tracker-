import { cn } from '@/lib/cn'

export function Progress({ value, className, barClassName }) {
  const width = Math.min(Math.max(value, 0), 100)
  return (
    <div className={cn('h-2 overflow-hidden rounded-full bg-white/10', className)}>
      <div
        className={cn('h-full rounded-full bg-mint transition-[width] duration-500', barClassName)}
        style={{ width: `${width}%` }}
      />
    </div>
  )
}
