import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'

export default function Invoices() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Invoices</h1>
        <Link to="/invoices/new" className="btn btn-primary">
          <Plus className="w-4 h-4 mr-2" />
          Create Invoice
        </Link>
      </div>
      <div className="card">
        <p className="text-gray-600">Invoices page. View, create, and manage sales and purchase invoices with GST calculation.</p>
      </div>
    </div>
  )
}
