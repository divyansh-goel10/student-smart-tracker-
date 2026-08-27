import { Link, Outlet } from 'react-router'
import { Logo } from '@/components/layout/Logo'
import { Button } from '@/components/ui/Button'

export function PublicShell() {
  return (
    <div className="bg-app-grid min-h-svh">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5">
        <Logo />
        <div className="flex items-center gap-2">
          <Button as={Link} to="/login" variant="ghost" size="sm">
            Log in
          </Button>
          <Button as={Link} to="/signup" size="sm">
            Get started
          </Button>
        </div>
      </header>
      <Outlet />
    </div>
  )
}
