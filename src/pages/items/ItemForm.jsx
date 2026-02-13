import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { itemAPI } from '../../services/api'
import toast from 'react-hot-toast'
import { ArrowLeft } from 'lucide-react'

export default function ItemForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'tea',
    hsnCode: '',
    unit: 'kg',
    pricing: {
      basePrice: 0,
      sellingPrice: 0,
      purchasePrice: 0
    },
    gst: {
      rate: 5
    },
    stock: {
      quantity: 0,
      bags: 0,
      minStockLevel: 0
    }
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isEdit) {
      loadItem()
    }
  }, [id])

  const loadItem = async () => {
    try {
      const response = await itemAPI.getOne(id)
      setFormData(response.data)
    } catch (error) {
      toast.error('Failed to load item')
      navigate('/items')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (isEdit) {
        await itemAPI.update(id, formData)
        toast.success('Item updated successfully')
      } else {
        await itemAPI.create(formData)
        toast.success('Item created successfully')
      }
      navigate('/items')
    } catch (error) {
      console.error('Failed to save item:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleNestedChange = (parent, field, value) => {
    setFormData({
      ...formData,
      [parent]: {
        ...formData[parent],
        [field]: value
      }
    })
  }

  // For number inputs: allow empty string while typing, convert to number on blur
  const handleNumberChange = (parent, field, rawValue) => {
    handleNestedChange(parent, field, rawValue === '' ? '' : Number(rawValue))
  }
  const handleNumberBlur = (parent, field) => {
    const val = formData[parent][field]
    if (val === '' || isNaN(val)) {
      handleNestedChange(parent, field, 0)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/items')} className="btn btn-secondary">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className="text-3xl font-bold">{isEdit ? 'Edit' : 'Add'} Item</h1>
      </div>

      <div className="card max-w-4xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Item Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="input"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="input"
                rows={2}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="input"
                required
              >
                <option value="tea">Tea</option>
                <option value="accessories">Accessories</option>
                <option value="packaging">Packaging</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">HSN Code *</label>
              <input
                type="text"
                name="hsnCode"
                value={formData.hsnCode}
                onChange={handleChange}
                className="input"
                placeholder="09023010"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unit *</label>
              <select
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                className="input"
                required
              >
                <option value="kg">Kilogram (kg)</option>
                <option value="gram">Gram</option>
                <option value="bags">Bags</option>
                <option value="pieces">Pieces</option>
                <option value="litre">Litre</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">GST Rate * (%)</label>
              <select
                name="gstRate"
                value={formData.gst.rate}
                onChange={(e) => handleNestedChange('gst', 'rate', Number(e.target.value))}
                className="input"
                required
              >
                <option value={0}>0%</option>
                <option value={5}>5%</option>
                <option value={12}>12%</option>
                <option value={18}>18%</option>
                <option value={28}>28%</option>
              </select>
            </div>
          </div>

          {/* Pricing */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Pricing</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Base Price (₹)</label>
                <input
                  type="number"
                  value={formData.pricing.basePrice}
                  onChange={(e) => handleNumberChange('pricing', 'basePrice', e.target.value)}
                  onBlur={() => handleNumberBlur('pricing', 'basePrice')}
                  className="input"
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Selling Price (₹) *</label>
                <input
                  type="number"
                  value={formData.pricing.sellingPrice}
                  onChange={(e) => handleNumberChange('pricing', 'sellingPrice', e.target.value)}
                  onBlur={() => handleNumberBlur('pricing', 'sellingPrice')}
                  className="input"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Price (₹)</label>
                <input
                  type="number"
                  value={formData.pricing.purchasePrice}
                  onChange={(e) => handleNumberChange('pricing', 'purchasePrice', e.target.value)}
                  onBlur={() => handleNumberBlur('pricing', 'purchasePrice')}
                  className="input"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
          </div>

          {/* Stock */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Stock</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity ({formData.unit})</label>
                <input
                  type="number"
                  value={formData.stock.quantity}
                  onChange={(e) => handleNumberChange('stock', 'quantity', e.target.value)}
                  onBlur={() => handleNumberBlur('stock', 'quantity')}
                  className="input"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bags</label>
                <input
                  type="number"
                  value={formData.stock.bags}
                  onChange={(e) => handleNumberChange('stock', 'bags', e.target.value)}
                  onBlur={() => handleNumberBlur('stock', 'bags')}
                  className="input"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Min Stock Level</label>
                <input
                  type="number"
                  value={formData.stock.minStockLevel}
                  onChange={(e) => handleNumberChange('stock', 'minStockLevel', e.target.value)}
                  onBlur={() => handleNumberBlur('stock', 'minStockLevel')}
                  className="input"
                  min="0"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button type="submit" disabled={loading} className="btn btn-primary flex-1">
              {loading ? 'Saving...' : isEdit ? 'Update Item' : 'Create Item'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/items')}
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
