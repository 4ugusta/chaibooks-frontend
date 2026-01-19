import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { itemAPI } from '../../services/api'
import { Plus, Search, Edit, Trash2, Package } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Items() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    loadItems()
  }, [])

  const loadItems = async () => {
    try {
      const response = await itemAPI.getAll({ search })
      setItems(response.data.items || [])
    } catch (error) {
      console.error('Failed to load items:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return

    try {
      await itemAPI.delete(id)
      toast.success('Item deleted successfully')
      loadItems()
    } catch (error) {
      console.error('Failed to delete item:', error)
    }
  }

  const getStockStatus = (item) => {
    if (item.stock.quantity <= item.stock.minStockLevel) {
      return <span className="text-red-600 font-semibold">Low Stock</span>
    }
    return <span className="text-green-600">In Stock</span>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Items</h1>
        <Link to="/items/new" className="btn btn-primary">
          <Plus className="w-4 h-4 mr-2" />
          Add Item
        </Link>
      </div>

      <div className="card">
        <div className="mb-4">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyUp={loadItems}
              className="input pl-10"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : items.length === 0 ? (
          <div className="text-center py-8">
            <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">No items found. Add your first item to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Category</th>
                  <th>HSN Code</th>
                  <th>Price</th>
                  <th>GST%</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {items.map((item) => (
                  <tr key={item._id}>
                    <td className="font-medium">{item.name}</td>
                    <td className="capitalize">{item.category}</td>
                    <td>{item.hsnCode}</td>
                    <td>₹{item.pricing.sellingPrice}</td>
                    <td>{item.gst.rate}%</td>
                    <td>
                      {item.stock.quantity} {item.unit}
                    </td>
                    <td>{getStockStatus(item)}</td>
                    <td>
                      <div className="flex gap-2">
                        <Link
                          to={`/items/${item._id}/edit`}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(item._id)}
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
