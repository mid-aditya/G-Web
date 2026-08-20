import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiPackage, FiShoppingCart, FiUsers, FiDollarSign, FiArrowLeft, FiPlus, FiEdit2, FiTrash2, FiX } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
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

interface Category {
  id: string
  name: string
  slug: string
}

interface ProductForm {
  name: string
  description: string
  price: number
  discount: number
  categoryId: string
  isFeatured: boolean
}

const EMPTY_PRODUCT: ProductForm = {
  name: '',
  description: '',
  price: 0,
  discount: 0,
  categoryId: '',
  isFeatured: false,
}

const Admin = () => {
  const navigate = useNavigate()
  const { user, isAuthenticated, isLoading } = useAuthStore()
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'orders' | 'users'>('dashboard')
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [orders, setOrders] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  // Product CRUD state
  const [showProductModal, setShowProductModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<string | null>(null)
  const [productForm, setProductForm] = useState<ProductForm>(EMPTY_PRODUCT)
  const [isSavingProduct, setIsSavingProduct] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

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
          const [productsRes, categoriesRes] = await Promise.all([
            api.get('/admin/products'),
            api.get('/products/categories'),
          ])
          setProducts(productsRes.data.products)
          setCategories(categoriesRes.data)
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
      toast.success('Status pesanan diperbarui')
    } catch (err: any) {
      toast.error('Gagal memperbarui status')
    }
  }

  // Product CRUD handlers
  const openCreateProduct = () => {
    setEditingProduct(null)
    setProductForm(EMPTY_PRODUCT)
    setShowProductModal(true)
  }

  const openEditProduct = (product: any) => {
    setEditingProduct(product.id)
    setProductForm({
      name: product.name,
      description: product.description || '',
      price: product.price,
      discount: product.discount || 0,
      categoryId: product.category.id,
      isFeatured: product.isFeatured || false,
    })
    setShowProductModal(true)
  }

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSavingProduct(true)
    try {
      if (editingProduct) {
        await api.put(`/admin/products/${editingProduct}`, productForm)
        toast.success('Produk berhasil diperbarui')
      } else {
        await api.post('/admin/products', productForm)
        toast.success('Produk berhasil ditambahkan')
      }
      setShowProductModal(false)
      // Refresh products
      const { data } = await api.get('/admin/products')
      setProducts(data.products)
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Gagal menyimpan produk')
    } finally {
      setIsSavingProduct(false)
    }
  }

  const handleDeleteProduct = async (productId: string) => {
    try {
      await api.delete(`/admin/products/${productId}`)
      setProducts(prev => prev.filter(p => p.id !== productId))
      setDeleteConfirm(null)
      toast.success('Produk berhasil dihapus')
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Gagal menghapus produk')
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
              <button className="btn btn-primary btn-sm" onClick={openCreateProduct}>
                <FiPlus size={14} /> Tambah Produk
              </button>
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
                    <th>Aksi</th>
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
                      <td>
                        <div className="table-actions">
                          <button className="action-btn" onClick={() => openEditProduct(product)} title="Edit">
                            <FiEdit2 size={14} />
                          </button>
                          <button className="action-btn danger" onClick={() => setDeleteConfirm(product.id)} title="Hapus">
                            <FiTrash2 size={14} />
                          </button>
                        </div>
                      </td>
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

      {/* Product Modal */}
      {showProductModal && (
        <div className="modal-overlay" onClick={() => setShowProductModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingProduct ? 'Edit Produk' : 'Tambah Produk Baru'}</h2>
              <button className="modal-close" onClick={() => setShowProductModal(false)}>
                <FiX size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="modal-body">
              <div className="form-group">
                <label>Nama Produk</label>
                <input
                  type="text"
                  className="input"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Deskripsi</label>
                <textarea
                  className="input"
                  rows={3}
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Harga (Rp)</label>
                  <input
                    type="number"
                    className="input"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                    required
                    min={0}
                  />
                </div>
                <div className="form-group">
                  <label>Diskon (%)</label>
                  <input
                    type="number"
                    className="input"
                    value={productForm.discount}
                    onChange={(e) => setProductForm({ ...productForm, discount: Number(e.target.value) })}
                    min={0}
                    max={100}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Kategori</label>
                <select
                  className="input"
                  value={productForm.categoryId}
                  onChange={(e) => setProductForm({ ...productForm, categoryId: e.target.value })}
                  required
                >
                  <option value="">Pilih kategori</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={productForm.isFeatured}
                    onChange={(e) => setProductForm({ ...productForm, isFeatured: e.target.checked })}
                  />
                  Produk Unggulan
                </label>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setShowProductModal(false)}>
                  Batal
                </button>
                <button type="submit" className="btn btn-primary" disabled={isSavingProduct}>
                  {isSavingProduct ? 'Menyimpan...' : editingProduct ? 'Simpan Perubahan' : 'Tambah Produk'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal modal-sm" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Hapus Produk</h2>
              <button className="modal-close" onClick={() => setDeleteConfirm(null)}>
                <FiX size={20} />
              </button>
            </div>
            <div className="modal-body">
              <p className="text-muted">Apakah Anda yakin ingin menghapus produk ini? Tindakan ini tidak dapat dibatalkan.</p>
            </div>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setDeleteConfirm(null)}>Batal</button>
              <button className="btn btn-danger" onClick={() => handleDeleteProduct(deleteConfirm)}>Hapus</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Admin
