import { Request, Response } from 'express'
import prisma from '../config/database.js'

// Dashboard stats
export const getDashboardStats = async (_req: Request, res: Response) => {
  try {
    const [
      totalProducts,
      totalOrders,
      totalUsers,
      totalRevenue,
      recentOrders,
      pendingOrders,
      lowStockProducts,
    ] = await Promise.all([
      prisma.product.count({ where: { isActive: true } }),
      prisma.order.count(),
      prisma.user.count({ where: { role: { name: 'CUSTOMER' } } }),
      prisma.order.aggregate({ where: { status: 'PAID' }, _sum: { total: true } }),
      prisma.order.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          user: { select: { id: true, name: true, email: true } },
          items: { include: { variant: { include: { product: { select: { name: true } } } } } },
        },
      }),
      prisma.order.count({ where: { status: 'PENDING' } }),
      prisma.productVariant.findMany({
        where: { stock: { lte: 5 } },
        include: { product: { select: { id: true, name: true, slug: true, baseImage: true } } },
        orderBy: { stock: 'asc' },
        take: 10,
      }),
    ])

    // Revenue by month (last 6 months)
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const revenueByMonth = await prisma.order.groupBy({
      by: ['createdAt'],
      where: {
        status: 'PAID',
        createdAt: { gte: sixMonthsAgo },
      },
      _sum: { total: true },
      _count: true,
    })

    res.json({
      totalProducts,
      totalOrders,
      totalUsers,
      totalRevenue: totalRevenue._sum.total || 0,
      pendingOrders,
      recentOrders,
      lowStockProducts,
      revenueByMonth,
    })
  } catch (error) {
    console.error('Dashboard stats error:', error)
    res.status(500).json({ error: 'Gagal mengambil statistik dashboard' })
  }
}

// Admin Products
export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const { page = '1', limit = '20', search } = req.query

    const where: any = {}
    if (search) {
      where.OR = [
        { name: { contains: search as string } },
        { slug: { contains: search as string } },
      ]
    }

    const pageNum = parseInt(page as string, 10)
    const limitNum = parseInt(limit as string, 10)

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
        include: {
          category: { select: { id: true, name: true } },
          variants: { select: { stock: true } },
          _count: { select: { orderItems: true } },
        },
      }),
      prisma.product.count({ where }),
    ])

    const transformed = products.map((p) => ({
      ...p,
      totalStock: p.variants.reduce((sum, v) => sum + v.stock, 0),
      soldCount: p._count.orderItems,
    }))

    res.json({
      products: transformed,
      pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    })
  } catch (error) {
    console.error('Admin get products error:', error)
    res.status(500).json({ error: 'Gagal mengambil produk' })
  }
}

// Admin Orders
export const getAllOrders = async (req: Request, res: Response) => {
  try {
    const { page = '1', limit = '20', status, search } = req.query

    const where: any = {}
    if (status) where.status = status
    if (search) {
      where.OR = [
        { orderNumber: { contains: search as string } },
        { user: { name: { contains: search as string } } },
        { user: { email: { contains: search as string } } },
      ]
    }

    const pageNum = parseInt(page as string, 10)
    const limitNum = parseInt(limit as string, 10)

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
        include: {
          user: { select: { id: true, name: true, email: true } },
          address: true,
          items: {
            include: {
              variant: {
                include: { product: { select: { id: true, name: true, baseImage: true } } },
              },
            },
          },
        },
      }),
      prisma.order.count({ where }),
    ])

    res.json({
      orders,
      pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    })
  } catch (error) {
    console.error('Admin get orders error:', error)
    res.status(500).json({ error: 'Gagal mengambil pesanan' })
  }
}

export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { status } = req.body

    const validStatuses = ['PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED']
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Status tidak valid' })
    }

    const order = await prisma.order.update({
      where: { id },
      data: { status },
    })

    res.json(order)
  } catch (error) {
    console.error('Update order status error:', error)
    res.status(500).json({ error: 'Gagal update status pesanan' })
  }
}

// Admin Users
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const { page = '1', limit = '20' } = req.query
    const pageNum = parseInt(page as string, 10)
    const limitNum = parseInt(limit as string, 10)

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          role: { select: { name: true } },
          createdAt: true,
          _count: { select: { orders: true } },
        },
      }),
      prisma.user.count(),
    ])

    res.json({
      users,
      pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    })
  } catch (error) {
    console.error('Admin get users error:', error)
    res.status(500).json({ error: 'Gagal mengambil pengguna' })
  }
}
