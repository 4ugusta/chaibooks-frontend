import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from './stores/authStore'

// Layouts
import Layout from './components/layout/Layout'
import AuthLayout from './components/layout/AuthLayout'

// Pages
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import Dashboard from './pages/Dashboard'
import Customers from './pages/customers/Customers'
import CustomerForm from './pages/customers/CustomerForm'
import Items from './pages/items/Items'
import ItemForm from './pages/items/ItemForm'
import Invoices from './pages/invoices/Invoices'
import InvoiceForm from './pages/invoices/InvoiceForm'
import InvoiceDetail from './pages/invoices/InvoiceDetail'
import Transactions from './pages/transactions/Transactions'
import Reports from './pages/reports/Reports'
import Settings from './pages/Settings'

function PrivateRoute({ children }) {
  const { user } = useAuthStore()
  return user ? children : <Navigate to="/login" />
}

function PublicRoute({ children }) {
  const { user } = useAuthStore()
  return !user ? children : <Navigate to="/" />
}

function App() {
  return (
    <>
      <Router>
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
      </Router>
      <Toaster position="top-right" />
    </>
  )
}

export default App
