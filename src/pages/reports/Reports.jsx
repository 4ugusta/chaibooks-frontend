export default function Reports() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Reports</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-xl font-semibold mb-2">Sales Report</h2>
          <p className="text-gray-600">Track your sales over time</p>
        </div>
        <div className="card">
          <h2 className="text-xl font-semibold mb-2">Purchase Report</h2>
          <p className="text-gray-600">Monitor your purchases</p>
        </div>
        <div className="card">
          <h2 className="text-xl font-semibold mb-2">GST Report (ITR Ready)</h2>
          <p className="text-gray-600">GST summary for tax filing</p>
        </div>
        <div className="card">
          <h2 className="text-xl font-semibold mb-2">Profit & Loss</h2>
          <p className="text-gray-600">View your profit and loss statement</p>
        </div>
        <div className="card">
          <h2 className="text-xl font-semibold mb-2">Stock Report</h2>
          <p className="text-gray-600">Current inventory status</p>
        </div>
        <div className="card">
          <h2 className="text-xl font-semibold mb-2">Customer Report</h2>
          <p className="text-gray-600">Customer analysis and outstanding</p>
        </div>
      </div>
    </div>
  )
}
