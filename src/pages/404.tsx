import { Link } from 'react-router-dom'
import Footer from '../components/Footer'
import Navbar from '../components/Navbar'

interface NotFoundProps {
  onLogin: () => void
  onRegister: () => void
  onLogoClick?: () => void
}

const NotFound = ({ onLogin, onRegister, onLogoClick }: NotFoundProps) => {
  return (
    <div className="app">
      <Navbar 
        onLogin={onLogin}
        onRegister={onRegister}
        onLogoClick={onLogoClick}
      />

      <section className="showcase" style={{ paddingTop: '8rem', minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
        <div className="showcase-container" style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: 'clamp(4rem, 10vw, 8rem)', fontWeight: 700, margin: 0, lineHeight: 1 }}>
            404
          </h1>
          <h2 className="section-title" style={{ marginTop: '1rem', marginBottom: '2rem' }}>
            Page Not Found
          </h2>
          <p style={{ color: 'rgba(255, 255, 255, 0.7)', marginBottom: '2rem', fontSize: '1.1rem' }}>
            The page you're looking for doesn't exist or has been moved.
          </p>
          <Link to="/" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-block' }}>
            Go Back Home
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default NotFound
