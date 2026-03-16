import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { invoiceAPI } from '../../services/api'
import { Plus, Search, Eye, Download, FileText, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

export default function Invoices() {
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => {
      loadInvoices()
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  const loadInvoices = async () => {
    try {
      const response = await invoiceAPI.getAll({ search })
      setInvoices(response.data.invoices || [])
    } catch (error) {

      toast.error('Failed to load invoices')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    const colors = {
      paid: 'bg-success-100 text-success-800 dark:bg-success-900/30 dark:text-success-400',
      unpaid: 'bg-danger-100 text-danger-800 dark:bg-danger-900/30 dark:text-danger-400',
      partial: 'bg-warning-100 text-warning-800 dark:bg-warning-900/30 dark:text-warning-400',
      overdue: 'bg-danger-100 text-danger-800 dark:bg-danger-900/30 dark:text-danger-400'
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colors[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}>
        {status.toUpperCase()}
      </span>
    )
  }

  const handleDelete = async (id, invoiceNumber) => {
    if (!window.confirm(`Delete invoice ${invoiceNumber}? Stock will be restored and linked payments/transactions will be removed.`)) {
      return
    }
    try {
      await invoiceAPI.delete(id)
      toast.success('Invoice deleted successfully')
      setInvoices(invoices.filter(inv => inv._id !== id))
    } catch (error) {

      toast.error('Failed to delete invoice')
    }
  }

  const handleDownloadPDF = async (id, invoiceNumber) => {
    try {
      const response = await invoiceAPI.downloadPDF(id)
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `${invoiceNumber}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (error) {

      toast.error('Failed to download PDF')
    }
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl md:text-3xl font-bold">Invoices</h1>
        <Link to="/invoices/new" className="btn btn-primary text-sm md:text-base">
          <Plus className="w-4 h-4 mr-1.5" />
          <span className="hidden sm:inline">Create </span>Invoice
        </Link>
      </div>

      <div className="card">
        <div className="mb-4">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Search invoices..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-10"
              aria-label="Search invoices"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">Loading invoices...</div>
        ) : invoices.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No invoices found. Create your first invoice to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Invoice #</th>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {invoices.map((invoice) => (
                  <tr key={invoice._id}>
                    <td className="font-medium">{invoice.invoiceNumber}</td>
                    <td>{format(new Date(invoice.invoiceDate), 'dd MMM yyyy')}</td>
                    <td className="max-w-[200px] truncate" title={invoice.customer?.name || 'N/A'}>{invoice.customer?.name || 'N/A'}</td>
                    <td className="font-semibold">₹{invoice.grandTotal?.toFixed(2)}</td>
                    <td>{getStatusBadge(invoice.paymentStatus)}</td>
                    <td>
                      <div className="flex gap-1">
                        <Link
                          to={`/invoices/${invoice._id}`}
                          className="btn-icon text-info-600 hover:text-info-800 dark:text-info-400 dark:hover:text-info-300 hover:bg-info-50 dark:hover:bg-info-900/20"
                          aria-label={`View invoice ${invoice.invoiceNumber}`}
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDownloadPDF(invoice._id, invoice.invoiceNumber)}
                          className="btn-icon text-success-600 hover:text-success-800 dark:text-success-400 dark:hover:text-success-300 hover:bg-success-50 dark:hover:bg-success-900/20"
                          aria-label={`Download invoice ${invoice.invoiceNumber} as PDF`}
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(invoice._id, invoice.invoiceNumber)}
                          className="btn-icon text-danger-600 hover:text-danger-800 dark:text-danger-400 dark:hover:text-danger-300 hover:bg-danger-50 dark:hover:bg-danger-900/20"
                          aria-label={`Delete invoice ${invoice.invoiceNumber}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
