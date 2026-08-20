import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { FiSliders, FiX, FiChevronDown } from 'react-icons/fi'
import Navbar from '../components/Navbar'
import SEO from '../components/SEO'
import Footer from '../components/Footer'
import { formatCurrency } from '../lib/utils'
import api from '../lib/api'
import './Catalog.css'

interface Product {
  id: string
  name: string
  slug: string
  baseImage: string
  price: number
  discount: number
  category: { name: string; slug: string }
  variants: { size: string; color: string; colorHex: string }[]
  totalStock: number
  orderCount: number
}

interface Category {
  id: string
  name: string
  slug: string
  _count: { products: number }
}

const SORT_OPTIONS = [
  { value: 'newest', label: 'Terbaru' },
  { value: 'price_asc', label: 'Harga: Rendah ke Tinggi' },
  { value: 'price_desc', label: 'Harga: Tinggi ke Rendah' },
  { value: 'popular', label: 'Terpopuler' },
]

const SIZES = ['S', 'M', 'L', 'XL', 'XXL', '28', '30', '32', '34', 'One Size']

const Catalog = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [totalProducts, setTotalProducts] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const currentCategory = searchParams.get('category') || ''
  const currentSearch = searchParams.get('search') || ''
  const currentSort = searchParams.get('sort') || 'newest'
  const currentFeatured = searchParams.get('featured') || ''

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await api.get('/products/categories')
        setCategories(data)
      } catch (err) { console.error(err) }
    }
    fetchCategories()
  }, [])

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true)
      try {
        const params = new URLSearchParams()
        if (currentCategory) params.set('category', currentCategory)
        if (currentSearch) params.set('search', currentSearch)
        if (currentSort) params.set('sort', currentSort)
        if (currentFeatured) params.set('featured', currentFeatured)
        params.set('page', String(currentPage))
        params.set('limit', '12')

        const { data } = await api.get(`/products?${params.toString()}`)
        setProducts(data.products)
        setTotalProducts(data.pagination.total)
        setTotalPages(data.pagination.totalPages)
      } catch (err) {
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchProducts()
  }, [currentCategory, currentSearch, currentSort, currentFeatured, currentPage])

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams)
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    if (key !== 'page') params.set('page', '1')
    setCurrentPage(1)
    setSearchParams(params)
  }

  const clearFilters = () => {
    setSearchParams({})
    setCurrentPage(1)
  }

  const hasActiveFilters = currentCategory || currentSearch || currentFeatured

  const getDiscountedPrice = (price: number, discount: number) => {
    return Math.round(price * (1 - discount / 100))
  }

  const getUniqueColors = (variants: { colorHex: string }[]) => {
    const seen = new Set<string>()
    return variants.filter(v => { if (seen.has(v.colorHex)) return false; seen.add(v.colorHex); return true })
  }

  return (
    <div className="catalog-page">
      <SEO
        title={currentCategory ? categories.find(c => c.slug === currentCategory)?.name || 'Koleksi' : currentSearch ? `Pencarian: ${currentSearch}` : 'Koleksi'}
        description="Jelajahi koleksi pakaian SETSUKO. Temukan kaos, kemeja, celana, jaket, dress, dan aksesoris favorit Anda."
      />
      <Navbar />

      <div className="catalog-header">
        <div className="container">
          <div className="catalog-header-content">
            <div>
              <h1>
                {currentCategory
                  ? categories.find(c => c.slug === currentCategory)?.name || 'Koleksi'
                  : currentSearch
                  ? `Hasil pencarian "${currentSearch}"`
                  : 'Semua Koleksi'}
              </h1>
              <p>{totalProducts} produk ditemukan</p>
            </div>
            <div className="catalog-actions">
              <button className="btn btn-ghost btn-sm" onClick={() => setShowFilters(!showFilters)}>
                <FiSliders size={14} /> Filter
              </button>
              <div className="sort-select-wrapper">
                <select
                  className="sort-select"
                  value={currentSort}
                  onChange={(e) => updateParam('sort', e.target.value)}
                >
                  {SORT_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <FiChevronDown className="sort-select-icon" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container catalog-layout">
        {/* Filters Sidebar */}
        <aside className={`catalog-sidebar ${showFilters ? 'open' : ''}`}>
          <div className="sidebar-header">
            <h3>Filter</h3>
            {hasActiveFilters && (
              <button className="btn btn-ghost btn-sm" onClick={clearFilters}>Hapus Semua</button>
            )}
          </div>

          <div className="filter-group">
            <h4 className="filter-title">Kategori</h4>
            <div className="filter-options">
              <button
                className={`filter-option ${!currentCategory ? 'active' : ''}`}
                onClick={() => updateParam('category', '')}
              >
                Semua
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  className={`filter-option ${currentCategory === cat.slug ? 'active' : ''}`}
                  onClick={() => updateParam('category', cat.slug)}
                >
                  {cat.name}
                  <span className="filter-count">{cat._count.products}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <h4 className="filter-title">Ukuran</h4>
            <div className="filter-sizes">
              {SIZES.map(size => (
                <button key={size} className="size-btn">{size}</button>
              ))}
            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <main className="catalog-main">
          {hasActiveFilters && (
            <div className="active-filters">
              {currentCategory && (
                <span className="active-filter">
                  {categories.find(c => c.slug === currentCategory)?.name}
                  <button onClick={() => updateParam('category', '')}><FiX size={12} /></button>
                </span>
              )}
              {currentSearch && (
                <span className="active-filter">
                  "{currentSearch}"
                  <button onClick={() => updateParam('search', '')}><FiX size={12} /></button>
                </span>
              )}
            </div>
          )}

          {isLoading ? (
            <div className="catalog-loading">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="loading-card">
                  <div className="loading-image" />
                  <div className="loading-text" />
                  <div className="loading-text short" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="catalog-empty">
              <h3>Tidak ada produk ditemukan</h3>
              <p>Coba ubah filter atau kata kunci pencarian</p>
              <button className="btn btn-secondary" onClick={clearFilters}>Reset Filter</button>
            </div>
          ) : (
            <>
              <div className="catalog-grid">
                {products.map(product => {
                  const colors = getUniqueColors(product.variants)
                  const discountedPrice = getDiscountedPrice(product.price, product.discount)
                  return (
                    <Link to={`/product/${product.slug}`} key={product.id} className="product-card">
                      <div className="product-card-image">
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
                              <span key={i} className="color-swatch" style={{ background: c.colorHex }} />
                            ))}
                          </div>
                        )}
                      </div>
                    </Link>
                  )
                })}
              </div>

              {totalPages > 1 && (
                <div className="catalog-pagination">
                  <button
                    className="btn btn-ghost btn-sm"
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage(p => p - 1)}
                  >
                    Sebelumnya
                  </button>
                  <span className="pagination-info">Halaman {currentPage} dari {totalPages}</span>
                  <button
                    className="btn btn-ghost btn-sm"
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage(p => p + 1)}
                  >
                    Berikutnya
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      <Footer />
    </div>
  )
}

export default Catalog
