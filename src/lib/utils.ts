export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export const formatDate = (date: string | Date): string => {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date))
}

export const formatDateTime = (date: string | Date): string => {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    PENDING: 'Menunggu Pembayaran',
    PAID: 'Dibayar',
    PROCESSING: 'Diproses',
    SHIPPED: 'Dikirim',
    DELIVERED: 'Terkirim',
    CANCELLED: 'Dibatalkan',
    REFUNDED: 'Dikembalikan',
  }
  return labels[status] || status
}

export const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    PENDING: '#d4a017',
    PAID: '#4a7c59',
    PROCESSING: '#2c3e50',
    SHIPPED: '#3498db',
    DELIVERED: '#27ae60',
    CANCELLED: '#c0392b',
    REFUNDED: '#8e44ad',
  }
  return colors[status] || '#7a7a78'
}

export const truncate = (text: string, length: number): string => {
  if (text.length <= length) return text
  return text.substring(0, length) + '...'
}
