import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { reportAPI, invoiceAPI, customerAPI, itemAPI } from '../services/api'
import { DollarSign, Users, Package, FileText, TrendingUp, TrendingDown } from 'lucide-react'

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalItems: 0,
    pendingInvoices: 0,
    paidInvoices: 0,
    profitLoss: null
  })
  const [loading, setLoading] = useState(true)

  // Format large numbers for display
  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '₹0.00'
    const absAmount = Math.abs(amount)
    if (absAmount >= 10000000) { // 1 crore
      return `₹${(amount / 10000000).toFixed(2)}Cr`
    } else if (absAmount >= 100000) { // 1 lakh
      return `₹${(amount / 100000).toFixed(2)}L`
    } else {
      return `₹${amount.toFixed(2)}`
    }
  }

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
      console.error('Failed to load dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const StatCard = ({ title, value, icon: Icon, color, link, fullValue }) => (
    <Link to={link} className="card hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-2xl lg:text-3xl font-bold truncate" title={fullValue}>
            {loading ? '...' : value}
          </p>
        </div>
        <div className={`p-3 rounded-lg ${color} flex-shrink-0 ml-2`}>
          <Icon className="w-8 h-8 text-white" />
        </div>
      </div>
    </Link>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Link to="/invoices/new" className="btn btn-primary">
          Create Invoice
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Customers"
          value={stats.totalCustomers}
          icon={Users}
          color="bg-blue-500"
          link="/customers"
        />
        <StatCard
          title="Total Items"
          value={stats.totalItems}
          icon={Package}
          color="bg-green-500"
          link="/items"
        />
        <StatCard
          title="Total Invoices"
          value={stats.pendingInvoices}
          icon={FileText}
          color="bg-yellow-500"
          link="/invoices"
        />
        <StatCard
          title="Net Profit"
          value={stats.profitLoss ? formatCurrency(stats.profitLoss.netProfit) : '₹0'}
          fullValue={stats.profitLoss ? `₹${stats.profitLoss.netProfit.toFixed(2)}` : '₹0'}
          icon={stats.profitLoss?.netProfit >= 0 ? TrendingUp : TrendingDown}
          color={stats.profitLoss?.netProfit >= 0 ? 'bg-primary-500' : 'bg-red-500'}
          link="/reports"
        />
      </div>

      {stats.profitLoss && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card">
            <h3 className="text-lg font-semibold mb-2">Revenue</h3>
            <p className="text-xl lg:text-2xl font-bold text-green-600 truncate"
               title={`₹${stats.profitLoss.revenue.toFixed(2)}`}>
              {formatCurrency(stats.profitLoss.revenue)}
            </p>
          </div>
          <div className="card">
            <h3 className="text-lg font-semibold mb-2">Expenses</h3>
            <p className="text-xl lg:text-2xl font-bold text-red-600 truncate"
               title={`₹${stats.profitLoss.cost.toFixed(2)}`}>
              {formatCurrency(stats.profitLoss.cost)}
            </p>
          </div>
          <div className="card">
            <h3 className="text-lg font-semibold mb-2">Profit Margin</h3>
            <p className="text-xl lg:text-2xl font-bold text-blue-600">
              {stats.profitLoss.profitMargin.toFixed(2)}%
            </p>
          </div>
        </div>
      )}

      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link to="/customers/new" className="btn btn-secondary text-center">
            Add Customer
          </Link>
          <Link to="/items/new" className="btn btn-secondary text-center">
            Add Item
          </Link>
          <Link to="/invoices/new" className="btn btn-secondary text-center">
            Create Invoice
          </Link>
          <Link to="/reports" className="btn btn-secondary text-center">
            View Reports
          </Link>
        </div>
      </div>
    </div>
  )
}
