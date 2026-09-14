import { Request, Response } from 'express'
import prisma from '../config/database.js'
import { createMidtransTransaction, verifyMidtransNotification } from '../utils/midtrans.js'
import { validatePromotion } from '../utils/promotion.js'

export const createOrder = async (req: Request, res: Response) => {
  try {
    const { addressId, paymentMethod, notes, promoCode } = req.body

    // Get cart items
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: req.user!.userId },
      include: {
        variant: {
          include: {
            product: { select: { name: true, price: true, discount: true } },
          },
        },
      },
    })

    if (cartItems.length === 0) {
      return res.status(400).json({ error: 'Keranjang kosong' })
    }

    // Verify address
    const address = await prisma.address.findFirst({
      where: { id: addressId, userId: req.user!.userId },
    })

    if (!address) {
      return res.status(400).json({ error: 'Alamat tidak ditemukan' })
    }

    // Calculate totals
    const subtotal = cartItems.reduce((sum, item) => {
      const price = item.variant.product.price * (1 - item.variant.product.discount / 100)
      return sum + Math.round(price) * item.quantity
    }, 0)

    // Validate promo (optional)
    let discountAmount = 0
    let promotionId: string | undefined
    let appliedPromoCode: string | undefined
    if (promoCode) {
      const result = await validatePromotion(promoCode, subtotal, req.user!.userId)
      if (!result.valid || !result.promotion) {
        return res.status(400).json({ error: result.error || 'Kode promo tidak valid' })
      }
      discountAmount = result.discountAmount || 0
      promotionId = result.promotion.id
      appliedPromoCode = result.promotion.code
    }

    const discountedSubtotal = Math.max(0, subtotal - discountAmount)
    const shippingCost = discountedSubtotal >= 500000 ? 0 : 15000 // Free shipping above 500k
    const total = discountedSubtotal + shippingCost

    // Generate order number
    const orderCount = await prisma.order.count()
    const orderNumber = `STK-${String(orderCount + 1).padStart(6, '0')}`

    // Create order in database
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: req.user!.userId,
        addressId,
        subtotal,
        discountAmount,
        promoCode: appliedPromoCode,
        promotionId,
        shippingCost,
        total,
        paymentMethod,
        notes,
        status: 'PENDING',
        items: {
          create: cartItems.map((item) => ({
            variantId: item.variantId,
            quantity: item.quantity,
            price: Math.round(item.variant.product.price * (1 - item.variant.product.discount / 100)),
          })),
        },
      },
      include: {
        items: { include: { variant: { include: { product: true } } } },
        address: true,
      },
    })

    // Bump promo usage
    if (promotionId) {
      await prisma.promotion.update({
        where: { id: promotionId },
        data: { usedCount: { increment: 1 } },
      })
    }

    // Create Midtrans transaction
    try {
      const midtransItems = cartItems.map((item) => ({
        id: item.variantId,
        name: `${item.variant.product.name} - ${item.variant.size}/${item.variant.color}`,
        price: Math.round(item.variant.product.price * (1 - item.variant.product.discount / 100)),
        quantity: item.quantity,
      }))
      if (discountAmount > 0) {
        midtransItems.push({
          id: `DISKON-${appliedPromoCode || 'PROMO'}`,
          name: `Diskon ${appliedPromoCode || 'promo'}`,
          price: -discountAmount,
          quantity: 1,
        })
      }
      const midtransResult = await createMidtransTransaction({
        orderId: order.id,
        items: midtransItems,
        customerDetails: {
          firstName: address.name,
          email: req.user!.email,
          phone: address.phone,
        },
      })

      // Update order with Midtrans info
      await prisma.order.update({
        where: { id: order.id },
        data: {
          midtransToken: midtransResult.token,
          midtransOrderId: midtransResult.transactionId,
          paymentUrl: midtransResult.redirectUrl,
        },
      })

      // Clear cart
      await prisma.cartItem.deleteMany({ where: { userId: req.user!.userId } })

      res.status(201).json({
        order: {
          ...order,
          paymentUrl: midtransResult.redirectUrl,
          midtransToken: midtransResult.token,
        },
      })
    } catch (midtransError) {
      console.error('Midtrans error:', midtransError)
      // Order is created but payment link failed - user can retry
      res.status(201).json({
        order,
        error: 'Gagal membuat link pembayaran. Silakan coba lagi dari halaman order.',
      })
    }
  } catch (error) {
    console.error('Create order error:', error)
    res.status(500).json({ error: 'Gagal membuat pesanan' })
  }
}

