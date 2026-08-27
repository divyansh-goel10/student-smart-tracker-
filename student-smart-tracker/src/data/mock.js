import { CATEGORY_MAP } from '@/lib/constants'

export const mockProfile = {
  displayName: 'Aarav Mehta',
  campus: 'Your college name ',
  currency: 'INR',
  locale: 'en-IN',
  timezone: 'Asia/Kolkata',
}

export const mockMonth = {
  yearMonth: '2026-08-01',
  label: 'August 2026',
  daysInMonth: 31,
  dayOfMonth: 26,
}

export const mockBudget = {
  amount: 15000,
}

export const mockPocketMoney = {
  amount: 18000,
}

export const mockSemester = {
  name: 'Monsoon 2026',
  startDate: '2026-06-01',
  endDate: '2026-11-30',
  budget: 80000,
}

export const mockExpenses = [
  { id: 'e1', amount: 420, category: 'food', date: '2026-08-26', description: 'Mess extra + chai', paymentMethod: 'upi', merchant: 'Campus mess' },
  { id: 'e2', amount: 89, category: 'subscriptions', date: '2026-08-25', description: 'Spotify student', paymentMethod: 'card', merchant: 'Spotify' },
  { id: 'e3', amount: 1350, category: 'travel', date: '2026-08-24', description: 'Home weekend bus', paymentMethod: 'upi', merchant: 'RedBus' },
  { id: 'e4', amount: 640, category: 'shopping', date: '2026-08-23', description: 'Hostel essentials', paymentMethod: 'upi', merchant: 'Blinkit' },
  { id: 'e5', amount: 210, category: 'food', date: '2026-08-22', description: 'Late-night Maggi', paymentMethod: 'cash', merchant: 'Night canteen' },
  { id: 'e6', amount: 499, category: 'entertainment', date: '2026-08-21', description: 'Movie with friends', paymentMethod: 'upi', merchant: 'PVR' },
  { id: 'e7', amount: 780, category: 'books', date: '2026-08-19', description: 'Lab manual + pens', paymentMethod: 'upi', merchant: 'Campus bookstore' },
  { id: 'e8', amount: 5500, category: 'rent', date: '2026-08-01', description: 'August PG rent', paymentMethod: 'upi', merchant: 'PG owner' },
  { id: 'e9', amount: 399, category: 'subscriptions', date: '2026-08-10', description: 'Netflix split share', paymentMethod: 'upi', merchant: 'Netflix' },
  { id: 'e10', amount: 860, category: 'food', date: '2026-08-16', description: 'Dominos after exam', paymentMethod: 'card', merchant: 'Domino’s' },
  { id: 'e11', amount: 250, category: 'travel', date: '2026-08-14', description: 'Auto to station', paymentMethod: 'cash', merchant: 'Auto' },
  { id: 'e12', amount: 320, category: 'other', date: '2026-08-12', description: 'Printouts + ID lanyard', paymentMethod: 'upi', merchant: 'Xerox shop' },
]

export const mockDailySpend = [
  { day: '1', amount: 5500 },
  { day: '10', amount: 399 },
  { day: '12', amount: 320 },
  { day: '14', amount: 250 },
  { day: '16', amount: 860 },
  { day: '19', amount: 780 },
  { day: '21', amount: 499 },
  { day: '22', amount: 210 },
  { day: '23', amount: 640 },
  { day: '24', amount: 1350 },
  { day: '25', amount: 89 },
  { day: '26', amount: 420 },
]

export const mockMonthlyTrend = [
  { month: 'Mar', spent: 9800 },
  { month: 'Apr', spent: 11240 },
  { month: 'May', spent: 8700 },
  { month: 'Jun', spent: 14120 },
  { month: 'Jul', spent: 12890 },
  { month: 'Aug', spent: 11317 },
]

export const mockSemesterMonthly = [
  { month: 'Jun', spent: 14120 },
  { month: 'Jul', spent: 12890 },
  { month: 'Aug', spent: 11317 },
  { month: 'Sep', spent: 0 },
  { month: 'Oct', spent: 0 },
  { month: 'Nov', spent: 0 },
]

export const mockSavingsGoals = [
  { id: 'g1', name: 'New laptop', target: 10000, saved: 4200, targetDate: '2026-12-15' },
  { id: 'g2', name: 'Goa trip', target: 8000, saved: 1850, targetDate: '2026-10-20' },
]

export const mockRecurring = [
  { id: 'r1', name: 'PG rent', amount: 5500, category: 'rent', frequency: 'Monthly', nextDate: '2026-09-01' },
  { id: 'r2', name: 'Wi-Fi', amount: 499, category: 'subscriptions', frequency: 'Monthly', nextDate: '2026-08-29' },
  { id: 'r3', name: 'Spotify', amount: 89, category: 'subscriptions', frequency: 'Monthly', nextDate: '2026-09-25' },
]

export const mockAlerts = [
  {
    id: 'a1',
    level: 'watch',
    title: 'Watch spending',
    body: 'Estimate: at the current daily pace, pocket money may feel tight before month-end. This is a prediction, not a guarantee.',
  },
  {
    id: 'a2',
    level: 'caution',
    title: 'Wi-Fi due in 3 days',
    body: '₹499 recurring payment is coming up on 29 Aug. Tracking only — no automatic payment.',
  },
]

export function sumExpenses(expenses = mockExpenses) {
  return expenses.reduce((total, item) => total + item.amount, 0)
}

export function spendingByCategory(expenses = mockExpenses) {
  const totals = {}
  for (const item of expenses) {
    totals[item.category] = (totals[item.category] || 0) + item.amount
  }
  return Object.entries(totals)
    .map(([id, amount]) => ({
      id,
      label: CATEGORY_MAP[id]?.label ?? id,
      color: CATEGORY_MAP[id]?.color ?? '#94a3b8',
      amount,
    }))
    .sort((a, b) => b.amount - a.amount)
}

export const mockDashboard = {
  spent: sumExpenses(),
  budget: mockBudget.amount,
  pocket: mockPocketMoney.amount,
  semesterSpent: 14120 + 12890 + 11317,
}
