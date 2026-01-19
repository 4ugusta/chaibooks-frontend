import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { invoiceAPI } from '../../services/api'
import { Plus, Search, Eye, Download, FileText } from 'lucide-react'
import { format } from 'date-fns'

export default function Invoices() {
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    loadInvoices()
  }, [])

  const loadInvoices = async () => {
    try {
      const response = await invoiceAPI.getAll({ search })
      setInvoices(response.data.invoices || [])
    } catch (error) {
      console.error('Failed to load invoices:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    const colors = {
      paid: 'bg-green-100 text-green-800',
      unpaid: 'bg-red-100 text-red-800',
      partial: 'bg-yellow-100 text-yellow-800',
      overdue: 'bg-red-100 text-red-800'
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status.toUpperCase()}
      </span>
    )
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
      console.error('Failed to download PDF:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Invoices</h1>
        <Link to="/invoices/new" className="btn btn-primary">
          <Plus className="w-4 h-4 mr-2" />
          Create Invoice
        </Link>
      </div>

      <div className="card">
        <div className="mb-4">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search invoices..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyUp={loadInvoices}
              className="input pl-10"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : invoices.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">No invoices found. Create your first invoice to get started.</p>
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
              <tbody className="divide-y divide-gray-200">
                {invoices.map((invoice) => (
                  <tr key={invoice._id}>
                    <td className="font-medium">{invoice.invoiceNumber}</td>
                    <td>{format(new Date(invoice.invoiceDate), 'dd MMM yyyy')}</td>
                    <td>{invoice.customer?.name || 'N/A'}</td>
                    <td className="font-semibold">₹{invoice.grandTotal?.toFixed(2)}</td>
                    <td>{getStatusBadge(invoice.paymentStatus)}</td>
                    <td>
                      <div className="flex gap-2">
                        <Link
                          to={`/invoices/${invoice._id}`}
                          className="text-blue-600 hover:text-blue-800"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDownloadPDF(invoice._id, invoice.invoiceNumber)}
                          className="text-green-600 hover:text-green-800"
                          title="Download PDF"
                        >
                          <Download className="w-4 h-4" />
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
