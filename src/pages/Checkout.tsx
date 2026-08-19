import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import Navbar from '../components/Navbar'
import { formatCurrency } from '../lib/utils'
import { useCartStore } from '../stores/cartStore'
import { useAuthStore } from '../stores/authStore'
import api from '../lib/api'
import './Checkout.css'

const Checkout = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { items, total } = useCartStore()
  const [isProcessing, setIsProcessing] = useState(false)
  const [address, setAddress] = useState({
    label: 'Rumah',
    name: user?.name || '',
    phone: user?.phone || '',
    address: '',
    city: '',
    province: '',
    zipCode: '',
  })

  useEffect(() => {
    if (items.length === 0) {
      navigate('/cart')
    }
  }, [items, navigate])

  const shippingCost = total >= 500000 ? 0 : 15000

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)

    try {
      // Create address first
      const { data: addressData } = await api.post('/auth/addresses', {
        ...address,
        isDefault: true,
      })

      // Create order
      const { data } = await api.post('/orders', {
        addressId: addressData.id,
        paymentMethod: 'midtrans',
        notes: '',
      })

      if (data.order?.midtransToken || data.order?.paymentUrl) {
        // Redirect to Midtrans payment page
        if (data.order.paymentUrl) {
          window.location.href = data.order.paymentUrl
        }
      } else {
        toast.error(data.error || 'Gagal membuat pesanan')
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Gagal memproses checkout')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="checkout-page">
      <Navbar />

      <div className="container">
        <div className="checkout-header">
          <h1>Checkout</h1>
        </div>

        <div className="checkout-layout">
          <form onSubmit={handleSubmit} className="checkout-form">
            <div className="checkout-section">
              <h3>Alamat Pengiriman</h3>

              <div className="form-row">
                <div className="form-group">
                  <label>Nama Lengkap</label>
                  <input
                    type="text"
                    className="input"
                    value={address.name}
                    onChange={(e) => setAddress({ ...address, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>No. Telepon</label>
                  <input
                    type="tel"
                    className="input"
                    value={address.phone}
                    onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Alamat Lengkap</label>
                <textarea
                  className="input"
                  rows={3}
                  value={address.address}
                  onChange={(e) => setAddress({ ...address, address: e.target.value })}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Kota</label>
                  <input
                    type="text"
                    className="input"
                    value={address.city}
                    onChange={(e) => setAddress({ ...address, city: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Provinsi</label>
                  <input
                    type="text"
                    className="input"
                    value={address.province}
                    onChange={(e) => setAddress({ ...address, province: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Kode Pos</label>
                  <input
                    type="text"
                    className="input"
                    value={address.zipCode}
                    onChange={(e) => setAddress({ ...address, zipCode: e.target.value })}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="checkout-section">
              <h3>Metode Pembayaran</h3>
              <div className="payment-options">
                <label className="payment-option active">
                  <input type="radio" name="payment" value="midtrans" defaultChecked />
                  <div className="payment-option-content">
                    <span className="payment-name">Midtrans Payment</span>
                    <span className="payment-desc">VA, E-Wallet, Kartu Kredit, Minimarket</span>
                  </div>
                </label>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg checkout-submit"
              disabled={isProcessing}
            >
              {isProcessing ? 'Memproses...' : 'Bayar Sekarang'}
            </button>
          </form>

          <div className="checkout-summary">
            <h3>Ringkasan Pesanan</h3>

            <div className="checkout-items">
              {items.map((item) => {
                const price = Math.round(
                  item.variant.product.price * (1 - item.variant.product.discount / 100)
                )
                return (
                  <div key={item.id} className="checkout-item">
                    <div className="checkout-item-image">
                      <span>{item.variant.product.name.charAt(0)}</span>
                    </div>
                    <div className="checkout-item-info">
                      <p className="checkout-item-name">{item.variant.product.name}</p>
                      <p className="checkout-item-meta">{item.variant.size} / {item.variant.color} × {item.quantity}</p>
                    </div>
                    <p className="checkout-item-price">{formatCurrency(price * item.quantity)}</p>
                  </div>
                )
              })}
            </div>

            <div className="summary-divider" />

            <div className="summary-row">
              <span>Subtotal</span>
              <span>{formatCurrency(total)}</span>
            </div>
            <div className="summary-row">
              <span>Pengiriman</span>
              <span>{shippingCost === 0 ? 'GRATIS' : formatCurrency(shippingCost)}</span>
            </div>
            <div className="summary-divider" />
            <div className="summary-row total">
              <span>Total</span>
              <span>{formatCurrency(total + shippingCost)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Checkout
