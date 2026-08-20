import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiMapPin, FiUser, FiTrash2, FiPlus, FiCheck } from 'react-icons/fi'
import toast from 'react-hot-toast'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import SEO from '../components/SEO'
import { useAuthStore } from '../stores/authStore'
import { useAddressStore } from '../stores/addressStore'
import './Account.css'

const EMPTY_ADDRESS = {
  label: 'Rumah',
  name: '',
  phone: '',
  address: '',
  city: '',
  province: '',
  zipCode: '',
}

const Account = () => {
  const navigate = useNavigate()
  const { user, isAuthenticated, isLoading, updateProfile, logout } = useAuthStore()
  const {
    addresses,
    isLoading: addressesLoading,
    fetchAddresses,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefault,
  } = useAddressStore()

  const [activeTab, setActiveTab] = useState<'profile' | 'addresses'>('profile')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [editingAddress, setEditingAddress] = useState<string | null>(null)
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [addressForm, setAddressForm] = useState(EMPTY_ADDRESS)
  const [isSavingAddress, setIsSavingAddress] = useState(false)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login')
    }
    if (user) {
      setName(user.name)
      setPhone(user.phone || '')
    }
  }, [user, isAuthenticated, isLoading, navigate])

  useEffect(() => {
    if (isAuthenticated) {
      fetchAddresses()
    }
  }, [isAuthenticated, fetchAddresses])

  // Sync address form with user info when opening new form
  useEffect(() => {
    if (showAddressForm && !editingAddress) {
      setAddressForm(prev => ({
        ...prev,
        name: user?.name || prev.name,
        phone: user?.phone || prev.phone,
      }))
    }
  }, [showAddressForm, editingAddress, user])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      await updateProfile({ name, phone })
      toast.success('Profil berhasil diperbarui')
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Gagal update profil')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSavingAddress(true)
    try {
      if (editingAddress) {
        await updateAddress(editingAddress, addressForm)
        toast.success('Alamat berhasil diperbarui')
      } else {
        await addAddress({
          ...addressForm,
          isDefault: addresses.length === 0,
        })
        toast.success('Alamat berhasil ditambahkan')
      }
      setShowAddressForm(false)
      setEditingAddress(null)
      setAddressForm(EMPTY_ADDRESS)
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Gagal menyimpan alamat')
    } finally {
      setIsSavingAddress(false)
    }
  }

  const handleEditAddress = (address: any) => {
    setEditingAddress(address.id)
    setAddressForm({
      label: address.label,
      name: address.name,
      phone: address.phone,
      address: address.address,
      city: address.city,
      province: address.province,
      zipCode: address.zipCode,
    })
    setShowAddressForm(true)
  }

  const handleDeleteAddress = async (id: string) => {
    if (!confirm('Hapus alamat ini?')) return
    try {
      await deleteAddress(id)
      toast.success('Alamat berhasil dihapus')
    } catch {
      toast.error('Gagal menghapus alamat')
    }
  }

  const handleSetDefault = async (id: string) => {
    try {
      await setDefault(id)
      toast.success('Alamat utama diperbarui')
    } catch {
      toast.error('Gagal mengatur alamat utama')
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  if (isLoading || !user) {
    return (
      <div className="account-page">
        <Navbar />
        <div className="container">
          <div className="account-header">
            <div className="skeleton skeleton-text" style={{ height: '2rem', width: 200 }} />
          </div>
          <div className="account-layout">
            <aside className="account-sidebar">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {[1, 2, 3].map(i => (
                  <div key={i} className="skeleton" style={{ width: '100%', height: 36 }} />
                ))}
              </div>
            </aside>
            <main className="account-main">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div className="skeleton skeleton-text" style={{ height: '1.25rem', width: 150 }} />
                {[1, 2, 3].map(i => (
                  <div key={i}>
                    <div className="skeleton skeleton-text short" style={{ height: '0.75rem', marginBottom: '0.5rem' }} />
                    <div className="skeleton" style={{ width: '100%', height: 44 }} />
                  </div>
                ))}
                <div className="skeleton" style={{ width: 160, height: 44 }} />
              </div>
            </main>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="account-page">
      <SEO title="Akun Saya" description="Kelola profil dan alamat Anda di SETSUKO" />
      <Navbar />
      <div className="container">
        <div className="account-header">
          <h1>Akun Saya</h1>
        </div>

        <div className="account-layout">
          <aside className="account-sidebar">
            <nav className="account-nav">
              <button
                className={`account-nav-link ${activeTab === 'profile' ? 'active' : ''}`}
                onClick={() => setActiveTab('profile')}
              >
                <FiUser size={14} /> Profil
              </button>
              <button
                className={`account-nav-link ${activeTab === 'addresses' ? 'active' : ''}`}
                onClick={() => setActiveTab('addresses')}
              >
                <FiMapPin size={14} /> Alamat
              </button>
              <button className="account-nav-link" onClick={() => navigate('/orders')}>Pesanan Saya</button>
              {user.role === 'ADMIN' && (
                <button className="account-nav-link" onClick={() => navigate('/admin')}>Panel Admin</button>
              )}
              <button className="account-nav-link logout" onClick={handleLogout}>Logout</button>
            </nav>
          </aside>

          <main className="account-main">
            {activeTab === 'profile' ? (
              <form onSubmit={handleSave} className="account-form">
                <div className="account-section">
                  <h3>Informasi Pribadi</h3>
                  <div className="form-group">
                    <label>Email</label>
                    <input type="email" className="input" value={user.email} disabled />
                  </div>
                  <div className="form-group">
                    <label>Nama Lengkap</label>
                    <input type="text" className="input" value={name} onChange={(e) => setName(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label>No. Telepon</label>
                    <input type="tel" className="input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="08xxxxxxxxxx" />
                  </div>
                </div>

                <button type="submit" className="btn btn-primary" disabled={isSaving}>
                  {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </form>
            ) : (
              <div className="account-section">
                <div className="address-section-header">
                  <h3>Alamat Saya</h3>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => {
                      setEditingAddress(null)
                      setAddressForm(EMPTY_ADDRESS)
                      setShowAddressForm(true)
                    }}
                  >
                    <FiPlus size={14} /> Tambah Alamat
                  </button>
                </div>

                {showAddressForm && (
                  <form onSubmit={handleSaveAddress} className="address-form">
                    <h4>{editingAddress ? 'Edit Alamat' : 'Alamat Baru'}</h4>

                    <div className="form-group">
                      <label>Label</label>
                      <select
                        className="input"
                        value={addressForm.label}
                        onChange={(e) => setAddressForm({ ...addressForm, label: e.target.value })}
                      >
                        <option value="Rumah">Rumah</option>
                        <option value="Kantor">Kantor</option>
                        <option value="Kos">Kos</option>
                        <option value="Lainnya">Lainnya</option>
                      </select>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Nama Penerima</label>
                        <input
                          type="text"
                          className="input"
                          value={addressForm.name}
                          onChange={(e) => setAddressForm({ ...addressForm, name: e.target.value })}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>No. Telepon</label>
                        <input
                          type="tel"
                          className="input"
                          value={addressForm.phone}
                          onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Alamat Lengkap</label>
                      <textarea
                        className="input"
                        rows={3}
                        value={addressForm.address}
                        onChange={(e) => setAddressForm({ ...addressForm, address: e.target.value })}
                        required
                      />
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Kota</label>
                        <input
                          type="text"
                          className="input"
                          value={addressForm.city}
                          onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Provinsi</label>
                        <input
                          type="text"
                          className="input"
                          value={addressForm.province}
                          onChange={(e) => setAddressForm({ ...addressForm, province: e.target.value })}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Kode Pos</label>
                        <input
                          type="text"
                          className="input"
                          value={addressForm.zipCode}
                          onChange={(e) => setAddressForm({ ...addressForm, zipCode: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="address-form-actions">
                      <button type="submit" className="btn btn-primary" disabled={isSavingAddress}>
                        {isSavingAddress ? 'Menyimpan...' : 'Simpan Alamat'}
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost"
                        onClick={() => {
                          setShowAddressForm(false)
                          setEditingAddress(null)
                        }}
                      >
                        Batal
                      </button>
                    </div>
                  </form>
                )}

                {addressesLoading ? (
                  <div className="address-list">
                    {[1, 2].map(i => (
                      <div key={i} className="address-card">
                        <div className="skeleton skeleton-text short" style={{ height: '1rem', width: 80, marginBottom: '0.75rem' }} />
                        <div className="skeleton skeleton-text" style={{ height: '0.875rem', marginBottom: '0.5rem' }} />
                        <div className="skeleton skeleton-text medium" style={{ height: '0.875rem' }} />
                      </div>
                    ))}
                  </div>
                ) : addresses.length === 0 && !showAddressForm ? (
                  <div className="address-empty">
                    <FiMapPin size={32} strokeWidth={1} />
                    <p>Belum ada alamat tersimpan</p>
                  </div>
                ) : (
                  <div className="address-list">
                    {addresses.map((addr) => (
                      <div key={addr.id} className={`address-card ${addr.isDefault ? 'default' : ''}`}>
                        <div className="address-card-header">
                          <span className="address-label">{addr.label}</span>
                          {addr.isDefault && (
                            <span className="address-default-badge">
                              <FiCheck size={12} /> Utama
                            </span>
                          )}
                        </div>
                        <p className="address-name">{addr.name} · {addr.phone}</p>
                        <p className="address-text">
                          {addr.address}, {addr.city}, {addr.province} {addr.zipCode}
                        </p>
                        <div className="address-card-actions">
                          {!addr.isDefault && (
                            <button className="btn btn-ghost btn-sm" onClick={() => handleSetDefault(addr.id)}>
                              Jadikan Utama
                            </button>
                          )}
                          <button className="btn btn-ghost btn-sm" onClick={() => handleEditAddress(addr)}>
                            Edit
                          </button>
                          <button className="btn btn-ghost btn-sm address-delete" onClick={() => handleDeleteAddress(addr.id)}>
                            <FiTrash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default Account
