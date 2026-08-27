import { cn } from '@/lib/cn'

export function Card({ className, ...props }) {
  return <div className={cn('glass rounded-2xl', className)} {...props} />
}

export function CardHeader({ className, ...props }) {
  return <div className={cn('flex items-start justify-between gap-3 p-5 pb-0', className)} {...props} />
}

export function CardTitle({ className, ...props }) {
  return <h2 className={cn('font-display text-base font-semibold text-white', className)} {...props} />
}

export function CardBody({ className, ...props }) {
  return <div className={cn('p-5', className)} {...props} />
}
