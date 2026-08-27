import { Link } from 'react-router'

export function Logo({ compact = false }) {
  return (
    <Link to="/" className="flex items-center gap-2.5">
      <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-mint to-violet text-ink shadow-[0_8px_20px_rgb(46_233_197/0.25)]">
        <span className="font-display text-sm font-bold">₹</span>
      </span>
      {compact ? null : (
        <span className="font-display text-base font-semibold tracking-tight text-white">
          Student Smart Tracker
        </span>
      )}
    </Link>
  )
}
