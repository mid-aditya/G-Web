import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { formatCurrency } from '../lib/utils'
import api from '../lib/api'
import './Home.css'

interface Product {
  id: string
  name: string
  slug: string
  baseImage: string
  price: number
  discount: number
  category: { name: string; slug: string }
  colors: string[]
  colorHexes: string[]
  variants: { size: string; color: string; colorHex: string }[]
}

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const { data } = await api.get('/products?featured=true&limit=4')
        setFeaturedProducts(data.products)
      } catch (err) {
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchFeatured()
  }, [])

  const categories = [
    { name: 'Kaos', slug: 'kaos', count: '12+' },
    { name: 'Kemeja', slug: 'kemeja', count: '8+' },
    { name: 'Celana', slug: 'celana', count: '10+' },
    { name: 'Jaket', slug: 'jaket', count: '6+' },
    { name: 'Dress', slug: 'dress', count: '5+' },
    { name: 'Aksesoris', slug: 'aksesoris', count: '15+' },
  ]

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
    <div className="home">
      <Navbar />

      {/* Hero */}
      <section className="hero">
        <div className="hero-inner">
          <div className="hero-content">
            <p className="hero-label">Musim Baru 2026</p>
            <h1 className="hero-title">
              Simplicity<br />
              <span className="hero-title-accent">is the</span><br />
              Ultimate Sophistication
            </h1>
            <p className="hero-desc">
              Koleksi pakaian minimalis yang dirancang untuk gaya hidup modern.
              Bahan premium, potongan sempurna.
            </p>
            <div className="hero-actions">
              <Link to="/catalog" className="btn btn-primary btn-lg">Belanja Sekarang</Link>
              <Link to="/catalog?featured=true" className="btn btn-secondary btn-lg">Lihat Unggulan</Link>
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-image-wrapper">
              <div className="hero-image-placeholder">
                <span className="hero-image-text">SETSUKO</span>
                <span className="hero-image-sub">新作</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <p className="section-label">Kategori</p>
            <h2>Jelajahi Koleksi Kami</h2>
          </div>
          <div className="categories-grid">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                to={`/catalog?category=${cat.slug}`}
                className="category-card"
              >
                <div className="category-card-inner">
                  <span className="category-name">{cat.name}</span>
                  <span className="category-count">{cat.count} produk</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="section section-featured">
        <div className="container">
          <div className="section-header">
            <p className="section-label">Pilihan Kami</p>
            <h2>Produk Unggulan</h2>
          </div>

          {isLoading ? (
            <div className="products-loading">
              <div className="loading-grid">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="loading-card">
                    <div className="loading-image" />
                    <div className="loading-text" />
                    <div className="loading-text short" />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="grid grid-4">
              {featuredProducts.map((product) => {
                const colors = getUniqueColors(product.variants)
                const discountedPrice = getDiscountedPrice(product.price, product.discount)
                return (
                  <Link to={`/product/${product.slug}`} key={product.id} className="product-card">
                    <div className="product-card-image">
                      <div className="product-card-placeholder">
                        <span>{product.name.charAt(0)}</span>
                      </div>
                      {product.discount > 0 && (
                        <span className="product-card-badge">{product.discount}% OFF</span>
                      )}
                    </div>
                    <div className="product-card-info">
                      <p className="product-card-category">{product.category.name}</p>
                      <h4 className="product-card-name">{product.name}</h4>
                      <div className="product-card-price">
                        <span className="current">{formatCurrency(discountedPrice)}</span>
                        {product.discount > 0 && (
                          <span className="original">{formatCurrency(product.price)}</span>
                        )}
                      </div>
                      {colors.length > 0 && (
                        <div className="color-swatches">
                          {colors.slice(0, 5).map((c, i) => (
                            <span
                              key={i}
                              className="color-swatch"
                              style={{ background: c.colorHex }}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </Link>
                )
              })}
            </div>
          )}

          <div className="text-center" style={{ marginTop: '3rem' }}>
            <Link to="/catalog" className="btn btn-secondary">Lihat Semua Produk</Link>
          </div>
        </div>
      </section>

      {/* Banner */}
      <section className="banner">
        <div className="container">
          <div className="banner-inner">
            <div className="banner-content">
              <p className="banner-label">Gratis Ongkir</p>
              <h2>Pembelian di atas Rp 500.000</h2>
              <p className="banner-desc">Berlaku untuk seluruh wilayah Indonesia. Tanpa minimal item.</p>
              <Link to="/catalog" className="btn btn-primary">Mulai Belanja</Link>
            </div>
            <div className="banner-visual">
              <span className="banner-kanji">送料無料</span>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default Home
