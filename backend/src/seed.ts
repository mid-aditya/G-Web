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
      baseImage: '/placeholder/kaos-oversize.jpg',
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
      baseImage: '/placeholder/kemeja-flannel.jpg',
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
      baseImage: '/placeholder/celana-cargo.jpg',
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
      baseImage: '/placeholder/jaket-bomber.jpg',
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
      baseImage: '/placeholder/kaos-graphic.jpg',
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
      baseImage: '/placeholder/dress-linen.jpg',
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
      baseImage: '/placeholder/kemeja-linen.jpg',
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
      baseImage: '/placeholder/celana-chino.jpg',
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
      baseImage: '/placeholder/jaket-denim.jpg',
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
      baseImage: '/placeholder/tas-tote.jpg',
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
      update: {},
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
