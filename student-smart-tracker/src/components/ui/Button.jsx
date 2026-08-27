import { cn } from '@/lib/cn'

const variants = {
  primary:
    'bg-mint text-ink hover:bg-mint/90 shadow-[0_8px_24px_rgb(46_233_197/0.22)]',
  secondary:
    'bg-white/8 text-white hover:bg-white/12 border border-white/10',
  ghost: 'text-slate-200 hover:bg-white/8',
  danger: 'bg-rose-500/90 text-white hover:bg-rose-500',
}

const sizes = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-11 px-4 text-sm',
  lg: 'h-12 px-5 text-base',
}

export function Button({
  as: Tag = 'button',
  variant = 'primary',
  size = 'md',
  className,
  type = 'button',
  ...props
}) {
  return (
    <Tag
      type={Tag === 'button' ? type : undefined}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-colors disabled:opacity-50',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  )
}
