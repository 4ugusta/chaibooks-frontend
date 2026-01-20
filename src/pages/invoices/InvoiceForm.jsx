import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { invoiceAPI, customerAPI, itemAPI } from '../../services/api'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function InvoiceForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)

  const [customers, setCustomers] = useState([])
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    customer: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    invoiceType: 'sale',
    items: [{ item: '', quantity: 1, rate: 0, unit: 'kg', description: '' }],
    discount: 0,
    ewayBill: {
      number: '',
      vehicleNumber: '',
      distance: 0
    }
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [customersRes, itemsRes] = await Promise.all([
        customerAPI.getAll(),
        itemAPI.getAll()
      ])
      setCustomers(customersRes.data.customers || [])
      setItems(itemsRes.data.items || [])

      if (isEdit) {
        const response = await invoiceAPI.getOne(id)
        const invoice = response.data
        setFormData({
          customer: invoice.customer._id,
          invoiceDate: invoice.invoiceDate.split('T')[0],
          dueDate: invoice.dueDate.split('T')[0],
          invoiceType: invoice.invoiceType,
          items: invoice.items.map(item => ({
            item: item.item._id,
            quantity: item.quantity,
            rate: item.rate,
            unit: item.unit,
            description: item.description
          })),
          discount: invoice.discount || 0,
          ewayBill: invoice.ewayBill || { number: '', vehicleNumber: '', distance: 0 }
        })
      }
    } catch (error) {
      console.error('Failed to load data:', error)
      toast.error('Failed to load form data')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Prevent double submission
    if (loading) return
    setLoading(true)

    if (!formData.customer) {
      toast.error('Please select a customer')
      setLoading(false)
      return
    }

    if (formData.items.length === 0 || !formData.items[0].item) {
      toast.error('Please add at least one item')
      setLoading(false)
      return
    }

    try {
      if (isEdit) {
        await invoiceAPI.update(id, formData)
        toast.success('Invoice updated successfully')
      } else {
        await invoiceAPI.create(formData)
        toast.success('Invoice created successfully')
      }
      navigate('/invoices')
    } catch (error) {
      console.error('Failed to save invoice:', error)
      toast.error(error.response?.data?.error || 'Failed to save invoice')
    } finally {
      setLoading(false)
    }
  }

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { item: '', quantity: 1, rate: 0, unit: 'kg', description: '' }]
    })
  }

  const handleRemoveItem = (index) => {
    if (formData.items.length === 1) {
      toast.error('At least one item is required')
      return
    }
    const newItems = formData.items.filter((_, i) => i !== index)
    setFormData({ ...formData, items: newItems })
  }

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items]
    newItems[index][field] = value

    // Auto-populate rate, unit when item is selected
    if (field === 'item' && value) {
      const selectedItem = items.find(item => item._id === value)
      if (selectedItem) {
        newItems[index].rate = selectedItem.pricing.sellingPrice
        newItems[index].unit = selectedItem.unit
        newItems[index].description = selectedItem.description || selectedItem.name
      }
    }

    setFormData({ ...formData, items: newItems })
  }

  const calculateSubtotal = () => {
    return formData.items.reduce((sum, item) => {
      return sum + (item.quantity * item.rate)
    }, 0)
  }

  const calculateGST = () => {
    let totalGST = 0
    formData.items.forEach(lineItem => {
      const selectedItem = items.find(i => i._id === lineItem.item)
      if (selectedItem) {
        const itemTotal = lineItem.quantity * lineItem.rate
        const gstAmount = (itemTotal * selectedItem.gst.rate) / 100
        totalGST += gstAmount
      }
    })
    return totalGST
  }

  const calculateGrandTotal = () => {
    const subtotal = calculateSubtotal()
    const gst = calculateGST()
    const discount = parseFloat(formData.discount) || 0
    return subtotal + gst - discount
  }

  const selectedCustomer = customers.find(c => c._id === formData.customer)
  const isInterState = selectedCustomer?.location?.state !== 'Maharashtra' // Assuming business is in Maharashtra

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/invoices')} className="btn btn-secondary">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className="text-3xl font-bold">{isEdit ? 'Edit' : 'Create'} Invoice</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Invoice Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Customer *</label>
              <select
                value={formData.customer}
                onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
                className="input"
                required
              >
                <option value="">Select Customer</option>
                {customers.map(customer => (
                  <option key={customer._id} value={customer._id}>
                    {customer.name} - {customer.gstin || 'No GSTIN'}
                  </option>
                ))}
              </select>
              {selectedCustomer && (
                <p className="text-xs text-gray-500 mt-1">
                  {selectedCustomer.location?.state} {isInterState ? '(Inter-state - IGST)' : '(Intra-state - CGST+SGST)'}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Date *</label>
              <input
                type="date"
                value={formData.invoiceDate}
                onChange={(e) => setFormData({ ...formData, invoiceDate: e.target.value })}
                className="input"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Due Date *</label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="input"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Type *</label>
              <select
                value={formData.invoiceType}
                onChange={(e) => setFormData({ ...formData, invoiceType: e.target.value })}
                className="input"
                required
              >
                <option value="sale">Sale</option>
                <option value="purchase">Purchase</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Discount (₹)</label>
              <input
                type="number"
                value={formData.discount}
                onChange={(e) => setFormData({ ...formData, discount: parseFloat(e.target.value) || 0 })}
                className="input"
                min="0"
                step="0.01"
              />
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Items</h2>
            <button type="button" onClick={handleAddItem} className="btn btn-secondary btn-sm">
              <Plus className="w-4 h-4 mr-1" />
              Add Item
            </button>
          </div>

          <div className="space-y-4">
            {formData.items.map((lineItem, index) => {
              const selectedItem = items.find(i => i._id === lineItem.item)
              const itemTotal = lineItem.quantity * lineItem.rate
              const gstRate = selectedItem?.gst?.rate || 0
              const gstAmount = (itemTotal * gstRate) / 100
              const totalWithGST = itemTotal + gstAmount

              return (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start gap-4">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-3">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Item *</label>
                        <select
                          value={lineItem.item}
                          onChange={(e) => handleItemChange(index, 'item', e.target.value)}
                          className="input"
                          required
                        >
                          <option value="">Select Item</option>
                          {items.map(item => (
                            <option key={item._id} value={item._id}>
                              {item.name} - ₹{item.pricing.sellingPrice}/{item.unit}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
                        <input
                          type="number"
                          value={lineItem.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                          className="input"
                          min="0.01"
                          step="0.01"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Rate (₹) *</label>
                        <input
                          type="number"
                          value={lineItem.rate}
                          onChange={(e) => handleItemChange(index, 'rate', parseFloat(e.target.value) || 0)}
                          className="input"
                          min="0"
                          step="0.01"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                        <input
                          type="text"
                          value={lineItem.unit}
                          onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                          className="input"
                          readOnly
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      className="text-red-600 hover:text-red-800 mt-7"
                      title="Remove Item"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <input
                      type="text"
                      value={lineItem.description}
                      onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                      className="input"
                      placeholder="Optional description"
                    />
                  </div>

                  {selectedItem && (
                    <div className="flex justify-between text-sm bg-gray-50 p-3 rounded">
                      <span className="text-gray-600">
                        HSN: <span className="font-semibold">{selectedItem.hsnCode}</span> |
                        GST: <span className="font-semibold">{gstRate}%</span>
                      </span>
                      <span className="text-gray-600">
                        Taxable: ₹{itemTotal.toFixed(2)} + GST: ₹{gstAmount.toFixed(2)} =
                        <span className="font-bold text-primary-600 ml-1">₹{totalWithGST.toFixed(2)}</span>
                      </span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* E-Way Bill (Optional) */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">E-Way Bill Details (Optional)</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">E-Way Bill Number</label>
              <input
                type="text"
                value={formData.ewayBill.number}
                onChange={(e) => setFormData({
                  ...formData,
                  ewayBill: { ...formData.ewayBill, number: e.target.value }
                })}
                className="input"
                placeholder="12 digit number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Number</label>
              <input
                type="text"
                value={formData.ewayBill.vehicleNumber}
                onChange={(e) => setFormData({
                  ...formData,
                  ewayBill: { ...formData.ewayBill, vehicleNumber: e.target.value }
                })}
                className="input"
                placeholder="MH01AB1234"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Distance (km)</label>
              <input
                type="number"
                value={formData.ewayBill.distance}
                onChange={(e) => setFormData({
                  ...formData,
                  ewayBill: { ...formData.ewayBill, distance: parseInt(e.target.value) || 0 }
                })}
                className="input"
                min="0"
              />
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Summary</h2>
          <div className="max-w-md ml-auto space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal (Taxable):</span>
              <span className="font-semibold">₹{calculateSubtotal().toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total GST:</span>
              <span className="font-semibold">₹{calculateGST().toFixed(2)}</span>
            </div>
            {formData.discount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Discount:</span>
                <span className="font-semibold text-red-600">- ₹{formData.discount.toFixed(2)}</span>
              </div>
            )}
            <div className="border-t pt-2">
              <div className="flex justify-between">
                <span className="text-lg font-semibold">Grand Total:</span>
                <span className="text-2xl font-bold text-primary-600">₹{calculateGrandTotal().toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-4">
          <button type="submit" disabled={loading} className="btn btn-primary flex-1">
            {loading ? 'Saving...' : isEdit ? 'Update Invoice' : 'Create Invoice'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/invoices')}
            className="btn btn-secondary"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
