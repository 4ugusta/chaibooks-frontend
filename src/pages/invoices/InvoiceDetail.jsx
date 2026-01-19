import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Download } from 'lucide-react'

export default function InvoiceDetail() {
  const navigate = useNavigate()
  const { id } = useParams()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/invoices')} className="btn btn-secondary">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className="text-3xl font-bold">Invoice Details</h1>
        <div className="ml-auto flex gap-2">
          <button className="btn btn-primary">
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </button>
        </div>
      </div>
      <div className="card">
        <p className="text-gray-600">Invoice detail page with PDF download and E-Way bill generation.</p>
      </div>
    </div>
  )
}
