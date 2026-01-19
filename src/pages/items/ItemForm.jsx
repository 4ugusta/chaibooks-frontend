import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export default function ItemForm() {
  const navigate = useNavigate()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/items')} className="btn btn-secondary">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className="text-3xl font-bold">Add Item</h1>
      </div>
      <div className="card">
        <p className="text-gray-600">Item form page. Add item details like name, weight, price, HSN code, GST rate, etc.</p>
      </div>
    </div>
  )
}
