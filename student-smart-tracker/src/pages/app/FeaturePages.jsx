import { PlaceholderPage } from '@/pages/app/PlaceholderPage'
import { CATEGORY_MAP } from '@/lib/constants'
import { mockExpenses } from '@/data/mock'
import { formatDate } from '@/utils/dates'
import { formatINR } from '@/utils/money'
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card'
import { Progress } from '@/components/ui/Progress'
import {
  Plus,
  Trash2,
  Receipt,
  Users,
  Camera,
  Upload,
  X,
  CheckCircle2,
  Pencil,
} from 'lucide-react'

import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabaseClient'
function addInterval(dateStr, frequency) {
  if (!dateStr) return ''

  // Parse as a local calendar date so the displayed date does not
  // shift because of timezone conversion.
  const [year, month, day] = dateStr.split('-').map(Number)
  const d = new Date(year, month - 1, day)

  if (frequency === 'weekly') {
    d.setDate(d.getDate() + 7)
  } else if (frequency === 'yearly') {
    d.setFullYear(d.getFullYear() + 1)
  } else {
    d.setMonth(d.getMonth() + 1)
  }

  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function ExpensesPage() {
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)

  const [form, setForm] = useState({
    amount: '',
    category: 'food',
    date: new Date().toISOString().split('T')[0],
    description: '',
    paymentMethod: 'upi',
    merchant: '',
    isRecurring: false,
    frequency: 'monthly',
  })

  async function loadExpenses() {
    setLoading(true)
    setError('')

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setError('Please log in to view your expenses.')
      setLoading(false)
      return
    }

    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', user.id)
      .order('expense_date', { ascending: false })

    if (error) {
      console.error(error)
      setError(error.message)
    } else {
      setExpenses(data || [])
    }

    setLoading(false)
  }

  useEffect(() => {
    loadExpenses()
  }, [])

  function handleChange(event) {
    const { name, value, type, checked } = event.target
    setForm((previous) => ({
      ...previous,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSaving(true)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setError('Please log in first.')
      setSaving(false)
      return
    }

    if (!form.amount || Number(form.amount) <= 0) {
      setError('Please enter a valid amount.')
      setSaving(false)
      return
    }

    if (!form.date) {
      setError('Please select an expense date.')
      setSaving(false)
      return
    }

    // IMPORTANT:
    // Always create the real expense first. This is what makes the
    // current month's spending/budget calculations include it.
    const { error: expenseError } = await supabase.from('expenses').insert({
      user_id: user.id,
      amount: Number(form.amount),
      category: form.category,
      expense_date: form.date,
      description: form.description,
      payment_method: form.paymentMethod,
      merchant: form.merchant,
    })

    if (expenseError) {
      console.error('Expense creation error:', expenseError)
      setError(expenseError.message)
      setSaving(false)
      return
    }

    // If the checkbox is selected, create ONLY the recurring rule in
    // addition to the actual expense above. The first expense is already
    // counted in the budget because it lives in the expenses table.
    if (form.isRecurring) {
      const nextDueDate = addInterval(form.date, form.frequency)

      const { error: recurringError } = await supabase
        .from('recurring_expenses')
        .insert({
          user_id: user.id,
          name:
            form.description ||
            form.merchant ||
            CATEGORY_MAP[form.category]?.label ||
            'Recurring expense',
          amount: Number(form.amount),
          category: form.category,
          frequency: form.frequency,
          due_date: nextDueDate,
          active: true,
        })

      if (recurringError) {
        console.error('Recurring creation error:', recurringError)
        setError(
          `Expense saved, but recurring setup failed: ${recurringError.message}`,
        )
        setSaving(false)
        await loadExpenses()
        return
      }
    }

    setForm({
      amount: '',
      category: 'food',
      date: new Date().toISOString().split('T')[0],
      description: '',
      paymentMethod: 'upi',
      merchant: '',
      isRecurring: false,
      frequency: 'monthly',
    })

    setShowForm(false)
    setSaving(false)
    await loadExpenses()
  }

  async function deleteExpense(id) {
    setError('')

    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id)

    if (error) {
      console.error(error)
      setError(error.message)
      return
    }

    setExpenses((previous) =>
      previous.filter((expense) => expense.id !== id),
    )
  }

  const nextDueDate = form.isRecurring
    ? addInterval(form.date, form.frequency)
    : ''

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-white">
            Expenses
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Track your real expenses stored securely in your account.
          </p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="rounded-xl bg-emerald-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300"
        >
          {showForm ? 'Cancel' : '+ Add Expense'}
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-300">
          {error}
        </div>
      )}

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add Expense</CardTitle>
          </CardHeader>

          <CardBody>
            <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm text-slate-400">Amount</label>
                <input
                  name="amount"
                  type="number"
                  min="1"
                  step="0.01"
                  value={form.amount}
                  onChange={handleChange}
                  placeholder="₹500"
                  className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-sm text-slate-400">Category</label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-white outline-none"
                >
                  <option value="food">Food</option>
                  <option value="travel">Travel</option>
                  <option value="rent">Rent</option>
                  <option value="shopping">Shopping</option>
                  <option value="subscriptions">Subscriptions</option>
                  <option value="entertainment">Entertainment</option>
                  <option value="books">Books</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="sm:col-span-2 rounded-xl border border-white/8 bg-white/4 p-3">
                <label className="flex cursor-pointer items-center gap-3 text-sm text-slate-200">
                  <input
                    type="checkbox"
                    name="isRecurring"
                    checked={form.isRecurring}
                    onChange={handleChange}
                    className="size-4 rounded border-white/20 bg-white/5"
                  />
                  <span className="font-medium">Make this a recurring expense</span>
                </label>

                <p className="mt-1 ml-7 text-xs text-slate-500">
                  The expense is added now and counts toward this month's budget.
                  The recurring rule is used for future due dates.
                </p>

                {form.isRecurring && (
                  <div className="mt-4 ml-7 rounded-xl border border-emerald-400/20 bg-emerald-400/5 p-3">
                    <div className="flex flex-wrap items-end gap-4">
                      <div>
                        <label className="text-xs text-slate-400">Repeats</label>
                        <select
                          name="frequency"
                          value={form.frequency}
                          onChange={handleChange}
                          className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none sm:w-48"
                        >
                          <option value="weekly">Weekly</option>
                          <option value="monthly">Monthly</option>
                          <option value="yearly">Yearly</option>
                        </select>
                      </div>

                      <div>
                        <p className="text-xs text-slate-400">Next due date</p>
                        <p className="mt-1 text-sm font-semibold text-emerald-300">
                          {nextDueDate ? formatDate(nextDueDate, 'd MMM yyyy') : 'Select a date'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="text-sm text-slate-400">Date</label>
                <input
                  name="date"
                  type="date"
                  value={form.date}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-sm text-slate-400">Payment method</label>
                <select
                  name="paymentMethod"
                  value={form.paymentMethod}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-white outline-none"
                >
                  <option value="upi">UPI</option>
                  <option value="card">Card</option>
                  <option value="cash">Cash</option>
                </select>
              </div>

              <div>
                <label className="text-sm text-slate-400">Description</label>
                <input
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Lunch with friends"
                  className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none"
                />
              </div>

              <div>
                <label className="text-sm text-slate-400">Merchant</label>
                <input
                  name="merchant"
                  value={form.merchant}
                  onChange={handleChange}
                  placeholder="Dominos"
                  className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-400 px-5 py-3 font-semibold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <CheckCircle2 className="size-5" />
                  {saving ? 'Saving...' : 'Save Expense'}
                </button>
              </div>
            </form>
          </CardBody>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Expense history</CardTitle>
        </CardHeader>

        <CardBody className="divide-y divide-white/8 p-0">
          {loading ? (
            <div className="px-5 py-6 text-sm text-slate-400">Loading expenses...</div>
          ) : expenses.length === 0 ? (
            <div className="px-5 py-6 text-sm text-slate-400">
              No expenses yet. Add your first expense above.
            </div>
          ) : (
            expenses.map((expense) => (
              <div
                key={expense.id}
                className="flex items-center justify-between gap-3 px-5 py-4 text-sm"
              >
                <div>
                  <p className="text-white">{expense.description || 'Expense'}</p>
                  <p className="text-xs text-slate-400">
                    {CATEGORY_MAP[expense.category]?.label || expense.category} ·{' '}
                    {formatDate(expense.expense_date)} · {expense.payment_method || '—'}
                  </p>
                  {expense.merchant && (
                    <p className="mt-1 text-xs text-slate-500">{expense.merchant}</p>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <p className="font-medium text-white">{formatINR(expense.amount)}</p>
                  <button
                    onClick={() => deleteExpense(expense.id)}
                    className="text-xs text-red-300 hover:text-red-200"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </CardBody>
      </Card>
    </div>
  )
}

export function BudgetPage() {
  const [amount, setAmount] = useState('')
  const [currentBudget, setCurrentBudget] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const getCurrentMonth = () => {
    const now = new Date()

    return `${now.getFullYear()}-${String(
      now.getMonth() + 1,
    ).padStart(2, '0')}-01`
  }

  async function loadBudget() {
    setLoading(true)
    setError('')

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setError('Please log in first.')
      setLoading(false)
      return
    }

    const month = getCurrentMonth()

    const { data, error } = await supabase
      .from('budgets')
      .select('*')
      .eq('user_id', user.id)
      .eq('month', month)
      .maybeSingle()

    if (error) {
      console.error('Budget loading error:', error)
      setError(error.message)
      setLoading(false)
      return
    }

    if (data) {
      setCurrentBudget(data)
      setAmount(String(data.amount))
    }

    setLoading(false)
  }

  useEffect(() => {
    loadBudget()
  }, [])

  async function saveBudget(e) {
    e.preventDefault()

    setMessage('')
    setError('')

    const numericAmount = Number(amount)

    if (!numericAmount || numericAmount <= 0) {
      setError('Please enter a valid budget amount.')
      return
    }

    setSaving(true)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setError('Please log in first.')
      setSaving(false)
      return
    }

    const month = getCurrentMonth()

    const { data, error } = await supabase
      .from('budgets')
      .upsert(
        {
          user_id: user.id,
          month,
          amount: numericAmount,
        },
        {
          onConflict: 'user_id,month',
        },
      )
      .select()
      .single()

    if (error) {
      console.error('Budget saving error:', error)
      setError(error.message)
      setSaving(false)
      return
    }

    setCurrentBudget(data)
    setAmount(String(data.amount))
    setMessage('Budget saved successfully!')

    setSaving(false)
  }

  return (
    <div className="space-y-6">

      <div>
        <h1 className="font-display text-2xl font-semibold text-white">
          Budget
        </h1>

        <p className="mt-1 text-sm text-slate-400">
          Set your monthly spending limit.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Monthly budget</CardTitle>
        </CardHeader>

        <CardBody>

          <form
            onSubmit={saveBudget}
            className="max-w-md space-y-4"
          >

            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Monthly budget
              </label>

              <div className="flex items-center rounded-xl border border-white/10 bg-white/5">

                <span className="px-3 text-slate-400">
                  ₹
                </span>

                <input
                  type="number"
                  min="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="15000"
                  className="w-full bg-transparent px-3 py-3 text-white outline-none"
                />

              </div>
            </div>

            <button
              type="submit"
              disabled={saving || loading}
              className="rounded-xl bg-violet-500 px-5 py-3 font-medium text-white transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Budget'}
            </button>

            {message && (
              <p className="text-sm text-emerald-400">
                {message}
              </p>
            )}

            {error && (
              <p className="text-sm text-red-400">
                {error}
              </p>
            )}

          </form>

          {currentBudget && (
            <div className="mt-6 rounded-xl bg-white/5 p-4">

              <p className="text-sm text-slate-400">
                Current monthly budget
              </p>

              <p className="mt-1 text-2xl font-semibold text-white">
                ₹{Number(currentBudget.amount).toLocaleString('en-IN')}
              </p>

            </div>
          )}

        </CardBody>
      </Card>

    </div>
  )
}
export function PocketMoneyPage() {
  const [amount, setAmount] = useState('')
  const [currentPocketMoney, setCurrentPocketMoney] = useState(null)
  const [spent, setSpent] = useState(0)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const getCurrentMonth = () => {
    const now = new Date()

    return `${now.getFullYear()}-${String(
      now.getMonth() + 1,
    ).padStart(2, '0')}-01`
  }

  async function loadPocketMoney() {
    setLoading(true)
    setError('')

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setError('Please log in first.')
      setLoading(false)
      return
    }

    const month = getCurrentMonth()

    // Load pocket money
    const { data, error: pocketMoneyError } = await supabase
      .from('pocket_money')
      .select('*')
      .eq('user_id', user.id)
      .eq('month', month)
      .maybeSingle()

    if (pocketMoneyError) {
      console.error('Pocket money loading error:', pocketMoneyError)
      setError(pocketMoneyError.message)
      setLoading(false)
      return
    }

    if (data) {
      setCurrentPocketMoney(data)
      setAmount(String(data.amount))
    }

    // Load this month's expenses
    const startDate = month

    const nextMonthDate = new Date(
      Number(month.slice(0, 4)),
      Number(month.slice(5, 7)),
      1,
    )

    const nextMonth = `${nextMonthDate.getFullYear()}-${String(
      nextMonthDate.getMonth() + 1,
    ).padStart(2, '0')}-01`

    const { data: expenses, error: expensesError } = await supabase
      .from('expenses')
      .select('amount')
      .eq('user_id', user.id)
      .gte('expense_date', startDate)
      .lt('expense_date', nextMonth)

    if (expensesError) {
      console.error('Expense loading error:', expensesError)
      setError(expensesError.message)
    } else {
      const totalSpent =
        expenses?.reduce(
          (total, expense) => total + Number(expense.amount || 0),
          0,
        ) || 0

      setSpent(totalSpent)
    }

    setLoading(false)
  }

  useEffect(() => {
    loadPocketMoney()
  }, [])

  async function savePocketMoney(e) {
    e.preventDefault()

    setMessage('')
    setError('')

    const numericAmount = Number(amount)

    if (!numericAmount || numericAmount <= 0) {
      setError('Please enter a valid pocket money amount.')
      return
    }

    setSaving(true)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setError('Please log in first.')
      setSaving(false)
      return
    }

    const month = getCurrentMonth()

    const { data, error } = await supabase
      .from('pocket_money')
      .upsert(
        {
          user_id: user.id,
          month,
          amount: numericAmount,
        },
        {
          onConflict: 'user_id,month',
        },
      )
      .select()
      .single()

    if (error) {
      console.error('Pocket money saving error:', error)
      setError(error.message)
      setSaving(false)
      return
    }

    setCurrentPocketMoney(data)
    setAmount(String(data.amount))
    setMessage('Pocket money saved successfully!')
    setSaving(false)
  }

  const remaining = Math.max(
    Number(currentPocketMoney?.amount || amount || 0) - spent,
    0,
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-white">
          Pocket Money
        </h1>

        <p className="mt-1 text-sm text-slate-400">
          Set your monthly pocket money and track what remains.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-300">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Monthly pocket money</CardTitle>
        </CardHeader>

        <CardBody>
          <form
            onSubmit={savePocketMoney}
            className="max-w-md space-y-4"
          >
            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Monthly pocket money
              </label>

              <div className="flex items-center rounded-xl border border-white/10 bg-white/5">
                <span className="px-3 text-slate-400">
                  ₹
                </span>

                <input
                  type="number"
                  min="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="10000"
                  className="w-full bg-transparent px-3 py-3 text-white outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={saving || loading}
              className="rounded-xl bg-emerald-400 px-5 py-3 font-medium text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Pocket Money'}
            </button>

            {message && (
              <p className="text-sm text-emerald-400">
                {message}
              </p>
            )}
          </form>
        </CardBody>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardBody>
            <p className="text-sm text-slate-400">
              Monthly pocket money
            </p>

            <p className="mt-2 text-2xl font-semibold text-white">
              ₹{Number(
                currentPocketMoney?.amount || amount || 0,
              ).toLocaleString('en-IN')}
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <p className="text-sm text-slate-400">
              Spent this month
            </p>

            <p className="mt-2 text-2xl font-semibold text-white">
              ₹{spent.toLocaleString('en-IN')}
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <p className="text-sm text-slate-400">
              Remaining
            </p>

            <p className="mt-2 text-2xl font-semibold text-emerald-400">
              ₹{remaining.toLocaleString('en-IN')}
            </p>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
export function RecurringPage() {
  const [recurring, setRecurring] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({
    name: '',
    amount: '',
    category: 'subscriptions',
    dueDate: '',
    frequency: 'monthly',
  })
  const [savingEdit, setSavingEdit] = useState(false)

  async function loadRecurring() {
    setLoading(true)
    setError('')

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setError('Please log in to view recurring expenses.')
      setLoading(false)
      return
    }

    const { data, error } = await supabase
      .from('recurring_expenses')
      .select('*')
      .eq('user_id', user.id)
      .order('due_date', { ascending: true })

    if (error) {
      console.error('Recurring loading error:', error)
      setError(error.message)
    } else {
      setRecurring(data || [])
    }

    setLoading(false)
  }

  useEffect(() => {
    loadRecurring()
  }, [])

  function startEditing(item) {
    setError('')
    setEditingId(item.id)
    setEditForm({
      name: item.name || '',
      amount: String(item.amount ?? ''),
      category: item.category || 'subscriptions',
      dueDate: item.due_date || '',
      frequency: item.frequency || 'monthly',
    })
  }

  function cancelEditing() {
    setEditingId(null)
    setEditForm({
      name: '',
      amount: '',
      category: 'subscriptions',
      dueDate: '',
      frequency: 'monthly',
    })
  }

  function handleEditChange(event) {
    const { name, value } = event.target
    setEditForm((previous) => ({
      ...previous,
      [name]: value,
    }))
  }

  async function saveEdit(event, item) {
    event.preventDefault()
    setError('')

    const amount = Number(editForm.amount)

    if (!editForm.name.trim()) {
      setError('Please enter a recurring expense name.')
      return
    }

    if (!amount || amount <= 0) {
      setError('Please enter a valid amount.')
      return
    }

    if (!editForm.dueDate) {
      setError('Please select the next due date.')
      return
    }

    setSavingEdit(true)

    const { data, error } = await supabase
      .from('recurring_expenses')
      .update({
        name: editForm.name.trim(),
        amount,
        category: editForm.category,
        frequency: editForm.frequency,
        due_date: editForm.dueDate,
      })
      .eq('id', item.id)
      .select()
      .single()

    if (error) {
      console.error('Recurring update error:', error)
      setError(error.message)
      setSavingEdit(false)
      return
    }

    setRecurring((previous) =>
      previous.map((expense) =>
        expense.id === item.id ? data : expense,
      ),
    )

    cancelEditing()
    setSavingEdit(false)
  }

  async function toggleActive(item) {
    setError('')

    const { error } = await supabase
      .from('recurring_expenses')
      .update({
        active: !item.active,
      })
      .eq('id', item.id)

    if (error) {
      console.error('Recurring status error:', error)
      setError(error.message)
      return
    }

    setRecurring((previous) =>
      previous.map((expense) =>
        expense.id === item.id
          ? {
              ...expense,
              active: !item.active,
            }
          : expense,
      ),
    )
  }

  async function deleteRecurring(id) {
    setError('')

    const { error } = await supabase
      .from('recurring_expenses')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Recurring deletion error:', error)
      setError(error.message)
      return
    }

    setRecurring((previous) =>
      previous.filter((item) => item.id !== id),
    )
  }

  const activeRecurring = recurring.filter((item) => item.active)

  const monthlyRecurringTotal = activeRecurring.reduce(
    (total, item) => {
      const amount = Number(item.amount || 0)

      if (item.frequency === 'weekly') {
        return total + amount * 4.33
      }

      if (item.frequency === 'yearly') {
        return total + amount / 12
      }

      return total + amount
    },
    0,
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-white">
            Recurring Expenses
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Manage recurring expenses created from the Expense page.
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardBody>
            <p className="text-sm text-slate-400">Active recurring</p>
            <p className="mt-2 text-2xl font-semibold text-white">
              {activeRecurring.length}
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <p className="text-sm text-slate-400">Estimated monthly</p>
            <p className="mt-2 text-2xl font-semibold text-emerald-400">
              {formatINR(monthlyRecurringTotal)}
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <p className="text-sm text-slate-400">How to add</p>
            <p className="mt-2 text-sm font-medium text-white">
              Expense → Make recurring
            </p>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your recurring expenses</CardTitle>
        </CardHeader>

        <CardBody className="space-y-4">
          {loading ? (
            <p className="text-sm text-slate-400">
              Loading recurring expenses...
            </p>
          ) : recurring.length === 0 ? (
            <div className="rounded-xl bg-white/5 p-5">
              <p className="text-white">No recurring expenses yet.</p>
              <p className="mt-1 text-sm text-slate-400">
                To create one, go to the Expense page and check “Make this a recurring expense”.
              </p>
            </div>
          ) : (
            recurring.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-white/8 bg-white/4 p-5"
              >
                {editingId === item.id ? (
                  <form onSubmit={(event) => saveEdit(event, item)} className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="text-xs text-slate-400">Name</label>
                        <input
                          name="name"
                          value={editForm.name}
                          onChange={handleEditChange}
                          className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-xs text-slate-400">Amount</label>
                        <input
                          name="amount"
                          type="number"
                          min="1"
                          step="0.01"
                          value={editForm.amount}
                          onChange={handleEditChange}
                          className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-xs text-slate-400">Category</label>
                        <select
                          name="category"
                          value={editForm.category}
                          onChange={handleEditChange}
                          className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-white outline-none"
                        >
                          <option value="food">Food</option>
                          <option value="travel">Travel</option>
                          <option value="rent">Rent</option>
                          <option value="shopping">Shopping</option>
                          <option value="subscriptions">Subscriptions</option>
                          <option value="entertainment">Entertainment</option>
                          <option value="books">Books</option>
                          <option value="other">Other</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-xs text-slate-400">Frequency</label>
                        <select
                          name="frequency"
                          value={editForm.frequency}
                          onChange={handleEditChange}
                          className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-white outline-none"
                        >
                          <option value="weekly">Weekly</option>
                          <option value="monthly">Monthly</option>
                          <option value="yearly">Yearly</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-xs text-slate-400">Next due date</label>
                        <input
                          name="dueDate"
                          type="date"
                          value={editForm.dueDate}
                          onChange={handleEditChange}
                          className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <button
                        type="submit"
                        disabled={savingEdit}
                        className="rounded-xl bg-emerald-400 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-300 disabled:opacity-50"
                      >
                        {savingEdit ? 'Saving...' : 'Save changes'}
                      </button>
                      <button
                        type="button"
                        onClick={cancelEditing}
                        className="rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-300 hover:bg-white/5"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-3">
                          <div
                            className={`size-2 rounded-full ${
                              item.active ? 'bg-emerald-400' : 'bg-slate-600'
                            }`}
                          />
                          <h3 className="font-medium text-white">{item.name}</h3>
                          {!item.active && (
                            <span className="rounded-full bg-slate-700 px-2 py-1 text-xs text-slate-300">
                              Inactive
                            </span>
                          )}
                        </div>

                        <p className="mt-2 text-sm text-slate-400">
                          {CATEGORY_MAP[item.category]?.label || item.category} · {item.frequency}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          Next due:{' '}
                          {item.due_date
                            ? formatDate(item.due_date, 'd MMM yyyy')
                            : 'Not set'}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-lg font-semibold text-white">
                          {formatINR(item.amount)}
                        </p>
                        <p className="text-xs text-slate-500">per {item.frequency}</p>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-4 border-t border-white/5 pt-4">
                      <button
                        onClick={() => startEditing(item)}
                        className="flex items-center gap-1 text-sm font-medium text-sky-300 hover:text-sky-200"
                      >
                        <Pencil className="size-4" />
                        Edit
                      </button>

                      <button
                        onClick={() => toggleActive(item)}
                        className="text-sm font-medium text-emerald-300 hover:text-emerald-200"
                      >
                        {item.active ? 'Deactivate' : 'Activate'}
                      </button>

                      <button
                        onClick={() => deleteRecurring(item.id)}
                        className="text-sm text-red-300 hover:text-red-200"
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </CardBody>
      </Card>

      <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
        <p className="text-sm font-medium text-white">💡 How recurring expenses work</p>
        <p className="mt-1 text-xs leading-5 text-slate-500">
          Create the expense from the Expense page. The first expense is saved immediately,
          so it counts in your budget. Checking “Make this a recurring expense” also creates
          the recurring rule and shows its next due date here. This page is only for editing,
          activating/deactivating, and deleting existing recurring rules.
        </p>
      </div>
    </div>
  )
}

export function SavingsPage() {
  const [goals, setGoals] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [showForm, setShowForm] = useState(false)

  const [form, setForm] = useState({
    name: '',
    targetAmount: '',
    savedAmount: '',
    targetDate: '',
  })

  async function loadGoals() {
    setLoading(true)
    setError('')

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setError('Please log in first.')
      setLoading(false)
      return
    }

    const { data, error } = await supabase
      .from('savings_goals')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Savings loading error:', error)
      setError(error.message)
    } else {
      setGoals(data || [])
    }

    setLoading(false)
  }

  useEffect(() => {
    loadGoals()
  }, [])

  function handleChange(e) {
    const { name, value } = e.target

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }))
  }

  async function handleSubmit(e) {
    e.preventDefault()

    setError('')
    setMessage('')

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setError('Please log in first.')
      return
    }

    const targetAmount = Number(form.targetAmount)
    const savedAmount = Number(form.savedAmount || 0)

    if (!form.name.trim()) {
      setError('Please enter a goal name.')
      return
    }

    if (!targetAmount || targetAmount <= 0) {
      setError('Please enter a valid target amount.')
      return
    }

    if (savedAmount < 0) {
      setError('Saved amount cannot be negative.')
      return
    }

    if (savedAmount > targetAmount) {
      setError('Saved amount cannot be greater than target amount.')
      return
    }

    setSaving(true)

    const { data, error } = await supabase
  .from('savings_goals')
  .insert({
    user_id: user.id,
    name: form.name.trim(),
    target_amount: targetAmount,
    saved_amount: savedAmount,
    target_date: form.targetDate || null,
  })
  .select()
  .single()

if (error) {
  console.error('CREATE GOAL ERROR:', error)
  setError(error.message)
  return
}

console.log('GOAL CREATED:', data)

setForm({
  name: '',
  targetAmount: '',
  savedAmount: '',
  targetDate: '',
})

setShowForm(false)

await loadGoals()
      .select()
      .single()

    if (error) {
      console.error('Savings insert error:', error)
      setError(error.message)
      setSaving(false)
      return
    }

    console.log('Savings goal created:', data)

    setForm({
      name: '',
      targetAmount: '',
      savedAmount: '',
      targetDate: '',
    })

    setShowForm(false)
    setMessage('Savings goal created successfully!')
    setSaving(false)

    loadGoals()
  }

  async function addContribution(goal) {
    const amountText = window.prompt(
      `How much do you want to add to "${goal.name}"?`,
    )

    if (amountText === null) return

    const amount = Number(amountText)
    const currentSaved = Number(goal.saved_amount || 0)
    const target = Number(goal.target_amount)

    if (!amount || amount <= 0) {
      setError('Please enter a valid amount.')
      return
    }

    if (currentSaved + amount > target) {
      setError(
        `You only need ${formatINR(
          target - currentSaved,
        )} more to reach this goal.`,
      )
      return
    }

    const { error } = await supabase
      .from('savings_goals')
      .update({
        saved_amount: currentSaved + amount,
      })
      .eq('id', goal.id)
      .eq('user_id', goal.user_id)

    if (error) {
      console.error('Contribution error:', error)
      setError(error.message)
      return
    }

    setError('')
    setMessage('Money added successfully!')
    loadGoals()
  }

  async function deleteGoal(id) {
    const { error } = await supabase
      .from('savings_goals')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Delete goal error:', error)
      setError(error.message)
      return
    }

    setGoals((previous) =>
      previous.filter((goal) => goal.id !== id),
    )

    setMessage('Savings goal deleted.')
  }

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-white">
            Savings goals
          </h1>

          <p className="mt-1 text-sm text-slate-400">
            Save towards the things that matter to you.
          </p>
        </div>

        <button
          onClick={() => {
            setShowForm(!showForm)
            setError('')
            setMessage('')
          }}
          className="rounded-xl bg-emerald-400 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-300"
        >
          {showForm ? 'Cancel' : '+ Add Goal'}
        </button>
      </div>

      {/* MESSAGES */}
      {error && (
        <div className="rounded-xl border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-300">
          {error}
        </div>
      )}

      {message && (
        <div className="rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-4 text-sm text-emerald-300">
          {message}
        </div>
      )}

      {/* ADD GOAL FORM */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create savings goal</CardTitle>
          </CardHeader>

          <CardBody>
            <form
              onSubmit={handleSubmit}
              className="grid gap-4 sm:grid-cols-2"
            >
              <div>
                <label className="text-sm text-slate-400">
                  Goal name
                </label>

                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="New Laptop"
                  className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-sm text-slate-400">
                  Target amount
                </label>

                <input
                  name="targetAmount"
                  type="number"
                  min="1"
                  step="0.01"
                  value={form.targetAmount}
                  onChange={handleChange}
                  placeholder="80000"
                  className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-sm text-slate-400">
                  Already saved
                </label>

                <input
                  name="savedAmount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.savedAmount}
                  onChange={handleChange}
                  placeholder="10000"
                  className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none"
                />
              </div>

              <div>
                <label className="text-sm text-slate-400">
                  Target date
                </label>

                <input
                  name="targetDate"
                  type="date"
                  value={form.targetDate}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-emerald-400 px-5 py-2 font-semibold text-slate-950 hover:bg-emerald-300 disabled:opacity-50"
                >
                  {saving ? 'Creating...' : 'Create Goal'}
                </button>
              </div>
            </form>
          </CardBody>
        </Card>
      )}

      {/* GOALS */}
      <Card>
        <CardHeader>
          <CardTitle>Your savings goals</CardTitle>
        </CardHeader>

        <CardBody className="space-y-4">
          {loading ? (
            <p className="text-sm text-slate-400">
              Loading savings goals...
            </p>
          ) : goals.length === 0 ? (
            <div className="rounded-xl bg-white/5 p-5">
              <p className="text-white">
                No savings goals yet.
              </p>

              <p className="mt-1 text-sm text-slate-400">
                Click "+ Add Goal" to create one.
              </p>
            </div>
          ) : (
            goals.map((goal) => {
              const target = Number(goal.target_amount || 0)
              const saved = Number(goal.saved_amount || 0)

              const remaining = Math.max(
                target - saved,
                0,
              )

              const progress =
                target > 0
                  ? Math.min((saved / target) * 100, 100)
                  : 0

              return (
                <div
                  key={goal.id}
                  className="rounded-2xl border border-white/8 bg-white/4 p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="font-medium text-white">
                        {goal.name}
                      </h3>

                      {goal.target_date && (
                        <p className="mt-1 text-xs text-slate-400">
                          Target date:{' '}
                          {formatDate(
                            goal.target_date,
                            'd MMM yyyy',
                          )}
                        </p>
                      )}
                    </div>

                    <div className="text-right">
                      <p className="font-semibold text-white">
                        {formatINR(saved)}
                      </p>

                      <p className="text-xs text-slate-400">
                        of {formatINR(target)}
                      </p>
                    </div>
                  </div>

                  <Progress
                    value={progress}
                    className="mt-4"
                  />

                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm text-slate-400">
                      {progress.toFixed(0)}% complete ·{' '}
                      {formatINR(remaining)} remaining
                    </p>

                    <div className="flex gap-3">
                      {saved < target && (
                        <button
                          onClick={() =>
                            addContribution(goal)
                          }
                          className="text-sm font-medium text-emerald-300 hover:text-emerald-200"
                        >
                          + Add money
                        </button>
                      )}

                      <button
                        onClick={() =>
                          deleteGoal(goal.id)
                        }
                        className="text-sm text-red-300 hover:text-red-200"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </CardBody>
      </Card>
    </div>
  )
}

export function SplitsPage() {
  const [title, setTitle] = useState('')
  const [participants, setParticipants] = useState([
    { name: '', paid: '' },
    { name: '', paid: '' },
  ])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [history, setHistory] = useState([])
  const [loadingHistory, setLoadingHistory] = useState(true)

  async function loadHistory() {
    setLoadingHistory(true)
    const { data: splits, error: splitsError } = await supabase
      .from('bill_splits')
      .select('*')
      .order('created_at', { ascending: false })

    if (splitsError) {
      console.error(splitsError)
      setLoadingHistory(false)
      return
    }

    const withParticipants = await Promise.all(
      (splits || []).map(async (split) => {
        const { data: people } = await supabase
          .from('bill_participants')
          .select('*')
          .eq('bill_split_id', split.id)
        return { ...split, participants: people || [] }
      }),
    )

    setHistory(withParticipants)
    setLoadingHistory(false)
  }

  useEffect(() => {
    loadHistory()
  }, [])

  function updateParticipant(index, field, value) {
    setParticipants((previous) =>
      previous.map((p, i) => (i === index ? { ...p, [field]: value } : p)),
    )
  }

  function addParticipant() {
    setParticipants((previous) => [...previous, { name: '', paid: '' }])
  }

  function removeParticipant(index) {
    setParticipants((previous) => previous.filter((_, i) => i !== index))
  }

  const validParticipants = participants
    .map((p) => ({ name: p.name.trim(), paid: Number(p.paid) || 0 }))
    .filter((p) => p.name)

  const total = validParticipants.reduce((sum, p) => sum + p.paid, 0)
  const share = validParticipants.length ? total / validParticipants.length : 0

  const balances = validParticipants.map((p) => ({
    name: p.name,
    paid: p.paid,
    balance: Math.round((p.paid - share) * 100) / 100,
  }))

  const settlement = computeSettlement(balances)

  async function handleSave(event) {
    event.preventDefault()
    setError('')

    if (!title.trim()) {
      setError('Give the split a title, like "Dinner at Dominos".')
      return
    }
    if (validParticipants.length < 2) {
      setError('Add at least 2 people.')
      return
    }
    if (total <= 0) {
      setError('At least one person needs to have paid something.')
      return
    }

    setSaving(true)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setError('Please log in first.')
      setSaving(false)
      return
    }

    const { data: split, error: splitError } = await supabase
      .from('bill_splits')
      .insert({ user_id: user.id, title: title.trim(), total_amount: total })
      .select()
      .single()

    if (splitError) {
      setError(splitError.message)
      setSaving(false)
      return
    }

    const rows = validParticipants.map((p) => ({
      bill_split_id: split.id,
      name: p.name,
      paid_amount: p.paid,
      share_amount: Math.round(share * 100) / 100,
    }))

    const { error: participantsError } = await supabase.from('bill_participants').insert(rows)

    if (participantsError) {
      setError(participantsError.message)
      setSaving(false)
      return
    }

    setTitle('')
    setParticipants([{ name: '', paid: '' }, { name: '', paid: '' }])
    setSaving(false)
    loadHistory()
  }

  async function handleDeleteSplit(id) {
    await supabase.from('bill_splits').delete().eq('id', id)
    setHistory((previous) => previous.filter((s) => s.id !== id))
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-white">Split bills</h1>
        <p className="mt-1 text-sm text-slate-400">
          Enter what each person actually paid — everyone's fair share and who owes whom is calculated
          automatically. No real-money transfers happen here.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-300">{error}</div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>New split</CardTitle>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="text-sm text-slate-400">Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Dinner at Dominos"
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none"
              />
            </div>

            <div className="space-y-3">
              <label className="text-sm text-slate-400">Who paid what</label>
              {participants.map((p, i) => (
                <div key={i} className="flex gap-3">
                  <input
                    value={p.name}
                    onChange={(e) => updateParticipant(i, 'name', e.target.value)}
                    placeholder={`Person ${i + 1} name`}
                    className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none"
                  />
                  <input
                    value={p.paid}
                    onChange={(e) => updateParticipant(i, 'paid', e.target.value)}
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Amount paid"
                    className="w-40 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none"
                  />
                  {participants.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeParticipant(i)}
                      className="text-xs text-red-300 hover:text-red-200"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addParticipant}
                className="text-xs text-emerald-300 hover:text-emerald-200"
              >
                + Add another person
              </button>
            </div>

            {validParticipants.length >= 2 && total > 0 && (
              <div className="rounded-xl border border-white/8 bg-white/4 p-4 text-sm">
                <p className="text-slate-300">
                  Total: <span className="font-semibold text-white">{formatINR(total)}</span> · Fair share each:{' '}
                  <span className="font-semibold text-white">{formatINR(share)}</span>
                </p>
                <div className="mt-3 space-y-1">
                  {settlement.length === 0 ? (
                    <p className="text-emerald-300">Everyone's even — no one owes anything.</p>
                  ) : (
                    settlement.map((s, i) => (
                      <p key={i} className="text-slate-300">
                        <span className="text-white">{s.from}</span> owes{' '}
                        <span className="text-white">{s.to}</span>{' '}
                        <span className="font-semibold text-emerald-300">{formatINR(s.amount)}</span>
                      </p>
                    ))
                  )}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-emerald-400 px-5 py-2 font-semibold text-slate-950 transition hover:bg-emerald-300 disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save split'}
            </button>
          </form>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Past splits</CardTitle>
        </CardHeader>
        <CardBody className="divide-y divide-white/8 p-0">
          {loadingHistory ? (
            <p className="p-5 text-sm text-slate-400">Loading…</p>
          ) : history.length === 0 ? (
            <p className="p-5 text-sm text-slate-400">No splits saved yet.</p>
          ) : (
            history.map((split) => {
              const splitBalances = split.participants.map((p) => ({
                name: p.name,
                paid: Number(p.paid_amount),
                balance: Math.round((Number(p.paid_amount) - Number(p.share_amount)) * 100) / 100,
              }))
              const splitSettlement = computeSettlement(splitBalances)
              return (
                <div key={split.id} className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-white">{split.title}</p>
                      <p className="text-xs text-slate-400">
                        {formatINR(split.total_amount)} · {split.participants.length} people
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteSplit(split.id)}
                      className="text-xs text-red-300 hover:text-red-200"
                    >
                      Delete
                    </button>
                  </div>
                  <div className="mt-2 space-y-1 text-sm">
                    {splitSettlement.length === 0 ? (
                      <p className="text-emerald-300">Everyone's even.</p>
                    ) : (
                      splitSettlement.map((s, i) => (
                        <p key={i} className="text-slate-300">
                          {s.from} owes {s.to} <span className="text-emerald-300">{formatINR(s.amount)}</span>
                        </p>
                      ))
                    )}
                  </div>
                </div>
              )
            })
          )}
        </CardBody>
      </Card>
    </div>
  )
}

// Greedy settlement: match whoever owes the most against whoever is owed the most,
// repeating until everyone's balance is (near) zero. Minimizes number of transfers.
function computeSettlement(balances) {
  const debtors = balances.filter((b) => b.balance < -0.01).map((b) => ({ ...b })).sort((a, b) => a.balance - b.balance)
  const creditors = balances.filter((b) => b.balance > 0.01).map((b) => ({ ...b })).sort((a, b) => b.balance - a.balance)

  const transfers = []
  let i = 0
  let j = 0

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i]
    const creditor = creditors[j]
    const amount = Math.min(-debtor.balance, creditor.balance)

    if (amount > 0.01) {
      transfers.push({ from: debtor.name, to: creditor.name, amount: Math.round(amount * 100) / 100 })
    }

    debtor.balance += amount
    creditor.balance -= amount

    if (Math.abs(debtor.balance) < 0.01) i += 1
    if (Math.abs(creditor.balance) < 0.01) j += 1
  }

  return transfers
}
export function InsightsPage() {
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function loadInsights() {
    setLoading(true)
    setError('')

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setError('Please log in to view your insights.')
      setLoading(false)
      return
    }

    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', user.id)
      .order('expense_date', { ascending: false })

    if (error) {
      console.error('Insights loading error:', error)
      setError(error.message)
      setLoading(false)
      return
    }

    setExpenses(data || [])
    setLoading(false)
  }

  useEffect(() => {
    loadInsights()
  }, [])

  // -----------------------------
  // CURRENT MONTH
  // -----------------------------

  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth()

  const monthlyExpenses = expenses.filter((expense) => {
    const date = new Date(
      `${expense.expense_date}T00:00:00`,
    )

    return (
      date.getFullYear() === currentYear &&
      date.getMonth() === currentMonth
    )
  })

  // -----------------------------
  // TOTAL SPENDING
  // -----------------------------

  const totalSpent = monthlyExpenses.reduce(
    (total, expense) =>
      total + Number(expense.amount || 0),
    0,
  )

  // -----------------------------
  // CATEGORY TOTALS
  // -----------------------------

  const categoryTotals = {}

  for (const expense of monthlyExpenses) {
    const category = expense.category || 'other'

    categoryTotals[category] =
      (categoryTotals[category] || 0) +
      Number(expense.amount || 0)
  }

  const categoryList = Object.entries(categoryTotals)
    .map(([id, amount]) => ({
      id,
      label:
        CATEGORY_MAP[id]?.label || id,
      amount,
    }))
    .sort((a, b) => b.amount - a.amount)

  const topCategory = categoryList[0]

  // -----------------------------
  // DAILY SPENDING
  // -----------------------------

  const dailyTotals = {}

  for (const expense of monthlyExpenses) {
    const day = expense.expense_date

    dailyTotals[day] =
      (dailyTotals[day] || 0) +
      Number(expense.amount || 0)
  }

  const dailyList = Object.entries(dailyTotals)
    .map(([date, amount]) => ({
      date,
      amount,
    }))
    .sort((a, b) => b.amount - a.amount)

  const highestSpendingDay = dailyList[0]

  // -----------------------------
  // AVERAGE DAILY SPENDING
  // -----------------------------

  const daysWithSpending = dailyList.length

  const averageDaily =
    daysWithSpending > 0
      ? totalSpent / daysWithSpending
      : 0

  // -----------------------------
  // TOP CATEGORY PERCENTAGE
  // -----------------------------

  const topCategoryPercentage =
    totalSpent > 0 && topCategory
      ? (topCategory.amount / totalSpent) * 100
      : 0

  // -----------------------------
  // INSIGHT MESSAGE
  // -----------------------------

  let mainInsight =
    'Start adding expenses to generate personalized insights.'

  if (totalSpent > 0 && topCategory) {
    mainInsight = `Your highest spending category this month is ${topCategory.label}, accounting for ${topCategoryPercentage.toFixed(
      0,
    )}% of your total spending.`
  }

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-white">
            AI insights
          </h1>

          <p className="mt-1 text-sm text-slate-400">
            Understand your spending habits using your real expense data.
          </p>
        </div>

        <button
          onClick={loadInsights}
          className="rounded-xl bg-emerald-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300"
        >
          Refresh
        </button>
      </div>

      {/* ERROR */}
      {error && (
        <div className="rounded-xl border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-300">
          {error}
        </div>
      )}

      {/* LOADING */}
      {loading ? (
        <Card>
          <CardBody>
            <p className="text-sm text-slate-400">
              Analysing your expenses...
            </p>
          </CardBody>
        </Card>
      ) : (
        <>
          {/* SUMMARY CARDS */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

            <Card>
              <CardBody>
                <p className="text-sm text-slate-400">
                  This month
                </p>

                <p className="mt-2 text-2xl font-semibold text-white">
                  {formatINR(totalSpent)}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Total spending
                </p>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <p className="text-sm text-slate-400">
                  Top category
                </p>

                <p className="mt-2 text-xl font-semibold text-white">
                  {topCategory
                    ? topCategory.label
                    : 'No data'}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  {topCategory
                    ? formatINR(topCategory.amount)
                    : 'Add expenses'}
                </p>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <p className="text-sm text-slate-400">
                  Average per day
                </p>

                <p className="mt-2 text-2xl font-semibold text-white">
                  {formatINR(averageDaily)}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Based on days with spending
                </p>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <p className="text-sm text-slate-400">
                  Highest spending day
                </p>

                <p className="mt-2 text-xl font-semibold text-white">
                  {highestSpendingDay
                    ? formatINR(
                        highestSpendingDay.amount,
                      )
                    : 'No data'}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  {highestSpendingDay
                    ? formatDate(
                        highestSpendingDay.date,
                        'd MMM yyyy',
                      )
                    : 'Add expenses'}
                </p>
              </CardBody>
            </Card>

          </div>

          {/* MAIN INSIGHT */}
          <Card>
            <CardHeader>
              <CardTitle>
                Your spending insight
              </CardTitle>
            </CardHeader>

            <CardBody>
              <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-5">

                <p className="text-base leading-7 text-slate-200">
                  {mainInsight}
                </p>

                {topCategory && (
                  <p className="mt-3 text-sm text-slate-400">
                    Consider reviewing your{' '}
                    {topCategory.label.toLowerCase()}{' '}
                    expenses and setting a limit if this
                    category is taking up more of your
                    budget than expected.
                  </p>
                )}

              </div>
            </CardBody>
          </Card>

          {/* CATEGORY BREAKDOWN */}
          <Card>
            <CardHeader>
              <CardTitle>
                Spending breakdown
              </CardTitle>
            </CardHeader>

            <CardBody className="space-y-4">

              {categoryList.length === 0 ? (
                <div className="rounded-xl bg-white/5 p-5">
                  <p className="text-white">
                    No expenses this month.
                  </p>

                  <p className="mt-1 text-sm text-slate-400">
                    Add some expenses to generate insights.
                  </p>
                </div>
              ) : (
                categoryList.map((category) => {
                  const percentage =
                    totalSpent > 0
                      ? (category.amount /
                          totalSpent) *
                        100
                      : 0

                  return (
                    <div key={category.id}>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-300">
                          {category.label}
                        </span>

                        <span className="text-white">
                          {formatINR(
                            category.amount,
                          )}
                        </span>
                      </div>

                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/5">
                        <div
                          className="h-full rounded-full bg-emerald-400 transition-all"
                          style={{
                            width: `${Math.min(
                              percentage,
                              100,
                            )}%`,
                          }}
                        />
                      </div>

                      <p className="mt-1 text-xs text-slate-500">
                        {percentage.toFixed(0)}% of total
                      </p>

                    </div>
                  )
                })
              )}

            </CardBody>
          </Card>

          {/* SMART SUGGESTIONS */}
          <Card>
            <CardHeader>
              <CardTitle>
                Smart suggestions
              </CardTitle>
            </CardHeader>

            <CardBody className="space-y-3">

              {totalSpent === 0 ? (
                <div className="rounded-xl bg-white/5 p-4">
                  <p className="text-sm text-slate-300">
                    Add your first expense to start
                    receiving spending suggestions.
                  </p>
                </div>
              ) : (
                <>
                  {topCategory && (
                    <div className="rounded-xl bg-white/5 p-4">
                      <p className="font-medium text-white">
                        Watch your {topCategory.label.toLowerCase()} spending
                      </p>

                      <p className="mt-1 text-sm text-slate-400">
                        It is currently your largest
                        spending category this month.
                      </p>
                    </div>
                  )}

                  {averageDaily > 0 && (
                    <div className="rounded-xl bg-white/5 p-4">
                      <p className="font-medium text-white">
                        Track your daily average
                      </p>

                      <p className="mt-1 text-sm text-slate-400">
                        You are averaging{' '}
                        {formatINR(averageDaily)} per
                        spending day this month.
                      </p>
                    </div>
                  )}

                  {highestSpendingDay && (
                    <div className="rounded-xl bg-white/5 p-4">
                      <p className="font-medium text-white">
                        Review your highest-spending day
                      </p>

                      <p className="mt-1 text-sm text-slate-400">
                        You spent{' '}
                        {formatINR(
                          highestSpendingDay.amount,
                        )}{' '}
                        on{' '}
                        {formatDate(
                          highestSpendingDay.date,
                          'd MMM yyyy',
                        )}
                        .
                      </p>
                    </div>
                  )}
                </>
              )}

            </CardBody>
          </Card>

          {/* DISCLAIMER */}
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 text-xs text-slate-500">
            These insights are calculated from your recorded
            expenses. They are estimates and are not financial
            advice.
          </div>
        </>
      )}

    </div>
  )
}



export function ChatPage() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: 'Hi! 👋 I can help you understand your spending.',
    },
  ])

  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)

  async function sendMessage(event) {
    event.preventDefault()

    const text = input.trim()
    if (!text || sending) return

    setMessages((previous) => [...previous, { role: 'user', text }])
    setInput('')
    setSending(true)

    try {
      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: { message: text },
      })

      if (error) throw error
      if (data?.error) throw new Error(data.error)

      setMessages((previous) => [
        ...previous,
        { role: 'assistant', text: data.reply },
      ])
    } catch (err) {
      console.error(err)
      let detail = err.message
      if (err.context) {
        try {
          const body = await err.context.json()
          detail = body.error || detail
        } catch {
          // response wasn't JSON, fall back to err.message
        }
      }
      setMessages((previous) => [
        ...previous,
        {
          role: 'assistant',
          text: `Sorry, something went wrong: ${detail}`,
        },
      ])
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-white">AI chat</h1>
        <p className="mt-1 text-sm text-slate-400">Ask questions about your spending and savings.</p>
      </div>

      <Card>
        <CardBody>
          <div className="flex min-h-[500px] flex-col">
            <div className="flex-1 space-y-4 overflow-y-auto">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={message.role === 'user' ? 'flex justify-end' : 'flex justify-start'}
                >
                  <div
                    className={
                      message.role === 'user'
                        ? 'max-w-[80%] rounded-2xl rounded-br-md bg-emerald-400 px-4 py-3 text-sm font-medium text-slate-950'
                        : 'max-w-[80%] rounded-2xl rounded-bl-md border border-white/8 bg-white/5 px-4 py-3 text-sm text-slate-200'
                    }
                  >
                    {message.text}
                  </div>
                </div>
              ))}
              {sending && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] rounded-2xl rounded-bl-md border border-white/8 bg-white/5 px-4 py-3 text-sm text-slate-400">
                    Thinking…
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={sendMessage} className="mt-6 flex gap-3">
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask something..."
                disabled={sending}
                className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-emerald-400/50"
              />

              <button
                type="submit"
                disabled={sending || !input.trim()}
                className="rounded-xl bg-emerald-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300 disabled:opacity-50"
              >
                Send
              </button>
            </form>
          </div>
        </CardBody>
      </Card>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setInput('Where am I spending the most?')}
          className="rounded-xl border border-white/8 bg-white/4 px-3 py-2 text-xs text-slate-300 hover:bg-white/8 hover:text-white"
        >
          Where am I spending the most?
        </button>

        <button
          type="button"
          onClick={() => setInput('How much did I spend this month?')}
          className="rounded-xl border border-white/8 bg-white/4 px-3 py-2 text-xs text-slate-300 hover:bg-white/8 hover:text-white"
        >
          How much did I spend?
        </button>

        <button
          type="button"
          onClick={() => setInput('How can I save money?')}
          className="rounded-xl border border-white/8 bg-white/4 px-3 py-2 text-xs text-slate-300 hover:bg-white/8 hover:text-white"
        >
          How can I save money?
        </button>
      </div>
    </div>
  )
}



