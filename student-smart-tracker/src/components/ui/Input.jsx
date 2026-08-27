import { cn } from '@/lib/cn'

export function Input({ label, hint, className, id, ...props }) {
  return (
    <label className="block space-y-1.5" htmlFor={id}>
      {label ? (
        <span className="text-sm font-medium text-slate-200">{label}</span>
      ) : null}
      <input
        id={id}
        className={cn(
          'h-11 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-mint/50 focus:ring-2 focus:ring-mint/20',
          className,
        )}
        {...props}
      />
      {hint ? <span className="text-xs text-slate-400">{hint}</span> : null}
    </label>
  )
}
