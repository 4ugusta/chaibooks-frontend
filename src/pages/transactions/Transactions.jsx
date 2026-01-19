import { useEffect, useState } from 'react'
import { transactionAPI } from '../../services/api'
import { ArrowLeftRight } from 'lucide-react'
import { format } from 'date-fns'

export default function Transactions() {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTransactions()
  }, [])

  const loadTransactions = async () => {
    try {
      const response = await transactionAPI.getAll()
      setTransactions(response.data.transactions || [])
    } catch (error) {
      console.error('Failed to load transactions:', error)
    } finally {
      setLoading(false)
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
      <h1 className="text-3xl font-bold">Transactions</h1>

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
    </div>
  )
}
