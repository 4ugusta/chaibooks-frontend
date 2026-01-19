import { useState } from 'react'
import { useAuthStore } from '../stores/authStore'

export default function Settings() {
  const { user, updateProfile } = useAuthStore()
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    businessDetails: user?.businessDetails || {
      businessName: '',
      gstin: '',
      address: '',
      phone: '',
      email: ''
    }
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    await updateProfile(formData)
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Settings</h1>

      <div className="card max-w-2xl">
        <h2 className="text-xl font-semibold mb-4">Profile Settings</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="input"
            />
          </div>

          <h3 className="text-lg font-semibold mt-6 mb-2">Business Details</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
            <input
              type="text"
              value={formData.businessDetails.businessName}
              onChange={(e) => setFormData({
                ...formData,
                businessDetails: { ...formData.businessDetails, businessName: e.target.value }
              })}
              className="input"
            />
          </div>

          <button type="submit" className="btn btn-primary">
            Save Changes
          </button>
        </form>
      </div>
    </div>
  )
}
