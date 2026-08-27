import { useEffect, useState } from 'react'

import {
  CalendarRange,
  PiggyBank,
  Repeat,
  Wallet,
  AlertTriangle,
} from 'lucide-react'

import { SmartBudgetBar } from '@/components/budget/SmartBudgetBar'
import { CategoryPie } from '@/components/charts/CategoryPie'
import { DailyBar } from '@/components/charts/DailyBar'
import { MonthlyTrend } from '@/components/charts/MonthlyTrend'

import { Badge } from '@/components/ui/Badge'
import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card'

import { KpiCard } from '@/components/ui/KpiCard'
import { Progress } from '@/components/ui/Progress'

import { CATEGORY_MAP } from '@/lib/constants'
import { supabase } from '@/lib/supabaseClient'

import { formatDate } from '@/utils/dates'
import { formatINR, percent } from '@/utils/money'


export function DashboardPage() {
  const [expenses, setExpenses] = useState([])
  const [budget, setBudget] = useState(0)
  const [pocketMoney, setPocketMoney] = useState(0)
  const [savingsGoals, setSavingsGoals] = useState([])
  const [recurringExpenses, setRecurringExpenses] = useState([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')


  // =========================================================
  // LOAD DASHBOARD DATA
  // =========================================================

  async function loadDashboardData() {
    setLoading(true)
    setError('')

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setError('Please log in to view your dashboard.')
      setLoading(false)
      return
    }


    // =======================================================
    // EXPENSES
    // =======================================================

    const {
      data: expenseData,
      error: expenseError,
    } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', user.id)
      .order('expense_date', {
        ascending: false,
      })

    if (expenseError) {
      console.error(
        'Dashboard expenses error:',
        expenseError,
      )

      setError(expenseError.message)
      setLoading(false)
      return
    }

    setExpenses(expenseData || [])


    // =======================================================
    // CURRENT MONTH
    // =======================================================

    const now = new Date()

    const month = `${now.getFullYear()}-${String(
      now.getMonth() + 1,
    ).padStart(2, '0')}-01`


    // =======================================================
    // BUDGET
    // =======================================================

    const {
      data: budgetData,
      error: budgetError,
    } = await supabase
      .from('budgets')
      .select('amount')
      .eq('user_id', user.id)
      .eq('month', month)
      .maybeSingle()

    if (budgetError) {
      console.error(
        'Dashboard budget error:',
        budgetError,
      )

      setError(budgetError.message)
      setLoading(false)
      return
    }

    setBudget(
      Number(budgetData?.amount || 0),
    )


    // =======================================================
    // POCKET MONEY
    // =======================================================

    const {
      data: pocketMoneyData,
      error: pocketMoneyError,
    } = await supabase
      .from('pocket_money')
      .select('amount')
      .eq('user_id', user.id)
      .eq('month', month)
      .maybeSingle()

    if (pocketMoneyError) {
      console.error(
        'Dashboard pocket money error:',
        pocketMoneyError,
      )

      setError(pocketMoneyError.message)
      setLoading(false)
      return
    }

    setPocketMoney(
      Number(
        pocketMoneyData?.amount || 0,
      ),
    )


    // =======================================================
    // SAVINGS GOALS
    // =======================================================

    const {
      data: savingsData,
      error: savingsError,
    } = await supabase
      .from('savings_goals')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', {
        ascending: false,
      })

    if (savingsError) {
      console.error(
        'Dashboard savings error:',
        savingsError,
      )

      setError(savingsError.message)
      setLoading(false)
      return
    }

    setSavingsGoals(
      savingsData || [],
    )


    // =======================================================
    // RECURRING EXPENSES
    // =======================================================

    const {
      data: recurringData,
      error: recurringError,
    } = await supabase
      .from('recurring_expenses')
      .select('*')
      .eq('user_id', user.id)
      .eq('active', true)
      .order('due_date', {
        ascending: true,
      })

    if (recurringError) {
      console.error(
        'Dashboard recurring error:',
        recurringError,
      )

      setError(recurringError.message)
      setLoading(false)
      return
    }

    setRecurringExpenses(
      recurringData || [],
    )


    setLoading(false)
  }


  useEffect(() => {
    loadDashboardData()
  }, [])


  // =========================================================
  // CURRENT MONTH EXPENSES
  // =========================================================

  const currentYear =
    new Date().getFullYear()

  const currentMonth =
    new Date().getMonth()

  const monthlyExpenses =
    expenses.filter((expense) => {
      if (!expense.expense_date) {
        return false
      }

      const date = new Date(
        `${expense.expense_date}T00:00:00`,
      )

      return (
        date.getFullYear() === currentYear &&
        date.getMonth() === currentMonth
      )
    })


  // =========================================================
  // TOTAL SPENT
  // =========================================================

  const spent =
    monthlyExpenses.reduce(
      (total, expense) =>
        total +
        Number(expense.amount || 0),
      0,
    )


  // =========================================================
  // BUDGET
  // =========================================================

  const budgetLeft =
    Math.max(
      budget - spent,
      0,
    )

  const budgetOver =
    Math.max(
      spent - budget,
      0,
    )

  const budgetExceeded =
    budget > 0 &&
    spent > budget


  // =========================================================
  // POCKET MONEY
  // =========================================================

  const pocketMoneyRemaining =
    Math.max(
      pocketMoney - spent,
      0,
    )

  const pocketMoneyOver =
    Math.max(
      spent - pocketMoney,
      0,
    )

  const pocketMoneyExceeded =
    pocketMoney > 0 &&
    spent > pocketMoney


  // =========================================================
  // SPENDING BY CATEGORY
  // =========================================================

  const categoryTotals = {}

  for (const expense of monthlyExpenses) {
    const category =
      expense.category || 'misc'

    categoryTotals[category] =
      (categoryTotals[category] || 0) +
      Number(expense.amount || 0)
  }

  const categories =
    Object.entries(categoryTotals)
      .map(([id, amount]) => ({
        id,
        label:
          CATEGORY_MAP[id]?.label ??
          id,
        color:
          CATEGORY_MAP[id]?.color ??
          '#94a3b8',
        amount: Number(amount),
      }))
      .sort(
        (a, b) =>
          b.amount - a.amount,
      )


  // =========================================================
  // DAILY SPENDING — REAL DATA
  // =========================================================

  const dailyTotals = {}

  for (const expense of monthlyExpenses) {
    if (!expense.expense_date) {
      continue
    }

    const day = String(
      new Date(
        `${expense.expense_date}T00:00:00`,
      ).getDate(),
    )

    dailyTotals[day] =
      (dailyTotals[day] || 0) +
      Number(expense.amount || 0)
  }

  const dailySpend =
    Object.entries(dailyTotals)
      .map(([day, amount]) => ({
        day,
        amount: Number(amount),
      }))
      .sort(
        (a, b) =>
          Number(a.day) -
          Number(b.day),
      )


  // =========================================================
  // SIX MONTH TREND — REAL DATA
  // =========================================================

  const monthlyTrend = []

  for (let i = 5; i >= 0; i--) {
    const date = new Date(
      currentYear,
      currentMonth - i,
      1,
    )

    const year =
      date.getFullYear()

    const monthIndex =
      date.getMonth()

    const monthName =
      date.toLocaleString(
        'en-IN',
        {
          month: 'short',
        },
      )

    const monthSpent =
      expenses
        .filter((expense) => {
          if (!expense.expense_date) {
            return false
          }

          const expenseDate =
            new Date(
              `${expense.expense_date}T00:00:00`,
            )

          return (
            expenseDate.getFullYear() ===
              year &&
            expenseDate.getMonth() ===
              monthIndex
          )
        })
        .reduce(
          (total, expense) =>
            total +
            Number(
              expense.amount || 0,
            ),
          0,
        )

    monthlyTrend.push({
      month: monthName,
      amount: monthSpent,
    })
  }


  // =========================================================
  // UPCOMING RECURRING
  // =========================================================

  const upcomingRecurring =
    recurringExpenses
      .filter((item) => {
        if (!item.due_date) {
          return false
        }

        return true
      })
      .slice(0, 5)


  // =========================================================
  // SAVINGS TOTAL
  // =========================================================

  const totalSaved =
    savingsGoals.reduce(
      (total, goal) =>
        total +
        Number(
          goal.saved_amount || 0,
        ),
      0,
    )


  // =========================================================
  // REAL ALERTS
  // =========================================================

  const alerts = []

  if (budgetExceeded) {
    alerts.push({
      id: 'budget-over',
      type: 'danger',
      title: 'Budget exceeded',
      message: `You are over your monthly budget by ${formatINR(
        budgetOver,
      )}.`,
    })
  } else if (
    budget > 0 &&
    percent(spent, budget) >= 80
  ) {
    alerts.push({
      id: 'budget-warning',
      type: 'warning',
      title: 'Budget almost used',
      message: `You have used ${percent(
        spent,
        budget,
      ).toFixed(0)}% of your monthly budget.`,
    })
  }

  if (pocketMoneyExceeded) {
    alerts.push({
      id: 'pocket-over',
      type: 'danger',
      title: 'Pocket money exceeded',
      message: `You have spent ${formatINR(
        pocketMoneyOver,
      )} more than your pocket money.`,
    })
  }

  if (
    upcomingRecurring.length > 0
  ) {
    alerts.push({
      id: 'recurring',
      type: 'info',
      title: 'Upcoming recurring expense',
      message: `${upcomingRecurring[0].name} is due on ${formatDate(
        upcomingRecurring[0].due_date,
        'd MMM',
      )}.`,
    })
  }

  if (
    alerts.length === 0 &&
    monthlyExpenses.length === 0
  ) {
    alerts.push({
      id: 'no-expenses',
      type: 'info',
      title: 'No expenses yet',
      message:
        'Add your first expense to start tracking your spending.',
    })
  }


  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="space-y-6">

      {/* HEADER */}

      <div className="flex flex-wrap items-end justify-between gap-3">

        <div>
          <h1 className="font-display text-2xl font-semibold text-white">
            Dashboard
          </h1>

          <p className="mt-1 text-sm text-slate-400">
            Your real spending data from Supabase.
          </p>
        </div>

        <Badge tone="mint">
          Live data
        </Badge>

      </div>


      {/* ERROR */}

      {error && (
        <div className="rounded-xl border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-300">
          {error}
        </div>
      )}


      {/* KPI CARDS */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <KpiCard
          label="Spent this month"
          value={
            loading
              ? 'Loading...'
              : formatINR(spent)
          }
          hint={
            budget > 0
              ? `${percent(
                  spent,
                  budget,
                ).toFixed(0)}% of monthly budget`
              : 'Set a monthly budget'
          }
          icon={Wallet}
          tone="mint"
        />


        <KpiCard
          label="Budget remaining"
          value={
            loading
              ? 'Loading...'
              : budgetExceeded
                ? `Over by ${formatINR(
                    budgetOver,
                  )}`
                : budget > 0
                  ? formatINR(
                      budgetLeft,
                    )
                  : 'Not set'
          }
          hint={
            budget > 0
              ? `Budget ${formatINR(
                  budget,
                )}`
              : 'Set a monthly budget'
          }
          icon={Wallet}
          tone="violet"
        />


        <KpiCard
          label="Pocket money remaining"
          value={
            loading
              ? 'Loading...'
              : pocketMoney <= 0
                ? 'Not set'
                : pocketMoneyExceeded
                  ? `Over by ${formatINR(
                      pocketMoneyOver,
                    )}`
                  : formatINR(
                      pocketMoneyRemaining,
                    )
          }
          hint={
            pocketMoney > 0
              ? `Allowance ${formatINR(
                  pocketMoney,
                )}`
              : 'Set your pocket money'
          }
          icon={PiggyBank}
          tone="amber"
        />


        <KpiCard
          label="Total saved"
          value={
            loading
              ? 'Loading...'
              : formatINR(totalSaved)
          }
          hint={
            savingsGoals.length > 0
              ? `${savingsGoals.length} savings ${
                  savingsGoals.length === 1
                    ? 'goal'
                    : 'goals'
                }`
              : 'Create a savings goal'
          }
          icon={PiggyBank}
          tone="rose"
        />

      </div>


      {/* BUDGET OVER ALERT */}

      {budgetExceeded && (
        <div className="rounded-2xl border border-red-400/30 bg-red-400/10 p-4">

          <div className="flex items-center justify-between gap-4">

            <div className="flex items-start gap-3">

              <AlertTriangle className="mt-0.5 size-5 text-red-300" />

              <div>
                <p className="font-medium text-red-300">
                  You are over budget
                </p>

                <p className="mt-1 text-sm text-red-200/70">
                  You have spent{' '}
                  {formatINR(
                    budgetOver,
                  )}{' '}
                  more than your monthly budget.
                </p>
              </div>

            </div>

            <p className="text-lg font-semibold text-red-300">
              +{formatINR(
                budgetOver,
              )}
            </p>

          </div>

        </div>
      )}


      {/* POCKET MONEY ALERT */}

      {pocketMoneyExceeded && (
        <div className="rounded-2xl border border-red-400/30 bg-red-400/10 p-4">

          <div className="flex items-center justify-between gap-4">

            <div className="flex items-start gap-3">

              <PiggyBank className="mt-0.5 size-5 text-red-300" />

              <div>
                <p className="font-medium text-red-300">
                  Pocket money limit exceeded
                </p>

                <p className="mt-1 text-sm text-red-200/70">
                  You have spent{' '}
                  {formatINR(
                    pocketMoneyOver,
                  )}{' '}
                  more than your monthly pocket money.
                </p>
              </div>

            </div>

            <p className="text-lg font-semibold text-red-300">
              +{formatINR(
                pocketMoneyOver,
              )}
            </p>

          </div>

        </div>
      )}


      {/* SMART BUDGET + ALERTS */}

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">

        <Card>

          <CardHeader>
            <CardTitle>
              Smart budget progress
            </CardTitle>
          </CardHeader>

          <CardBody>

            {budget > 0 ? (
              <SmartBudgetBar
                spent={spent}
                budget={budget}
              />
            ) : (
              <p className="py-6 text-sm text-slate-400">
                Set your monthly budget to see your budget progress.
              </p>
            )}

            <div className="mt-6 grid gap-3 sm:grid-cols-2">

              <div className="rounded-xl bg-white/4 p-3 text-sm">

                <p className="text-slate-400">
                  Monthly budget
                </p>

                <p className="mt-1 text-white">
                  {budget > 0
                    ? formatINR(
                        budget,
                      )
                    : 'Not set'}
                </p>

              </div>


              <div className="rounded-xl bg-white/4 p-3 text-sm">

                <p className="text-slate-400">
                  Budget status
                </p>

                <p
                  className={
                    budgetExceeded
                      ? 'mt-1 text-red-300'
                      : 'mt-1 text-white'
                  }
                >
                  {budget <= 0
                    ? 'Not available'
                    : budgetExceeded
                      ? `Over by ${formatINR(
                          budgetOver,
                        )}`
                      : `${formatINR(
                          budgetLeft,
                        )} remaining`}
                </p>

              </div>

            </div>

          </CardBody>

        </Card>


        {/* REAL ALERTS */}

        <Card>

          <CardHeader>
            <CardTitle>
              Alerts
            </CardTitle>
          </CardHeader>

          <CardBody className="space-y-3">

            {alerts.map(
              (alert) => (
                <div
                  key={alert.id}
                  className={`rounded-xl border p-3 ${
                    alert.type ===
                    'danger'
                      ? 'border-red-400/20 bg-red-400/10'
                      : alert.type ===
                          'warning'
                        ? 'border-amber-400/20 bg-amber-400/10'
                        : 'border-white/10 bg-white/5'
                  }`}
                >

                  <p
                    className={`text-sm font-medium ${
                      alert.type ===
                      'danger'
                        ? 'text-red-300'
                        : alert.type ===
                            'warning'
                          ? 'text-amber-300'
                          : 'text-slate-200'
                    }`}
                  >
                    {alert.title}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    {alert.message}
                  </p>

                </div>
              ),
            )}

            <p className="text-xs text-slate-500">
              Alerts are calculated from your current account data.
            </p>

          </CardBody>

        </Card>

      </div>


      {/* CATEGORY + DAILY SPENDING */}

      <div className="grid gap-4 lg:grid-cols-2">

        {/* CATEGORY */}

        <Card>

          <CardHeader>
            <CardTitle>
              Spending by category
            </CardTitle>
          </CardHeader>

          <CardBody>

            {categories.length > 0 ? (
              <>
                <CategoryPie
                  data={categories}
                />

                <ul className="mt-2 space-y-2 text-sm">

                  {categories
                    .slice(0, 5)
                    .map((item) => (
                      <li
                        key={item.id}
                        className="flex items-center justify-between text-slate-300"
                      >

                        <span className="flex items-center gap-2">

                          <span
                            className="size-2 rounded-full"
                            style={{
                              background:
                                item.color,
                            }}
                          />

                          {item.label}

                        </span>

                        {formatINR(
                          item.amount,
                        )}

                      </li>
                    ))}

                </ul>
              </>
            ) : (
              <p className="py-6 text-sm text-slate-400">
                No expenses this month yet.
              </p>
            )}

          </CardBody>

        </Card>


        {/* DAILY SPENDING — REAL */}

        <Card>

          <CardHeader>
            <CardTitle>
              Daily spending
            </CardTitle>
          </CardHeader>

          <CardBody>

            {loading ? (
              <p className="py-6 text-sm text-slate-400">
                Loading daily spending...
              </p>
            ) : dailySpend.length > 0 ? (
              <DailyBar
                data={dailySpend}
              />
            ) : (
              <p className="py-6 text-sm text-slate-400">
                No spending recorded this month yet.
              </p>
            )}

          </CardBody>

        </Card>

      </div>


      {/* SIX MONTH TREND + SAVINGS */}

      <div className="grid gap-4 lg:grid-cols-2">

        {/* REAL SIX MONTH TREND */}

        <Card>

          <CardHeader>
            <CardTitle>
              Six-month spending trend
            </CardTitle>
          </CardHeader>

          <CardBody>

            <MonthlyTrend
              data={monthlyTrend}
            />

          </CardBody>

        </Card>


        {/* REAL SAVINGS */}

        <Card>

          <CardHeader>
            <CardTitle>
              Savings goals
            </CardTitle>
          </CardHeader>

          <CardBody className="space-y-4">

            {loading ? (
              <p className="text-sm text-slate-400">
                Loading savings goals...
              </p>
            ) : savingsGoals.length === 0 ? (
              <p className="text-sm text-slate-400">
                No savings goals yet.
              </p>
            ) : (
              savingsGoals
                .slice(0, 4)
                .map((goal) => {

                  const target =
                    Number(
                      goal.target_amount ||
                        0,
                    )

                  const saved =
                    Number(
                      goal.saved_amount ||
                        0,
                    )

                  const pct =
                    target > 0
                      ? Math.min(
                          (saved /
                            target) *
                            100,
                          100,
                        )
                      : 0

                  return (
                    <div
                      key={goal.id}
                    >

                      <div className="flex items-center justify-between text-sm">

                        <span className="text-white">
                          {goal.name}
                        </span>

                        <span className="text-slate-400">
                          {formatINR(
                            saved,
                          )}{' '}
                          /{' '}
                          {formatINR(
                            target,
                          )}
                        </span>

                      </div>

                      <Progress
                        value={pct}
                        className="mt-2"
                      />

                      <div className="mt-1 flex justify-between text-xs text-slate-500">

                        <span>
                          {pct.toFixed(
                            0,
                          )}
                          % complete
                        </span>

                        <span>
                          {formatINR(
                            Math.max(
                              target -
                                saved,
                              0,
                            ),
                          )}{' '}
                          remaining
                        </span>

                      </div>

                    </div>
                  )
                })
            )}

          </CardBody>

        </Card>

      </div>


      {/* RECENT EXPENSES + REAL RECURRING */}

      <div className="grid gap-4 lg:grid-cols-2">

        {/* RECENT EXPENSES */}

        <Card>

          <CardHeader>
            <CardTitle>
              Recent expenses
            </CardTitle>
          </CardHeader>

          <CardBody className="space-y-3">

            {loading ? (
              <p className="text-sm text-slate-400">
                Loading expenses...
              </p>
            ) : monthlyExpenses.length === 0 ? (
              <p className="text-sm text-slate-400">
                No expenses this month yet.
              </p>
            ) : (
              monthlyExpenses
                .slice(0, 6)
                .map((expense) => (
                  <div
                    key={expense.id}
                    className="flex items-center justify-between gap-3 text-sm"
                  >

                    <div>

                      <p className="text-white">
                        {expense.description ||
                          expense.merchant ||
                          'Expense'}
                      </p>

                      <p className="text-xs text-slate-400">

                        {CATEGORY_MAP[
                          expense.category
                        ]?.label ??
                          expense.category}

                        {' · '}

                        {formatDate(
                          expense.expense_date,
                          'd MMM',
                        )}

                      </p>

                    </div>

                    <p className="font-medium text-white">
                      {formatINR(
                        expense.amount,
                      )}
                    </p>

                  </div>
                ))
            )}

          </CardBody>

        </Card>


        {/* REAL RECURRING */}

        <Card>

          <CardHeader>
            <CardTitle>
              Upcoming recurring
            </CardTitle>
          </CardHeader>

          <CardBody className="space-y-3">

            {loading ? (
              <p className="text-sm text-slate-400">
                Loading recurring expenses...
              </p>
            ) : upcomingRecurring.length ===
              0 ? (
              <p className="text-sm text-slate-400">
                No active recurring expenses.
              </p>
            ) : (
              upcomingRecurring.map(
                (item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-3 text-sm"
                  >

                    <div className="flex items-center gap-2">

                      <Repeat className="size-4 text-emerald-300" />

                      <div>

                        <p className="text-white">
                          {item.name}
                        </p>

                        <p className="text-xs text-slate-400">

                          {item.frequency ||
                            'Recurring'}

                          {' · due '}

                          {item.due_date
                            ? formatDate(
                                item.due_date,
                                'd MMM',
                              )
                            : 'No date'}

                        </p>

                      </div>

                    </div>

                    <p className="font-medium text-white">
                      {formatINR(
                        item.amount,
                      )}
                    </p>

                  </div>
                ),
              )
            )}

            <p className="text-xs text-slate-500">
              Recurring expenses are reminders for tracking. No payments are made automatically.
            </p>

          </CardBody>

        </Card>

      </div>

    </div>
  )
}