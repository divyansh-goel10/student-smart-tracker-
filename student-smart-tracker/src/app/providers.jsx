import { Toaster } from 'sonner'
import { AuthProvider } from '@/hooks/useAuth'

export function AppProviders({ children }) {
  return (
    <AuthProvider>
      {children}
      <Toaster
        theme="dark"
        position="top-right"
        toastOptions={{
          style: {
            background: '#121a31',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#e8edf7',
          },
        }}
      />
    </AuthProvider>
  )
}
