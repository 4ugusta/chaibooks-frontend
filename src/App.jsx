import { lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from './stores/authStore'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Set to false to re-enable the full app
const APP_ON_HOLD = true
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

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

function AccountOnHold() {
  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-lg border border-stone-200 p-8 text-center">
          {/* Logo / Brand */}
          <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-stone-800 mb-2">
            Account On Hold
          </h1>

          <p className="text-stone-500 mb-6">
            Your ChaiBooks account has been temporarily paused due to an outstanding balance.
          </p>

          {/* Amount Due Card */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-6">
            <p className="text-sm font-medium text-amber-700 mb-1">Amount Due</p>
            <p className="text-4xl font-bold text-amber-800">$75.00</p>
            <p className="text-sm text-amber-600 mt-1">Past due balance</p>
          </div>

          <p className="text-stone-600 text-sm mb-6">
            Please clear your outstanding balance to resume access to your account and all ChaiBooks features.
          </p>

          {/* Contact */}
          <div className="bg-stone-50 rounded-xl p-4 mb-6">
            <p className="text-sm text-stone-500 mb-1">Contact us to resolve</p>
            <a
              href="mailto:b.augusta1103@gmail.com?subject=ChaiBooks%20-%20Clear%20Outstanding%20Balance"
              className="text-primary-600 font-medium hover:text-primary-700 transition-colors"
            >
              b.augusta1103@gmail.com
            </a>
          </div>

          <a
            href="mailto:b.augusta1103@gmail.com?subject=ChaiBooks%20-%20Clear%20Outstanding%20Balance"
            className="w-full inline-flex items-center justify-center px-6 py-3 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            Contact to Pay
          </a>

          <p className="text-xs text-stone-400 mt-6">
            Once payment is confirmed, your account will be reactivated.
          </p>
        </div>
      </div>
    </div>
  )
}

function App() {
  if (APP_ON_HOLD) {
    return <AccountOnHold />
  }

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
