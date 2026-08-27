import { NavLink } from 'react-router'
import * as icons from 'lucide-react'
import { MOBILE_NAV } from '@/lib/constants'
import { cn } from '@/lib/cn'

export function MobileNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-white/8 bg-ink/90 px-2 py-2 backdrop-blur-xl lg:hidden">
      <ul className="grid grid-cols-5">
        {MOBILE_NAV.map((item) => {
          const Icon = icons[item.icon]
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
  )
}
