import axios from 'axios'

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000'
})

// Products
export const getProducts = () => API.get('/products')
export const createProduct = (data) => API.post('/products', data)
export const updateProduct = (id, data) => API.put(`/products/${id}`, data)
export const deleteProduct = (id) => API.delete(`/products/${id}`)

// Customers
export const getCustomers = () => API.get('/customers')
export const createCustomer = (data) => API.post('/customers', data)
export const deleteCustomer = (id) => API.delete(`/customers/${id}`)

// Orders
export const getOrders = () => API.get('/orders')
export const createOrder = (data) => API.post('/orders', data)
export const deleteOrder = (id) => API.delete(`/orders/${id}`)

// Dashboard
export const getDashboard = () => API.get('/dashboard')