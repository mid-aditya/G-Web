import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuthStore } from '../stores/authStore'
import SEO from '../components/SEO'
import './Auth.css'

const Register = () => {
  const navigate = useNavigate()
  const { register, googleLogin } = useAuthStore()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const googleBtnRef = useRef<HTMLDivElement>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await register({ name, email, phone, birthDate: birthDate || undefined, password })
      toast.success('Akun berhasil dibuat!')
      navigate('/')
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Pendaftaran gagal')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
    if (!clientId || !window.google?.accounts?.id) return

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: async (response: any) => {
        setIsLoading(true)
        try {
          await googleLogin(response.credential)
          toast.success('Akun berhasil dibuat!')
          navigate('/')
        } catch (err: any) {
          toast.error(err.response?.data?.error || 'Login Google gagal')
        } finally {
          setIsLoading(false)
        }
      },
    })

    if (googleBtnRef.current) {
      window.google.accounts.id.renderButton(googleBtnRef.current, {
        theme: 'outline',
        size: 'large',
        width: '100%',
        text: 'continue_with',
      })
    }
  }, [googleLogin, navigate])

  return (
    <div className="auth-page">
      <SEO title="Daftar" description="Buat akun baru di SETSUKO" />
      <div className="auth-container">
        <div className="auth-left">
          <div className="auth-brand">
            <span className="logo-mark">+</span>
            <span className="logo-text">SETSUKO</span>
          </div>
          <h1>Buat Akun<br />Baru</h1>
          <p>Daftar untuk menikmati pengalaman belanja yang lebih baik</p>
        </div>

        <div className="auth-right">
          <form onSubmit={handleSubmit} className="auth-form">
            <h2>Daftar</h2>

            <div className="form-group">
              <label>Nama Lengkap</label>
              <input
                type="text"
                className="input"
                placeholder="Nama Anda"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                className="input"
                placeholder="email@contoh.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>No. Telepon (opsional)</label>
              <input
                type="tel"
                className="input"
                placeholder="08xxxxxxxxxx"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Tanggal Lahir (opsional, untuk promo ultah)</label>
              <input
                type="date"
                className="input"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                className="input"
                placeholder="Min. 6 karakter"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            <button type="submit" className="btn btn-primary btn-lg auth-submit" disabled={isLoading}>
              {isLoading ? 'Mendaftar...' : 'Daftar'}
            </button>

            <div className="auth-divider">
              <span>atau</span>
            </div>

            <div ref={googleBtnRef} className="google-btn-wrapper" />

            <p className="auth-switch">
              Sudah punya akun? <Link to="/login">Masuk</Link>
            </p>

            <Link to="/" className="auth-back">← Kembali ke beranda</Link>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Register