export function ScanPage() {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)

  const [cameraOpen, setCameraOpen] = useState(false)
  const [image, setImage] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [form, setForm] = useState({
    merchant: '',
    amount: '',
    category: 'misc',
    expenseDate: new Date().toISOString().split('T')[0],
    description: '',
    note: '',
    paymentMethod: 'UPI',
  })

  // -----------------------------
  // START CAMERA
  // -----------------------------

  async function startCamera() {
    setError('')
    setSuccess('')

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
        },
        audio: false,
      })

      streamRef.current = stream
      setCameraOpen(true)

      // Give React time to render the video element
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
      }, 100)
    } catch (cameraError) {
      console.error('Camera error:', cameraError)

      setError(
        'Camera could not be opened. Please allow camera permission in your browser.'
      )
    }
  }

  // -----------------------------
  // STOP CAMERA
  // -----------------------------

  function stopCamera() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop()
      })

      streamRef.current = null
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null
    }

    setCameraOpen(false)
  }

  // -----------------------------
  // CAPTURE PHOTO
  // -----------------------------

  function capturePhoto() {
    if (!videoRef.current || !canvasRef.current) {
      setError('Camera is not ready yet.')
      return
    }

    const video = videoRef.current
    const canvas = canvasRef.current

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    const context = canvas.getContext('2d')

    if (!context) {
      setError('Could not capture the photo.')
      return
    }

    context.drawImage(
      video,
      0,
      0,
      canvas.width,
      canvas.height
    )

    const photo = canvas.toDataURL('image/jpeg', 0.9)

    setImage(photo)

    stopCamera()

    setError('')
    setSuccess('Photo captured successfully. Review the details below.')
  }

  // -----------------------------
  // UPLOAD IMAGE
  // -----------------------------

  function handleUpload(event) {
    const file = event.target.files?.[0]

    if (!file) return

    setError('')
    setSuccess('')

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file.')
      return
    }

    const reader = new FileReader()

    reader.onload = () => {
      setImage(reader.result)
      setSuccess('Receipt uploaded. Review the details below.')
    }

    reader.onerror = () => {
      setError('Could not read the selected image.')
    }

    reader.readAsDataURL(file)
  }

  // -----------------------------
  // REMOVE PHOTO
  // -----------------------------

  function removePhoto() {
    stopCamera()

    setImage(null)

    setForm((previous) => ({
      ...previous,
      merchant: '',
      amount: '',
      description: '',
    }))

    setError('')
    setSuccess('')
  }

  // -----------------------------
  // FORM CHANGE
  // -----------------------------

  function handleChange(event) {
    const { name, value } = event.target

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }))
  }

  // -----------------------------
  // SAVE EXPENSE
  // -----------------------------

  async function handleSave(event) {
    event.preventDefault()

    setError('')
    setSuccess('')

    if (!image) {
      setError('Please take or upload a receipt first.')
      return
    }

    const amount = Number(form.amount)

    if (!form.merchant.trim()) {
      setError('Please enter the merchant name.')
      return
    }

    if (!amount || amount <= 0) {
      setError('Please enter a valid amount.')
      return
    }

    if (!form.expenseDate) {
      setError('Please select the expense date.')
      return
    }

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setError('Please log in first.')
      return
    }

    setSaving(true)

    const { error: saveError } = await supabase
      .from('expenses')
      .insert({
        user_id: user.id,
        payment_method: form.paymentMethod,
        note: form.note.trim() || null,
        amount,
        category: form.category,
        expense_date: form.expenseDate,
        merchant: form.merchant.trim(),
        description:
          form.description.trim() ||
          `Receipt from ${form.merchant.trim()}`,
      })

    if (saveError) {
      console.error(
        'Receipt expense save error:',
        saveError
      )

      setError(saveError.message)
      setSaving(false)
      return
    }

    setSuccess(
      'Expense saved successfully!'
    )

    setImage(null)

    setForm({
      merchant: '',
      amount: '',
      category: 'misc',
      expenseDate: new Date()
        .toISOString()
        .split('T')[0],
      description: '',
      note: '',
      paymentMethod: 'UPI',
    })

    setSaving(false)
  }

  // -----------------------------
  // CLEANUP CAMERA
  // -----------------------------

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current
          .getTracks()
          .forEach((track) => track.stop())
      }
    }
  }, [])

  return (
    <div className="space-y-6">

      {/* HEADER */}

      <div>
        <h1 className="font-display text-2xl font-semibold text-white">
          Receipt Scanner
        </h1>

        <p className="mt-1 text-sm text-slate-400">
          Take a photo of your receipt or upload one,
          review the details, and save it as an expense.
        </p>
      </div>

      {/* ERROR */}

      {error && (
        <div className="rounded-xl border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-300">
          {error}
        </div>
      )}

      {/* SUCCESS */}

      {success && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-4 text-sm text-emerald-300">
          <CheckCircle2 className="size-5" />

          {success}
        </div>
      )}

      {/* CAMERA */}

      {cameraOpen && (
        <Card>

          <CardHeader>
            <div className="flex items-center justify-between">

              <CardTitle>
                Take a photo
              </CardTitle>

              <button
                type="button"
                onClick={stopCamera}
                className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-red-300"
              >
                <X className="size-5" />
              </button>

            </div>
          </CardHeader>

          <CardBody>

            <div className="overflow-hidden rounded-2xl border border-white/10 bg-black">

              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="max-h-[600px] w-full object-contain"
              />

            </div>

            <canvas
              ref={canvasRef}
              className="hidden"
            />

            <div className="mt-4 flex justify-center">

              <button
                type="button"
                onClick={capturePhoto}
                className="flex items-center gap-2 rounded-xl bg-emerald-400 px-6 py-3 font-semibold text-slate-950 transition hover:bg-emerald-300"
              >
                <Camera className="size-5" />

                Capture Photo
              </button>

            </div>

          </CardBody>

        </Card>
      )}

      {/* TAKE / UPLOAD */}

      {!cameraOpen && !image && (
        <Card>

          <CardHeader>
            <CardTitle>
              Scan your receipt
            </CardTitle>
          </CardHeader>

          <CardBody>

            <div className="grid gap-4 sm:grid-cols-2">

              {/* CAMERA BUTTON */}

              <button
                type="button"
                onClick={startCamera}
                className="group rounded-2xl border border-dashed border-emerald-400/30 bg-emerald-400/5 p-8 text-center transition hover:border-emerald-400/60 hover:bg-emerald-400/10"
              >

                <Camera className="mx-auto size-10 text-emerald-300 transition group-hover:scale-110" />

                <p className="mt-4 font-medium text-white">
                  Take Photo
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Open your camera and capture the receipt
                </p>

              </button>

              {/* UPLOAD BUTTON */}

              <label className="group cursor-pointer rounded-2xl border border-dashed border-white/10 bg-white/5 p-8 text-center transition hover:border-white/20 hover:bg-white/10">

                <Upload className="mx-auto size-10 text-slate-300 transition group-hover:scale-110" />

                <p className="mt-4 font-medium text-white">
                  Upload Receipt
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Choose an image from your device
                </p>

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleUpload}
                  className="hidden"
                />

              </label>

            </div>

          </CardBody>

        </Card>
      )}

      {/* REVIEW */}

      {image && (
        <div className="grid gap-4 lg:grid-cols-2">

          {/* RECEIPT */}

          <Card>

            <CardHeader>

              <div className="flex items-center justify-between">

                <CardTitle>
                  Receipt preview
                </CardTitle>

                <button
                  type="button"
                  onClick={removePhoto}
                  className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-red-300"
                >
                  <X className="size-5" />
                </button>

              </div>

            </CardHeader>

            <CardBody>

              <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/20">

                <img
                  src={image}
                  alt="Receipt"
                  className="max-h-[600px] w-full object-contain"
                />

              </div>

            </CardBody>

          </Card>

          {/* DETAILS */}

          <Card>

            <CardHeader>
              <CardTitle>
                Review expense
              </CardTitle>
            </CardHeader>

            <CardBody>

              <form
                onSubmit={handleSave}
                className="space-y-4"
              >

                {/* MERCHANT */}

                <div>

                  <label className="text-sm text-slate-400">
                    Merchant
                  </label>

                  <input
                    name="merchant"
                    value={form.merchant}
                    onChange={handleChange}
                    placeholder="e.g. Amazon"
                    className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none placeholder:text-slate-600"
                  />

                </div>

                {/* AMOUNT */}

                <div>

                  <label className="text-sm text-slate-400">
                    Amount
                  </label>

                  <input
                    name="amount"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={form.amount}
                    onChange={handleChange}
                    placeholder="500"
                    className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none placeholder:text-slate-600"
                  />

                </div>

                {/* CATEGORY */}

                <div>

                  <label className="text-sm text-slate-400">
                    Category
                  </label>

                  <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    className="mt-2 w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-white outline-none"
                  >
                    <option value="food">
                      Food / Mess
                    </option>

                    <option value="hostel">
                      Hostel / Rent
                    </option>

                    <option value="travel">
                      Travel
                    </option>

                    <option value="subscriptions">
                      Subscriptions
                    </option>

                    <option value="stationery">
                      Stationery / Books
                    </option>

                    <option value="entertainment">
                      Entertainment
                    </option>

                    <option value="misc">
                      Miscellaneous
                    </option>
                  </select>

                </div>

                {/* DATE */}

                <div>

                  <label className="text-sm text-slate-400">
                    Expense date
                  </label>

                  <input
                    name="expenseDate"
                    type="date"
                    value={form.expenseDate}
                    onChange={handleChange}
                    className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none"
                  />

                </div>

                {/* PAYMENT */}

                <div>

                  <label className="text-sm text-slate-400">
                    Payment method
                  </label>

                  <select
                    name="paymentMethod"
                    value={form.paymentMethod}
                    onChange={handleChange}
                    className="mt-2 w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-white outline-none"
                  >
                    <option value="UPI">
                      UPI
                    </option>

                    <option value="Cash">
                      Cash
                    </option>

                    <option value="Card">
                      Card
                    </option>

                    <option value="Bank Transfer">
                      Bank Transfer
                    </option>

                    <option value="Other">
                      Other
                    </option>
                  </select>

                </div>

                {/* DESCRIPTION */}

                <div>

                  <label className="text-sm text-slate-400">
                    Description
                  </label>

                  <input
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="What was this expense for?"
                    className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none placeholder:text-slate-600"
                  />

                </div>

                {/* NOTE */}

                <div>

                  <label className="text-sm text-slate-400">
                    Note
                  </label>

                  <textarea
                    name="note"
                    value={form.note}
                    onChange={handleChange}
                    placeholder="Optional note"
                    rows="3"
                    className="mt-2 w-full resize-none rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none placeholder:text-slate-600"
                  />

                </div>

                {/* SAVE */}

                <button
                  type="submit"
                  disabled={saving}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-400 px-5 py-3 font-semibold text-slate-950 transition hover:bg-emerald-300 disabled:opacity-50"
                >

                  <CheckCircle2 className="size-5" />

                  {saving
                    ? 'Saving...'
                    : 'Confirm & Save Expense'}

                </button>

              </form>

            </CardBody>

          </Card>

        </div>
      )}

    </div>
  )
}

