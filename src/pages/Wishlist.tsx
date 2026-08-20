import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiHeart } from 'react-icons/fi'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import SEO from '../components/SEO'
import WishlistButton from '../components/WishlistButton'
import { formatCurrency } from '../lib/utils'
import { useWishlistStore } from '../stores/wishlistStore'
import { useAuthStore } from '../stores/authStore'
import './Wishlist.css'

const Wishlist = () => {
  const navigate = useNavigate()
  const { isAuthenticated, isLoading: authLoading } = useAuthStore()
  const { items, isLoading, fetchWishlist } = useWishlistStore()

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login')
    }
  }, [isAuthenticated, authLoading, navigate])

  useEffect(() => {
    if (isAuthenticated) {
      fetchWishlist()
    }
  }, [isAuthenticated, fetchWishlist])

  const getDiscountedPrice = (price: number, discount: number) => {
    return Math.round(price * (1 - discount / 100))
  }

  const getUniqueColors = (variants: { colorHex: string }[]) => {
    const seen = new Set<string>()
    return variants.filter(v => {
      if (seen.has(v.colorHex)) return false
      seen.add(v.colorHex)
      return true
    })
  }

  return (
    <div className="wishlist-page">
      <SEO title="Favorit Saya" description="Daftar produk favorit Anda di SETSUKO" />
      <Navbar />

      <div className="container">
        <div className="wishlist-header">
          <h1>Favorit Saya</h1>
          <p>{items.length} produk tersimpan</p>
        </div>

        {isLoading ? (
          <div className="wishlist-grid">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="product-card">
                <div className="product-card-image">
                  <div className="skeleton skeleton-image" />
                </div>
                <div className="product-card-info">
                  <div className="skeleton skeleton-text short" style={{ height: '0.75rem' }} />
                  <div className="skeleton skeleton-text" style={{ height: '1rem', marginTop: '0.5rem' }} />
                  <div className="skeleton skeleton-text short" style={{ height: '0.875rem', marginTop: '0.5rem' }} />
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="wishlist-empty">
            <FiHeart size={48} strokeWidth={1} />
            <h2>Belum ada favorit</h2>
            <p>Simpan produk yang Anda sukai untuk dilihat nanti</p>
            <Link to="/catalog" className="btn btn-primary">Jelajahi Koleksi</Link>
          </div>
        ) : (
          <div className="wishlist-grid">
            {items.map((item) => {
              const product = item.product
              const colors = getUniqueColors(product.variants)
              const discountedPrice = getDiscountedPrice(product.price, product.discount)
              return (
                <div key={item.id} className="product-card wishlist-card">
                  <Link to={`/product/${product.slug}`} className="product-card-image">
                    {product.baseImage ? (
                      <img src={product.baseImage} alt={product.name} className="product-card-img" loading="lazy" />
                    ) : (
                      <div className="product-card-placeholder">
                        <span>{product.name.charAt(0)}</span>
                      </div>
                    )}
                    {product.discount > 0 && (
                      <span className="product-card-badge">{product.discount}% OFF</span>
                    )}
                    <div className="wishlist-btn-wrapper">
                      <WishlistButton productId={product.id} size={18} />
                    </div>
                  </Link>
                  <div className="product-card-info">
                    <p className="product-card-category">{product.category.name}</p>
                    <Link to={`/product/${product.slug}`}>
                      <h4 className="product-card-name">{product.name}</h4>
                    </Link>
                    <div className="product-card-price">
                      <span className="current">{formatCurrency(discountedPrice)}</span>
                      {product.discount > 0 && (
                        <span className="original">{formatCurrency(product.price)}</span>
                      )}
                    </div>
                    {colors.length > 0 && (
                      <div className="color-swatches">
                        {colors.slice(0, 5).map((c, i) => (
                          <span key={i} className="color-swatch" style={{ background: c.colorHex }} />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}

export default Wishlist
