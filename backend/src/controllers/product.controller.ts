import { Request, Response } from 'express'
import prisma from '../config/database.js'

export const getCategories = async (_req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      include: { _count: { select: { products: true } } },
    })
    res.json(categories)
  } catch (error) {
    console.error('Get categories error:', error)
    res.status(500).json({ error: 'Gagal mengambil kategori' })
  }
}

export const getProducts = async (req: Request, res: Response) => {
  try {
    const {
      category,
      search,
      minPrice,
      maxPrice,
      sort = 'newest',
      page = '1',
      limit = '12',
      featured,
    } = req.query

    const where: any = { isActive: true }

    if (category) {
      where.category = { slug: category }
    }

    if (search) {
      where.OR = [
        { name: { contains: search as string } },
        { description: { contains: search as string } },
      ]
    }

    if (minPrice || maxPrice) {
      where.price = {}
      if (minPrice) where.price.gte = Number(minPrice)
      if (maxPrice) where.price.lte = Number(maxPrice)
    }

    if (featured === 'true') {
      where.isFeatured = true
    }

    const orderBy: any = (() => {
      switch (sort) {
        case 'price_asc': return { price: 'asc' as const }
        case 'price_desc': return { price: 'desc' as const }
        case 'popular': return { createdAt: 'desc' as const }
        default: return { createdAt: 'desc' as const }
      }
    })()

    const pageNum = parseInt(page as string, 10)
    const limitNum = parseInt(limit as string, 10)
    const skip = (pageNum - 1) * limitNum

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limitNum,
        include: {
          category: { select: { id: true, name: true, slug: true } },
          variants: {
            select: { size: true, color: true, colorHex: true, stock: true },
          },
          images: { orderBy: { sortOrder: 'asc' } },
          _count: { select: { reviews: true } },
        },
      }),
      prisma.product.count({ where }),
    ])

    // Transform products to include available sizes and colors
    const transformedProducts = products.map((product) => ({
      ...product,
      sizes: [...new Set(product.variants.map((v) => v.size))],
      colors: [...new Set(product.variants.map((v) => v.color))],
      colorHexes: [...new Set(product.variants.map((v) => v.colorHex))],
      totalStock: product.variants.reduce((sum, v) => sum + v.stock, 0),
      rating: 0, // Calculate from reviews if needed
      reviewCount: product._count.reviews,
      orderCount: 0,
    }))

    res.json({
      products: transformedProducts,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    })
  } catch (error) {
    console.error('Get products error:', error)
    res.status(500).json({ error: 'Gagal mengambil produk' })
  }
}

export const getProduct = async (req: Request, res: Response) => {
  try {
    const slug = req.params.slug as string

    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        variants: {
          select: { id: true, size: true, color: true, colorHex: true, stock: true, sku: true },
        },
        images: { orderBy: { sortOrder: 'asc' } },
        reviews: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: { user: { select: { id: true, name: true, avatar: true } } },
        },
        _count: { select: { reviews: true } },
      },
    })

    if (!product || !product.isActive) {
      return res.status(404).json({ error: 'Produk tidak ditemukan' })
    }

    const avgRating = product.reviews.length
      ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
      : 0

    res.json({
      ...product,
      sizes: [...new Set(product.variants.map((v) => v.size))],
      colors: [...new Set(product.variants.map((v) => v.color))],
      totalStock: product.variants.reduce((sum, v) => sum + v.stock, 0),
      rating: Math.round(avgRating * 10) / 10,
      orderCount: 0,
    })
  } catch (error) {
    console.error('Get product error:', error)
    res.status(500).json({ error: 'Gagal mengambil detail produk' })
  }
}

// Admin only
export const createProduct = async (req: Request, res: Response) => {
  try {
    const { name, description, price, discount, categoryId, isFeatured, baseImage, images, variants } = req.body

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        price,
        discount: discount || 0,
        categoryId,
        isFeatured: isFeatured || false,
        baseImage,
        images: images ? { create: images.map((url: string, i: number) => ({ url, sortOrder: i })) } : undefined,
        variants: variants ? {
          create: variants.map((v: any) => ({
            size: v.size,
            color: v.color,
            colorHex: v.colorHex,
            stock: v.stock,
            sku: `${slug}-${v.size}-${v.color}`.toUpperCase(),
          })),
        } : undefined,
      },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        variants: true,
        images: true,
      },
    })

    res.status(201).json(product)
  } catch (error) {
    console.error('Create product error:', error)
    res.status(500).json({ error: 'Gagal membuat produk' })
  }
}

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string
    const { name, description, price, discount, categoryId, isFeatured, isActive, baseImage } = req.body

    const product = await prisma.product.update({
      where: { id },
      data: {
        name,
        description,
        price,
        discount,
        categoryId,
        isFeatured,
        isActive,
        baseImage,
        slug: name
          ?.toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-'),
      },
      include: { category: true, variants: true, images: true },
    })

    res.json(product)
  } catch (error) {
    console.error('Update product error:', error)
    res.status(500).json({ error: 'Gagal update produk' })
  }
}

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string
    await prisma.product.delete({ where: { id } })
    res.json({ message: 'Produk berhasil dihapus' })
  } catch (error) {
    console.error('Delete product error:', error)
    res.status(500).json({ error: 'Gagal menghapus produk' })
  }
}
