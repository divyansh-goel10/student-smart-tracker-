const inr = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
})

const inrExact = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export function formatINR(amount, { exact = false } = {}) {
  const value = Number(amount) || 0
  return exact ? inrExact.format(value) : inr.format(value)
}

export function formatCompactINR(amount) {
  const value = Number(amount) || 0
  if (Math.abs(value) >= 100000) {
    return `₹${(value / 100000).toFixed(1)}L`
  }
  if (Math.abs(value) >= 1000) {
    return `₹${(value / 1000).toFixed(1)}k`
  }
  return formatINR(value)
}

export function percent(part, whole) {
  if (!whole) return 0
  return (Number(part) / Number(whole)) * 100
}

export function clampPercent(value) {
  if (Number.isNaN(value)) return 0
  return Math.max(0, value)
}
