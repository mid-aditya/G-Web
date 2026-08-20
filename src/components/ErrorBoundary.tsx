import { Component, type ReactNode } from 'react'
import { Link } from 'react-router-dom'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '2rem',
          textAlign: 'center',
          fontFamily: 'inherit',
        }}>
          <span style={{ fontSize: '4rem', marginBottom: '1rem' }}>⚠️</span>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Terjadi Kesalahan</h1>
          <p style={{ color: 'var(--text-secondary, #888)', marginBottom: '2rem', maxWidth: 400 }}>
            Sesuatu yang tidak terduga terjadi. Silakan coba muat ulang halaman.
          </p>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              className="btn btn-primary"
              onClick={() => this.setState({ hasError: false, error: null })}
            >
              Coba Lagi
            </button>
            <Link to="/" className="btn btn-secondary">
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
