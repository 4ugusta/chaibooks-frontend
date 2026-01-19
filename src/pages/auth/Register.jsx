import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { UserPlus } from 'lucide-react'

export default function Register() {
  const navigate = useNavigate()
  const { register, loading } = useAuthStore()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    businessDetails: {
      businessName: '',
      gstin: '',
      address: '',
      phone: '',
      email: ''
    }
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    const success = await register(formData)
    if (success) {
      navigate('/')
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleBusinessChange = (e) => {
    setFormData({
      ...formData,
      businessDetails: {
        ...formData.businessDetails,
        [e.target.name]: e.target.value
      }
    })
  }

  return (
    <div className="card max-h-[90vh] overflow-y-auto">
      <div className="flex items-center justify-center mb-6">
        <UserPlus className="w-8 h-8 text-primary-600" />
      </div>
      <h2 className="text-2xl font-bold text-center mb-6">Register for ChaiBooks</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Your Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="input"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="input"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="input"
            minLength={6}
            required
          />
        </div>

        <hr className="my-4" />
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Business Details</h3>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Business Name
          </label>
          <input
            type="text"
            name="businessName"
            value={formData.businessDetails.businessName}
            onChange={handleBusinessChange}
            className="input"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            GSTIN
          </label>
          <input
            type="text"
            name="gstin"
            value={formData.businessDetails.gstin}
            onChange={handleBusinessChange}
            className="input"
            pattern="^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$"
            placeholder="22AAAAA0000A1Z5"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Business Address
          </label>
          <textarea
            name="address"
            value={formData.businessDetails.address}
            onChange={handleBusinessChange}
            className="input"
            rows={2}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Business Phone
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.businessDetails.phone}
            onChange={handleBusinessChange}
            className="input"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Business Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.businessDetails.email}
            onChange={handleBusinessChange}
            className="input"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full btn btn-primary"
        >
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-gray-600">
        Already have an account?{' '}
        <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
          Login
        </Link>
      </p>
    </div>
  )
}
