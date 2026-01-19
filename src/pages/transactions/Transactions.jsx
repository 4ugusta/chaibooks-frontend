import { useEffect, useState } from 'react'
import { transactionAPI, customerAPI } from '../../services/api'
import { ArrowLeftRight, Plus } from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

export default function Transactions() {
  const [transactions, setTransactions] = useState([])
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showTransactionModal, setShowTransactionModal] = useState(false)
  const [transactionData, setTransactionData] = useState({
    transactionType: 'payment_received',
    amount: 0,
    paymentMethod: 'cash',
    customer: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [transactionsRes, customersRes] = await Promise.all([
        transactionAPI.getAll(),
        customerAPI.getAll()
      ])
      setTransactions(transactionsRes.data.transactions || [])
      setCustomers(customersRes.data.customers || [])
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTransaction = async (e) => {
    e.preventDefault()
    try {
      await transactionAPI.create(transactionData)
      toast.success('Transaction recorded successfully')
      setShowTransactionModal(false)
      setTransactionData({
        transactionType: 'payment_received',
        amount: 0,
        paymentMethod: 'cash',
        customer: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
      })
      loadData()
    } catch (error) {
      console.error('Failed to create transaction:', error)
      toast.error('Failed to create transaction')
    }
  }

  const getTransactionIcon = (type) => {
    if (type === 'payment_received') return '↓'
    if (type === 'payment_made') return '↑'
    return '•'
  }

  const getTransactionColor = (type) => {
    if (type === 'payment_received') return 'text-green-600'
    if (type === 'payment_made') return 'text-red-600'
    return 'text-gray-600'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Transactions</h1>
        <button onClick={() => setShowTransactionModal(true)} className="btn btn-primary">
          <Plus className="w-4 h-4 mr-2" />
          Record Transaction
        </button>
      </div>

      <div className="card">
        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-8">
            <ArrowLeftRight className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">No transactions found.</p>
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
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {transactions.map((transaction) => (
                  <tr key={transaction._id}>
                    <td>{format(new Date(transaction.date), 'dd MMM yyyy')}</td>
                    <td>
                      <span className={`flex items-center gap-2 ${getTransactionColor(transaction.transactionType)}`}>
                        <span className="text-xl">{getTransactionIcon(transaction.transactionType)}</span>
                        {transaction.transactionType.replace('_', ' ')}
                      </span>
                    </td>
                    <td>{transaction.customer?.name || 'N/A'}</td>
                    <td className="capitalize">{transaction.paymentMethod}</td>
                    <td className={`font-semibold ${getTransactionColor(transaction.transactionType)}`}>
                      ₹{transaction.amount?.toFixed(2)}
                    </td>
                    <td className="text-sm text-gray-600">{transaction.description || '-'}</td>
                    <td>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        transaction.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {transaction.status}
                      </span>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-semibold mb-4">Record Transaction</h2>
            <form onSubmit={handleCreateTransaction} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Transaction Type *</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹) *</label>
                <input
                  type="number"
                  value={transactionData.amount}
                  onChange={(e) => setTransactionData({ ...transactionData, amount: parseFloat(e.target.value) })}
                  className="input"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method *</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer (Optional)</label>
                <select
                  value={transactionData.customer}
                  onChange={(e) => setTransactionData({ ...transactionData, customer: e.target.value })}
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                <input
                  type="date"
                  value={transactionData.date}
                  onChange={(e) => setTransactionData({ ...transactionData, date: e.target.value })}
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
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
                <button type="submit" className="btn btn-primary flex-1">
                  Record Transaction
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
