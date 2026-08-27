import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Logo } from '@/components/layout/Logo'
import { useAuth } from '@/hooks/useAuth'

export function LoginPage() {
  const navigate = useNavigate()
  const { signIn } = useAuth()
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const email = form.get('email')
    const password = form.get('password')

    setLoading(true)
    const { error } = await signIn({ email, password })
    setLoading(false)

    if (error) {
      toast.error('Could not log in', { description: error.message })
      return
    }

    toast.success('Welcome back!')
    navigate('/app')
  }

  return (
    <AuthCard title="Welcome back" subtitle="Log in to your tracker.">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <Input id="login-email" name="email" label="Email" type="email" placeholder="you@college.edu" required />
        <Input
          id="login-password"
          name="password"
          label="Password"
          type="password"
          placeholder="••••••••"
          required
        />
        <div className="flex justify-end">
          <Link to="/reset-password" className="text-xs text-mint hover:underline">
            Forgot password?
          </Link>
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Logging in…' : 'Log in'}
        </Button>
      </form>
      <p className="mt-4 text-center text-sm text-slate-400">
        New here?{' '}
        <Link to="/signup" className="text-mint hover:underline">
          Create an account
        </Link>
      </p>
    </AuthCard>
  )
}

export function SignupPage() {
  const navigate = useNavigate()
  const { signUp } = useAuth()
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const fullName = form.get('fullName')
    const email = form.get('email')
    const password = form.get('password')

    setLoading(true)
    const { data, error } = await signUp({ email, password, fullName })
    setLoading(false)

    if (error) {
      toast.error('Could not sign up', { description: error.message })
      return
    }

    // If email confirmation is enabled in Supabase, there is no session yet.
    if (!data.session) {
      toast.success('Check your inbox', {
        description: 'Confirm your email, then log in to continue.',
      })
      navigate('/login')
      return
    }

    toast.success('Account created!')
    navigate('/app')
  }

  return (
    <AuthCard title="Create your tracker" subtitle="Takes a minute.">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <Input id="signup-name" name="fullName" label="Name" placeholder="Aarav Mehta" required />
        <Input
          id="signup-email"
          name="email"
          label="Email"
          type="email"
          placeholder="you@college.edu"
          required
        />
        <Input
          id="signup-password"
          name="password"
          label="Password"
          type="password"
          placeholder="At least 8 characters"
          minLength={8}
          required
        />
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Creating account…' : 'Sign up'}
        </Button>
      </form>
      <p className="mt-4 text-center text-sm text-slate-400">
        Already have an account?{' '}
        <Link to="/login" className="text-mint hover:underline">
          Log in
        </Link>
      </p>
    </AuthCard>
  )
}

export function ResetPasswordPage() {
  const { resetPasswordForEmail } = useAuth()
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const email = form.get('email')

    setLoading(true)
    const { error } = await resetPasswordForEmail(email)
    setLoading(false)

    if (error) {
      toast.error('Could not send reset link', { description: error.message })
      return
    }

    setSent(true)
    toast.success('Reset link sent', { description: 'Check your inbox.' })
  }

  return (
    <AuthCard title="Reset password" subtitle="We’ll email a reset link.">
      {sent ? (
        <p className="text-sm text-slate-300">
          If an account exists for that email, a reset link is on its way.
        </p>
      ) : (
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Input id="reset-email" name="email" label="Email" type="email" placeholder="you@college.edu" required />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Sending…' : 'Send reset link'}
          </Button>
        </form>
      )}
      <p className="mt-4 text-center text-sm text-slate-400">
        <Link to="/login" className="text-mint hover:underline">
          Back to login
        </Link>
      </p>
    </AuthCard>
  )
}

function AuthCard({ title, subtitle, children }) {
  return (
    <div className="bg-app-grid flex min-h-svh flex-col items-center justify-center px-4 py-10">
      <Logo />
      <div className="glass mt-8 w-full max-w-md rounded-3xl p-6 sm:p-8">
        <h1 className="font-display text-2xl font-semibold text-white">{title}</h1>
        <p className="mt-2 text-sm text-slate-400">{subtitle}</p>
        <div className="mt-6">{children}</div>
      </div>
    </div>
  )
}
