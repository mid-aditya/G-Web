import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { formatCurrency, formatDate, getStatusLabel, getStatusColor } from '../lib/utils'
import { useAuthStore } from '../stores/authStore'
import api from '../lib/api'
import './Account.css'

interface OrderItem {
  id: string
  quantity: number
  price: number
  variant: {
    size: string
    color: string
    product: { id: string; name: string; slug: string; baseImage: string }
  }
}

interface Order {
  id: string
  orderNumber: string
  total: number
  status: string
  createdAt: string
  items: OrderItem[]
}

const Orders = () => {
  const navigate = useNavigate()
  const { isAuthenticated, isLoading } = useAuthStore()
  const [orders, setOrders] = useState<Order[]>([])
  const [loadingOrders, setLoadingOrders] = useState(true)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login')
    }
    const fetchOrders = async () => {
      try {
        const { data } = await api.get('/orders')
        setOrders(data.orders)
      } catch (err) {
        console.error(err)
      } finally {
        setLoadingOrders(false)
      }
    }
    if (isAuthenticated) fetchOrders()
  }, [isAuthenticated, isLoading, navigate])

  return (
    <div className="account-page">
      <Navbar />
      <div className="container">
        <div className="account-header">
          <h1>Pesanan Saya</h1>
        </div>

        <div className="account-layout">
          <aside className="account-sidebar">
            <nav className="account-nav">
              <button className="account-nav-link" onClick={() => navigate('/account')}>Profil</button>
              <button className="account-nav-link active">Pesanan Saya</button>
            </nav>
          </aside>

          <main className="account-main">
            {loadingOrders ? (
              <div className="orders-list">
                {[1, 2].map(i => (
                  <div key={i} className="order-card">
                    <div className="order-header">
                      <div>
                        <div className="skeleton skeleton-text short" style={{ height: '0.875rem', marginBottom: '0.375rem' }} />
                        <div className="skeleton skeleton-text" style={{ height: '0.75rem', width: 100 }} />
                      </div>
                      <div className="skeleton skeleton-text" style={{ height: '0.875rem', width: 80 }} />
                    </div>
                    <div className="order-items">
                      {[1].map(j => (
                        <div key={j} className="order-item">
                          <div className="skeleton" style={{ width: 56, height: 56, flexShrink: 0 }} />
                          <div style={{ flex: 1 }}>
                            <div className="skeleton skeleton-text medium" style={{ height: '0.875rem', marginBottom: '0.375rem' }} />
                            <div className="skeleton skeleton-text short" style={{ height: '0.75rem' }} />
                          </div>
                          <div className="skeleton skeleton-text" style={{ height: '0.875rem', width: 80 }} />
                        </div>
                      ))}
                    </div>
                    <div className="order-footer">
                      <div className="skeleton skeleton-text" style={{ height: '1rem', width: 120 }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : orders.length === 0 ? (
              <div className="orders-empty">
                <p>Belum ada pesanan</p>
              </div>
            ) : (
              <div className="orders-list">
                {orders.map(order => (
                  <div key={order.id} className="order-card">
                    <div className="order-header">
                      <div>
                        <p className="order-number">{order.orderNumber}</p>
                        <p className="order-date">{formatDate(order.createdAt)}</p>
                      </div>
                      <span className="order-status" style={{ color: getStatusColor(order.status) }}>
                        {getStatusLabel(order.status)}
                      </span>
                    </div>
                    <div className="order-items">
                      {order.items.map(item => (
                        <div key={item.id} className="order-item">
                          <div className="order-item-image">
                            {item.variant.product.baseImage ? (
                              <img src={item.variant.product.baseImage} alt={item.variant.product.name} className="product-card-img" style={{ borderRadius: 0 }} />
                            ) : (
                              <span>{item.variant.product.name.charAt(0)}</span>
                            )}
                          </div>
                          <div>
                            <p className="order-item-name">{item.variant.product.name}</p>
                            <p className="order-item-meta">{item.variant.size} / {item.variant.color} × {item.quantity}</p>
                          </div>
                          <p className="order-item-price">{formatCurrency(item.price * item.quantity)}</p>
                        </div>
                      ))}
                    </div>
                    <div className="order-footer">
                      <span className="order-total">Total: {formatCurrency(order.total)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default Orders
