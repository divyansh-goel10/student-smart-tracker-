import { cn } from '@/lib/cn'

const tones = {
  mint: 'bg-mint/15 text-mint',
  violet: 'bg-violet/15 text-violet',
  amber: 'bg-amber/15 text-amber',
  rose: 'bg-rose/15 text-rose',
  slate: 'bg-white/8 text-slate-200',
}

export function Badge({ tone = 'slate', className, ...props }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        tones[tone],
        className,
      )}
      {...props}
    />
  )
}
