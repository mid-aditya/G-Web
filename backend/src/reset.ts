import 'dotenv/config'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🧹 Reset database (order, cart, review, promo usage)...')

  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.cartItem.deleteMany()
  await prisma.review.deleteMany()
  await prisma.promotion.updateMany({ data: { usedCount: 0 } })

  console.log('✅ Reset complete! Jalankan `npm run db:seed` untuk isi ulang.')
}

main()
  .catch((e) => {
    console.error('❌ Reset failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
