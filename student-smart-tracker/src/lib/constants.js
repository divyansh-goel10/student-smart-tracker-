export const CATEGORIES = [
  { id: 'food', label: 'Food', color: '#2ee9c5' },
  { id: 'travel', label: 'Travel', color: '#60a5fa' },
  { id: 'rent', label: 'Rent', color: '#8b7cff' },
  { id: 'shopping', label: 'Shopping', color: '#f472b6' },
  { id: 'subscriptions', label: 'Subscriptions', color: '#f5b942' },
  { id: 'books', label: 'Books', color: '#34d399' },
  { id: 'entertainment', label: 'Entertainment', color: '#fb7185' },
  { id: 'other', label: 'Other', color: '#94a3b8' },
]

export const CATEGORY_MAP = Object.fromEntries(CATEGORIES.map((item) => [item.id, item]))

export const APP_NAV = [
  { to: '/app', label: 'Dashboard', icon: 'LayoutDashboard', end: true },
  { to: '/app/expenses', label: 'Expenses', icon: 'Receipt' },
  { to: '/app/budget', label: 'Budget', icon: 'Wallet' },
  { to: '/app/pocket-money', label: 'Pocket Money', icon: 'Banknote' },
  { to: '/app/recurring', label: 'Recurring', icon: 'Repeat' },
  { to: '/app/savings', label: 'Savings', icon: 'PiggyBank' },
  { to: '/app/splits', label: 'Split bills', icon: 'Users' },
  { to: '/app/insights', label: 'Insights', icon: 'Sparkles' },
  { to: '/app/chat', label: 'AI chat', icon: 'MessageCircle' },
  { to: '/app/scan', label: 'Scanner', icon: 'ScanLine' },
  { to: '/app/what-if', label: 'What-if', icon: 'Calculator' },
  { to: '/app/settings', label: 'Settings', icon: 'Settings' },
]

export const MOBILE_NAV = [
  { to: '/app', label: 'Home', icon: 'Home', end: true },
  { to: '/app/expenses', label: 'Expenses', icon: 'Receipt' },
  { to: '/app/scan', label: 'Add', icon: 'Plus', emphasize: true },
  { to: '/app/insights', label: 'Insights', icon: 'Sparkles' },
  { to: '/app/settings', label: 'More', icon: 'Menu' },
]
