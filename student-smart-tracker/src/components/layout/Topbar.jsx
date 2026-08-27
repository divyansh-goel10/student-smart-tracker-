import { Bell, LogOut } from 'lucide-react'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import { mockMonth, mockProfile } from '@/data/mock'
import { useAuth } from '@/hooks/useAuth'

function getInitials(nameOrEmail) {
  if (!nameOrEmail) return '??'
  const parts = nameOrEmail.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[1][0]).toUpperCase()
}

export function Topbar() {
  const navigate = useNavigate()
  const { user, signOut } = useAuth()

  const displayName = user?.user_metadata?.full_name || user?.email || mockProfile.displayName

  async function handleLogout() {
    const { error } = await signOut()
    if (error) {
      toast.error('Could not log out', { description: error.message })
      return
    }
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-white/8 bg-ink/70 px-4 py-3 backdrop-blur-xl lg:px-8">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">This month</p>
        <p className="font-display text-lg font-semibold text-white">{mockMonth.label}</p>
      </div>
      <div className="flex items-center gap-3">
        <span className="hidden rounded-full border border-white/10 px-3 py-1 text-xs text-slate-300 sm:inline">
          {mockProfile.timezone}
        </span>
        <button
          type="button"
          className="grid size-10 place-items-center rounded-xl border border-white/10 bg-white/5 text-slate-200"
          aria-label="Alerts"
        >
          <Bell className="size-4" />
        </button>
        <div
          className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-violet to-mint font-display text-sm font-bold text-ink"
          title={displayName}
        >
          {getInitials(displayName)}
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="grid size-10 place-items-center rounded-xl border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
          aria-label="Log out"
          title="Log out"
        >
          <LogOut className="size-4" />
        </button>
      </div>
    </header>
  )
}
