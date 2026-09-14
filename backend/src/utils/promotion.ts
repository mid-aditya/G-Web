import prisma from '../config/database.js'

interface PromotionLike {
  code: string
  discountType: string
  discountValue: number
  maxDiscount: number | null
  minPurchase: number
  startDate: Date
  endDate: Date
  isActive: boolean
  usageLimit: number | null
  usedCount: number
  id: string
}

interface ValidateResult {
  valid: boolean
  error?: string
  promotion?: PromotionLike
  discountAmount?: number
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any

export const calculateDiscount = (subtotal: number, promo: PromotionLike): number => {
  let discount = 0
  if (promo.discountType === 'PERCENT') {
    discount = Math.round((subtotal * promo.discountValue) / 100)
    if (promo.maxDiscount && discount > promo.maxDiscount) {
      discount = promo.maxDiscount
    }
  } else {
    discount = Math.min(promo.discountValue, subtotal)
  }
  return Math.max(0, Math.min(discount, subtotal))
}

export const validatePromotion = async (
  code: string,
  subtotal: number,
  userId?: string
): Promise<ValidateResult> => {
  const promo = (await db.promotion.findUnique({
    where: { code: code.toUpperCase().trim() },
  })) as PromotionLike | null

  if (!promo) return { valid: false, error: 'Kode promo tidak ditemukan' }
  if (!promo.isActive) return { valid: false, error: 'Promo sudah tidak aktif' }

  const now = new Date()
  if (now < promo.startDate) return { valid: false, error: 'Promo belum dimulai' }
  if (now > promo.endDate) return { valid: false, error: 'Promo sudah berakhir' }
  if (promo.usageLimit !== null && promo.usedCount >= promo.usageLimit) {
    return { valid: false, error: 'Kuota promo sudah habis' }
  }
  if (subtotal < promo.minPurchase) {
    return { valid: false, error: `Minimal belanja ${promo.minPurchase.toLocaleString('id-ID')}` }
  }

  // Promo ultah: kode diawali ULTAH hanya valid di bulan lahir user
  if (promo.code.startsWith('ULTAH') && userId) {
    const user = (await db.user.findUnique({ where: { id: userId }, select: { birthDate: true } })) as {
      birthDate: Date | null
    } | null
    if (!user?.birthDate) {
      return { valid: false, error: 'Promo ultah butuh tanggal lahir. Lengkapi di profil.' }
    }
    const birthMonth = new Date(user.birthDate).getMonth()
    if (birthMonth !== now.getMonth()) {
      return { valid: false, error: 'Promo ultah hanya berlaku di bulan kelahiranmu' }
    }
  }

  return { valid: true, promotion: promo, discountAmount: calculateDiscount(subtotal, promo) }
}
