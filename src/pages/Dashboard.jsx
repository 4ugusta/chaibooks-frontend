import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { reportAPI, invoiceAPI, customerAPI, itemAPI } from '../services/api'
import { Users, Package, FileText, TrendingUp, TrendingDown } from 'lucide-react'

const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return '₹0.00'
  const absAmount = Math.abs(amount)
  if (absAmount >= 10000000) return `₹${(amount / 10000000).toFixed(2)}Cr`
  if (absAmount >= 100000) return `₹${(amount / 100000).toFixed(2)}L`
  return `₹${amount.toFixed(2)}`
}

function StatCard({ title, value, icon: Icon, color, link, fullValue, loading }) {
  return (
    <Link to={link} className="card hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{title}</p>
          <p className="text-xl md:text-2xl lg:text-3xl font-bold truncate" title={fullValue}>
            {loading ? '...' : value}
          </p>
        </div>
        <div className={`p-2 md:p-3 rounded-xl ${color} flex-shrink-0 ml-2`}>
          <Icon className="w-6 h-6 md:w-8 md:h-8 text-white" />
        </div>
      </div>
    </Link>
  )
}

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalItems: 0,
    pendingInvoices: 0,
    paidInvoices: 0,
    profitLoss: null
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const [customersRes, itemsRes, invoicesRes, profitLossRes] = await Promise.all([
        customerAPI.getAll({ limit: 1 }),
        itemAPI.getAll({ limit: 1 }),
        invoiceAPI.getAll({ limit: 1 }),
        reportAPI.getProfitLoss()
      ])

      setStats({
        totalCustomers: customersRes.data.totalCustomers || 0,
        totalItems: itemsRes.data.totalItems || 0,
        pendingInvoices: invoicesRes.data.totalInvoices || 0,
        paidInvoices: 0,
        profitLoss: profitLossRes.data
      })
    } catch (error) {

    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>
        <Link to="/invoices/new" className="btn btn-primary text-sm md:text-base">
          Create Invoice
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        <StatCard
          title="Total Customers"
          value={stats.totalCustomers}
          icon={Users}
          color="bg-info-500"
          link="/customers"
          loading={loading}
        />
        <StatCard
          title="Total Items"
          value={stats.totalItems}
          icon={Package}
          color="bg-success-500"
          link="/items"
          loading={loading}
        />
        <StatCard
          title="Total Invoices"
          value={stats.pendingInvoices}
          icon={FileText}
          color="bg-warning-500"
          link="/invoices"
          loading={loading}
        />
        <StatCard
          title="Net Profit"
          value={stats.profitLoss ? formatCurrency(stats.profitLoss.netProfit) : '₹0'}
          fullValue={stats.profitLoss ? `₹${stats.profitLoss.netProfit.toFixed(2)}` : '₹0'}
          icon={stats.profitLoss?.netProfit >= 0 ? TrendingUp : TrendingDown}
          color={stats.profitLoss?.netProfit >= 0 ? 'bg-primary-500' : 'bg-danger-500'}
          link="/reports"
          loading={loading}
        />
      </div>

      {stats.profitLoss && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-6">
            <div className="card">
              <h3 className="text-sm md:text-lg font-semibold mb-1 md:mb-2">Revenue</h3>
              <p className="text-lg md:text-xl lg:text-2xl font-bold text-success-600 dark:text-success-400 truncate"
                 title={`₹${stats.profitLoss.revenue.toFixed(2)}`}>
                {formatCurrency(stats.profitLoss.revenue)}
              </p>
            </div>
            <div className="card">
              <h3 className="text-sm md:text-lg font-semibold mb-1 md:mb-2">Collected</h3>
              <p className="text-lg md:text-xl lg:text-2xl font-bold text-success-700 dark:text-success-400 truncate"
                 title={`₹${stats.profitLoss.totalCollected.toFixed(2)}`}>
                {formatCurrency(stats.profitLoss.totalCollected)}
              </p>
            </div>
            <div className="card">
              <h3 className="text-sm md:text-lg font-semibold mb-1 md:mb-2">Due</h3>
              <p className="text-lg md:text-xl lg:text-2xl font-bold text-warning-600 dark:text-warning-400 truncate"
                 title={`₹${stats.profitLoss.totalDue.toFixed(2)}`}>
                {formatCurrency(stats.profitLoss.totalDue)}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-6">
            <div className="card">
              <h3 className="text-sm md:text-lg font-semibold mb-1 md:mb-2">Purchases</h3>
              <p className="text-lg md:text-xl lg:text-2xl font-bold text-danger-600 dark:text-danger-400 truncate"
                 title={`₹${stats.profitLoss.cost.toFixed(2)}`}>
                {formatCurrency(stats.profitLoss.cost)}
              </p>
            </div>
            <div className="card">
              <h3 className="text-sm md:text-lg font-semibold mb-1 md:mb-2">Expenses</h3>
              <p className="text-lg md:text-xl lg:text-2xl font-bold text-danger-600 dark:text-danger-400 truncate"
                 title={`₹${stats.profitLoss.expenses.toFixed(2)}`}>
                {formatCurrency(stats.profitLoss.expenses)}
              </p>
            </div>
            <div className="card">
              <h3 className="text-sm md:text-lg font-semibold mb-1 md:mb-2">Profit Margin</h3>
              <p className="text-lg md:text-xl lg:text-2xl font-bold text-info-600 dark:text-info-400">
                {stats.profitLoss.profitMargin.toFixed(2)}%
              </p>
            </div>
          </div>
        </>
      )}

      <div className="card">
        <h2 className="text-lg md:text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <Link to="/customers/new" className="btn btn-secondary text-center text-sm md:text-base">
            Add Customer
          </Link>
          <Link to="/items/new" className="btn btn-secondary text-center text-sm md:text-base">
            Add Item
          </Link>
          <Link to="/invoices/new" className="btn btn-secondary text-center text-sm md:text-base">
            Create Invoice
          </Link>
          <Link to="/reports" className="btn btn-secondary text-center text-sm md:text-base">
            View Reports
          </Link>
        </div>
      </div>
    </div>
  )
}
