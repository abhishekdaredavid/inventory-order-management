import { useEffect, useState } from 'react'
import { getOrders, createOrder, deleteOrder, getProducts, getCustomers } from '../api/api'

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [products, setProducts] = useState([])
  const [customers, setCustomers] = useState([])
  const [customerId, setCustomerId] = useState('')
  const [items, setItems] = useState([{ product_id: '', quantity: 1 }])
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')

  const load = () => getOrders().then(r => setOrders(r.data))
  useEffect(() => {
    load()
    getProducts().then(r => setProducts(r.data))
    getCustomers().then(r => setCustomers(r.data))
  }, [])

  const handleAddItem = () => setItems([...items, { product_id: '', quantity: 1 }])
  const handleItemChange = (i, field, val) => {
    const updated = [...items]
    updated[i][field] = val
    setItems(updated)
  }

  const handleSubmit = async () => {
    setMsg(''); setErr('')
    try {
      await createOrder({
        customer_id: parseInt(customerId),
        items: items.map(i => ({ product_id: parseInt(i.product_id), quantity: parseInt(i.quantity) }))
      })
      setMsg('Order created!')
      setCustomerId('')
      setItems([{ product_id: '', quantity: 1 }])
      load()
    } catch (e) {
      setErr(e.response?.data?.detail || 'Error occurred')
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Cancel this order?')) {
      await deleteOrder(id); load()
    }
  }

  return (
    <div>
      <h2>🛒 Orders</h2>
      <div className="form-box">
        <h3 style={{ marginBottom: '12px' }}>Create Order</h3>
        {msg && <p className="msg-success">{msg}</p>}
        {err && <p className="msg-error">{err}</p>}
        <select value={customerId} onChange={e => setCustomerId(e.target.value)} style={{ marginBottom: '10px' }}>
          <option value="">Select Customer</option>
          {customers.map(c => <option key={c.id} value={c.id}>{c.full_name}</option>)}
        </select>
        {items.map((item, i) => (
          <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '8px' }}>
            <select value={item.product_id} onChange={e => handleItemChange(i, 'product_id', e.target.value)} style={{ flex: 2 }}>
              <option value="">Select Product</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.name} (Stock: {p.quantity})</option>)}
            </select>
            <input type="number" min="1" value={item.quantity} onChange={e => handleItemChange(i, 'quantity', e.target.value)} style={{ flex: 1 }} placeholder="Qty" />
          </div>
        ))}
        <button onClick={handleAddItem} style={{ marginBottom: '10px', background: '#e2e8f0' }}>+ Add Item</button><br />
        <button className="btn-success" onClick={handleSubmit}>Place Order</button>
      </div>
      <table>
        <thead><tr><th>Order ID</th><th>Customer ID</th><th>Total</th><th>Date</th><th>Action</th></tr></thead>
        <tbody>
          {orders.map(o => (
            <tr key={o.id}>
              <td>#{o.id}</td><td>{o.customer_id}</td><td>₹{o.total_amount}</td>
              <td>{new Date(o.created_at).toLocaleDateString()}</td>
              <td><button className="btn-danger" onClick={() => handleDelete(o.id)}>Cancel</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}