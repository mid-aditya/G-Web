import { create } from 'zustand'
import api from '../lib/api'

interface WishlistItem {
  id: string
  product: {
    id: string
    name: string
    slug: string
    baseImage: string
    price: number
    discount: number
    category: { name: string; slug: string }
    variants: { size: string; color: string; colorHex: string }[]
  }
  createdAt: string
}

interface WishlistState {
  items: WishlistItem[]
  isLoading: boolean
  productIds: Set<string>
  fetchWishlist: () => Promise<void>
  toggleWishlist: (productId: string) => Promise<boolean>
  isInWishlist: (productId: string) => boolean
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  items: [],
  isLoading: false,
  productIds: new Set(),

  fetchWishlist: async () => {
    set({ isLoading: true })
    try {
      const { data } = await api.get('/wishlist')
      const items = data.wishlist || data
      const productIds = new Set<string>(items.map((item: WishlistItem) => item.product.id))
      set({ items, productIds, isLoading: false })
    } catch {
      set({ isLoading: false })
    }
  },

  toggleWishlist: async (productId: string) => {
    const { productIds } = get()
    const isCurrentlyInWishlist = productIds.has(productId)

    // Optimistic update
    const newProductIds = new Set(productIds)
    if (isCurrentlyInWishlist) {
      newProductIds.delete(productId)
    } else {
      newProductIds.add(productId)
    }
    set({ productIds: newProductIds })

    try {
      if (isCurrentlyInWishlist) {
        await api.delete(`/wishlist/${productId}`)
        set({ productIds: newProductIds })
        return false
      } else {
        await api.post('/wishlist', { productId })
        set({ productIds: newProductIds })
        return true
      }
    } catch {
      // Revert on error
      set({ productIds })
      throw new Error('Gagal memperbarui wishlist')
    }
  },

  isInWishlist: (productId: string) => {
    return get().productIds.has(productId)
  },
}))
