import { Request, Response } from 'express'
import prisma from '../config/database.js'
import { validatePromotion, calculateDiscount } from '../utils/promotion.js'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any

export const getActivePromotions = async (_req: Request, res: Response) => {
  try {
    const now = new Date()
    const promos = await db.promotion.findMany({
      where: {
        isActive: true,
        startDate: { lte: now },
        endDate: { gte: now },
      },
      orderBy: { startDate: 'asc' },
      select: {
        id: true,
        code: true,
        name: true,
        description: true,
        discountType: true,
        discountValue: true,
        minPurchase: true,
        maxDiscount: true,
        startDate: true,
        endDate: true,
      },
    })
    res.json(promos)
  } catch (error) {
    console.error('Get active promos error:', error)
    res.status(500).json({ error: 'Gagal mengambil promo' })
  }
}

export const validatePromo = async (req: Request, res: Response) => {
  try {
    const { code, subtotal } = req.body
    if (!code) return res.status(400).json({ error: 'Kode promo harus diisi' })
    const result = await validatePromotion(code, Number(subtotal) || 0, req.user?.userId)
    if (!result.valid) return res.status(400).json({ error: result.error })
    res.json({ promotion: result.promotion, discountAmount: result.discountAmount })
  } catch (error) {
    console.error('Validate promo error:', error)
    res.status(500).json({ error: 'Gagal validasi promo' })
  }
}

export const getAllPromotions = async (_req: Request, res: Response) => {
  try {
    const promos = await db.promotion.findMany({ orderBy: { createdAt: 'desc' } })
    res.json(promos)
  } catch (error) {
    console.error('Admin get promos error:', error)
    res.status(500).json({ error: 'Gagal mengambil promo' })
  }
}

export const createPromotion = async (req: Request, res: Response) => {
  try {
    const {
      code,
      name,
      description,
      discountType,
      discountValue,
      minPurchase,
      maxDiscount,
      startDate,
      endDate,
      isActive,
      usageLimit,
    } = req.body

    if (!code || !name || discountValue === undefined || !startDate || !endDate) {
      return res.status(400).json({ error: 'Kode, nama, nilai diskon, dan periode harus diisi' })
    }

    const promo = await db.promotion.create({
      data: {
        code: String(code).toUpperCase().trim(),
        name,
        description,
        discountType: discountType === 'FIXED' ? 'FIXED' : 'PERCENT',
        discountValue: Number(discountValue),
        minPurchase: Number(minPurchase) || 0,
        maxDiscount: maxDiscount ? Number(maxDiscount) : null,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        isActive: isActive !== false,
        usageLimit: usageLimit ? Number(usageLimit) : null,
      },
    })
    res.status(201).json(promo)
  } catch (error) {
    console.error('Create promo error:', error)
    if ((error as { code?: string })?.code === 'P2002') {
      return res.status(409).json({ error: 'Kode promo sudah dipakai' })
    }
    res.status(500).json({ error: 'Gagal membuat promo' })
  }
}

export const updatePromotion = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string
    const {
      name,
      description,
      discountType,
      discountValue,
      minPurchase,
      maxDiscount,
      startDate,
      endDate,
      isActive,
      usageLimit,
    } = req.body

    const promo = await db.promotion.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(discountType !== undefined && { discountType }),
        ...(discountValue !== undefined && { discountValue: Number(discountValue) }),
        ...(minPurchase !== undefined && { minPurchase: Number(minPurchase) }),
        ...(maxDiscount !== undefined && { maxDiscount: maxDiscount ? Number(maxDiscount) : null }),
        ...(startDate !== undefined && { startDate: new Date(startDate) }),
        ...(endDate !== undefined && { endDate: new Date(endDate) }),
        ...(isActive !== undefined && { isActive: Boolean(isActive) }),
        ...(usageLimit !== undefined && { usageLimit: usageLimit ? Number(usageLimit) : null }),
      },
    })
    res.json(promo)
  } catch (error) {
    console.error('Update promo error:', error)
    res.status(500).json({ error: 'Gagal update promo' })
  }
}

export const deletePromotion = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string
    await db.promotion.delete({ where: { id } })
    res.json({ message: 'Promo dihapus' })
  } catch (error) {
    console.error('Delete promo error:', error)
    res.status(500).json({ error: 'Gagal menghapus promo' })
  }
}

export { calculateDiscount }
