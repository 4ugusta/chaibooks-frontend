import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { invoiceAPI } from '../../services/api'
import { ArrowLeft, Download, FileText, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

export default function InvoiceDetail() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [invoice, setInvoice] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [paymentData, setPaymentData] = useState({
    amount: 0,
    method: 'cash',
    reference: '',
    notes: '',
    date: new Date().toISOString().split('T')[0]
  })

  useEffect(() => {
    loadInvoice()
  }, [id])

  // Close modal on Escape key
  useEffect(() => {
    if (!showPaymentModal) return
    const handleEscape = (e) => {
      if (e.key === 'Escape') setShowPaymentModal(false)
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [showPaymentModal])

  const loadInvoice = async () => {
    try {
      const response = await invoiceAPI.getOne(id)
      setInvoice(response.data)
    } catch (error) {

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

      toast.error('Failed to download PDF')
    }
  }

  const handleDownloadEWayBill = async () => {
    try {
      const response = await invoiceAPI.downloadEWayBill(id)
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      const ewayNumber = invoice.ewayBill?.number || invoice.eWayBill?.number
      link.setAttribute('download', `EWAY-${ewayNumber}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      toast.success('E-Way Bill downloaded successfully')
    } catch (error) {

      toast.error('Failed to download E-Way Bill')
    }
  }

  const handleRecordPayment = async (e) => {
    e.preventDefault()
    if (submitting) return
    setSubmitting(true)

    try {
      await invoiceAPI.updatePayment(id, paymentData)
      toast.success('Payment recorded successfully')
      setShowPaymentModal(false)
      setPaymentData({
        amount: 0,
        method: 'cash',
        reference: '',
        notes: '',
        date: new Date().toISOString().split('T')[0]
      })
      loadInvoice()
    } catch (error) {

      toast.error(error.response?.data?.error || 'Failed to record payment')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteInvoice = async () => {
    if (!window.confirm('Are you sure you want to delete this invoice? Stock will be restored and linked payments/transactions will be removed.')) {
      return
    }
    try {
      await invoiceAPI.delete(id)
      toast.success('Invoice deleted successfully')
      navigate('/invoices')
    } catch (error) {

      toast.error('Failed to delete invoice')
    }
  }

  const handleDeletePayment = async (paymentId) => {
    if (!window.confirm('Are you sure you want to delete this payment? This will also delete the linked transaction.')) {
      return
    }

    try {
      await invoiceAPI.deletePayment(id, paymentId)
      toast.success('Payment deleted successfully')
      loadInvoice()
    } catch (error) {

      toast.error('Failed to delete payment')
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
      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${colors[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}>
        {status.toUpperCase()}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="space-y-4 md:space-y-6">
        <h1 className="text-2xl md:text-3xl font-bold">Invoice Details</h1>
        <div className="card text-center py-8 text-gray-500 dark:text-gray-400">Loading invoice...</div>
      </div>
    )
  }

  if (!invoice) {
    return (
      <div className="space-y-4 md:space-y-6">
        <h1 className="text-2xl md:text-3xl font-bold">Invoice Details</h1>
        <div className="card text-center py-8">
          <FileText className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <p className="text-gray-500 dark:text-gray-400">Invoice not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header — stacks on mobile */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/invoices')} className="btn btn-secondary">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold truncate">Invoice {invoice.invoiceNumber}</h1>
        </div>
        <div className="flex flex-wrap gap-2 sm:ml-auto">
          {invoice.paymentStatus !== 'paid' && (
            <button onClick={() => setShowPaymentModal(true)} className="btn btn-success text-sm">
              Record Payment
            </button>
          )}
          <button onClick={handleDownloadPDF} className="btn btn-primary text-sm">
            <Download className="w-4 h-4 mr-1.5" />
            <span className="hidden sm:inline">Download </span>PDF
          </button>
          {(invoice.ewayBill?.number || invoice.eWayBill?.number) && (
            <button onClick={handleDownloadEWayBill} className="btn btn-secondary text-sm">
              <Download className="w-4 h-4 mr-1.5" />
              E-Way
            </button>
          )}
          <button onClick={handleDeleteInvoice} className="btn btn-danger text-sm">
            <Trash2 className="w-4 h-4 sm:mr-1.5" />
            <span className="hidden sm:inline">Delete</span>
          </button>
        </div>
      </div>

      {/* Invoice Header */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-base md:text-lg font-semibold mb-3">Invoice Information</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Invoice Number:</span>
                <span className="font-semibold">{invoice.invoiceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Invoice Date:</span>
                <span className="font-semibold">{format(new Date(invoice.invoiceDate), 'dd MMM yyyy')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Due Date:</span>
                <span className="font-semibold">{format(new Date(invoice.dueDate), 'dd MMM yyyy')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Type:</span>
                <span className="font-semibold capitalize">{invoice.invoiceType}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Payment Status:</span>
                <span>{getStatusBadge(invoice.paymentStatus)}</span>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-base md:text-lg font-semibold mb-3">Customer Details</h2>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-600 dark:text-gray-400">Name:</span>
                <p className="font-semibold">{invoice.customer?.name}</p>
              </div>
              {invoice.customer?.gstin && (
                <div>
                  <span className="text-gray-600 dark:text-gray-400">GSTIN:</span>
                  <p className="font-semibold break-all">{invoice.customer.gstin}</p>
                </div>
              )}
              {invoice.customer?.pan && (
                <div>
                  <span className="text-gray-600 dark:text-gray-400">PAN:</span>
                  <p className="font-semibold">{invoice.customer.pan}</p>
                </div>
              )}
              <div>
                <span className="text-gray-600 dark:text-gray-400">Contact:</span>
                <p className="font-semibold">{invoice.customer?.contact?.phone}</p>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Email:</span>
                <p className="font-semibold truncate">{invoice.customer?.contact?.email}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Line Items — table on desktop, cards on mobile */}
      <div className="card">
        <h2 className="text-base md:text-lg font-semibold mb-4">Items</h2>

        {/* Mobile card layout */}
        <div className="space-y-3 md:hidden">
          {invoice.items?.map((item) => (
            <div key={item._id || item.item?._id} className="border dark:border-gray-700 rounded-xl p-3 space-y-2">
              <div className="flex justify-between items-start">
                <div className="min-w-0 flex-1">
                  <p className="font-medium truncate">{item.item?.name || 'N/A'}</p>
                  {item.description && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{item.description}</p>
                  )}
                </div>
                <p className="font-bold text-primary-600 ml-2 flex-shrink-0">₹{item.total?.toFixed(2)}</p>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs text-gray-600 dark:text-gray-400">
                <div>
                  <span className="block text-gray-400 dark:text-gray-500">Qty</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">{item.quantity} {item.unit}</span>
                </div>
                <div>
                  <span className="block text-gray-400 dark:text-gray-500">Rate</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">₹{item.rate?.toFixed(2)}</span>
                </div>
                <div>
                  <span className="block text-gray-400 dark:text-gray-500">GST</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">{item.gst?.rate}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
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
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {invoice.items?.map((item) => (
                <tr key={item._id || item.item?._id}>
                  <td className="text-left">
                    <div className="font-medium max-w-[200px] truncate" title={item.item?.name || 'N/A'}>{item.item?.name || 'N/A'}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 max-w-[200px] truncate" title={item.description}>{item.description}</div>
                  </td>
                  <td className="text-right">{item.hsnCode || item.item?.hsnCode}</td>
                  <td className="text-right">{item.quantity} {item.unit}</td>
                  <td className="text-right">₹{item.rate?.toFixed(2)}</td>
                  <td className="text-right">₹{item.amount?.toFixed(2)}</td>
                  <td className="text-right">{item.gst?.rate}%</td>
                  {invoice.isInterState ? (
                    <td className="text-right">₹{item.gst?.igstAmount?.toFixed(2)}</td>
                  ) : (
                    <>
                      <td className="text-right">₹{item.gst?.cgstAmount?.toFixed(2)}</td>
                      <td className="text-right">₹{item.gst?.sgstAmount?.toFixed(2)}</td>
                    </>
                  )}
                  <td className="text-right font-semibold">₹{item.total?.toFixed(2)}</td>
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
            <span className="text-gray-600 dark:text-gray-400">Subtotal (Taxable):</span>
            <span className="font-semibold">₹{invoice.subtotal?.toFixed(2)}</span>
          </div>

          {invoice.isInterState ? (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">IGST:</span>
              <span className="font-semibold">₹{invoice.totalGst?.igst?.toFixed(2)}</span>
            </div>
          ) : (
            <>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">CGST:</span>
                <span className="font-semibold">₹{invoice.totalGst?.cgst?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">SGST:</span>
                <span className="font-semibold">₹{invoice.totalGst?.sgst?.toFixed(2)}</span>
              </div>
            </>
          )}

          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Total GST:</span>
            <span className="font-semibold">₹{invoice.totalGst?.total?.toFixed(2)}</span>
          </div>

          {invoice.discount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Discount:</span>
              <span className="font-semibold text-danger-600 dark:text-danger-400">- ₹{invoice.discount?.toFixed(2)}</span>
            </div>
          )}

          <div className="border-t dark:border-gray-700 pt-3">
            <div className="flex justify-between items-baseline">
              <span className="text-base md:text-lg font-semibold">Grand Total:</span>
              <span className="text-xl md:text-2xl font-bold text-primary-600">₹{invoice.grandTotal?.toFixed(2)}</span>
            </div>
          </div>

          {invoice.amountInWords && (
            <div className="text-sm text-gray-600 dark:text-gray-400 italic">
              Amount in words: {invoice.amountInWords}
            </div>
          )}
        </div>
      </div>

      {/* E-Way Bill */}
      {(invoice.ewayBill?.number || invoice.eWayBill?.number) && (
        <div className="card">
          <h2 className="text-base md:text-lg font-semibold mb-4">E-Way Bill Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600 dark:text-gray-400">E-Way Bill Number:</span>
              <p className="font-semibold break-all">{invoice.ewayBill?.number || invoice.eWayBill?.number}</p>
            </div>
            {(invoice.ewayBill?.validUntil || invoice.eWayBill?.validUpto) && (
              <div>
                <span className="text-gray-600 dark:text-gray-400">Valid Until:</span>
                <p className="font-semibold">{format(new Date(invoice.ewayBill?.validUntil || invoice.eWayBill?.validUpto), 'dd MMM yyyy')}</p>
              </div>
            )}
            {(invoice.ewayBill?.vehicleNumber) && (
              <div>
                <span className="text-gray-600 dark:text-gray-400">Vehicle Number:</span>
                <p className="font-semibold">{invoice.ewayBill.vehicleNumber}</p>
              </div>
            )}
            {(invoice.ewayBill?.distance) && (
              <div>
                <span className="text-gray-600 dark:text-gray-400">Distance:</span>
                <p className="font-semibold">{invoice.ewayBill.distance} km</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Payment Summary */}
      {(invoice.payments && invoice.payments.length > 0) && (
        <div className="card">
          <h2 className="text-base md:text-lg font-semibold mb-4">Payment Summary</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 text-sm mb-6">
            <div className="bg-success-50 dark:bg-success-900/20 p-3 md:p-4 rounded-xl">
              <span className="text-gray-600 dark:text-gray-400 block mb-1">Total Paid</span>
              <p className="text-xl md:text-2xl font-bold text-success-600 dark:text-success-400">₹{invoice.amountPaid?.toFixed(2) || '0.00'}</p>
            </div>
            <div className="bg-danger-50 dark:bg-danger-900/20 p-3 md:p-4 rounded-xl">
              <span className="text-gray-600 dark:text-gray-400 block mb-1">Balance Due</span>
              <p className="text-xl md:text-2xl font-bold text-danger-600 dark:text-danger-400">₹{invoice.balanceDue?.toFixed(2) || '0.00'}</p>
            </div>
            <div className="bg-info-50 dark:bg-info-900/20 p-3 md:p-4 rounded-xl">
              <span className="text-gray-600 dark:text-gray-400 block mb-1">Total Payments</span>
              <p className="text-xl md:text-2xl font-bold text-info-600 dark:text-info-400">{invoice.payments.length}</p>
            </div>
          </div>

          <h3 className="text-md font-semibold mb-3">Payment History</h3>

          {/* Mobile payment cards */}
          <div className="space-y-3 md:hidden">
            {invoice.payments.map((payment) => (
              <div key={payment._id} className="border dark:border-gray-700 rounded-xl p-3 flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="font-bold text-success-600 dark:text-success-400">₹{payment.amount?.toFixed(2)}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">{payment.method}</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {format(new Date(payment.date), 'dd MMM yyyy')}
                    {(payment.reference || payment.notes) && ` · ${payment.reference || payment.notes}`}
                  </p>
                </div>
                <button
                  onClick={() => handleDeletePayment(payment._id)}
                  className="btn-icon text-danger-600 hover:text-danger-800 dark:text-danger-400 dark:hover:text-danger-300 hover:bg-danger-50 dark:hover:bg-danger-900/20 flex-shrink-0"
                  aria-label="Delete payment"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Desktop payment table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="table text-sm">
              <thead>
                <tr>
                  <th className="text-left">Date</th>
                  <th className="text-left">Method</th>
                  <th className="text-left">Reference</th>
                  <th className="text-right">Amount</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {invoice.payments.map((payment) => (
                  <tr key={payment._id}>
                    <td>{format(new Date(payment.date), 'dd MMM yyyy')}</td>
                    <td className="capitalize">{payment.method}</td>
                    <td className="text-gray-600 dark:text-gray-400 max-w-[150px] truncate" title={payment.reference || payment.notes || '-'}>{payment.reference || payment.notes || '-'}</td>
                    <td className="text-right font-semibold text-success-600 dark:text-success-400">₹{payment.amount?.toFixed(2)}</td>
                    <td className="text-right">
                      <button
                        onClick={() => handleDeletePayment(payment._id)}
                        className="btn-icon text-danger-600 hover:text-danger-800 dark:text-danger-400 dark:hover:text-danger-300 hover:bg-danger-50 dark:hover:bg-danger-900/20"
                        aria-label="Delete payment"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50"
          onClick={() => setShowPaymentModal(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Record payment"
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-t-xl sm:rounded-xl p-4 md:p-6 max-w-md w-full sm:mx-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg md:text-xl font-semibold mb-4">Record Payment</h2>
            <form onSubmit={handleRecordPayment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount (₹) *</label>
                <input
                  type="number"
                  value={paymentData.amount}
                  onChange={(e) => setPaymentData({ ...paymentData, amount: parseFloat(e.target.value) })}
                  className="input"
                  min="0.01"
                  step="0.01"
                  max={invoice.balanceDue || invoice.grandTotal}
                  required
                />
                <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <span>Balance due: ₹{(invoice.balanceDue || invoice.grandTotal).toFixed(2)}</span>
                  <button
                    type="button"
                    onClick={() => setPaymentData({ ...paymentData, amount: invoice.balanceDue || invoice.grandTotal })}
                    className="text-primary-600 hover:text-primary-700 font-medium p-1"
                  >
                    Pay Full
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Payment Method *</label>
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Payment Date *</label>
                <input
                  type="date"
                  value={paymentData.date}
                  onChange={(e) => setPaymentData({ ...paymentData, date: e.target.value })}
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Reference</label>
                <input
                  type="text"
                  value={paymentData.reference}
                  onChange={(e) => setPaymentData({ ...paymentData, reference: e.target.value })}
                  className="input"
                  placeholder="Transaction ID, cheque number, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
                <textarea
                  value={paymentData.notes}
                  onChange={(e) => setPaymentData({ ...paymentData, notes: e.target.value })}
                  className="input"
                  rows="2"
                  placeholder="Additional notes (optional)"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button type="submit" disabled={submitting} className="btn btn-primary flex-1">
                  {submitting ? 'Saving...' : 'Record Payment'}
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
