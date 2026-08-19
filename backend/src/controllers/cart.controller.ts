import { Request, Response } from 'express'
import prisma from '../config/database.js'

export const getCart = async (req: Request, res: Response) => {
  try {
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: req.user!.userId },
      include: {
        variant: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                baseImage: true,
                price: true,
                discount: true,
                isActive: true,
              },
            },
          },
        },
      },
      orderBy: { id: 'desc' },
    })

    const total = cartItems.reduce((sum, item) => {
      const price = item.variant.product.price * (1 - item.variant.product.discount / 100)
      return sum + Math.round(price) * item.quantity
    }, 0)

    res.json({ items: cartItems, total })
  } catch (error) {
    console.error('Get cart error:', error)
    res.status(500).json({ error: 'Gagal mengambil keranjang' })
  }
}

export const addToCart = async (req: Request, res: Response) => {
  try {
    const { variantId, quantity = 1 } = req.body

    // Check variant exists and has stock
    const variant = await prisma.productVariant.findUnique({
      where: { id: variantId },
      include: { product: { select: { isActive: true } } },
    })

    if (!variant || !variant.product.isActive) {
      return res.status(404).json({ error: 'Varian produk tidak ditemukan' })
    }

    if (variant.stock < quantity) {
      return res.status(400).json({ error: 'Stok tidak mencukupi' })
    }

    // Check if already in cart
    const existing = await prisma.cartItem.findUnique({
      where: { userId_variantId: { userId: req.user!.userId, variantId } },
    })

    let cartItem

    if (existing) {
      const newQty = existing.quantity + quantity
      if (newQty > variant.stock) {
        return res.status(400).json({ error: 'Jumlah melebihi stok yang tersedia' })
      }
      cartItem = await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: newQty },
        include: { variant: { include: { product: true } } },
      })
    } else {
      cartItem = await prisma.cartItem.create({
        data: {
          userId: req.user!.userId,
          variantId,
          quantity,
        },
        include: { variant: { include: { product: true } } },
      })
    }

    // Return updated cart
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: req.user!.userId },
      include: {
        variant: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                baseImage: true,
                price: true,
                discount: true,
              },
            },
          },
        },
      },
    })

    const total = cartItems.reduce((sum, item) => {
      const price = item.variant.product.price * (1 - item.variant.product.discount / 100)
      return sum + Math.round(price) * item.quantity
    }, 0)

    res.json({ items: cartItems, total, addedItem: cartItem })
  } catch (error) {
    console.error('Add to cart error:', error)
    res.status(500).json({ error: 'Gagal menambahkan ke keranjang' })
  }
}

export const updateCartItem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { quantity } = req.body

    const cartItem = await prisma.cartItem.findUnique({
      where: { id },
      include: { variant: true },
    })

    if (!cartItem || cartItem.userId !== req.user!.userId) {
      return res.status(404).json({ error: 'Item tidak ditemukan di keranjang' })
    }

    if (quantity <= 0) {
      await prisma.cartItem.delete({ where: { id } })
    } else {
      if (quantity > cartItem.variant.stock) {
        return res.status(400).json({ error: 'Jumlah melebihi stok yang tersedia' })
      }
      await prisma.cartItem.update({
        where: { id },
        data: { quantity },
      })
    }

    // Return updated cart
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: req.user!.userId },
      include: {
        variant: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                baseImage: true,
                price: true,
                discount: true,
              },
            },
          },
        },
      },
    })

    const total = cartItems.reduce((sum, item) => {
      const price = item.variant.product.price * (1 - item.variant.product.discount / 100)
      return sum + Math.round(price) * item.quantity
    }, 0)

    res.json({ items: cartItems, total })
  } catch (error) {
    console.error('Update cart item error:', error)
    res.status(500).json({ error: 'Gagal update keranjang' })
  }
}

export const removeFromCart = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const cartItem = await prisma.cartItem.findUnique({ where: { id } })
    if (!cartItem || cartItem.userId !== req.user!.userId) {
      return res.status(404).json({ error: 'Item tidak ditemukan di keranjang' })
    }

    await prisma.cartItem.delete({ where: { id } })

    // Return updated cart
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: req.user!.userId },
      include: {
        variant: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                baseImage: true,
                price: true,
                discount: true,
              },
            },
          },
        },
      },
    })

    const total = cartItems.reduce((sum, item) => {
      const price = item.variant.product.price * (1 - item.variant.product.discount / 100)
      return sum + Math.round(price) * item.quantity
    }, 0)

    res.json({ items: cartItems, total })
  } catch (error) {
    console.error('Remove from cart error:', error)
    res.status(500).json({ error: 'Gagal menghapus dari keranjang' })
  }
}

export const clearCart = async (req: Request, res: Response) => {
  try {
    await prisma.cartItem.deleteMany({ where: { userId: req.user!.userId } })
    res.json({ items: [], total: 0 })
  } catch (error) {
    console.error('Clear cart error:', error)
    res.status(500).json({ error: 'Gagal mengosongkan keranjang' })
  }
}
