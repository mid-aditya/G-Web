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

  if (isLoading || !user) return null

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
