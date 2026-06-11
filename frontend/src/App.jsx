import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ToastProvider } from './components/ui/Toast'
import AppLayout from './components/layout/AppLayout'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import ResidentPage from './pages/residents/ResidentsPage'
import HousePage from './pages/houses/HousesPage'
import MonthlyBillsPage from './pages/monthly-bills/MonthlyBillsPage'
import ExpensesPage from './pages/expenses/ExpensesPage'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen bg-slate-50" />
  return user ? children : <Navigate to="/login" replace />
}

function GuestRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen bg-slate-50" />
  return !user ? children : <Navigate to="/overview" replace />
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />

            <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
              <Route path="/overview" element={<DashboardPage />} />
              <Route path="/residents" element={<ResidentPage />} />
              <Route path="/houses" element={<HousePage />} />
              <Route path="/monthly-bills" element={<MonthlyBillsPage />} />
              <Route path="/expenses" element={<ExpensesPage />} />
            </Route>

            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  )
}