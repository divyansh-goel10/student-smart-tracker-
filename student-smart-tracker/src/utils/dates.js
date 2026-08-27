import { format, parseISO } from 'date-fns'

export const DEFAULT_TIMEZONE = 'Asia/Kolkata'
export const DEFAULT_LOCALE = 'en-IN'

export function formatDate(value, pattern = 'd MMM yyyy') {
  const date = typeof value === 'string' ? parseISO(value) : value
  return format(date, pattern)
}

export function formatMonthLabel(yearMonth) {
  const date = typeof yearMonth === 'string' ? parseISO(yearMonth) : yearMonth
  return format(date, 'MMMM yyyy')
}
