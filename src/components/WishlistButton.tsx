import { useEffect } from 'react'
import { FiHeart } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { useWishlistStore } from '../stores/wishlistStore'
import { useAuthStore } from '../stores/authStore'
import { useNavigate } from 'react-router-dom'

interface WishlistButtonProps {
  productId: string
  size?: number
  className?: string
}

const WishlistButton = ({ productId, size = 20, className = '' }: WishlistButtonProps) => {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  const { toggleWishlist, fetchWishlist, productIds } = useWishlistStore()
  const isActive = productIds.has(productId)

  useEffect(() => {
    if (isAuthenticated) {
      fetchWishlist()
    }
  }, [isAuthenticated, fetchWishlist])

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!isAuthenticated) {
      toast.error('Silakan login untuk menambahkan ke favorit')
      navigate('/login')
      return
    }

    try {
      const added = await toggleWishlist(productId)
      toast.success(added ? 'Ditambahkan ke favorit' : 'Dihapus dari favorit')
    } catch {
      toast.error('Gagal memperbarui favorit')
    }
  }

  return (
    <button
      className={`wishlist-btn ${isActive ? 'active' : ''} ${className}`}
      onClick={handleToggle}
      aria-label={isActive ? 'Hapus dari favorit' : 'Tambah ke favorit'}
      type="button"
    >
      <FiHeart
        size={size}
        fill={isActive ? 'currentColor' : 'none'}
      />
    </button>
  )
}

export default WishlistButton
