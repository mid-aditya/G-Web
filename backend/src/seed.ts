import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create roles
  await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {},
    create: { name: 'ADMIN' },
  })
  await prisma.role.upsert({
    where: { name: 'CUSTOMER' },
    update: {},
    create: { name: 'CUSTOMER' },
  })

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12)
  await prisma.user.upsert({
    where: { email: 'admin@setsuko.id' },
    update: {},
    create: {
      email: 'admin@setsuko.id',
      password: adminPassword,
      name: 'Admin Setsuko',
      role: { connect: { name: 'ADMIN' } },
    },
  })

  // Create categories
  const categories = [
    { name: 'Kaos', slug: 'kaos', sortOrder: 1 },
    { name: 'Kemeja', slug: 'kemeja', sortOrder: 2 },
    { name: 'Celana', slug: 'celana', sortOrder: 3 },
    { name: 'Jaket', slug: 'jaket', sortOrder: 4 },
    { name: 'Dress', slug: 'dress', sortOrder: 5 },
    { name: 'Aksesoris', slug: 'aksesoris', sortOrder: 6 },
  ]

  const categoryMap: Record<string, string> = {}

  for (const cat of categories) {
    const created = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    })
    categoryMap[cat.slug] = created.id
  }

  // Create products
  const products = [
    {
      name: 'Kaos Oversize Cotton Combed',
      slug: 'kaos-oversize-cotton-combed',
      description: 'Kaos oversized dengan bahan cotton combed 30s yang nyaman. Cocok untuk daily wear dengan potongan loose yang trendy.',
      price: 149000,
      discount: 0,
      baseImage: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=600&fit=crop',
      categorySlug: 'kaos',
      isFeatured: true,
      variants: [
        { size: 'S', color: 'Hitam', colorHex: '#1a1a1a', stock: 20 },
        { size: 'M', color: 'Hitam', colorHex: '#1a1a1a', stock: 30 },
        { size: 'L', color: 'Hitam', colorHex: '#1a1a1a', stock: 25 },
        { size: 'XL', color: 'Hitam', colorHex: '#1a1a1a', stock: 15 },
        { size: 'S', color: 'Putih', colorHex: '#ffffff', stock: 20 },
        { size: 'M', color: 'Putih', colorHex: '#ffffff', stock: 30 },
        { size: 'L', color: 'Putih', colorHex: '#ffffff', stock: 25 },
        { size: 'XL', color: 'Putih', colorHex: '#ffffff', stock: 15 },
      ],
    },
    {
      name: 'Kemeja Flannel Premium',
      slug: 'kemeja-flannel-premium',
      description: 'Kemeja flannel dengan motif kotak-kotak klasik. Bahan flannel tebal dan lembut, cocok untuk cuaca dingin.',
      price: 259000,
      discount: 10,
      baseImage: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500&h=600&fit=crop',
      categorySlug: 'kemeja',
      isFeatured: true,
      variants: [
        { size: 'M', color: 'Merah', colorHex: '#c0392b', stock: 15 },
        { size: 'L', color: 'Merah', colorHex: '#c0392b', stock: 20 },
        { size: 'XL', color: 'Merah', colorHex: '#c0392b', stock: 10 },
        { size: 'M', color: 'Biru', colorHex: '#2c3e50', stock: 15 },
        { size: 'L', color: 'Biru', colorHex: '#2c3e50', stock: 20 },
        { size: 'XL', color: 'Biru', colorHex: '#2c3e50', stock: 10 },
      ],
    },
    {
      name: 'Celana Cargo Utility',
      slug: 'celana-cargo-utility',
      description: 'Celana cargo dengan banyak pockets untuk kepraktisan. Bahan ripstop yang kuat dan ringan.',
      price: 299000,
      discount: 0,
      baseImage: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=500&h=600&fit=crop',
      categorySlug: 'celana',
      isFeatured: true,
      variants: [
        { size: '28', color: 'Olive', colorHex: '#556b2f', stock: 12 },
        { size: '30', color: 'Olive', colorHex: '#556b2f', stock: 18 },
        { size: '32', color: 'Olive', colorHex: '#556b2f', stock: 15 },
        { size: '34', color: 'Olive', colorHex: '#556b2f', stock: 10 },
        { size: '28', color: 'Hitam', colorHex: '#1a1a1a', stock: 12 },
        { size: '30', color: 'Hitam', colorHex: '#1a1a1a', stock: 18 },
        { size: '32', color: 'Hitam', colorHex: '#1a1a1a', stock: 15 },
        { size: '34', color: 'Hitam', colorHex: '#1a1a1a', stock: 10 },
      ],
    },
    {
      name: 'Jaket Bomber Satin',
      slug: 'jaket-bomber-satin',
      description: 'Jaket bomber dengan bahan satin yang mengkilap. Lining dalam berbahan mesh untuk kenyamanan.',
      price: 459000,
      discount: 15,
      baseImage: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&h=600&fit=crop',
      categorySlug: 'jaket',
      isFeatured: true,
      variants: [
        { size: 'M', color: 'Hitam', colorHex: '#1a1a1a', stock: 10 },
        { size: 'L', color: 'Hitam', colorHex: '#1a1a1a', stock: 15 },
        { size: 'XL', color: 'Hitam', colorHex: '#1a1a1a', stock: 10 },
        { size: 'M', color: 'Hijau', colorHex: '#2d5a27', stock: 8 },
        { size: 'L', color: 'Hijau', colorHex: '#2d5a27', stock: 12 },
        { size: 'XL', color: 'Hijau', colorHex: '#2d5a27', stock: 8 },
      ],
    },
    {
      name: 'Kaos Graphic Tee Series',
      slug: 'kaos-graphic-tee-series',
      description: 'Kaos dengan grafis unik di bagian depan. Sablon DTG kualitas tinggi yang tidak mudah luntur.',
      price: 179000,
      discount: 0,
      baseImage: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=500&h=600&fit=crop',
      categorySlug: 'kaos',
      isFeatured: false,
      variants: [
        { size: 'S', color: 'Abu', colorHex: '#808080', stock: 20 },
        { size: 'M', color: 'Abu', colorHex: '#808080', stock: 25 },
        { size: 'L', color: 'Abu', colorHex: '#808080', stock: 20 },
        { size: 'XL', color: 'Abu', colorHex: '#808080', stock: 10 },
      ],
    },
    {
      name: 'Dress Linen Casual',
      slug: 'dress-linen-casual',
      description: 'Dress casual dari bahan linen yang sejuk. Potongan A-line yang flattering untuk semua body type.',
      price: 349000,
      discount: 5,
      baseImage: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500&h=600&fit=crop',
      categorySlug: 'dress',
      isFeatured: true,
      variants: [
        { size: 'S', color: 'Cream', colorHex: '#f5f5dc', stock: 10 },
        { size: 'M', color: 'Cream', colorHex: '#f5f5dc', stock: 15 },
        { size: 'L', color: 'Cream', colorHex: '#f5f5dc', stock: 10 },
        { size: 'S', color: 'Sage', colorHex: '#b2ac88', stock: 8 },
        { size: 'M', color: 'Sage', colorHex: '#b2ac88', stock: 12 },
        { size: 'L', color: 'Sage', colorHex: '#b2ac88', stock: 8 },
      ],
    },
    {
      name: 'Kemeja Linen Oversized',
      slug: 'kemeja-linen-oversized',
      description: 'Kemeja linen dengan potongan oversized yang effortless. Cocok untuk tampilan kasual-chic.',
      price: 289000,
      discount: 0,
      baseImage: 'https://images.unsplash.com/photo-1598032895397-b9472444bf93?w=500&h=600&fit=crop',
      categorySlug: 'kemeja',
      isFeatured: false,
      variants: [
        { size: 'M', color: 'Putih', colorHex: '#ffffff', stock: 15 },
        { size: 'L', color: 'Putih', colorHex: '#ffffff', stock: 20 },
        { size: 'XL', color: 'Putih', colorHex: '#ffffff', stock: 10 },
        { size: 'M', color: 'Beige', colorHex: '#d4c5a9', stock: 15 },
        { size: 'L', color: 'Beige', colorHex: '#d4c5a9', stock: 20 },
        { size: 'XL', color: 'Beige', colorHex: '#d4c5a9', stock: 10 },
      ],
    },
    {
      name: 'Celana Chino Slim Fit',
      slug: 'celana-chino-slim-fit',
      description: 'Celana chino dengan potongan slim fit yang modern. Bahan cotton twill yang stretch dan nyaman.',
      price: 249000,
      discount: 0,
      baseImage: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=500&h=600&fit=crop',
      categorySlug: 'celana',
      isFeatured: false,
      variants: [
        { size: '28', color: 'Khaki', colorHex: '#c3b091', stock: 15 },
        { size: '30', color: 'Khaki', colorHex: '#c3b091', stock: 20 },
        { size: '32', color: 'Khaki', colorHex: '#c3b091', stock: 18 },
        { size: '34', color: 'Khaki', colorHex: '#c3b091', stock: 12 },
        { size: '28', color: 'Navy', colorHex: '#001f3f', stock: 15 },
        { size: '30', color: 'Navy', colorHex: '#001f3f', stock: 20 },
        { size: '32', color: 'Navy', colorHex: '#001f3f', stock: 18 },
        { size: '34', color: 'Navy', colorHex: '#001f3f', stock: 12 },
      ],
    },
    {
      name: 'Jaket Denim Classic',
      slug: 'jaket-denim-classic',
      description: 'Jaket denim klasik yang timeless. Bahan denim ringan dengan washed finish.',
      price: 399000,
      discount: 0,
      baseImage: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=500&h=600&fit=crop',
      categorySlug: 'jaket',
      isFeatured: false,
      variants: [
        { size: 'M', color: 'Blue', colorHex: '#4a90d9', stock: 12 },
        { size: 'L', color: 'Blue', colorHex: '#4a90d9', stock: 18 },
        { size: 'XL', color: 'Blue', colorHex: '#4a90d9', stock: 10 },
      ],
    },
    {
      name: 'Tas Canvas Tote',
      slug: 'tas-canvas-tote',
      description: 'Tas tote dari bahan canvas tebal. Cocok untuk belanja atau bawa barang sehari-hari.',
      price: 89000,
      discount: 0,
      baseImage: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=500&h=600&fit=crop',
      categorySlug: 'aksesoris',
      isFeatured: false,
      variants: [
        { size: 'One Size', color: 'Hitam', colorHex: '#1a1a1a', stock: 30 },
        { size: 'One Size', color: 'Putih', colorHex: '#ffffff', stock: 30 },
        { size: 'One Size', color: 'Olive', colorHex: '#556b2f', stock: 20 },
      ],
    },
  ]

  for (const product of products) {
    const { categorySlug, variants, ...productData } = product

    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {
        baseImage: productData.baseImage,
        price: productData.price,
        discount: productData.discount,
        description: productData.description,
        isFeatured: productData.isFeatured,
      },
      create: {
        ...productData,
        category: { connect: { id: categoryMap[categorySlug] } },
        variants: {
          create: variants.map((v) => ({
            ...v,
            sku: `${product.slug}-${v.size}-${v.color}`.toUpperCase(),
          })),
        },
      },
    })
  }

  // Promotions: tanggal cantik (9.9, 10.10, 11.11, 12.12), custom & ultah
  const promotions = [
    {
      code: 'CANTIK99',
      name: 'Promo 9.9 Tanggal Cantik',
      description: 'Diskon 19% spesial 9.9, min. belanja 150rb, maks. diskon 50rb.',
      discountType: 'PERCENT',
      discountValue: 19,
      minPurchase: 150000,
      maxDiscount: 50000,
      startDate: new Date('2026-09-09T00:00:00+07:00'),
      endDate: new Date('2026-09-11T23:59:59+07:00'),
      isActive: true,
      usageLimit: 500,
    },
    {
      code: 'CANTIK1010',
      name: 'Promo 10.10 Tanggal Cantik',
      description: 'Diskon 20% spesial 10.10, min. belanja 150rb, maks. diskon 60rb.',
      discountType: 'PERCENT',
      discountValue: 20,
      minPurchase: 150000,
      maxDiscount: 60000,
      startDate: new Date('2026-10-10T00:00:00+07:00'),
      endDate: new Date('2026-10-12T23:59:59+07:00'),
      isActive: true,
      usageLimit: 500,
    },
    {
      code: 'CANTIK1111',
      name: 'Promo 11.11 Tanggal Cantik',
      description: 'Diskon 25% spesial 11.11, min. belanja 200rb, maks. diskon 75rb.',
      discountType: 'PERCENT',
      discountValue: 25,
      minPurchase: 200000,
      maxDiscount: 75000,
      startDate: new Date('2026-11-11T00:00:00+07:00'),
      endDate: new Date('2026-11-13T23:59:59+07:00'),
      isActive: true,
      usageLimit: 1000,
    },
    {
      code: 'CANTIK1212',
      name: 'Promo 12.12 Tanggal Cantik',
      description: 'Diskon 30% spesial 12.12, min. belanja 200rb, maks. diskon 100rb.',
      discountType: 'PERCENT',
      discountValue: 30,
      minPurchase: 200000,
      maxDiscount: 100000,
      startDate: new Date('2026-12-12T00:00:00+07:00'),
      endDate: new Date('2026-12-14T23:59:59+07:00'),
      isActive: true,
      usageLimit: 1000,
    },
    {
      code: 'HEMAT20K',
      name: 'Potongan Custom 20rb',
      description: 'Potongan Rp 20.000, min. belanja 250rb. Bisa dipakai kapan saja selama aktif.',
      discountType: 'FIXED',
      discountValue: 20000,
      minPurchase: 250000,
      maxDiscount: null,
      startDate: new Date('2026-01-01T00:00:00+07:00'),
      endDate: new Date('2026-12-31T23:59:59+07:00'),
      isActive: true,
      usageLimit: null,
    },
    {
      code: 'ULTAH25',
      name: 'Promo Ultah 25%',
      description: 'Diskon 25% spesial bulan lahir, min. belanja 100rb, maks. diskon 50rb. Lengkapi tanggal lahir di profil.',
      discountType: 'PERCENT',
      discountValue: 25,
      minPurchase: 100000,
      maxDiscount: 50000,
      startDate: new Date('2026-01-01T00:00:00+07:00'),
      endDate: new Date('2026-12-31T23:59:59+07:00'),
      isActive: true,
      usageLimit: null,
    },
  ]

  for (const promo of promotions) {
    await prisma.promotion.upsert({
      where: { code: promo.code },
      update: {
        name: promo.name,
        description: promo.description,
        discountType: promo.discountType as 'PERCENT' | 'FIXED',
        discountValue: promo.discountValue,
        minPurchase: promo.minPurchase,
        maxDiscount: promo.maxDiscount,
        startDate: promo.startDate,
        endDate: promo.endDate,
        isActive: promo.isActive,
        usageLimit: promo.usageLimit,
      },
      create: {
        ...promo,
        discountType: promo.discountType as 'PERCENT' | 'FIXED',
      },
    })
  }

  console.log('✅ Seed complete!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
