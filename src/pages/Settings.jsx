import { useState } from 'react'
import { useAuthStore } from '../stores/authStore'

export default function Settings() {
  const { user, updateProfile } = useAuthStore()
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    businessDetails: {
      businessName: user?.businessDetails?.businessName || '',
      gstin: user?.businessDetails?.gstin || '',
      address: user?.businessDetails?.address || '',
      phone: user?.businessDetails?.phone || '',
      email: user?.businessDetails?.email || '',
      bankAccount: {
        accountNumber: user?.businessDetails?.bankAccount?.accountNumber || '',
        ifscCode: user?.businessDetails?.bankAccount?.ifscCode || '',
        bankName: user?.businessDetails?.bankAccount?.bankName || '',
        branchName: user?.businessDetails?.bankAccount?.branchName || ''
      }
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">GSTIN</label>
              <input
                type="text"
                value={formData.businessDetails.gstin}
                onChange={(e) => setFormData({
                  ...formData,
                  businessDetails: { ...formData.businessDetails, gstin: e.target.value.toUpperCase() }
                })}
                className="input"
                placeholder="22AAAAA0000A1Z5"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="tel"
                value={formData.businessDetails.phone}
                onChange={(e) => setFormData({
                  ...formData,
                  businessDetails: { ...formData.businessDetails, phone: e.target.value }
                })}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Business Email</label>
              <input
                type="email"
                value={formData.businessDetails.email}
                onChange={(e) => setFormData({
                  ...formData,
                  businessDetails: { ...formData.businessDetails, email: e.target.value }
                })}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <input
                type="text"
                value={formData.businessDetails.address}
                onChange={(e) => setFormData({
                  ...formData,
                  businessDetails: { ...formData.businessDetails, address: e.target.value }
                })}
                className="input"
              />
            </div>
          </div>

          <h3 className="text-lg font-semibold mt-6 mb-2">Bank Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
              <input
                type="text"
                value={formData.businessDetails.bankAccount.accountNumber}
                onChange={(e) => setFormData({
                  ...formData,
                  businessDetails: {
                    ...formData.businessDetails,
                    bankAccount: { ...formData.businessDetails.bankAccount, accountNumber: e.target.value }
                  }
                })}
                className="input"
                placeholder="1234567890"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">IFSC Code</label>
              <input
                type="text"
                value={formData.businessDetails.bankAccount.ifscCode}
                onChange={(e) => setFormData({
                  ...formData,
                  businessDetails: {
                    ...formData.businessDetails,
                    bankAccount: { ...formData.businessDetails.bankAccount, ifscCode: e.target.value.toUpperCase() }
                  }
                })}
                className="input"
                placeholder="SBIN0001234"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
              <input
                type="text"
                value={formData.businessDetails.bankAccount.bankName}
                onChange={(e) => setFormData({
                  ...formData,
                  businessDetails: {
                    ...formData.businessDetails,
                    bankAccount: { ...formData.businessDetails.bankAccount, bankName: e.target.value }
                  }
                })}
                className="input"
                placeholder="State Bank of India"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Branch Name</label>
              <input
                type="text"
                value={formData.businessDetails.bankAccount.branchName}
                onChange={(e) => setFormData({
                  ...formData,
                  businessDetails: {
                    ...formData.businessDetails,
                    bankAccount: { ...formData.businessDetails.bankAccount, branchName: e.target.value }
                  }
                })}
                className="input"
                placeholder="Main Branch"
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary mt-4">
            Save Changes
          </button>
        </form>
      </div>
    </div>
  )
}
