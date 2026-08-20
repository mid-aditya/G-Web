import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiTrash2, FiMinus, FiPlus, FiShoppingBag } from 'react-icons/fi'
import toast from 'react-hot-toast'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { formatCurrency } from '../lib/utils'
import { useCartStore } from '../stores/cartStore'
import { useAuthStore } from '../stores/authStore'
import './Cart.css'

const Cart = () => {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  const { items, total, isLoading, fetchCart, updateItem, removeItem } = useCartStore()

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart()
    }
  }, [isAuthenticated, fetchCart])

  const shippingCost = total >= 500000 ? 0 : 15000

  const handleUpdateQuantity = async (id: string, newQty: number) => {
    try {
      await updateItem(id, newQty)
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Gagal update')
    }
  }

  const handleRemove = async (id: string) => {
    try {
      await removeItem(id)
      toast.success('Item dihapus dari keranjang')
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Gagal menghapus')
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="cart-page">
        <Navbar />
        <div className="container cart-empty-state">
          <FiShoppingBag size={48} strokeWidth={1} />
          <h2>Belum login</h2>
          <p>Silakan login untuk melihat keranjang belanja</p>
          <Link to="/login" className="btn btn-primary">Masuk</Link>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="cart-page">
      <Navbar />

      <div className="container">
        <div className="cart-header">
          <h1>Keranjang Belanja</h1>
          <p>{items.length} item</p>
        </div>

        {isLoading ? (
          <div className="cart-layout">
            <div className="cart-items">
              {[1, 2, 3].map(i => (
                <div key={i} className="cart-item">
                  <div className="skeleton" style={{ width: 120, height: 160, flexShrink: 0 }} />
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div className="skeleton skeleton-text medium" style={{ height: '1rem' }} />
                    <div className="skeleton skeleton-text short" style={{ height: '0.875rem' }} />
                    <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div className="skeleton" style={{ width: 100, height: 32 }} />
                      <div className="skeleton" style={{ width: 80, height: '1rem' }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="cart-summary">
              <div className="skeleton skeleton-text" style={{ height: '1.25rem', marginBottom: '1.5rem' }} />
              <div className="skeleton skeleton-text" style={{ height: '1rem', marginBottom: '0.75rem' }} />
              <div className="skeleton skeleton-text medium" style={{ height: '1rem', marginBottom: '0.75rem' }} />
              <div className="skeleton" style={{ width: '100%', height: 1, margin: '1rem 0' }} />
              <div className="skeleton skeleton-text" style={{ height: '1.25rem', marginBottom: '1.5rem' }} />
              <div className="skeleton" style={{ width: '100%', height: 48 }} />
            </div>
          </div>
        ) : items.length === 0 ? (
          <div className="cart-empty-state">
            <FiShoppingBag size={48} strokeWidth={1} />
            <h2>Keranjang kosong</h2>
            <p>Belum ada produk di keranjang belanja Anda</p>
            <Link to="/catalog" className="btn btn-primary">Mulai Belanja</Link>
          </div>
        ) : (
          <div className="cart-layout">
            <div className="cart-items">
              {items.map((item) => {
                const discountedPrice = Math.round(
                  item.variant.product.price * (1 - item.variant.product.discount / 100)
                )
                return (
                  <div key={item.id} className="cart-item">
                    <Link to={`/product/${item.variant.product.slug}`} className="cart-item-image">
                      {item.variant.product.baseImage ? (
                        <img src={item.variant.product.baseImage} alt={item.variant.product.name} className="product-card-img" />
                      ) : (
                        <div className="cart-item-placeholder">
                          <span>{item.variant.product.name.charAt(0)}</span>
                        </div>
                      )}
                    </Link>

                    <div className="cart-item-info">
                      <div className="cart-item-header">
                        <div>
                          <Link to={`/product/${item.variant.product.slug}`} className="cart-item-name">
                            {item.variant.product.name}
                          </Link>
                          <p className="cart-item-meta">
                            {item.variant.size} / {item.variant.color}
                          </p>
                        </div>
                        <button
                          className="cart-item-remove"
                          onClick={() => handleRemove(item.id)}
                          aria-label="Remove item"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>

                      <div className="cart-item-bottom">
                        <div className="quantity-selector">
                          <button
                            className="qty-btn"
                            onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            <FiMinus size={14} />
                          </button>
                          <span className="qty-value">{item.quantity}</span>
                          <button
                            className="qty-btn"
                            onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                            disabled={item.quantity >= item.variant.stock}
                          >
                            <FiPlus size={14} />
                          </button>
                        </div>
                        <p className="cart-item-price">{formatCurrency(discountedPrice * item.quantity)}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="cart-summary">
              <h3>Ringkasan Belanja</h3>

              <div className="summary-row">
                <span>Subtotal</span>
                <span>{formatCurrency(total)}</span>
              </div>

              <div className="summary-row">
                <span>Estimasi Pengiriman</span>
                <span>{shippingCost === 0 ? 'GRATIS' : formatCurrency(shippingCost)}</span>
              </div>

              {shippingCost > 0 && (
                <p className="shipping-note">Gratis ongkir untuk pembelian di atas Rp 500.000</p>
              )}

              <div className="summary-divider" />

              <div className="summary-row total">
                <span>Total</span>
                <span>{formatCurrency(total + shippingCost)}</span>
              </div>

              <button
                className="btn btn-primary btn-lg checkout-btn"
                onClick={() => navigate('/checkout')}
              >
                Checkout
              </button>

              <Link to="/catalog" className="continue-shopping">
                Lanjut Belanja
              </Link>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}

export default Cart
