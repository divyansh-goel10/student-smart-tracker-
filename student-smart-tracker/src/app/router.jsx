import { BrowserRouter, Navigate, Route, Routes } from 'react-router'
import { AppShell } from '@/components/layout/AppShell'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { PublicShell } from '@/components/layout/PublicShell'
import { DashboardPage } from '@/pages/app/DashboardPage'
import {
  BudgetPage,
  ChatPage,
  ExpensesPage,
  InsightsPage,
  PocketMoneyPage,
  RecurringPage,
  SavingsPage,
  ScanPage,
  SettingsPage,
  SplitsPage,
  WhatIfPage,
} from '@/pages/app/FeaturePages'
import { LoginPage, ResetPasswordPage, SignupPage } from '@/pages/public/AuthPages'
import { LandingPage } from '@/pages/public/LandingPage'

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicShell />}>
          <Route path="/" element={<LandingPage />} />
        </Route>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <AppShell />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="expenses" element={<ExpensesPage />} />
          <Route path="budget" element={<BudgetPage />} />
          <Route path="pocket-money" element={<PocketMoneyPage />} />
          <Route path="recurring" element={<RecurringPage />} />
          <Route path="savings" element={<SavingsPage />} />
          <Route path="splits" element={<SplitsPage />} />
          <Route path="insights" element={<InsightsPage />} />
          <Route path="chat" element={<ChatPage />} />
          <Route path="scan" element={<ScanPage />} />
          <Route path="what-if" element={<WhatIfPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
