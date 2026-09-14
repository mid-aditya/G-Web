import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiPlus, FiCheck } from 'react-icons/fi'
import toast from 'react-hot-toast'
import Navbar from '../components/Navbar'
import SEO from '../components/SEO'
import { formatCurrency } from '../lib/utils'
import { useCartStore } from '../stores/cartStore'
import { useAuthStore } from '../stores/authStore'
import { useAddressStore } from '../stores/addressStore'
import api from '../lib/api'
import './Checkout.css'

const Checkout = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { items, total } = useCartStore()
  const {
    addresses,
    selectedAddressId,
    selectAddress,
    fetchAddresses,
    addAddress,
  } = useAddressStore()

  const [isProcessing, setIsProcessing] = useState(false)
  const [showNewAddress, setShowNewAddress] = useState(false)
  const [promoCode, setPromoCode] = useState('')
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; name: string; discountAmount: number } | null>(null)
  const [isValidatingPromo, setIsValidatingPromo] = useState(false)
  const [activePromos, setActivePromos] = useState<any[]>([])
  const [newAddress, setNewAddress] = useState({
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

  useEffect(() => {
    fetchAddresses()
  }, [fetchAddresses])

  useEffect(() => {
    const fetchPromos = async () => {
      try {
        const { data } = await api.get('/promotions/active')
        setActivePromos(data)
      } catch {
        // promo opsional, abaikan jika gagal
      }
    }
    fetchPromos()
  }, [])

  const discountAmount = appliedPromo?.discountAmount || 0
  const discountedTotal = Math.max(0, total - discountAmount)
  const shippingCost = discountedTotal >= 500000 ? 0 : 15000

  const handleApplyPromo = async () => {
    const code = promoCode.trim()
    if (!code) return
    setIsValidatingPromo(true)
    try {
      const { data } = await api.post('/promotions/validate', { code, subtotal: total })
      setAppliedPromo({
        code: data.promotion.code,
        name: data.promotion.name,
        discountAmount: data.discountAmount,
      })
      toast.success(`Promo ${data.promotion.code} dipakai`)
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Kode promo tidak valid')
    } finally {
      setIsValidatingPromo(false)
    }
  }

  const handleRemovePromo = () => {
    setAppliedPromo(null)
    setPromoCode('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)

    try {
      let addressId = selectedAddressId

      // If using new address, create it first
      if (showNewAddress && !addressId) {
        const saved = await addAddress({ ...newAddress, isDefault: addresses.length === 0 })
        addressId = saved.id
      }

      if (!addressId) {
        toast.error('Pilih alamat pengiriman')
        setIsProcessing(false)
        return
      }

      // Create order
      const { data } = await api.post('/orders', {
        addressId,
        paymentMethod: 'midtrans',
        notes: '',
        promoCode: appliedPromo?.code,
      })

      if (data.order?.midtransToken || data.order?.paymentUrl) {
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
      <SEO title="Checkout" description="Selesaikan pembelian Anda di SETSUKO" />
      <Navbar />

      <div className="container">
        <div className="checkout-header">
          <h1>Checkout</h1>
        </div>

        <form onSubmit={handleSubmit} className="checkout-layout">
          <div className="checkout-form">
            {/* Address Selection */}
            <div className="checkout-section">
              <h3>Alamat Pengiriman</h3>

              {addresses.length > 0 && !showNewAddress && (
                <div className="address-selection">
                  {addresses.map((addr) => (
                    <label
                      key={addr.id}
                      className={`address-option ${selectedAddressId === addr.id ? 'selected' : ''}`}
                    >
                      <input
                        type="radio"
                        name="address"
                        value={addr.id}
                        checked={selectedAddressId === addr.id}
                        onChange={() => selectAddress(addr.id)}
                      />
                      <div className="address-option-content">
                        <div className="address-option-header">
                          <span className="address-option-label">{addr.label}</span>
                          {addr.isDefault && <span className="address-default-badge"><FiCheck size={10} /> Utama</span>}
                        </div>
                        <p className="address-option-name">{addr.name} · {addr.phone}</p>
                        <p className="address-option-text">{addr.address}, {addr.city}, {addr.province} {addr.zipCode}</p>
                      </div>
                    </label>
                  ))}

                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => setShowNewAddress(true)}
                  >
                    <FiPlus size={14} /> Gunakan Alamat Baru
                  </button>
                </div>
              )}

              {(addresses.length === 0 || showNewAddress) && (
                <div className="new-address-form">
                  {addresses.length > 0 && (
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => setShowNewAddress(false)}
                      style={{ marginBottom: '1rem' }}
                    >
                      ← Kembali ke alamat tersimpan
                    </button>
                  )}

                  <div className="form-row">
                    <div className="form-group">
                      <label>Nama Lengkap</label>
                      <input
                        type="text"
                        className="input"
                        value={newAddress.name}
                        onChange={(e) => setNewAddress({ ...newAddress, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>No. Telepon</label>
                      <input
                        type="tel"
                        className="input"
                        value={newAddress.phone}
                        onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Alamat Lengkap</label>
                    <textarea
                      className="input"
                      rows={3}
                      value={newAddress.address}
                      onChange={(e) => setNewAddress({ ...newAddress, address: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Kota</label>
                      <input
                        type="text"
                        className="input"
                        value={newAddress.city}
                        onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Provinsi</label>
                      <input
                        type="text"
                        className="input"
                        value={newAddress.province}
                        onChange={(e) => setNewAddress({ ...newAddress, province: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Kode Pos</label>
                      <input
                        type="text"
                        className="input"
                        value={newAddress.zipCode}
                        onChange={(e) => setNewAddress({ ...newAddress, zipCode: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                </div>
              )}
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
              disabled={isProcessing || (!selectedAddressId && !showNewAddress)}
            >
              {isProcessing ? 'Memproses...' : 'Bayar Sekarang'}
            </button>
          </div>

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

            <div className="promo-box">
              <h4>Kode Promo</h4>
              {appliedPromo ? (
                <div className="promo-applied">
                  <div>
                    <p className="promo-code">{appliedPromo.code}</p>
                    <p className="promo-name">{appliedPromo.name}</p>
                  </div>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={handleRemovePromo}>
                    Hapus
                  </button>
                </div>
              ) : (
                <div className="promo-input-row">
                  <input
                    type="text"
                    className="input"
                    placeholder="Contoh: CANTIK99"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  />
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={handleApplyPromo}
                    disabled={isValidatingPromo || !promoCode.trim()}
                  >
                    {isValidatingPromo ? 'Cek...' : 'Pakai'}
                  </button>
                </div>
              )}
              {activePromos.length > 0 && !appliedPromo && (
                <div className="promo-list">
                  {activePromos.slice(0, 4).map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      className="promo-chip"
                      onClick={() => {
                        setPromoCode(p.code)
                      }}
                    >
                      {p.code}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="summary-divider" />

            <div className="summary-row">
              <span>Subtotal</span>
              <span>{formatCurrency(total)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="summary-row discount">
                <span>Diskon {appliedPromo?.code}</span>
                <span>-{formatCurrency(discountAmount)}</span>
              </div>
            )}
            <div className="summary-row">
              <span>Pengiriman</span>
              <span>{shippingCost === 0 ? 'GRATIS' : formatCurrency(shippingCost)}</span>
            </div>
            <div className="summary-divider" />
            <div className="summary-row total">
              <span>Total</span>
              <span>{formatCurrency(discountedTotal + shippingCost)}</span>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Checkout