export const getOrders = async (req: Request, res: Response) => {
  try {
    const { page = '1', limit = '10', status } = req.query

    const where: any = { userId: req.user!.userId }
    if (status) where.status = status

    const pageNum = parseInt(page as string, 10)
    const limitNum = parseInt(limit as string, 10)

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
        include: {
          items: {
            include: {
              variant: {
                include: {
                  product: { select: { id: true, name: true, slug: true, baseImage: true } },
                },
              },
            },
          },
          address: true,
          promotion: { select: { code: true, name: true } },
        },
      }),
      prisma.order.count({ where }),
    ])

    res.json({
      orders,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    })
  } catch (error) {
    console.error('Get orders error:', error)
    res.status(500).json({ error: 'Gagal mengambil pesanan' })
  }
}

export const getOrder = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string

    const order = await prisma.order.findFirst({
      where: { id, userId: req.user!.userId },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: { select: { id: true, name: true, slug: true, baseImage: true } },
              },
            },
          },
        },
        address: true,
          promotion: { select: { code: true, name: true } },
      },
    })

    if (!order) {
      return res.status(404).json({ error: 'Pesanan tidak ditemukan' })
    }

    res.json(order)
  } catch (error) {
    console.error('Get order error:', error)
    res.status(500).json({ error: 'Gagal mengambil detail pesanan' })
  }
}

export const handleMidtransCallback = async (req: Request, res: Response) => {
  try {
    const notification = req.body

    // Verify signature
    if (!verifyMidtransNotification(notification)) {
      return res.status(400).json({ error: 'Invalid signature' })
    }

    const { order_id, transaction_status, fraud_status, payment_type } = notification

    // Find order by midtrans order ID
    const order = await prisma.order.findFirst({
      where: { midtransOrderId: order_id },
    })

    if (!order) {
      return res.status(404).json({ error: 'Order not found' })
    }

    let newStatus: string

    switch (transaction_status) {
      case 'capture':
        if (fraud_status === 'accept') {
          newStatus = 'PAID'
        } else if (fraud_status === 'challenge') {
          newStatus = 'PENDING'
        } else {
          newStatus = 'CANCELLED'
        }
        break
      case 'settlement':
        newStatus = 'PAID'
        break
      case 'pending':
        newStatus = 'PENDING'
        break
      case 'deny':
      case 'cancel':
      case 'expire':
        newStatus = 'CANCELLED'
        break
      case 'refund':
        newStatus = 'REFUNDED'
        break
      default:
        newStatus = order.status
    }

    await prisma.order.update({
      where: { id: order.id },
      data: { status: newStatus as any },
    })

    // If payment successful, reduce stock
    if (newStatus === 'PAID' && order.status !== 'PAID') {
      const orderItems = await prisma.orderItem.findMany({
        where: { orderId: order.id },
      })

      for (const item of orderItems) {
        await prisma.productVariant.update({
          where: { id: item.variantId },
          data: { stock: { decrement: item.quantity } },
        })
      }
    }

    res.json({ status: 'ok' })
  } catch (error) {
    console.error('Midtrans callback error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const cancelOrder = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string

    const order = await prisma.order.findFirst({
      where: { id, userId: req.user!.userId },
    })

    if (!order) {
      return res.status(404).json({ error: 'Pesanan tidak ditemukan' })
    }

    if (order.status !== 'PENDING') {
      return res.status(400).json({ error: 'Hanya pesanan dengan status pending yang bisa dibatalkan' })
    }

    await prisma.order.update({
      where: { id },
      data: { status: 'CANCELLED' },
    })

    res.json({ message: 'Pesanan berhasil dibatalkan' })
  } catch (error) {
    console.error('Cancel order error:', error)
    res.status(500).json({ error: 'Gagal membatalkan pesanan' })
  }
}
