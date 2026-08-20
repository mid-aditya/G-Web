import { Link } from 'react-router-dom'
import './Footer.css'

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link to="/" className="footer-logo">
              <span className="logo-mark">+</span>
              <span className="logo-text">SETSUKO</span>
            </Link>
            <p className="footer-tagline">
              Koleksi pakaian minimalis yang dirancang untuk gaya hidup modern.
              Bahan premium, potongan sempurna.
            </p>
          </div>

          <div className="footer-col">
            <h4 className="footer-heading">Koleksi</h4>
            <Link to="/catalog?category=kaos" className="footer-link">Kaos</Link>
            <Link to="/catalog?category=kemeja" className="footer-link">Kemeja</Link>
            <Link to="/catalog?category=celana" className="footer-link">Celana</Link>
            <Link to="/catalog?category=jaket" className="footer-link">Jaket</Link>
          </div>

          <div className="footer-col">
            <h4 className="footer-heading">Informasi</h4>
            <Link to="/catalog" className="footer-link">Semua Produk</Link>
            <Link to="/catalog?featured=true" className="footer-link">Unggulan</Link>
            <Link to="/orders" className="footer-link">Pesanan Saya</Link>
            <Link to="/account" className="footer-link">Akun Saya</Link>
          </div>

          <div className="footer-col">
            <h4 className="footer-heading">Bantuan</h4>
            <span className="footer-link">FAQ</span>
            <span className="footer-link">Kebijakan Pengembalian</span>
            <span className="footer-link">Syarat & Ketentuan</span>
            <span className="footer-link">Hubungi Kami</span>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2025 Setsuko. All rights reserved.</p>
          <div className="footer-bottom-links">
            <a href="#privacy">Privacy</a>
            <a href="#terms">Terms</a>
            <a href="#cookies">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer