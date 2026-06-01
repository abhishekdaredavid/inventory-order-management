import { useEffect, useState } from 'react'
import { getCustomers, createCustomer, deleteCustomer } from '../api/api'

export default function Customers() {
  const [customers, setCustomers] = useState([])
  const [form, setForm] = useState({ full_name: '', email: '', phone: '' })
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')

  const load = () => getCustomers().then(r => setCustomers(r.data))
  useEffect(() => { load() }, [])

  const handleSubmit = async () => {
    setMsg(''); setErr('')
    try {
      await createCustomer(form)
      setMsg('Customer added!')
      setForm({ full_name: '', email: '', phone: '' })
      load()
    } catch (e) {
      setErr(e.response?.data?.detail || 'Error occurred')
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Delete this customer?')) {
      await deleteCustomer(id); load()
    }
  }

  return (
    <div>
      <h2>👥 Customers</h2>
      <div className="form-box">
        <h3 style={{ marginBottom: '12px' }}>Add Customer</h3>
        {msg && <p className="msg-success">{msg}</p>}
        {err && <p className="msg-error">{err}</p>}
        <input placeholder="Full Name" value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} />
        <input placeholder="Email" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
        <input placeholder="Phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
        <button className="btn-primary" onClick={handleSubmit}>Add Customer</button>
      </div>
      <table>
        <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Action</th></tr></thead>
        <tbody>
          {customers.map(c => (
            <tr key={c.id}>
              <td>{c.full_name}</td><td>{c.email}</td><td>{c.phone}</td>
              <td><button className="btn-danger" onClick={() => handleDelete(c.id)}>Delete</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}