export function WhatIfPage() {
  const [amount, setAmount] = useState('')
  const [expenses, setExpenses] = useState([])
  const [budget, setBudget] = useState(0)
  const [pocketMoney, setPocketMoney] = useState(0)
  const [savingsGoals, setSavingsGoals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function loadWhatIfData() {
    setLoading(true)
    setError('')

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setError('Please log in first.')
      setLoading(false)
      return
    }

    const now = new Date()

    const month = `${now.getFullYear()}-${String(
      now.getMonth() + 1,
    ).padStart(2, '0')}-01`

    const [
      expensesResult,
      budgetResult,
      pocketMoneyResult,
      savingsResult,
    ] = await Promise.all([
      supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user.id),

      supabase
        .from('budgets')
        .select('amount')
        .eq('user_id', user.id)
        .eq('month', month)
        .maybeSingle(),

      supabase
        .from('pocket_money')
        .select('amount')
        .eq('user_id', user.id)
        .eq('month', month)
        .maybeSingle(),

      supabase
        .from('savings_goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', {
          ascending: false,
        }),
    ])

    if (expensesResult.error) {
      setError(expensesResult.error.message)
      setLoading(false)
      return
    }

    if (budgetResult.error) {
      setError(budgetResult.error.message)
      setLoading(false)
      return
    }

    if (pocketMoneyResult.error) {
      setError(pocketMoneyResult.error.message)
      setLoading(false)
      return
    }

    if (savingsResult.error) {
      setError(savingsResult.error.message)
      setLoading(false)
      return
    }

    setExpenses(expensesResult.data || [])
    setBudget(Number(budgetResult.data?.amount || 0))
    setPocketMoney(
      Number(pocketMoneyResult.data?.amount || 0),
    )
    setSavingsGoals(savingsResult.data || [])

    setLoading(false)
  }

  useEffect(() => {
    loadWhatIfData()
  }, [])

  // -----------------------------
  // CURRENT MONTH SPENDING
  // -----------------------------

  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth()

  const monthlyExpenses = expenses.filter(
    (expense) => {
      const date = new Date(
        `${expense.expense_date}T00:00:00`,
      )

      return (
        date.getFullYear() === currentYear &&
        date.getMonth() === currentMonth
      )
    },
  )

  const spent = monthlyExpenses.reduce(
    (total, expense) =>
      total + Number(expense.amount || 0),
    0,
  )

  const purchaseAmount = Number(amount || 0)

  const newTotal = spent + purchaseAmount

  // -----------------------------
  // BUDGET RESULT
  // -----------------------------

  const budgetRemaining = budget - newTotal
  const budgetOver = Math.max(
    newTotal - budget,
    0,
  )

  const budgetExceeded =
    budget > 0 && newTotal > budget

  // -----------------------------
  // POCKET MONEY RESULT
  // -----------------------------

  const pocketRemaining =
    pocketMoney - newTotal

  const pocketOver = Math.max(
    newTotal - pocketMoney,
    0,
  )

  const pocketExceeded =
    pocketMoney > 0 &&
    newTotal > pocketMoney

  // -----------------------------
  // SAVINGS EFFECT
  // -----------------------------

  const savingsTotal = savingsGoals.reduce(
    (total, goal) =>
      total + Number(goal.saved_amount || 0),
    0,
  )

  const savingsTarget = savingsGoals.reduce(
    (total, goal) =>
      total + Number(goal.target_amount || 0),
    0,
  )

  const savingsAfterPurchase =
    Math.max(
      savingsTotal - purchaseAmount,
      0,
    )

  return (
    <div className="space-y-6">

      {/* HEADER */}

      <div>
        <h1 className="font-display text-2xl font-semibold text-white">
          What-if calculator
        </h1>

        <p className="mt-1 text-sm text-slate-400">
          See how a purchase could affect your budget,
          pocket money, and savings.
        </p>
      </div>

      {/* ERROR */}

      {error && (
        <div className="rounded-xl border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-300">
          {error}
        </div>
      )}

      {/* INPUT */}

      <Card>
        <CardHeader>
          <CardTitle>
            Can I afford this purchase?
          </CardTitle>
        </CardHeader>

        <CardBody>
          <div className="max-w-xl">

            <label className="text-sm text-slate-400">
              Purchase amount
            </label>

            <div className="mt-2 flex gap-3">

              <input
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={(event) =>
                  setAmount(event.target.value)
                }
                placeholder="5000"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-slate-600 focus:border-emerald-400/50"
              />

              <button
                onClick={loadWhatIfData}
                className="rounded-xl bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/15"
              >
                Refresh
              </button>

            </div>

            <p className="mt-2 text-xs text-slate-500">
              Enter the amount you are thinking of spending.
            </p>

          </div>
        </CardBody>
      </Card>

      {/* RESULT */}

      {loading ? (
        <Card>
          <CardBody>
            <p className="text-sm text-slate-400">
              Loading your financial data...
            </p>
          </CardBody>
        </Card>
      ) : purchaseAmount <= 0 ? (
        <Card>
          <CardBody>
            <div className="rounded-xl bg-white/5 p-5">
              <p className="font-medium text-white">
                Enter a purchase amount
              </p>

              <p className="mt-1 text-sm text-slate-400">
                We'll compare it with your real spending
                and financial limits.
              </p>
            </div>
          </CardBody>
        </Card>
      ) : (
        <>

          {/* AFFORDABILITY */}

          <Card>
            <CardHeader>
              <CardTitle>
                Purchase impact
              </CardTitle>
            </CardHeader>

            <CardBody>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

                {/* MONTHLY BUDGET */}

                <div
                  className={`rounded-2xl border p-5 ${
                    budgetExceeded
                      ? 'border-red-400/30 bg-red-400/5'
                      : 'border-emerald-400/20 bg-emerald-400/5'
                  }`}
                >
                  <p className="text-sm text-slate-400">
                    Monthly budget
                  </p>

                  {budget <= 0 ? (
                    <p className="mt-2 font-medium text-slate-300">
                      No budget set
                    </p>
                  ) : budgetExceeded ? (
                    <>
                      <p className="mt-2 text-xl font-semibold text-red-300">
                        Over by {formatINR(budgetOver)}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        After this purchase
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="mt-2 text-xl font-semibold text-emerald-300">
                        {formatINR(budgetRemaining)}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Budget remaining
                      </p>
                    </>
                  )}
                </div>

                {/* POCKET MONEY */}

                <div
                  className={`rounded-2xl border p-5 ${
                    pocketExceeded
                      ? 'border-red-400/30 bg-red-400/5'
                      : 'border-emerald-400/20 bg-emerald-400/5'
                  }`}
                >
                  <p className="text-sm text-slate-400">
                    Pocket money
                  </p>

                  {pocketMoney <= 0 ? (
                    <p className="mt-2 font-medium text-slate-300">
                      Not set
                    </p>
                  ) : pocketExceeded ? (
                    <>
                      <p className="mt-2 text-xl font-semibold text-red-300">
                        Over by {formatINR(pocketOver)}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        After this purchase
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="mt-2 text-xl font-semibold text-emerald-300">
                        {formatINR(pocketRemaining)}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Pocket money remaining
                      </p>
                    </>
                  )}
                </div>

                {/* CURRENT SPENDING */}

                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <p className="text-sm text-slate-400">
                    New monthly spending
                  </p>

                  <p className="mt-2 text-xl font-semibold text-white">
                    {formatINR(newTotal)}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Current spending + purchase
                  </p>
                </div>

              </div>

            </CardBody>
          </Card>

          {/* SAVINGS */}

          <Card>
            <CardHeader>
              <CardTitle>
                Savings impact
              </CardTitle>
            </CardHeader>

            <CardBody>

              {savingsGoals.length === 0 ? (
                <p className="text-sm text-slate-400">
                  You don't have any savings goals yet.
                </p>
              ) : (
                <div className="space-y-4">

                  <div className="rounded-xl bg-white/5 p-4">

                    <p className="text-sm text-slate-400">
                      Current saved across goals
                    </p>

                    <p className="mt-1 text-xl font-semibold text-white">
                      {formatINR(savingsTotal)}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Target: {formatINR(savingsTarget)}
                    </p>

                  </div>

                  <div className="rounded-xl border border-amber-400/20 bg-amber-400/5 p-4">

                    <p className="text-sm text-slate-400">
                      Purchase amount
                    </p>

                    <p className="mt-1 text-lg font-semibold text-amber-300">
                      {formatINR(purchaseAmount)}
                    </p>

                    <p className="mt-2 text-sm text-slate-400">
                      If this purchase comes from money
                      you were planning to save, your
                      potential savings would become
                      approximately{' '}
                      <span className="font-medium text-white">
                        {formatINR(
                          savingsAfterPurchase,
                        )}
                      </span>
                      .
                    </p>

                  </div>

                </div>
              )}

            </CardBody>
          </Card>

          {/* FINAL VERDICT */}

          <Card>
            <CardHeader>
              <CardTitle>
                Recommendation
              </CardTitle>
            </CardHeader>

            <CardBody>

              {budgetExceeded || pocketExceeded ? (
                <div className="rounded-2xl border border-red-400/30 bg-red-400/10 p-5">

                  <p className="text-lg font-semibold text-red-300">
                    ⚠️ This purchase may stretch your budget
                  </p>

                  <p className="mt-2 text-sm leading-6 text-red-200/70">
                    After spending {formatINR(
                      purchaseAmount,
                    )}, you would exceed at least one of
                    your current spending limits.
                  </p>

                </div>
              ) : (
                <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-5">

                  <p className="text-lg font-semibold text-emerald-300">
                    ✓ This purchase fits your current limits
                  </p>

                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    Based on your recorded spending,
                    this purchase would not exceed your
                    current monthly budget or pocket money.
                  </p>

                </div>
              )}

            </CardBody>
          </Card>

        </>
      )}

      {/* DISCLAIMER */}

      <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 text-xs text-slate-500">
        What-if calculations are estimates based on your
        recorded data. They do not move money or change
        your savings automatically.
      </div>

    </div>
  )
}


