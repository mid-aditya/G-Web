import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuthStore } from '../stores/authStore'
import './Auth.css'

const Login = () => {
  const navigate = useNavigate()
  const { login, googleLogin } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const googleBtnRef = useRef<HTMLDivElement>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await login(email, password)
      toast.success('Selamat datang kembali!')
      navigate('/')
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Login gagal')
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
          toast.success('Selamat datang!')
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
      <div className="auth-container">
        <div className="auth-left">
          <div className="auth-brand">
            <span className="logo-mark">+</span>
            <span className="logo-text">SETSUKO</span>
          </div>
          <h1>Selamat Datang<br />Kembali</h1>
          <p>Masuk ke akun Anda untuk melanjutkan belanja</p>
        </div>

        <div className="auth-right">
          <form onSubmit={handleSubmit} className="auth-form">
            <h2>Masuk</h2>

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
              <label>Password</label>
              <input
                type="password"
                className="input"
                placeholder="Masukkan password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary btn-lg auth-submit" disabled={isLoading}>
              {isLoading ? 'Masuk...' : 'Masuk'}
            </button>

            <div className="auth-divider">
              <span>atau</span>
            </div>

            <div ref={googleBtnRef} className="google-btn-wrapper" />

            <p className="auth-switch">
              Belum punya akun? <Link to="/register">Daftar</Link>
            </p>

            <Link to="/" className="auth-back">← Kembali ke beranda</Link>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Login
