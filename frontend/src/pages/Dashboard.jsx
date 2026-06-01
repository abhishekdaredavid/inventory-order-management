import { useEffect, useState } from 'react'
import { getDashboard } from '../api/api'

export default function Dashboard() {
  const [data, setData] = useState(null)

  useEffect(() => {
    getDashboard().then(r => setData(r.data)).catch(() => {})
  }, [])

  if (!data) return <p>Loading dashboard...</p>

  return (
    <div>
      <h2>📊 Dashboard</h2>
      <div className="grid">
        <div className="stat-card"><h3>{data.total_products}</h3><p>Total Products</p></div>
        <div className="stat-card"><h3>{data.total_customers}</h3><p>Total Customers</p></div>
        <div className="stat-card"><h3>{data.total_orders}</h3><p>Total Orders</p></div>
        <div className="stat-card"><h3>{data.low_stock_products?.length}</h3><p>Low Stock</p></div>
      </div>
      <div className="card">
        <h3 style={{ marginBottom: '12px' }}>⚠️ Low Stock Products</h3>
        {data.low_stock_products?.length === 0 ? <p>No low stock products</p> : (
          <table>
            <thead><tr><th>Name</th><th>SKU</th><th>Quantity</th></tr></thead>
            <tbody>
              {data.low_stock_products.map(p => (
                <tr key={p.id}><td>{p.name}</td><td>{p.sku}</td><td style={{ color: 'red' }}>{p.quantity}</td></tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}