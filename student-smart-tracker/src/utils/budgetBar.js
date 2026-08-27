export function getBudgetBarState(usagePct) {
  const usage = Number(usagePct) || 0

  if (usage > 100) {
    return {
      id: 'over',
      emoji: '🚨',
      label: 'Overspending',
      hint: 'You have crossed this month’s budget.',
      barClass: 'from-rose-500 to-orange-400',
      glow: 'shadow-[0_0_24px_rgb(251_113_133/0.35)]',
      textClass: 'text-rose-300',
    }
  }

  if (usage >= 95) {
    return {
      id: 'warning',
      emoji: '⚠️',
      label: 'Warning',
      hint: 'Almost at the limit. Slow down a little.',
      barClass: 'from-orange-400 to-amber-300',
      glow: 'shadow-[0_0_20px_rgb(251_146_60/0.3)]',
      textClass: 'text-orange-300',
    }
  }

  if (usage >= 80) {
    return {
      id: 'caution',
      emoji: '😬',
      label: 'Caution',
      hint: 'Approaching the budget limit.',
      barClass: 'from-amber-400 to-yellow-300',
      glow: 'shadow-[0_0_18px_rgb(245_185_66/0.28)]',
      textClass: 'text-amber-300',
    }
  }

  if (usage >= 50) {
    return {
      id: 'happy',
      emoji: '😊',
      label: 'On track',
      hint: 'Healthy pace for this point in the month.',
      barClass: 'from-mint to-teal-300',
      glow: 'shadow-[0_0_18px_rgb(46_233_197/0.28)]',
      textClass: 'text-mint',
    }
  }

  if (usage >= 20) {
    return {
      id: 'neutral',
      emoji: '😐',
      label: 'Neutral',
      hint: 'Spending is still in a comfortable range.',
      barClass: 'from-sky-400 to-cyan-300',
      glow: 'shadow-[0_0_16px_rgb(56_189_248/0.22)]',
      textClass: 'text-sky-300',
    }
  }

  return {
    id: 'concerned',
    emoji: '😟',
    label: 'Just getting started',
    hint: 'Very little of the budget has been used so far.',
    barClass: 'from-slate-400 to-slate-200',
    glow: '',
    textClass: 'text-slate-300',
  }
}

export function barWidthPercent(usagePct) {
  return Math.min(Math.max(Number(usagePct) || 0, 0), 100)
}
