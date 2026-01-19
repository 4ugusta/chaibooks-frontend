import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'

export default function Items() {
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
        <p className="text-gray-600">Items management page. Add, edit, and manage your tea products and inventory.</p>
      </div>
    </div>
  )
}
