import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export default function InvoiceForm() {
  const navigate = useNavigate()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/invoices')} className="btn btn-secondary">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className="text-3xl font-bold">Create Invoice</h1>
      </div>
      <div className="card">
        <p className="text-gray-600">Invoice form page. Select customer, add items, calculate GST, and generate invoice PDF.</p>
      </div>
    </div>
  )
}
