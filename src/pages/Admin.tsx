import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiPackage, FiShoppingCart, FiUsers, FiDollarSign, FiArrowLeft } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import { formatCurrency, formatDate, getStatusLabel, getStatusColor } from '../lib/utils'
import { useAuthStore } from '../stores/authStore'
import api from '../lib/api'
import './Admin.css'

interface DashboardStats {
  totalProducts: number
  totalOrders: number
  totalUsers: number
  totalRevenue: number
  pendingOrders: number
  recentOrders: any[]
}

const Admin = () => {
  const navigate = useNavigate()
  const { user, isAuthenticated, isLoading } = useAuthStore()
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'orders' | 'users'>('dashboard')
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [orders, setOrders] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== 'ADMIN')) {
      navigate('/')
    }
  }, [user, isAuthenticated, isLoading, navigate])

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        if (activeTab === 'dashboard') {
          const { data } = await api.get('/admin/dashboard')
          setStats(data)
        } else if (activeTab === 'orders') {
          const { data } = await api.get('/admin/orders')
          setOrders(data.orders)
        } else if (activeTab === 'products') {
          const { data } = await api.get('/admin/products')
          setProducts(data.products)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [activeTab])

  const handleStatusUpdate = async (orderId: string, status: string) => {
    try {
      await api.put(`/admin/orders/${orderId}/status`, { status })
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o))
    } catch (err: any) {
      console.error(err)
    }
  }

  if (isLoading || !isAuthenticated || user?.role !== 'ADMIN') return null

  return (
    <div className="admin-page">
      <div className="admin-sidebar">
        <div className="admin-sidebar-header">
          <Link to="/" className="admin-back"><FiArrowLeft size={18} /></Link>
          <h3>Admin Panel</h3>
        </div>
        <nav className="admin-nav">
          <button className={`admin-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
            <FiDollarSign size={16} /> Dashboard
          </button>
          <button className={`admin-nav-item ${activeTab === 'products' ? 'active' : ''}`} onClick={() => setActiveTab('products')}>
            <FiPackage size={16} /> Produk
          </button>
          <button className={`admin-nav-item ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>
            <FiShoppingCart size={16} /> Pesanan
          </button>
          <button className={`admin-nav-item ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>
            <FiUsers size={16} /> Pengguna
          </button>
        </nav>
        <div className="admin-sidebar-footer">
          <p className="admin-user">{user.name}</p>
          <p className="admin-email">{user.email}</p>
        </div>
      </div>

      <main className="admin-main">
        {loading ? (
          <div className="admin-loading">Memuat data...</div>
        ) : activeTab === 'dashboard' && stats ? (
          <div className="admin-dashboard">
            <h1>Dashboard</h1>
            <div className="stats-grid">
              <div className="stat-card">
                <FiDollarSign size={20} />
                <div>
                  <p className="stat-label">Total Pendapatan</p>
                  <p className="stat-value">{formatCurrency(stats.totalRevenue)}</p>
                </div>
              </div>
              <div className="stat-card">
                <FiShoppingCart size={20} />
                <div>
                  <p className="stat-label">Total Pesanan</p>
                  <p className="stat-value">{stats.totalOrders}</p>
                </div>
              </div>
              <div className="stat-card">
                <FiPackage size={20} />
                <div>
                  <p className="stat-label">Total Produk</p>
                  <p className="stat-value">{stats.totalProducts}</p>
                </div>
              </div>
              <div className="stat-card">
                <FiUsers size={20} />
                <div>
                  <p className="stat-label">Total Pengguna</p>
                  <p className="stat-value">{stats.totalUsers}</p>
                </div>
              </div>
            </div>

            <div className="admin-section">
              <h2>Pesanan Terbaru</h2>
              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Nomor</th>
                      <th>Pelanggan</th>
                      <th>Total</th>
                      <th>Status</th>
                      <th>Tanggal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentOrders.map((order: any) => (
                      <tr key={order.id}>
                        <td className="order-num">{order.orderNumber}</td>
                        <td>{order.user.name}</td>
                        <td>{formatCurrency(order.total)}</td>
                        <td>
                          <span className="status-badge" style={{ color: getStatusColor(order.status) }}>
                            {getStatusLabel(order.status)}
                          </span>
                        </td>
                        <td>{formatDate(order.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : activeTab === 'products' ? (
          <div className="admin-section">
            <div className="section-header-row">
              <h1>Produk ({products.length})</h1>
            </div>
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Nama</th>
                    <th>Kategori</th>
                    <th>Harga</th>
                    <th>Stok</th>
                    <th>Terjual</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product: any) => (
                    <tr key={product.id}>
                      <td>
                        <Link to={`/product/${product.slug}`} className="product-link">
                          {product.name}
                        </Link>
                      </td>
                      <td>{product.category.name}</td>
                      <td>{formatCurrency(product.price)}</td>
                      <td>{product.totalStock}</td>
                      <td>{product.soldCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : activeTab === 'orders' ? (
          <div className="admin-section">
            <h1>Pesanan ({orders.length})</h1>
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Nomor</th>
                    <th>Pelanggan</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order: any) => (
                    <tr key={order.id}>
                      <td className="order-num">{order.orderNumber}</td>
                      <td>{order.user.name}</td>
                      <td>{formatCurrency(order.total)}</td>
                      <td>
                        <span className="status-badge" style={{ color: getStatusColor(order.status) }}>
                          {getStatusLabel(order.status)}
                        </span>
                      </td>
                      <td>
                        <select
                          className="status-select"
                          value={order.status}
                          onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                        >
                          <option value="PENDING">Pending</option>
                          <option value="PAID">Dibayar</option>
                          <option value="PROCESSING">Diproses</option>
                          <option value="SHIPPED">Dikirim</option>
                          <option value="DELIVERED">Terkirim</option>
                          <option value="CANCELLED">Dibatalkan</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="admin-section">
            <h1>Pengguna</h1>
            <p className="text-muted">Manajemen pengguna segera hadir.</p>
          </div>
        )}
      </main>
    </div>
  )
}

export default Admin
