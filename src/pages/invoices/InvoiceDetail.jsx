import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { invoiceAPI } from '../../services/api'
import { ArrowLeft, Download, FileText } from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

export default function InvoiceDetail() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [invoice, setInvoice] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentData, setPaymentData] = useState({
    amount: 0,
    method: 'cash',
    reference: '',
    date: new Date().toISOString().split('T')[0]
  })

  useEffect(() => {
    loadInvoice()
  }, [id])

  const loadInvoice = async () => {
    try {
      const response = await invoiceAPI.getOne(id)
      setInvoice(response.data)
    } catch (error) {
      console.error('Failed to load invoice:', error)
      toast.error('Failed to load invoice')
      navigate('/invoices')
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadPDF = async () => {
    try {
      const response = await invoiceAPI.downloadPDF(id)
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `${invoice.invoiceNumber}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      toast.success('PDF downloaded successfully')
    } catch (error) {
      console.error('Failed to download PDF:', error)
      toast.error('Failed to download PDF')
    }
  }

  const handleDownloadEWayBill = async () => {
    try {
      const response = await invoiceAPI.downloadEWayBill(id)
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `EWAY-${invoice.ewayBill.number}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      toast.success('E-Way Bill downloaded successfully')
    } catch (error) {
      console.error('Failed to download E-Way Bill:', error)
      toast.error('Failed to download E-Way Bill')
    }
  }

  const handleRecordPayment = async (e) => {
    e.preventDefault()
    try {
      await invoiceAPI.updatePayment(id, paymentData)
      toast.success('Payment recorded successfully')
      setShowPaymentModal(false)
      loadInvoice() // Reload invoice data
    } catch (error) {
      console.error('Failed to record payment:', error)
      toast.error('Failed to record payment')
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
      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status.toUpperCase()}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Invoice Details</h1>
        <div className="card text-center py-8">Loading invoice...</div>
      </div>
    )
  }

  if (!invoice) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Invoice Details</h1>
        <div className="card text-center py-8">
          <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">Invoice not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/invoices')} className="btn btn-secondary">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className="text-3xl font-bold">Invoice {invoice.invoiceNumber}</h1>
        <div className="ml-auto flex gap-2">
          {invoice.paymentStatus !== 'paid' && (
            <button onClick={() => setShowPaymentModal(true)} className="btn btn-success">
              Record Payment
            </button>
          )}
          <button onClick={handleDownloadPDF} className="btn btn-primary">
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </button>
          {invoice.ewayBill?.number && (
            <button onClick={handleDownloadEWayBill} className="btn btn-secondary">
              <Download className="w-4 h-4 mr-2" />
              E-Way Bill
            </button>
          )}
        </div>
      </div>

      {/* Invoice Header */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-lg font-semibold mb-3">Invoice Information</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Invoice Number:</span>
                <span className="font-semibold">{invoice.invoiceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Invoice Date:</span>
                <span className="font-semibold">{format(new Date(invoice.invoiceDate), 'dd MMM yyyy')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Due Date:</span>
                <span className="font-semibold">{format(new Date(invoice.dueDate), 'dd MMM yyyy')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Type:</span>
                <span className="font-semibold capitalize">{invoice.invoiceType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Status:</span>
                <span>{getStatusBadge(invoice.paymentStatus)}</span>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-3">Customer Details</h2>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-600">Name:</span>
                <p className="font-semibold">{invoice.customer?.name}</p>
              </div>
              <div>
                <span className="text-gray-600">GSTIN:</span>
                <p className="font-semibold">{invoice.customer?.gstin || 'N/A'}</p>
              </div>
              <div>
                <span className="text-gray-600">Contact:</span>
                <p className="font-semibold">{invoice.customer?.contact?.phone}</p>
              </div>
              <div>
                <span className="text-gray-600">Email:</span>
                <p className="font-semibold">{invoice.customer?.contact?.email}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Line Items */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Items</h2>
        <div className="overflow-x-auto">
          <table className="table text-sm">
            <thead>
              <tr>
                <th className="text-left">Item</th>
                <th className="text-right">HSN</th>
                <th className="text-right">Qty</th>
                <th className="text-right">Rate</th>
                <th className="text-right">Taxable</th>
                <th className="text-right">GST %</th>
                {invoice.isInterState ? (
                  <th className="text-right">IGST</th>
                ) : (
                  <>
                    <th className="text-right">CGST</th>
                    <th className="text-right">SGST</th>
                  </>
                )}
                <th className="text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {invoice.items?.map((item, index) => (
                <tr key={index}>
                  <td className="text-left">
                    <div className="font-medium">{item.item?.name || 'N/A'}</div>
                    <div className="text-xs text-gray-500">{item.description}</div>
                  </td>
                  <td className="text-right">{item.item?.hsnCode}</td>
                  <td className="text-right">{item.quantity} {item.unit}</td>
                  <td className="text-right">₹{item.rate?.toFixed(2)}</td>
                  <td className="text-right">₹{item.taxableAmount?.toFixed(2)}</td>
                  <td className="text-right">{item.gstRate}%</td>
                  {invoice.isInterState ? (
                    <td className="text-right">₹{item.igst?.toFixed(2)}</td>
                  ) : (
                    <>
                      <td className="text-right">₹{item.cgst?.toFixed(2)}</td>
                      <td className="text-right">₹{item.sgst?.toFixed(2)}</td>
                    </>
                  )}
                  <td className="text-right font-semibold">₹{item.totalAmount?.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Totals */}
      <div className="card">
        <div className="max-w-md ml-auto space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal (Taxable):</span>
            <span className="font-semibold">₹{invoice.subtotal?.toFixed(2)}</span>
          </div>

          {invoice.isInterState ? (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">IGST:</span>
              <span className="font-semibold">₹{invoice.igst?.toFixed(2)}</span>
            </div>
          ) : (
            <>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">CGST:</span>
                <span className="font-semibold">₹{invoice.cgst?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">SGST:</span>
                <span className="font-semibold">₹{invoice.sgst?.toFixed(2)}</span>
              </div>
            </>
          )}

          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Total GST:</span>
            <span className="font-semibold">₹{invoice.totalGST?.toFixed(2)}</span>
          </div>

          {invoice.discount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Discount:</span>
              <span className="font-semibold text-red-600">- ₹{invoice.discount?.toFixed(2)}</span>
            </div>
          )}

          <div className="border-t pt-3">
            <div className="flex justify-between">
              <span className="text-lg font-semibold">Grand Total:</span>
              <span className="text-2xl font-bold text-primary-600">₹{invoice.grandTotal?.toFixed(2)}</span>
            </div>
          </div>

          {invoice.amountInWords && (
            <div className="text-sm text-gray-600 italic">
              Amount in words: {invoice.amountInWords}
            </div>
          )}
        </div>
      </div>

      {/* E-Way Bill */}
      {invoice.ewayBill && invoice.ewayBill.number && (
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">E-Way Bill Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">E-Way Bill Number:</span>
              <p className="font-semibold">{invoice.ewayBill.number}</p>
            </div>
            <div>
              <span className="text-gray-600">Valid Until:</span>
              <p className="font-semibold">{format(new Date(invoice.ewayBill.validUntil), 'dd MMM yyyy')}</p>
            </div>
            <div>
              <span className="text-gray-600">Vehicle Number:</span>
              <p className="font-semibold">{invoice.ewayBill.vehicleNumber}</p>
            </div>
            <div>
              <span className="text-gray-600">Distance:</span>
              <p className="font-semibold">{invoice.ewayBill.distance} km</p>
            </div>
          </div>
        </div>
      )}

      {/* Payment Information */}
      {invoice.paymentDetails && (
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Payment Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Payment Method:</span>
              <p className="font-semibold capitalize">{invoice.paymentDetails.method}</p>
            </div>
            <div>
              <span className="text-gray-600">Amount Paid:</span>
              <p className="font-semibold text-green-600">₹{invoice.paymentDetails.amountPaid?.toFixed(2)}</p>
            </div>
            <div>
              <span className="text-gray-600">Balance Due:</span>
              <p className="font-semibold text-red-600">₹{(invoice.grandTotal - (invoice.paymentDetails.amountPaid || 0))?.toFixed(2)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-semibold mb-4">Record Payment</h2>
            <form onSubmit={handleRecordPayment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹) *</label>
                <input
                  type="number"
                  value={paymentData.amount}
                  onChange={(e) => setPaymentData({ ...paymentData, amount: parseFloat(e.target.value) })}
                  className="input"
                  min="0"
                  step="0.01"
                  max={invoice.grandTotal - (invoice.paymentDetails?.amountPaid || 0)}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Balance due: ₹{(invoice.grandTotal - (invoice.paymentDetails?.amountPaid || 0)).toFixed(2)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method *</label>
                <select
                  value={paymentData.method}
                  onChange={(e) => setPaymentData({ ...paymentData, method: e.target.value })}
                  className="input"
                  required
                >
                  <option value="cash">Cash</option>
                  <option value="upi">UPI</option>
                  <option value="cheque">Cheque</option>
                  <option value="neft">NEFT</option>
                  <option value="rtgs">RTGS</option>
                  <option value="card">Card</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Date *</label>
                <input
                  type="date"
                  value={paymentData.date}
                  onChange={(e) => setPaymentData({ ...paymentData, date: e.target.value })}
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reference/Notes</label>
                <input
                  type="text"
                  value={paymentData.reference}
                  onChange={(e) => setPaymentData({ ...paymentData, reference: e.target.value })}
                  className="input"
                  placeholder="Transaction ID, cheque number, etc."
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button type="submit" className="btn btn-primary flex-1">
                  Record Payment
                </button>
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
