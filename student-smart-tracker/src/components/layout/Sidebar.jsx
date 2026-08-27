
import { useEffect, useState } from 'react'
import { NavLink } from 'react-router'
import * as icons from 'lucide-react'

import { APP_NAV } from '@/lib/constants'
import { cn } from '@/lib/cn'
import { Logo } from '@/components/layout/Logo'
import { useAuth } from '@/hooks/useAuth'

export function Sidebar() {
  const { user } = useAuth()

  const [profileName, setProfileName] = useState(() => {
    return (
      localStorage.getItem('display_name') ||
      user?.user_metadata?.full_name ||
      user?.email ||
      'Student'
    )
  })

  const [collegeName, setCollegeName] = useState(() => {
    return (
      localStorage.getItem('college_name') ||
      'Your College Name'
    )
  })

  useEffect(() => {
    function updateProfile() {
      setProfileName(
        localStorage.getItem('display_name') ||
          user?.user_metadata?.full_name ||
          user?.email ||
          'Student',
      )

      setCollegeName(
        localStorage.getItem('college_name') ||
          'Your College Name',
      )
    }

    updateProfile()

    window.addEventListener(
      'profile-updated',
      updateProfile,
    )

    window.addEventListener(
      'college-name-updated',
      updateProfile,
    )

    return () => {
      window.removeEventListener(
        'profile-updated',
        updateProfile,
      )

      window.removeEventListener(
        'college-name-updated',
        updateProfile,
      )
    }
  }, [user])

  return (
    <aside className="hidden w-64 shrink-0 border-r border-white/8 bg-ink-soft/80 p-4 lg:flex lg:flex-col">
      <Logo />

      <nav className="mt-8 flex flex-1 flex-col gap-1">
        {APP_NAV.map((item) => {
          const Icon = icons[item.icon]

          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-300 transition-colors hover:bg-white/6 hover:text-white',
                  isActive &&
                    'bg-white/8 text-white shadow-[inset_0_0_0_1px_rgb(46_233_197/0.25)]',
                )
              }
            >
              {Icon && (
                <Icon className="size-4 text-mint" />
              )}

              {item.label}
            </NavLink>
          )
        })}
      </nav>

      <div className="rounded-2xl border border-white/8 bg-white/4 p-3">
        <p className="text-sm font-medium text-white">
          {profileName}
        </p>

        <p className="text-xs text-slate-400">
          {collegeName}
        </p>
      </div>
    </aside>
  )
}
