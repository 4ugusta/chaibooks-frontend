import { lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from './stores/authStore'

// Layouts (always loaded — they wrap everything)
import Layout from './components/layout/Layout'
import AuthLayout from './components/layout/AuthLayout'

// Pages — lazy loaded per route
const Login = lazy(() => import('./pages/auth/Login'))
const Register = lazy(() => import('./pages/auth/Register'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Customers = lazy(() => import('./pages/customers/Customers'))
const CustomerForm = lazy(() => import('./pages/customers/CustomerForm'))
const Items = lazy(() => import('./pages/items/Items'))
const ItemForm = lazy(() => import('./pages/items/ItemForm'))
const Invoices = lazy(() => import('./pages/invoices/Invoices'))
const InvoiceForm = lazy(() => import('./pages/invoices/InvoiceForm'))
const InvoiceDetail = lazy(() => import('./pages/invoices/InvoiceDetail'))
const Transactions = lazy(() => import('./pages/transactions/Transactions'))
const Reports = lazy(() => import('./pages/reports/Reports'))
const Settings = lazy(() => import('./pages/Settings'))

function PrivateRoute({ children }) {
  const { user } = useAuthStore()
  return user ? children : <Navigate to="/login" />
}

function PublicRoute({ children }) {
  const { user } = useAuthStore()
  return !user ? children : <Navigate to="/" />
}

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="text-gray-500 dark:text-gray-400">Loading...</div>
    </div>
  )
}

function App() {
  return (
    <>
      <Router>
        <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public Routes */}
          <Route element={<AuthLayout />}>
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              }
            />
          </Route>

          {/* Private Routes */}
          <Route
            element={
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            }
          >
            <Route path="/" element={<Dashboard />} />

            {/* Customers */}
            <Route path="/customers" element={<Customers />} />
            <Route path="/customers/new" element={<CustomerForm />} />
            <Route path="/customers/:id/edit" element={<CustomerForm />} />

            {/* Items */}
            <Route path="/items" element={<Items />} />
            <Route path="/items/new" element={<ItemForm />} />
            <Route path="/items/:id/edit" element={<ItemForm />} />

            {/* Invoices */}
            <Route path="/invoices" element={<Invoices />} />
            <Route path="/invoices/new" element={<InvoiceForm />} />
            <Route path="/invoices/:id" element={<InvoiceDetail />} />
            <Route path="/invoices/:id/edit" element={<InvoiceForm />} />

            {/* Transactions */}
            <Route path="/transactions" element={<Transactions />} />

            {/* Reports */}
            <Route path="/reports" element={<Reports />} />

            {/* Settings */}
            <Route path="/settings" element={<Settings />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
        </Suspense>
      </Router>
      <Toaster position="top-right" />
    </>
  )
}

export default App
