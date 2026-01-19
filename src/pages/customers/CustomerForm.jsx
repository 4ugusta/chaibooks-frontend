import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { customerAPI } from '../../services/api'
import toast from 'react-hot-toast'
import { ArrowLeft } from 'lucide-react'

export default function CustomerForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)

  const [formData, setFormData] = useState({
    name: '',
    gstin: '',
    contact: { phone: '', email: '' },
    address: { street: '', city: '', state: '', pincode: '' }
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isEdit) {
      loadCustomer()
    }
  }, [id])

  const loadCustomer = async () => {
    try {
      const response = await customerAPI.getOne(id)
      setFormData(response.data)
    } catch (error) {
      toast.error('Failed to load customer')
      navigate('/customers')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (isEdit) {
        await customerAPI.update(id, formData)
        toast.success('Customer updated successfully')
      } else {
        await customerAPI.create(formData)
        toast.success('Customer created successfully')
      }
      navigate('/customers')
    } catch (error) {
      console.error('Failed to save customer:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/customers')} className="btn btn-secondary">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className="text-3xl font-bold">{isEdit ? 'Edit' : 'Add'} Customer</h1>
      </div>

      <div className="card max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">GSTIN *</label>
            <input
              type="text"
              value={formData.gstin}
              onChange={(e) => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })}
              className="input"
              pattern="^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$"
              placeholder="22AAAAA0000A1Z5"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
              <input
                type="tel"
                value={formData.contact.phone}
                onChange={(e) => setFormData({
                  ...formData,
                  contact: { ...formData.contact, phone: e.target.value }
                })}
                className="input"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={formData.contact.email}
                onChange={(e) => setFormData({
                  ...formData,
                  contact: { ...formData.contact, email: e.target.value }
                })}
                className="input"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Street</label>
            <input
              type="text"
              value={formData.address.street}
              onChange={(e) => setFormData({
                ...formData,
                address: { ...formData.address, street: e.target.value }
              })}
              className="input"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input
                type="text"
                value={formData.address.city}
                onChange={(e) => setFormData({
                  ...formData,
                  address: { ...formData.address, city: e.target.value }
                })}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
              <input
                type="text"
                value={formData.address.state}
                onChange={(e) => setFormData({
                  ...formData,
                  address: { ...formData.address, state: e.target.value }
                })}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
              <input
                type="text"
                value={formData.address.pincode}
                onChange={(e) => setFormData({
                  ...formData,
                  address: { ...formData.address, pincode: e.target.value }
                })}
                className="input"
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button type="submit" disabled={loading} className="btn btn-primary flex-1">
              {loading ? 'Saving...' : isEdit ? 'Update Customer' : 'Create Customer'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/customers')}
              className="btn btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