export function SettingsPage() {
  const [displayName, setDisplayName] = useState('')
  const [collegeName, setCollegeName] = useState('')
  const [currency, setCurrency] = useState('INR')
  const [timezone, setTimezone] = useState('Asia/Kolkata')
  const [monthlyBudget, setMonthlyBudget] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    setDisplayName(
      localStorage.getItem('display_name') || '',
    )

    setCollegeName(
      localStorage.getItem('college_name') || '',
    )

    setCurrency(
      localStorage.getItem('currency') || 'INR',
    )

    setTimezone(
      localStorage.getItem('timezone') || 'Asia/Kolkata',
    )

    setMonthlyBudget(
      localStorage.getItem('monthly_budget') || '',
    )
  }, [])

  function handleSave(event) {
    event.preventDefault()
  
    localStorage.setItem(
      'display_name',
      displayName.trim(),
    )
  
    localStorage.setItem(
      'college_name',
      collegeName.trim(),
    )
  
    localStorage.setItem(
      'currency',
      currency,
    )
  
    localStorage.setItem(
      'timezone',
      timezone,
    )
  
    localStorage.setItem(
      'monthly_budget',
      monthlyBudget,
    )
  
    // Tell the Sidebar that the profile changed
    window.dispatchEvent(
      new Event('profile-updated'),
    )
  
    window.dispatchEvent(
      new Event('college-name-updated'),
    )
  
    setMessage('Settings saved successfully.')
  
    setTimeout(() => {
      setMessage('')
    }, 3000)
  }
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-white">
          Profile & settings
        </h1>

        <p className="mt-1 text-sm text-slate-400">
          Manage your profile and spending preferences.
        </p>
      </div>

      {message && (
        <div className="rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-4 text-sm text-emerald-300">
          {message}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>
            Profile settings
          </CardTitle>
        </CardHeader>

        <CardBody>
          <form
            onSubmit={handleSave}
            className="space-y-5"
          >
            <div>
              <label className="text-sm text-slate-400">
                Display name
              </label>

              <input
                type="text"
                value={displayName}
                onChange={(event) =>
                  setDisplayName(event.target.value)
                }
                placeholder="Your name"
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none placeholder:text-slate-600 focus:border-emerald-400/50"
              />
            </div>

            <div>
              <label className="text-sm text-slate-400">
                College name
              </label>

              <input
                type="text"
                value={collegeName}
                onChange={(event) =>
                  setCollegeName(event.target.value)
                }
                placeholder="e.g. MAIT"
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none placeholder:text-slate-600 focus:border-emerald-400/50"
              />

              <p className="mt-2 text-xs text-slate-500">
                This name will appear under your name in the sidebar.
              </p>
            </div>

            <div>
              <label className="text-sm text-slate-400">
                Currency
              </label>

              <select
                value={currency}
                onChange={(event) =>
                  setCurrency(event.target.value)
                }
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-emerald-400/50"
              >
                <option value="INR">
                  INR (₹)
                </option>

                <option value="USD">
                  USD ($)
                </option>

                <option value="EUR">
                  EUR (€)
                </option>
              </select>
            </div>

            <div>
              <label className="text-sm text-slate-400">
                Timezone
              </label>

              <select
                value={timezone}
                onChange={(event) =>
                  setTimezone(event.target.value)
                }
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-emerald-400/50"
              >
                <option value="Asia/Kolkata">
                  Asia/Kolkata
                </option>

                <option value="Asia/Dubai">
                  Asia/Dubai
                </option>

                <option value="Asia/Singapore">
                  Asia/Singapore
                </option>

                <option value="Europe/London">
                  Europe/London
                </option>

                <option value="America/New_York">
                  America/New_York
                </option>
              </select>
            </div>

            <div>
              <label className="text-sm text-slate-400">
                Default monthly budget
              </label>

              <input
                type="number"
                min="0"
                value={monthlyBudget}
                onChange={(event) =>
                  setMonthlyBudget(event.target.value)
                }
                placeholder="15000"
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none placeholder:text-slate-600 focus:border-emerald-400/50"
              />
            </div>

            <button
              type="submit"
              className="rounded-xl bg-emerald-400 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300"
            >
              Save settings
            </button>
          </form>
        </CardBody>
      </Card>
    </div>
  )
}

