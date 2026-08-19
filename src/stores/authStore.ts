import { create } from 'zustand'
import api from '../lib/api'

interface User {
  id: string
  email: string
  name: string
  phone?: string
  role: string
  avatar?: string
  addresses?: any[]
}

interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: { email: string; password: string; name: string; phone?: string }) => Promise<void>
  logout: () => Promise<void>
  fetchUser: () => Promise<void>
  updateProfile: (data: { name: string; phone?: string }) => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  login: async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password })
    localStorage.setItem('token', data.token)
    set({ user: data.user, isAuthenticated: true })
  },

  register: async (userData) => {
    const { data } = await api.post('/auth/register', userData)
    localStorage.setItem('token', data.token)
    set({ user: data.user, isAuthenticated: true })
  },

  logout: async () => {
    try {
      await api.post('/auth/logout')
    } catch {
      // Ignore error
    } finally {
      localStorage.removeItem('token')
      set({ user: null, isAuthenticated: false })
    }
  },

  fetchUser: async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        set({ isLoading: false })
        return
      }
      const { data } = await api.get('/auth/me')
      set({ user: data, isAuthenticated: true, isLoading: false })
    } catch {
      localStorage.removeItem('token')
      set({ user: null, isAuthenticated: false, isLoading: false })
    }
  },

  updateProfile: async (profileData) => {
    const { data } = await api.put('/auth/profile', profileData)
    set((state) => ({ user: state.user ? { ...state.user, ...data } : null }))
  },
}))
