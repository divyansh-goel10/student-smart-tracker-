import { Sparkles } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'

export function ComingSoonNote({ feature }) {
  return (
    <div className="mt-6 flex items-start gap-3 rounded-2xl border border-dashed border-white/15 bg-white/4 px-4 py-3">
      <Sparkles className="mt-0.5 size-4 text-violet" />
      <div>
        <Badge tone="violet">Phase 1 mock</Badge>
        <p className="mt-1 text-sm text-slate-300">
          {feature} is wired into the navigation and layout. Live data, auth, and AI arrive in later phases.
        </p>
      </div>
    </div>
  )
}
