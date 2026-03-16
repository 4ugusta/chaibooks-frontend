import { useEffect, useState } from 'react'
import { transactionAPI, customerAPI, invoiceAPI } from '../../services/api'
import { ArrowLeftRight, Plus, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

export default function Transactions() {
  const [transactions, setTransactions] = useState([])
  const [customers, setCustomers] = useState([])
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [showTransactionModal, setShowTransactionModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [transactionData, setTransactionData] = useState({
    transactionType: 'payment_received',
    amount: 0,
    paymentMethod: 'cash',
    customer: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    reference: '',
    referenceId: ''
  })

  useEffect(() => {
    loadData()
  }, [])

  // Close modal on Escape key
  useEffect(() => {
    if (!showTransactionModal) return
    const handleEscape = (e) => {
      if (e.key === 'Escape') setShowTransactionModal(false)
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [showTransactionModal])

  const loadData = async () => {
    try {
      const [transactionsRes, customersRes] = await Promise.all([
        transactionAPI.getAll(),
        customerAPI.getAll()
      ])
      setTransactions(transactionsRes.data.transactions || [])
      setCustomers(customersRes.data.customers || [])
    } catch (error) {

      toast.error('Failed to load transactions')
    } finally {
      setLoading(false)
    }
  }

  const loadInvoicesForCustomer = async (customerId) => {
    if (!customerId) {
      setInvoices([])
      return
    }
    try {
      const response = await invoiceAPI.getAll({ customer: customerId })
      setInvoices(response.data.invoices || [])
    } catch (error) {

      setInvoices([])
    }
  }

  const handleCreateTransaction = async (e) => {
    e.preventDefault()
    if (submitting) return
    setSubmitting(true)

    try {
      const dataToSend = {
        transactionType: transactionData.transactionType,
        amount: transactionData.amount,
        paymentMethod: transactionData.paymentMethod,
        description: transactionData.description,
        date: transactionData.date
      }

      if (transactionData.customer) {
        dataToSend.customer = transactionData.customer
      }

      if (transactionData.reference === 'invoice' && transactionData.referenceId) {
        dataToSend.reference = 'invoice'
        dataToSend.referenceId = transactionData.referenceId
        dataToSend.referenceModel = 'Invoice'
      } else {
        dataToSend.reference = 'direct'
      }

      await transactionAPI.create(dataToSend)
      toast.success('Transaction recorded successfully')
      setShowTransactionModal(false)
      setTransactionData({
        transactionType: 'payment_received',
        amount: 0,
        paymentMethod: 'cash',
        customer: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        reference: '',
        referenceId: ''
      })
      setInvoices([])
      loadData()
    } catch (error) {

      toast.error(error.response?.data?.error || 'Failed to create transaction')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteTransaction = async (transactionId) => {
    if (!window.confirm('Are you sure you want to delete this transaction? This will also update the linked invoice if applicable.')) {
      return
    }

    try {
      await transactionAPI.delete(transactionId)
      toast.success('Transaction deleted successfully')
      loadData()
    } catch (error) {

      toast.error('Failed to delete transaction')
    }
  }

  const getTransactionIcon = (type) => {
    if (type === 'payment_received') return '↓'
    if (type === 'payment_made') return '↑'
    return '•'
  }

  const getTransactionColor = (type) => {
    if (type === 'payment_received') return 'text-success-600 dark:text-success-400'
    if (type === 'payment_made') return 'text-danger-600 dark:text-danger-400'
    return 'text-gray-600 dark:text-gray-400'
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl md:text-3xl font-bold">Transactions</h1>
        <button onClick={() => setShowTransactionModal(true)} className="btn btn-primary text-sm md:text-base">
          <Plus className="w-4 h-4 mr-1.5" />
          <span className="hidden sm:inline">Record </span>Transaction
        </button>
      </div>

      <div className="card">
        {loading ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">Loading transactions...</div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-8">
            <ArrowLeftRight className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No transactions found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Customer</th>
                  <th>Method</th>
                  <th>Amount</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {transactions.map((transaction) => (
                  <tr key={transaction._id}>
                    <td>{format(new Date(transaction.date), 'dd MMM yyyy')}</td>
                    <td>
                      <span className={`flex items-center gap-2 ${getTransactionColor(transaction.transactionType)}`}>
                        <span className="text-xl" aria-hidden="true">{getTransactionIcon(transaction.transactionType)}</span>
                        {transaction.transactionType.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="max-w-[150px] truncate" title={transaction.customer?.name || 'N/A'}>{transaction.customer?.name || 'N/A'}</td>
                    <td className="capitalize">{transaction.paymentMethod}</td>
                    <td className={`font-semibold ${getTransactionColor(transaction.transactionType)}`}>
                      ₹{transaction.amount?.toFixed(2)}
                    </td>
                    <td className="text-sm text-gray-600 dark:text-gray-400 max-w-[200px] truncate" title={transaction.description || '-'}>{transaction.description || '-'}</td>
                    <td>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        transaction.status === 'completed' ? 'bg-success-100 text-success-800 dark:bg-success-900/30 dark:text-success-400' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                        {transaction.status}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => handleDeleteTransaction(transaction._id)}
                        className="btn-icon text-danger-600 hover:text-danger-800 dark:text-danger-400 dark:hover:text-danger-300 hover:bg-danger-50 dark:hover:bg-danger-900/20"
                        aria-label="Delete transaction"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Transaction Modal */}
      {showTransactionModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50"
          onClick={() => setShowTransactionModal(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Record transaction"
        >
          <div className="bg-white dark:bg-gray-800 rounded-t-xl sm:rounded-xl p-4 md:p-6 max-w-md w-full sm:mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg md:text-xl font-semibold mb-4">Record Transaction</h2>
            <form onSubmit={handleCreateTransaction} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Transaction Type *</label>
                <select
                  value={transactionData.transactionType}
                  onChange={(e) => setTransactionData({ ...transactionData, transactionType: e.target.value })}
                  className="input"
                  required
                >
                  <option value="payment_received">Payment Received</option>
                  <option value="payment_made">Payment Made</option>
                  <option value="expense">Expense</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount (₹) *</label>
                <input
                  type="number"
                  value={transactionData.amount}
                  onChange={(e) => setTransactionData({ ...transactionData, amount: parseFloat(e.target.value) })}
                  className="input"
                  min="0.01"
                  step="0.01"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Payment Method *</label>
                <select
                  value={transactionData.paymentMethod}
                  onChange={(e) => setTransactionData({ ...transactionData, paymentMethod: e.target.value })}
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Customer (Optional)</label>
                <select
                  value={transactionData.customer}
                  onChange={(e) => {
                    const customerId = e.target.value
                    setTransactionData({ ...transactionData, customer: customerId, referenceId: '' })
                    loadInvoicesForCustomer(customerId)
                  }}
                  className="input"
                >
                  <option value="">None</option>
                  {customers.map(customer => (
                    <option key={customer._id} value={customer._id}>
                      {customer.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Link to Invoice? (Optional)</label>
                <select
                  value={transactionData.reference}
                  onChange={(e) => setTransactionData({ ...transactionData, reference: e.target.value, referenceId: '' })}
                  className="input"
                >
                  <option value="">No</option>
                  <option value="invoice">Yes - Link to Invoice</option>
                </select>
              </div>

              {transactionData.reference === 'invoice' && transactionData.customer && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Select Invoice *</label>
                  <select
                    value={transactionData.referenceId}
                    onChange={(e) => setTransactionData({ ...transactionData, referenceId: e.target.value })}
                    className="input"
                    required
                  >
                    <option value="">Select an invoice</option>
                    {invoices.map(invoice => (
                      <option key={invoice._id} value={invoice._id}>
                        {invoice.invoiceNumber} - ₹{invoice.grandTotal?.toFixed(2)} ({invoice.paymentStatus})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date *</label>
                <input
                  type="date"
                  value={transactionData.date}
                  onChange={(e) => setTransactionData({ ...transactionData, date: e.target.value })}
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description *</label>
                <textarea
                  value={transactionData.description}
                  onChange={(e) => setTransactionData({ ...transactionData, description: e.target.value })}
                  className="input"
                  rows={3}
                  placeholder="Payment details, expense notes, etc."
                  required
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button type="submit" disabled={submitting} className="btn btn-primary flex-1">
                  {submitting ? 'Saving...' : 'Record Transaction'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowTransactionModal(false)}
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
