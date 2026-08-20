import { create } from 'zustand'
import api from '../lib/api'

interface Address {
  id: string
  label: string
  name: string
  phone: string
  address: string
  city: string
  province: string
  zipCode: string
  isDefault: boolean
}

interface AddressState {
  addresses: Address[]
  selectedAddressId: string | null
  isLoading: boolean
  fetchAddresses: () => Promise<void>
  addAddress: (data: Omit<Address, 'id'>) => Promise<Address>
  updateAddress: (id: string, data: Partial<Address>) => Promise<void>
  deleteAddress: (id: string) => Promise<void>
  setDefault: (id: string) => Promise<void>
  selectAddress: (id: string) => void
  getSelectedAddress: () => Address | null
}

export const useAddressStore = create<AddressState>((set, get) => ({
  addresses: [],
  selectedAddressId: null,
  isLoading: false,

  fetchAddresses: async () => {
    set({ isLoading: true })
    try {
      const { data } = await api.get('/auth/addresses')
      const addresses = data.addresses || data
      const defaultAddr = addresses.find((a: Address) => a.isDefault)
      set({
        addresses,
        selectedAddressId: get().selectedAddressId || defaultAddr?.id || addresses[0]?.id || null,
        isLoading: false,
      })
    } catch {
      set({ isLoading: false })
    }
  },

  addAddress: async (addressData) => {
    const { data } = await api.post('/auth/addresses', addressData)
    const newAddress = data.address || data
    set((state) => {
      const addresses = [...state.addresses, newAddress]
      return {
        addresses,
        selectedAddressId: state.selectedAddressId || newAddress.id,
      }
    })
    return newAddress
  },

  updateAddress: async (id, addressData) => {
    const { data } = await api.put(`/auth/addresses/${id}`, addressData)
    const updated = data.address || data
    set((state) => ({
      addresses: state.addresses.map(a => a.id === id ? { ...a, ...updated } : a),
    }))
  },

  deleteAddress: async (id) => {
    await api.delete(`/auth/addresses/${id}`)
    set((state) => {
      const addresses = state.addresses.filter(a => a.id !== id)
      const selectedAddressId = state.selectedAddressId === id
        ? addresses.find(a => a.isDefault)?.id || addresses[0]?.id || null
        : state.selectedAddressId
      return { addresses, selectedAddressId }
    })
  },

  setDefault: async (id) => {
    await api.put(`/auth/addresses/${id}`, { isDefault: true })
    set((state) => ({
      addresses: state.addresses.map(a => ({
        ...a,
        isDefault: a.id === id,
      })),
    }))
  },

  selectAddress: (id) => set({ selectedAddressId: id }),

  getSelectedAddress: () => {
    const { addresses, selectedAddressId } = get()
    return addresses.find(a => a.id === selectedAddressId) || null
  },
}))
