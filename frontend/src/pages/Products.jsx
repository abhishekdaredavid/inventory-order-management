import { useEffect, useState } from 'react'
import { getProducts, createProduct, updateProduct, deleteProduct } from '../api/api'

export default function Products() {
  const [products, setProducts] = useState([])
  const [form, setForm] = useState({ name: '', sku: '', price: '', quantity: '' })
  const [editing, setEditing] = useState(null)
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')

  const load = () => getProducts().then(r => setProducts(r.data))
  useEffect(() => { load() }, [])

  const handleSubmit = async () => {
    setMsg(''); setErr('')
    try {
      const data = { ...form, price: parseFloat(form.price), quantity: parseInt(form.quantity) }
      if (editing) {
        await updateProduct(editing, data)
        setMsg('Product updated!')
        setEditing(null)
      } else {
        await createProduct(data)
        setMsg('Product added!')
      }
      setForm({ name: '', sku: '', price: '', quantity: '' })
      load()
    } catch (e) {
      setErr(e.response?.data?.detail || 'Error occurred')
    }
  }

  const handleEdit = (p) => {
    setEditing(p.id)
    setForm({ name: p.name, sku: p.sku, price: p.price, quantity: p.quantity })
  }

  const handleDelete = async (id) => {
    if (window.confirm('Delete this product?')) {
      await deleteProduct(id); load()
    }
  }

  return (
    <div>
      <h2>📦 Products</h2>
      <div className="form-box">
        <h3 style={{ marginBottom: '12px' }}>{editing ? 'Edit Product' : 'Add Product'}</h3>
        {msg && <p className="msg-success">{msg}</p>}
        {err && <p className="msg-error">{err}</p>}
        <input placeholder="Product Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
        <input placeholder="SKU Code" value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} />
        <input placeholder="Price" type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
        <input placeholder="Quantity" type="number" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} />
        <button className="btn-primary" onClick={handleSubmit}>{editing ? 'Update' : 'Add Product'}</button>
        {editing && <button style={{ marginLeft: '10px' }} onClick={() => { setEditing(null); setForm({ name: '', sku: '', price: '', quantity: '' }) }}>Cancel</button>}
      </div>
      <table>
        <thead><tr><th>Name</th><th>SKU</th><th>Price</th><th>Qty</th><th>Actions</th></tr></thead>
        <tbody>
          {products.map(p => (
            <tr key={p.id}>
              <td>{p.name}</td><td>{p.sku}</td><td>₹{p.price}</td><td>{p.quantity}</td>
              <td>
                <button className="btn-primary" style={{ marginRight: '8px' }} onClick={() => handleEdit(p)}>Edit</button>
                <button className="btn-danger" onClick={() => handleDelete(p.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}