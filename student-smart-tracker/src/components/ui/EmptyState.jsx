import { Link } from 'react-router'
import { Button } from '@/components/ui/Button'

export function EmptyState({ title, body, actionTo, actionLabel }) {
  return (
    <div className="glass rounded-2xl px-6 py-14 text-center">
      <p className="font-display text-lg font-semibold text-white">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-sm text-slate-400">{body}</p>
      {actionTo ? (
        <Button as={Link} to={actionTo} className="mt-6" variant="secondary">
          {actionLabel}
        </Button>
      ) : null}
    </div>
  )
}
