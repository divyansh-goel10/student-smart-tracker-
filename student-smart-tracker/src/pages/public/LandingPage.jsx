import { ArrowRight, ScanLine, Sparkles, Split, Wallet } from 'lucide-react'
import { Link } from 'react-router'
import { Button } from '@/components/ui/Button'

const features = [
  {
    icon: Wallet,
    title: 'Budgets that match campus life',
    body: 'Track monthly budget and pocket money separately, plus a full semester view.',
  },
  {
    icon: ScanLine,
    title: 'Scan receipts, not spreadsheets',
    body: 'Upload a bill or payment screenshot, review the extract, then save. Nothing is auto-posted.',
  },
  {
    icon: Sparkles,
    title: 'Ask about your own money',
    body: 'Totals come from your data. AI is for explanations and suggestions — never another student’s numbers.',
  },
  {
    icon: Split,
    title: 'Split the mess bill fairly',
    body: 'Equal or custom splits with a simple who-owes-whom summary. No real-money transfers in v1.',
  },
]

export function LandingPage() {
  return (
    <div>
      <section className="mx-auto grid max-w-6xl gap-12 px-4 pb-20 pt-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:pt-16">
        <div>
          <p className="inline-flex rounded-full border border-mint/25 bg-mint/10 px-3 py-1 text-xs font-medium text-mint">
            Built for students · INR · Asia/Kolkata
          </p>
          <h1 className="mt-5 font-display text-4xl font-semibold leading-tight tracking-tight text-white sm:text-6xl">
            Know where your pocket money actually goes.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
            Student Smart Tracker is a polished money OS for campus life — expenses, budgets, savings, splits, and
            AI insights that stay on your side of the ledger.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button as={Link} to="/signup" size="lg">
              Create free account
              <ArrowRight className="size-4" />
            </Button>
            <Button as={Link} to="/app" variant="secondary" size="lg">
              Preview dashboard
            </Button>
          </div>
          <p className="mt-4 text-xs text-slate-500">
            Preview uses mock data. Authentication and live database arrive in later phases.
          </p>
        </div>

        <div className="glass relative overflow-hidden rounded-3xl p-5">
          <div className="absolute -right-8 -top-8 size-40 rounded-full bg-mint/20 blur-3xl" />
          <div className="absolute -bottom-10 -left-6 size-40 rounded-full bg-violet/25 blur-3xl" />
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">August snapshot</p>
          <p className="mt-2 font-display text-3xl font-semibold text-white">₹11,317 spent</p>
          <p className="mt-1 text-sm text-slate-400">₹3,683 left in a ₹15,000 budget · ₹6,683 pocket remaining</p>
          <div className="mt-6 h-3 overflow-hidden rounded-full bg-white/8">
            <div className="h-full w-[75%] rounded-full bg-gradient-to-r from-mint to-teal-300" />
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-2xl bg-white/5 p-3">
              <p className="text-slate-400">Food</p>
              <p className="mt-1 font-medium text-white">₹1,490</p>
            </div>
            <div className="rounded-2xl bg-white/5 p-3">
              <p className="text-slate-400">Rent</p>
              <p className="mt-1 font-medium text-white">₹5,500</p>
            </div>
            <div className="rounded-2xl bg-white/5 p-3">
              <p className="text-slate-400">Laptop goal</p>
              <p className="mt-1 font-medium text-white">42%</p>
            </div>
            <div className="rounded-2xl bg-white/5 p-3">
              <p className="text-slate-400">Wi-Fi due</p>
              <p className="mt-1 font-medium text-white">3 days</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-24">
        <h2 className="font-display text-2xl font-semibold text-white">Designed like a product, not a lab demo</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {features.map((feature) => (
            <article key={feature.title} className="glass rounded-2xl p-5">
              <feature.icon className="size-5 text-mint" />
              <h3 className="mt-3 font-display text-lg font-semibold text-white">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{feature.body}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
