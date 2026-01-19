import { useEffect, useState } from 'react'
import { reportAPI } from '../../services/api'
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react'

export default function Reports() {
  const [gstReport, setGstReport] = useState(null)
  const [profitLoss, setProfitLoss] = useState(null)
  const [loading, setLoading] = useState(true)

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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-green-600">₹{profitLoss.revenue?.toFixed(2)}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Costs</p>
                <p className="text-2xl font-bold text-red-600">₹{profitLoss.cost?.toFixed(2)}</p>
              </div>
              <TrendingDown className="w-8 h-8 text-red-500" />
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Net Profit</p>
                <p className={`text-2xl font-bold ${profitLoss.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ₹{profitLoss.netProfit?.toFixed(2)}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-primary-500" />
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Profit Margin</p>
                <p className="text-2xl font-bold text-blue-600">{profitLoss.profitMargin?.toFixed(2)}%</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* GST Report */}
      {gstReport && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">GST Summary (ITR Ready)</h2>

          {gstReport.summary && gstReport.summary.length > 0 ? (
            <div className="space-y-4">
              {gstReport.summary.map((item, index) => (
                <div key={index} className="border-b pb-4">
                  <h3 className="font-semibold text-lg capitalize mb-2">{item._id} Transactions</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">CGST</p>
                      <p className="text-lg font-semibold">₹{item.totalCGST?.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">SGST</p>
                      <p className="text-lg font-semibold">₹{item.totalSGST?.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">IGST</p>
                      <p className="text-lg font-semibold">₹{item.totalIGST?.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total GST</p>
                      <p className="text-lg font-bold text-primary-600">₹{item.totalGST?.toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm text-gray-600">Taxable Value: <span className="font-semibold">₹{item.totalTaxableValue?.toFixed(2)}</span></p>
                    <p className="text-sm text-gray-600">Invoice Count: <span className="font-semibold">{item.invoiceCount}</span></p>
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
          <button className="mt-4 btn btn-secondary">View Detailed Report</button>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold mb-2">Stock Report</h2>
          <p className="text-gray-600">Monitor inventory levels and low stock alerts</p>
          <button className="mt-4 btn btn-secondary">View Stock Details</button>
        </div>
      </div>
    </div>
  )
}
