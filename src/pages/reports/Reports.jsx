import { useEffect, useState } from 'react'
import { reportAPI } from '../../services/api'
import { TrendingUp, TrendingDown, DollarSign, Download, FileSpreadsheet } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Reports() {
  const [gstReport, setGstReport] = useState(null)
  const [profitLoss, setProfitLoss] = useState(null)
  const [salesData, setSalesData] = useState(null)
  const [stockData, setStockData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showSalesReport, setShowSalesReport] = useState(false)
  const [showStockReport, setShowStockReport] = useState(false)

  // Format large numbers for display
  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '₹0.00'
    const absAmount = Math.abs(amount)
    if (absAmount >= 10000000) { // 1 crore
      return `₹${(amount / 10000000).toFixed(2)}Cr`
    } else if (absAmount >= 100000) { // 1 lakh
      return `₹${(amount / 100000).toFixed(2)}L`
    } else {
      return `₹${amount.toFixed(2)}`
    }
  }

  useEffect(() => {
    loadReports()
  }, [])

  const loadReports = async () => {
    try {
      const [gstRes, plRes] = await Promise.all([
        reportAPI.getGST(),
        reportAPI.getProfitLoss()
      ])
      setGstReport(gstRes.data)
      setProfitLoss(plRes.data)
    } catch (error) {
      console.error('Failed to load reports:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadSalesReport = async () => {
    try {
      const response = await reportAPI.getSales()
      setSalesData(response.data)
      setShowSalesReport(true)
    } catch (error) {
      console.error('Failed to load sales report:', error)
      toast.error('Failed to load sales report')
    }
  }

  const loadStockReport = async () => {
    try {
      const response = await reportAPI.getStock()
      setStockData(response.data)
      setShowStockReport(true)
    } catch (error) {
      console.error('Failed to load stock report:', error)
      toast.error('Failed to load stock report')
    }
  }

  const downloadGSTReport = () => {
    if (!gstReport) return

    // Create CSV content
    let csv = 'GST Report - ITR Ready\n\n'
    csv += 'Type,Taxable Value,CGST,SGST,IGST,Total GST,Invoice Count\n'

    gstReport.summary?.forEach(item => {
      csv += `${item._id},${item.totalTaxableValue},${item.totalCGST},${item.totalSGST},${item.totalIGST},${item.totalGST},${item.invoiceCount}\n`
    })

    csv += '\n\nDetailed by Rate\n'
    csv += 'Type,GST Rate,Taxable Value,CGST,SGST,IGST,Total GST\n'

    gstReport.detailedByRate?.forEach(item => {
      csv += `${item._id.invoiceType},${item._id.gstRate}%,${item.taxableValue},${item.cgst},${item.sgst},${item.igst},${item.totalGst}\n`
    })

    // Download
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `GST-Report-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('GST report downloaded')
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Reports</h1>
        <div className="card text-center py-8">Loading reports...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Business Reports</h1>

      {/* Profit & Loss Summary */}
      {profitLoss && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
                <p className="text-xl lg:text-2xl font-bold text-green-600 truncate" title={`₹${profitLoss.revenue?.toFixed(2)}`}>
                  {formatCurrency(profitLoss.revenue)}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500 flex-shrink-0 ml-2" />
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-600 mb-1">Total Costs</p>
                <p className="text-xl lg:text-2xl font-bold text-red-600 truncate" title={`₹${profitLoss.cost?.toFixed(2)}`}>
                  {formatCurrency(profitLoss.cost)}
                </p>
              </div>
              <TrendingDown className="w-8 h-8 text-red-500 flex-shrink-0 ml-2" />
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-600 mb-1">Net Profit</p>
                <p className={`text-xl lg:text-2xl font-bold truncate ${profitLoss.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}
                   title={`₹${profitLoss.netProfit?.toFixed(2)}`}>
                  {formatCurrency(profitLoss.netProfit)}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-primary-500 flex-shrink-0 ml-2" />
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-600 mb-1">Profit Margin</p>
                <p className="text-xl lg:text-2xl font-bold text-blue-600">{profitLoss.profitMargin?.toFixed(2)}%</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* GST Report */}
      {gstReport && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">GST Summary (ITR Ready)</h2>
            <button onClick={downloadGSTReport} className="btn btn-secondary btn-sm">
              <Download className="w-4 h-4 mr-2" />
              Download CSV
            </button>
          </div>

          {gstReport.summary && gstReport.summary.length > 0 ? (
            <div className="space-y-4">
              {gstReport.summary.map((item, index) => (
                <div key={index} className="border-b pb-4">
                  <h3 className="font-semibold text-lg capitalize mb-2">{item._id} Transactions</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">CGST</p>
                      <p className="text-base font-semibold" title={`₹${item.totalCGST?.toFixed(2)}`}>{formatCurrency(item.totalCGST)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">SGST</p>
                      <p className="text-base font-semibold" title={`₹${item.totalSGST?.toFixed(2)}`}>{formatCurrency(item.totalSGST)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">IGST</p>
                      <p className="text-base font-semibold" title={`₹${item.totalIGST?.toFixed(2)}`}>{formatCurrency(item.totalIGST)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total GST</p>
                      <p className="text-base font-bold text-primary-600" title={`₹${item.totalGST?.toFixed(2)}`}>{formatCurrency(item.totalGST)}</p>
                    </div>
                  </div>
                  <div className="mt-2 text-sm">
                    <p className="text-gray-600">Taxable Value: <span className="font-semibold" title={`₹${item.totalTaxableValue?.toFixed(2)}`}>{formatCurrency(item.totalTaxableValue)}</span></p>
                    <p className="text-gray-600">Invoice Count: <span className="font-semibold">{item.invoiceCount}</span></p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No GST data available</p>
          )}

          {/* GST by Rate */}
          {gstReport.detailedByRate && gstReport.detailedByRate.length > 0 && (
            <div className="mt-6">
              <h3 className="font-semibold text-lg mb-3">GST Breakdown by Rate</h3>
              <div className="overflow-x-auto">
                <table className="table text-sm">
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>GST Rate</th>
                      <th>Taxable Value</th>
                      <th>CGST</th>
                      <th>SGST</th>
                      <th>IGST</th>
                      <th>Total GST</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gstReport.detailedByRate.map((item, index) => (
                      <tr key={index}>
                        <td className="capitalize">{item._id.invoiceType}</td>
                        <td>{item._id.gstRate}%</td>
                        <td>₹{item.taxableValue?.toFixed(2)}</td>
                        <td>₹{item.cgst?.toFixed(2)}</td>
                        <td>₹{item.sgst?.toFixed(2)}</td>
                        <td>₹{item.igst?.toFixed(2)}</td>
                        <td className="font-semibold">₹{item.totalGst?.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-xl font-semibold mb-2">Sales Report</h2>
          <p className="text-gray-600">Track your sales performance over time</p>
          <button onClick={loadSalesReport} className="mt-4 btn btn-secondary">
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            View Detailed Report
          </button>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold mb-2">Stock Report</h2>
          <p className="text-gray-600">Monitor inventory levels and low stock alerts</p>
          <button onClick={loadStockReport} className="mt-4 btn btn-secondary">
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            View Stock Details
          </button>
        </div>
      </div>

      {/* Sales Report Modal */}
      {showSalesReport && salesData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Sales Report</h2>
              <button onClick={() => setShowSalesReport(false)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            {salesData.sales && salesData.sales.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="table text-sm">
                  <thead>
                    <tr>
                      <th>Invoice #</th>
                      <th>Date</th>
                      <th>Customer</th>
                      <th>Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {salesData.sales.map((sale, index) => (
                      <tr key={index}>
                        <td>{sale.invoiceNumber}</td>
                        <td>{new Date(sale.invoiceDate).toLocaleDateString()}</td>
                        <td>{sale.customer?.name}</td>
                        <td>₹{sale.grandTotal?.toFixed(2)}</td>
                        <td className="capitalize">{sale.paymentStatus}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="mt-4 p-4 bg-gray-50 rounded">
                  <p className="font-semibold">Total Sales: ₹{salesData.totalSales?.toFixed(2)}</p>
                  <p className="text-sm text-gray-600">Count: {salesData.sales.length} invoices</p>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No sales data available</p>
            )}
          </div>
        </div>
      )}

      {/* Stock Report Modal */}
      {showStockReport && stockData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Stock Report</h2>
              <button onClick={() => setShowStockReport(false)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            {stockData.items && stockData.items.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="table text-sm">
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Category</th>
                      <th>Quantity</th>
                      <th>Bags</th>
                      <th>Min Level</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stockData.items.map((item, index) => (
                      <tr key={index}>
                        <td className="font-medium">{item.name}</td>
                        <td className="capitalize">{item.category}</td>
                        <td>{item.stock?.quantity || 0}</td>
                        <td>{item.stock?.bags || 0}</td>
                        <td>{item.stock?.minStockLevel || 0}</td>
                        <td>
                          {(item.stock?.quantity || 0) <= (item.stock?.minStockLevel || 0) ? (
                            <span className="text-red-600 font-semibold">Low Stock</span>
                          ) : (
                            <span className="text-green-600">Good</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="mt-4 p-4 bg-gray-50 rounded">
                  <p className="font-semibold">Total Items: {stockData.items.length}</p>
                  <p className="text-sm text-gray-600">
                    Low Stock Items: {stockData.items.filter(i => (i.stock?.quantity || 0) <= (i.stock?.minStockLevel || 0)).length}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No stock data available</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
