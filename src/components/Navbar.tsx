import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiSearch, FiUser, FiShoppingBag, FiMenu, FiX, FiHeart } from 'react-icons/fi'
import { useAuthStore } from '../stores/authStore'
import { useCartStore } from '../stores/cartStore'
import './Navbar.css'

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()
  const { user, isAuthenticated, logout } = useAuthStore()
  const { itemCount } = useCartStore()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/catalog?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
      setIsSearchOpen(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/')
    setIsMenuOpen(false)
  }

  return (
    <>
      <nav className="navbar">
        <div className="navbar-inner">
          <button className="navbar-icon-btn navbar-menu-btn" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle menu">
            {isMenuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
          </button>

          <Link to="/" className="navbar-logo" onClick={() => setIsMenuOpen(false)}>
            <span className="logo-mark">+</span>
            <span className="logo-text">SETSUKO</span>
          </Link>

          <div className="navbar-links">
            <Link to="/catalog" className="nav-link">Koleksi</Link>
            <Link to="/catalog?featured=true" className="nav-link">Unggulan</Link>
            <Link to="/catalog?category=kaos" className="nav-link">Kaos</Link>
            <Link to="/catalog?category=kemeja" className="nav-link">Kemeja</Link>
          </div>

          <div className="navbar-actions">
            <button className="navbar-icon-btn" onClick={() => setIsSearchOpen(!isSearchOpen)} aria-label="Search">
              <FiSearch size={18} />
            </button>
            {isAuthenticated ? (
              <Link to="/wishlist" className="navbar-icon-btn" aria-label="Wishlist"><FiHeart size={18} /></Link>
            ) : null}
            {isAuthenticated ? (
              <Link to="/account" className="navbar-icon-btn" aria-label="Account"><FiUser size={18} /></Link>
            ) : (
              <Link to="/login" className="navbar-icon-btn" aria-label="Login"><FiUser size={18} /></Link>
            )}
            <Link to="/cart" className="navbar-icon-btn cart-btn" aria-label="Cart">
              <FiShoppingBag size={18} />
              {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
            </Link>
          </div>
        </div>
      </nav>

      <div className={`search-overlay ${isSearchOpen ? 'open' : ''}`}>
        <form onSubmit={handleSearch} className="search-form">
          <input type="text" placeholder="Cari produk..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="search-input" autoFocus />
          <button type="submit" className="search-submit"><FiSearch size={20} /></button>
        </form>
      </div>

      <div className={`mobile-menu ${isMenuOpen ? 'open' : ''}`}>
        <div className="mobile-menu-content">
          <Link to="/catalog" className="mobile-link" onClick={() => setIsMenuOpen(false)}>Koleksi</Link>
          <Link to="/catalog?featured=true" className="mobile-link" onClick={() => setIsMenuOpen(false)}>Unggulan</Link>
          <Link to="/catalog?category=kaos" className="mobile-link" onClick={() => setIsMenuOpen(false)}>Kaos</Link>
          <Link to="/catalog?category=kemeja" className="mobile-link" onClick={() => setIsMenuOpen(false)}>Kemeja</Link>
          <Link to="/catalog?category=celana" className="mobile-link" onClick={() => setIsMenuOpen(false)}>Celana</Link>
          <Link to="/catalog?category=jaket" className="mobile-link" onClick={() => setIsMenuOpen(false)}>Jaket</Link>
          <Link to="/catalog?category=dress" className="mobile-link" onClick={() => setIsMenuOpen(false)}>Dress</Link>
          <div className="mobile-menu-divider" />
          {isAuthenticated ? (
            <>
              <Link to="/wishlist" className="mobile-link" onClick={() => setIsMenuOpen(false)}>Favorit Saya</Link>
              <Link to="/account" className="mobile-link" onClick={() => setIsMenuOpen(false)}>Akun Saya</Link>
              <Link to="/orders" className="mobile-link" onClick={() => setIsMenuOpen(false)}>Pesanan Saya</Link>
              {user?.role === 'ADMIN' && <Link to="/admin" className="mobile-link" onClick={() => setIsMenuOpen(false)}>Panel Admin</Link>}
              <button className="mobile-link mobile-link-btn" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="mobile-link" onClick={() => setIsMenuOpen(false)}>Masuk</Link>
              <Link to="/register" className="mobile-link" onClick={() => setIsMenuOpen(false)}>Daftar</Link>
            </>
          )}
        </div>
      </div>
    </>
  )
}

export default Navbar
