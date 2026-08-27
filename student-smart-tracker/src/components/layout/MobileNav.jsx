import { useState } from 'react'
import { NavLink } from 'react-router'
import * as icons from 'lucide-react'
import { APP_NAV, MOBILE_NAV } from '@/lib/constants'
import { cn } from '@/lib/cn'

// Everything in the full desktop nav that isn't already one of the 4
// primary bottom-bar buttons lives inside the "More" sheet.
const PRIMARY_PATHS = new Set(MOBILE_NAV.filter((item) => item.label !== 'More').map((item) => item.to))
const MORE_ITEMS = APP_NAV.filter((item) => !PRIMARY_PATHS.has(item.to))

export function MobileNav() {
  const [open, setOpen] = useState(false)

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-black/60" />
          <div
            className="absolute inset-x-0 bottom-0 rounded-t-3xl border-t border-white/10 bg-ink p-4 pb-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-white/20" />
            <ul className="grid grid-cols-3 gap-3">
              {MORE_ITEMS.map((item) => {
                const Icon = icons[item.icon]
                return (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      onClick={() => setOpen(false)}
                      className={({ isActive }) =>
                        cn(
                          'flex flex-col items-center gap-2 rounded-2xl border border-white/8 bg-white/4 px-2 py-4 text-center text-xs text-slate-300',
                          isActive && 'border-mint/40 text-mint',
                        )
                      }
                    >
                      <Icon className="size-5" />
                      {item.label}
                    </NavLink>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      )}

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-white/8 bg-ink/90 px-2 py-2 backdrop-blur-xl lg:hidden">
        <ul className="grid grid-cols-5">
          {MOBILE_NAV.map((item) => {
            const Icon = icons[item.icon]

            if (item.label === 'More') {
              return (
                <li key={item.to}>
                  <button
                    type="button"
                    onClick={() => setOpen(true)}
                    className="flex w-full flex-col items-center gap-1 rounded-xl py-1 text-[11px] text-slate-400"
                  >
                    <span className="grid size-9 place-items-center rounded-xl">
                      <Icon className="size-4" />
                    </span>
                    {item.label}
                  </button>
                </li>
              )
            }

            return (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    cn(
                      'flex flex-col items-center gap-1 rounded-xl py-1 text-[11px] text-slate-400',
                      item.emphasize && '-mt-3',
                      isActive && 'text-mint',
                    )
                  }
                >
                  <span
                    className={cn(
                      'grid size-9 place-items-center rounded-xl',
                      item.emphasize && 'size-12 bg-mint text-ink shadow-[0_8px_20px_rgb(46_233_197/0.3)]',
                    )}
                  >
                    <Icon className="size-4" />
                  </span>
                  {item.label}
                </NavLink>
              </li>
            )
          })}
        </ul>
      </nav>
    </>
  )
}