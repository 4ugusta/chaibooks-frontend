import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { customerAPI } from '../../services/api'
import { Plus, Search, Edit, Trash2, Users } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Customers() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => {
      loadCustomers()
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  const loadCustomers = async () => {
    try {
      const response = await customerAPI.getAll({ search })
      setCustomers(response.data.customers || [])
    } catch (error) {

      toast.error('Failed to load customers')
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

      toast.error('Failed to delete customer')
    }
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl md:text-3xl font-bold">Customers</h1>
        <Link to="/customers/new" className="btn btn-primary text-sm md:text-base">
          <Plus className="w-4 h-4 mr-1.5" />
          <span className="hidden sm:inline">Add </span>Customer
        </Link>
      </div>

      <div className="card">
        <div className="mb-4">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Search customers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-10"
              aria-label="Search customers"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">Loading customers...</div>
        ) : customers.length === 0 ? (
          <div className="text-center py-8">
            <Users className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No customers found. Add your first customer to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>GSTIN / PAN</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>Outstanding</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {customers.map((customer) => (
                  <tr key={customer._id}>
                    <td className="font-medium max-w-[200px] truncate" title={customer.name}>{customer.name}</td>
                    <td>{customer.gstin || customer.pan || '-'}</td>
                    <td>{customer.contact.phone}</td>
                    <td className="max-w-[200px] truncate" title={customer.contact.email || '-'}>{customer.contact.email || '-'}</td>
                    <td>₹{customer.outstandingBalance?.toFixed(2) || '0.00'}</td>
                    <td>
                      <div className="flex gap-1">
                        <Link
                          to={`/customers/${customer._id}/edit`}
                          className="btn-icon text-info-600 hover:text-info-800 dark:text-info-400 dark:hover:text-info-300 hover:bg-info-50 dark:hover:bg-info-900/20"
                          aria-label={`Edit ${customer.name}`}
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(customer._id)}
                          className="btn-icon text-danger-600 hover:text-danger-800 dark:text-danger-400 dark:hover:text-danger-300 hover:bg-danger-50 dark:hover:bg-danger-900/20"
                          aria-label={`Delete ${customer.name}`}
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
