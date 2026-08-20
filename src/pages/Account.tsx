import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useAuthStore } from '../stores/authStore'
import './Account.css'

const Account = () => {
  const navigate = useNavigate()
  const { user, isAuthenticated, isLoading, updateProfile, logout } = useAuthStore()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login')
    }
    if (user) {
      setName(user.name)
      setPhone(user.phone || '')
    }
  }, [user, isAuthenticated, isLoading, navigate])

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
      <Navbar />
      <div className="container">
        <div className="account-header">
          <h1>Akun Saya</h1>
        </div>

        <div className="account-layout">
          <aside className="account-sidebar">
            <nav className="account-nav">
              <button className="account-nav-link active">Profil</button>
              <button className="account-nav-link" onClick={() => navigate('/orders')}>Pesanan Saya</button>
              {user.role === 'ADMIN' && (
                <button className="account-nav-link" onClick={() => navigate('/admin')}>Panel Admin</button>
              )}
              <button className="account-nav-link logout" onClick={handleLogout}>Logout</button>
            </nav>
          </aside>

          <main className="account-main">
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
          </main>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default Account
