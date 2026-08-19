import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import './404.css'

const NotFound = () => {
  return (
    <div className="not-found-page">
      <Navbar />
      <div className="not-found-content">
        <span className="not-found-code">404</span>
        <h1>Halaman Tidak Ditemukan</h1>
        <p>Halaman yang Anda cari tidak tersedia atau telah dipindahkan.</p>
        <Link to="/" className="btn btn-primary">Kembali ke Beranda</Link>
      </div>
    </div>
  )
}

export default NotFound
