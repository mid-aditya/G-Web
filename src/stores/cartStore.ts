import { create } from 'zustand'
import api from '../lib/api'

interface CartItem {
  id: string
  quantity: number
  variant: {
    id: string
    size: string
    color: string
    colorHex: string
    stock: number
    product: {
      id: string
      name: string
      slug: string
      baseImage: string
      price: number
      discount: number
    }
  }
}

interface CartState {
  items: CartItem[]
  total: number
  itemCount: number
  isLoading: boolean
  fetchCart: () => Promise<void>
  addItem: (variantId: string, quantity?: number) => Promise<void>
  updateItem: (id: string, quantity: number) => Promise<void>
  removeItem: (id: string) => Promise<void>
  clearCart: () => Promise<void>
}

export const useCartStore = create<CartState>((set) => ({
  items: [],
  total: 0,
  itemCount: 0,
  isLoading: false,

  fetchCart: async () => {
    try {
      set({ isLoading: true })
      const { data } = await api.get('/cart')
      set({
        items: data.items,
        total: data.total,
        itemCount: data.items.length,
        isLoading: false,
      })
    } catch {
      set({ isLoading: false })
    }
  },

  addItem: async (variantId, quantity = 1) => {
    const { data } = await api.post('/cart', { variantId, quantity })
    set({
      items: data.items,
      total: data.total,
      itemCount: data.items.length,
    })
  },

  updateItem: async (id, quantity) => {
    const { data } = await api.put(`/cart/${id}`, { quantity })
    set({
      items: data.items,
      total: data.total,
      itemCount: data.items.length,
    })
  },

  removeItem: async (id) => {
    const { data } = await api.delete(`/cart/${id}`)
    set({
      items: data.items,
      total: data.total,
      itemCount: data.items.length,
    })
  },

  clearCart: async () => {
    await api.delete('/cart')
    set({ items: [], total: 0, itemCount: 0 })
  },
}))
