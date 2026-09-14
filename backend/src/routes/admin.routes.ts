import { Router } from 'express'
import { getDashboardStats, getAllProducts, getAllOrders, updateOrderStatus, getAllUsers } from '../controllers/admin.controller.js'
import { getAllPromotions, createPromotion, updatePromotion, deletePromotion } from '../controllers/promotion.controller.js'
import { authMiddleware, adminMiddleware } from '../middleware/auth.js'

const router = Router()

router.use(authMiddleware, adminMiddleware)

router.get('/dashboard', getDashboardStats)
router.get('/products', getAllProducts)
router.get('/orders', getAllOrders)
router.put('/orders/:id/status', updateOrderStatus)
router.get('/users', getAllUsers)
router.get('/promotions', getAllPromotions)
router.post('/promotions', createPromotion)
router.put('/promotions/:id', updatePromotion)
router.delete('/promotions/:id', deletePromotion)

export default router
