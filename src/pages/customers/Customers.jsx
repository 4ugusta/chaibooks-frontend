import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { customerAPI } from '../../services/api'
import { Plus, Search, Edit, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Customers() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    loadCustomers()
  }, [])

  const loadCustomers = async () => {
    try {
      const response = await customerAPI.getAll({ search })
      setCustomers(response.data.customers || [])
    } catch (error) {
      console.error('Failed to load customers:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this customer?')) return

    try {
      await customerAPI.delete(id)
      toast.success('Customer deleted successfully')
      loadCustomers()
    } catch (error) {
      console.error('Failed to delete customer:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Customers</h1>
        <Link to="/customers/new" className="btn btn-primary">
          <Plus className="w-4 h-4 mr-2" />
          Add Customer
        </Link>
      </div>

      <div className="card">
        <div className="mb-4">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search customers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyUp={loadCustomers}
              className="input pl-10"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : customers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No customers found. Add your first customer to get started.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>GSTIN</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>Outstanding</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {customers.map((customer) => (
                  <tr key={customer._id}>
                    <td className="font-medium">{customer.name}</td>
                    <td>{customer.gstin}</td>
                    <td>{customer.contact.phone}</td>
                    <td>{customer.contact.email || '-'}</td>
                    <td>₹{customer.outstandingBalance?.toFixed(2) || '0.00'}</td>
                    <td>
                      <div className="flex gap-2">
                        <Link
                          to={`/customers/${customer._id}/edit`}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(customer._id)}
                          className="text-red-600 hover:text-red-800"
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
