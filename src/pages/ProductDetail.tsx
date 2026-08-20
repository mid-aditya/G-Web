import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { FiMinus, FiPlus, FiChevronLeft, FiCheck } from 'react-icons/fi'
import toast from 'react-hot-toast'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { formatCurrency } from '../lib/utils'
import { useCartStore } from '../stores/cartStore'
import { useAuthStore } from '../stores/authStore'
import api from '../lib/api'
import './ProductDetail.css'

interface Variant {
  id: string
  size: string
  color: string
  colorHex: string
  stock: number
  sku: string
}

interface Product {
  id: string
  name: string
  slug: string
  description: string
  price: number
  discount: number
  baseImage: string
  category: { name: string; slug: string }
  variants: Variant[]
  sizes: string[]
  colors: string[]
  totalStock: number
  rating: number
  reviewCount: number
  orderCount: number
}

const ProductDetail = () => {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  const { addItem } = useCartStore()
  const [product, setProduct] = useState<Product | null>(null)
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedColor, setSelectedColor] = useState('')
  const [, setSelectedColorHex] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [isAdding, setIsAdding] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await api.get(`/products/${slug}`)
        setProduct(data)
        if (data.sizes.length > 0) setSelectedSize(data.sizes[0])
        if (data.colors.length > 0) {
          setSelectedColor(data.colors[0])
          setSelectedColorHex(data.variants.find((v: Variant) => v.color === data.colors[0])?.colorHex || '')
        }
      } catch (err) {
        console.error(err)
        navigate('/catalog')
      } finally {
        setIsLoading(false)
      }
    }
    fetchProduct()
  }, [slug, navigate])

  const getSelectedVariant = (): Variant | undefined => {
    return product?.variants.find(
      (v) => v.size === selectedSize && v.color === selectedColor
    )
  }

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error('Silakan login terlebih dahulu')
      navigate('/login')
      return
    }

    const variant = getSelectedVariant()
    if (!variant) {
      toast.error('Pilih ukuran dan warna')
      return
    }

    if (variant.stock < quantity) {
      toast.error('Stok tidak mencukupi')
      return
    }

    setIsAdding(true)
    try {
      await addItem(variant.id, quantity)
      toast.success('Ditambahkan ke keranjang')
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Gagal menambahkan ke keranjang')
    } finally {
      setIsAdding(false)
    }
  }

  const getDiscountedPrice = (price: number, discount: number) => {
    return Math.round(price * (1 - discount / 100))
  }

  if (isLoading) {
    return (
      <div className="product-detail-page">
        <Navbar />
        <div className="container" style={{ paddingTop: '120px' }}>
          <div className="product-detail-layout">
            <div className="product-detail-image">
              <div className="skeleton skeleton-image" />
            </div>
            <div className="product-detail-info">
              <div className="product-detail-header">
                <div className="skeleton skeleton-text short" style={{ height: '0.75rem' }} />
                <div className="skeleton skeleton-text" style={{ height: '2rem', marginBottom: '1rem' }} />
                <div className="skeleton skeleton-text medium" style={{ height: '1.5rem' }} />
              </div>
              <div className="product-detail-section">
                <div className="skeleton skeleton-text short" style={{ height: '0.875rem', marginBottom: '1rem' }} />
                <div className="flex gap-1">
                  <div className="skeleton" style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
                  <div className="skeleton" style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
                </div>
              </div>
              <div className="product-detail-section">
                <div className="skeleton skeleton-text short" style={{ height: '0.875rem', marginBottom: '1rem' }} />
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="skeleton" style={{ width: '48px', height: '40px' }} />
                  ))}
                </div>
              </div>
              <div className="skeleton" style={{ width: '100%', height: '48px', marginTop: '1.5rem' }} />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) return null

  const variant = getSelectedVariant()
  const discountedPrice = getDiscountedPrice(product.price, product.discount)
  const uniqueColors = product.variants.filter((v, i, arr) => arr.findIndex(x => x.color === v.color) === i)

  return (
    <div className="product-detail-page">
      <Navbar />

      <div className="container">
        <div className="breadcrumb">
          <Link to="/catalog" className="breadcrumb-link">
            <FiChevronLeft size={14} /> Koleksi
          </Link>
          <span className="breadcrumb-separator">/</span>
          <Link to={`/catalog?category=${product.category.slug}`} className="breadcrumb-link">
            {product.category.name}
          </Link>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">{product.name}</span>
        </div>

        <div className="product-detail-layout">
          <div className="product-detail-image">
            {product.baseImage ? (
              <img src={product.baseImage} alt={product.name} className="product-detail-img" />
            ) : (
              <div className="product-detail-image-placeholder">
                <span>{product.name.charAt(0)}</span>
              </div>
            )}
            {product.discount > 0 && (
              <span className="product-card-badge">{product.discount}% OFF</span>
            )}
          </div>

          <div className="product-detail-info">
            <div className="product-detail-header">
              <p className="product-detail-category">{product.category.name}</p>
              <h1 className="product-detail-name">{product.name}</h1>
              <div className="product-detail-price">
                <span className="current">{formatCurrency(discountedPrice)}</span>
                {product.discount > 0 && (
                  <>
                    <span className="original">{formatCurrency(product.price)}</span>
                    <span className="discount">-{product.discount}%</span>
                  </>
                )}
              </div>
            </div>

            {/* Color Selection */}
            <div className="product-detail-section">
              <h4>Warna: {selectedColor}</h4>
              <div className="color-options">
                {uniqueColors.map((v) => (
                  <button
                    key={v.id}
                    className={`color-option ${selectedColor === v.color ? 'active' : ''}`}
                    onClick={() => {
                      setSelectedColor(v.color)
                      setSelectedColorHex(v.colorHex)
                    }}
                  >
                    <span className="color-swatch-lg" style={{ background: v.colorHex }} />
                  </button>
                ))}
              </div>
            </div>

            {/* Size Selection */}
            <div className="product-detail-section">
              <div className="size-header">
                <h4>Ukuran: {selectedSize || 'Pilih'}</h4>
                <button className="btn btn-ghost btn-sm">Size Guide</button>
              </div>
              <div className="size-options">
                {product.sizes.map((size) => {
                  const available = product.variants.some(
                    (v) => v.size === size && v.color === selectedColor && v.stock > 0
                  )
                  return (
                    <button
                      key={size}
                      className={`size-option ${selectedSize === size ? 'active' : ''} ${!available ? 'unavailable' : ''}`}
                      onClick={() => available && setSelectedSize(size)}
                      disabled={!available}
                    >
                      {size}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Quantity */}
            <div className="product-detail-section">
              <h4>Jumlah</h4>
              <div className="quantity-selector">
                <button
                  className="qty-btn"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <FiMinus size={14} />
                </button>
                <span className="qty-value">{quantity}</span>
                <button
                  className="qty-btn"
                  onClick={() => setQuantity(Math.min(variant?.stock || 99, quantity + 1))}
                >
                  <FiPlus size={14} />
                </button>
              </div>
            </div>

            {/* Stock Info */}
            {variant && (
              <div className="stock-info">
                {variant.stock > 0 ? (
                  <span className="in-stock">
                    <FiCheck size={14} /> Tersedia ({variant.stock} stok)
                  </span>
                ) : (
                  <span className="out-of-stock">Stok habis</span>
                )}
              </div>
            )}

            {/* Add to Cart */}
            <button
              className="btn btn-primary btn-lg add-to-cart-btn"
              onClick={handleAddToCart}
              disabled={isAdding || !variant || variant.stock === 0}
            >
              {isAdding ? 'Menambahkan...' : !variant ? 'Pilih Ukuran & Warna' : variant.stock === 0 ? 'Stok Habis' : 'Tambah ke Keranjang'}
            </button>

            {/* Description */}
            {product.description && (
              <div className="product-detail-section">
                <h4>Deskripsi</h4>
                <p className="product-description">{product.description}</p>
              </div>
            )}

            {/* Meta */}
            <div className="product-meta">
              <p>SKU: {variant?.sku || '-'}</p>
              <p>Kategori: {product.category.name}</p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default ProductDetail
