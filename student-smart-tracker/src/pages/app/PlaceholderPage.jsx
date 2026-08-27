import { ComingSoonNote } from '@/components/ui/ComingSoonNote'

export function PlaceholderPage({ title, body }) {
  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-white">{title}</h1>
      <p className="mt-2 max-w-2xl text-sm text-slate-400">{body}</p>
      <ComingSoonNote feature={title} />
    </div>
  )
}
