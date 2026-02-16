import { useEffect, useState } from 'react'
import { reportAPI } from '../../services/api'
import { TrendingUp, TrendingDown, DollarSign, Download, FileText, Package, ShoppingCart, ClipboardList } from 'lucide-react'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

export default function Reports() {
  const [gstReport, setGstReport] = useState(null)
  const [profitLoss, setProfitLoss] = useState(null)
  const [salesData, setSalesData] = useState(null)
  const [purchaseData, setPurchaseData] = useState(null)
  const [stockData, setStockData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState(null)
  const [downloading, setDownloading] = useState(null)

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '₹0.00'
    const absAmount = Math.abs(amount)
    if (absAmount >= 10000000) return `₹${(amount / 10000000).toFixed(2)}Cr`
    if (absAmount >= 100000) return `₹${(amount / 100000).toFixed(2)}L`
    return `₹${amount.toFixed(2)}`
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
    if (salesData) { setActiveTab('sales'); return }
    try {
      const response = await reportAPI.getSales()
      setSalesData(response.data)
      setActiveTab('sales')
    } catch (error) {
      toast.error('Failed to load sales report')
    }
  }

  const loadPurchaseReport = async () => {
    if (purchaseData) { setActiveTab('purchases'); return }
    try {
      const response = await reportAPI.getPurchases()
      // getPurchases returns grouped data, let's also fetch individual invoices
      const invoicesRes = await reportAPI.getPurchases({ groupBy: 'none' })
      setPurchaseData(response.data)
      setActiveTab('purchases')
    } catch (error) {
      toast.error('Failed to load purchase report')
    }
  }

  const loadStockReport = async () => {
    if (stockData) { setActiveTab('stock'); return }
    try {
      const response = await reportAPI.getStock()
      setStockData(response.data)
      setActiveTab('stock')
    } catch (error) {
      toast.error('Failed to load stock report')
    }
  }

  const downloadPDF = async (type) => {
    setDownloading(type)
    try {
      let response
      let filename

      switch (type) {
        case 'sales':
          response = await reportAPI.downloadSalesPDF()
          filename = `Sales-Report-${format(new Date(), 'yyyy-MM-dd')}.pdf`
          break
        case 'purchases':
          response = await reportAPI.downloadPurchasesPDF()
          filename = `Purchase-Report-${format(new Date(), 'yyyy-MM-dd')}.pdf`
          break
        case 'stock':
          response = await reportAPI.downloadStockPDF()
          filename = `Stock-Report-${format(new Date(), 'yyyy-MM-dd')}.pdf`
          break
        case 'gst':
          response = await reportAPI.downloadGSTPDF()
          filename = `GSTR3B-Report-${format(new Date(), 'yyyy-MM-dd')}.pdf`
          break
        default:
          return
      }

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', filename)
      document.body.appendChild(link)
      link.click()
      link.remove()
      toast.success('Report downloaded')
    } catch (error) {
      console.error('Failed to download report:', error)
      toast.error('Failed to download report')
    } finally {
      setDownloading(null)
    }
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
                <p className="text-xl lg:text-2xl font-bold text-red-600 truncate" title={`₹${(profitLoss.cost + profitLoss.expenses)?.toFixed(2)}`}>
                  {formatCurrency(profitLoss.cost + profitLoss.expenses)}
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

      {/* Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card border-2 border-transparent hover:border-green-200 transition-colors">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="font-semibold">Sales Report</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">All sale invoices with customer and GST details</p>
          <div className="flex gap-2">
            <button onClick={loadSalesReport} className="btn btn-secondary btn-sm flex-1">
              <FileText className="w-4 h-4 mr-1" /> View
            </button>
            <button
              onClick={() => downloadPDF('sales')}
              disabled={downloading === 'sales'}
              className="btn btn-primary btn-sm flex-1"
            >
              <Download className="w-4 h-4 mr-1" /> {downloading === 'sales' ? '...' : 'PDF'}
            </button>
          </div>
        </div>

        <div className="card border-2 border-transparent hover:border-red-200 transition-colors">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <ShoppingCart className="w-5 h-5 text-red-600" />
            </div>
            <h3 className="font-semibold">Purchase Report</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">All purchase invoices with supplier and ITC details</p>
          <div className="flex gap-2">
            <button onClick={loadPurchaseReport} className="btn btn-secondary btn-sm flex-1">
              <FileText className="w-4 h-4 mr-1" /> View
            </button>
            <button
              onClick={() => downloadPDF('purchases')}
              disabled={downloading === 'purchases'}
              className="btn btn-primary btn-sm flex-1"
            >
              <Download className="w-4 h-4 mr-1" /> {downloading === 'purchases' ? '...' : 'PDF'}
            </button>
          </div>
        </div>

        <div className="card border-2 border-transparent hover:border-blue-200 transition-colors">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="font-semibold">Stock Report</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">Inventory levels, stock value, and low stock alerts</p>
          <div className="flex gap-2">
            <button onClick={loadStockReport} className="btn btn-secondary btn-sm flex-1">
              <FileText className="w-4 h-4 mr-1" /> View
            </button>
            <button
              onClick={() => downloadPDF('stock')}
              disabled={downloading === 'stock'}
              className="btn btn-primary btn-sm flex-1"
            >
              <Download className="w-4 h-4 mr-1" /> {downloading === 'stock' ? '...' : 'PDF'}
            </button>
          </div>
        </div>

        <div className="card border-2 border-transparent hover:border-purple-200 transition-colors">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <ClipboardList className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="font-semibold">GST Report (GSTR-3B)</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">GSTR-3B format with ITC, tax payable, and rate breakup</p>
          <div className="flex gap-2">
            <button onClick={() => setActiveTab('gst')} className="btn btn-secondary btn-sm flex-1">
              <FileText className="w-4 h-4 mr-1" /> View
            </button>
            <button
              onClick={() => downloadPDF('gst')}
              disabled={downloading === 'gst'}
              className="btn btn-primary btn-sm flex-1"
            >
              <Download className="w-4 h-4 mr-1" /> {downloading === 'gst' ? '...' : 'PDF'}
            </button>
          </div>
        </div>
      </div>

      {/* Sales Report View */}
      {activeTab === 'sales' && salesData && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Sales Report</h2>
            <button onClick={() => setActiveTab(null)} className="text-gray-500 hover:text-gray-700 text-xl">&times;</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-green-50 p-3 rounded-lg">
              <p className="text-sm text-gray-600">Total Sales</p>
              <p className="text-xl font-bold text-green-600">₹{salesData.totalSales?.toFixed(2)}</p>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-gray-600">Total GST</p>
              <p className="text-xl font-bold text-blue-600">₹{salesData.totalGST?.toFixed(2)}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-600">Total Invoices</p>
              <p className="text-xl font-bold">{salesData.totalInvoices}</p>
            </div>
          </div>
          {salesData.sales?.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="table text-sm">
                <thead>
                  <tr>
                    <th>Invoice #</th>
                    <th>Date</th>
                    <th>Customer</th>
                    <th>GSTIN</th>
                    <th className="text-right">Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {salesData.sales.map((sale, i) => (
                    <tr key={i}>
                      <td className="font-medium">{sale.invoiceNumber}</td>
                      <td>{new Date(sale.invoiceDate).toLocaleDateString('en-IN')}</td>
                      <td>{sale.customer?.name || 'N/A'}</td>
                      <td className="text-gray-500">{sale.customer?.gstin || '-'}</td>
                      <td className="text-right font-semibold">₹{sale.grandTotal?.toFixed(2)}</td>
                      <td>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          sale.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                          sale.paymentStatus === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {sale.paymentStatus?.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No sales data available</p>
          )}
        </div>
      )}

      {/* Purchase Report View */}
      {activeTab === 'purchases' && purchaseData && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Purchase Report</h2>
            <button onClick={() => setActiveTab(null)} className="text-gray-500 hover:text-gray-700 text-xl">&times;</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-red-50 p-3 rounded-lg">
              <p className="text-sm text-gray-600">Total Purchases</p>
              <p className="text-xl font-bold text-red-600">₹{purchaseData.summary?.totalPurchases?.toFixed(2)}</p>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-gray-600">Total GST (ITC)</p>
              <p className="text-xl font-bold text-blue-600">₹{purchaseData.summary?.totalGST?.toFixed(2)}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-600">Total Invoices</p>
              <p className="text-xl font-bold">{purchaseData.summary?.totalInvoices}</p>
            </div>
          </div>
          {purchaseData.data?.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="table text-sm">
                <thead>
                  <tr>
                    <th>Period</th>
                    <th className="text-right">Purchase Amount</th>
                    <th className="text-right">GST (ITC)</th>
                    <th className="text-right">Invoices</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {purchaseData.data.map((row, i) => (
                    <tr key={i}>
                      <td className="font-medium">{row._id}</td>
                      <td className="text-right font-semibold">₹{row.totalPurchases?.toFixed(2)}</td>
                      <td className="text-right">₹{row.totalGST?.toFixed(2)}</td>
                      <td className="text-right">{row.totalInvoices}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No purchase data available</p>
          )}
        </div>
      )}

      {/* Stock Report View */}
      {activeTab === 'stock' && stockData && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Stock Report</h2>
            <button onClick={() => setActiveTab(null)} className="text-gray-500 hover:text-gray-700 text-xl">&times;</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-gray-600">Total Items</p>
              <p className="text-xl font-bold text-blue-600">{stockData.summary?.totalItems}</p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <p className="text-sm text-gray-600">Total Stock Value</p>
              <p className="text-xl font-bold text-green-600">₹{stockData.summary?.totalStockValue?.toFixed(2)}</p>
            </div>
            <div className="bg-red-50 p-3 rounded-lg">
              <p className="text-sm text-gray-600">Low Stock Items</p>
              <p className="text-xl font-bold text-red-600">{stockData.summary?.lowStockItems}</p>
            </div>
          </div>
          {stockData.items?.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="table text-sm">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Category</th>
                    <th className="text-right">Quantity</th>
                    <th className="text-right">Bags</th>
                    <th className="text-right">Min Level</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {stockData.items.map((item, i) => (
                    <tr key={i}>
                      <td className="font-medium">{item.name}</td>
                      <td className="capitalize">{item.category}</td>
                      <td className="text-right">{item.stock?.quantity || 0}</td>
                      <td className="text-right">{item.stock?.bags || 0}</td>
                      <td className="text-right">{item.stock?.minStockLevel || 0}</td>
                      <td>
                        {(item.stock?.quantity || 0) <= (item.stock?.minStockLevel || 0) ? (
                          <span className="px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">LOW</span>
                        ) : (
                          <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">OK</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No stock data available</p>
          )}
        </div>
      )}

      {/* GST Report View */}
      {activeTab === 'gst' && gstReport && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">GST Summary (GSTR-3B Format)</h2>
            <button onClick={() => setActiveTab(null)} className="text-gray-500 hover:text-gray-700 text-xl">&times;</button>
          </div>

          {gstReport.summary?.length > 0 ? (
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
                    <p className="text-gray-600">Taxable Value: <span className="font-semibold">{formatCurrency(item.totalTaxableValue)}</span></p>
                    <p className="text-gray-600">Invoice Count: <span className="font-semibold">{item.invoiceCount}</span></p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No GST data available</p>
          )}

          {gstReport.detailedByRate?.length > 0 && (
            <div className="mt-6">
              <h3 className="font-semibold text-lg mb-3">Rate-wise Tax Breakup</h3>
              <div className="overflow-x-auto">
                <table className="table text-sm">
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>GST Rate</th>
                      <th className="text-right">Taxable Value</th>
                      <th className="text-right">CGST</th>
                      <th className="text-right">SGST</th>
                      <th className="text-right">IGST</th>
                      <th className="text-right">Total GST</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {gstReport.detailedByRate.map((item, index) => (
                      <tr key={index}>
                        <td className="capitalize">{item._id.invoiceType}</td>
                        <td>{item._id.gstRate}%</td>
                        <td className="text-right">₹{item.taxableValue?.toFixed(2)}</td>
                        <td className="text-right">₹{item.cgst?.toFixed(2)}</td>
                        <td className="text-right">₹{item.sgst?.toFixed(2)}</td>
                        <td className="text-right">₹{item.igst?.toFixed(2)}</td>
                        <td className="text-right font-semibold">₹{item.totalGst?.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
