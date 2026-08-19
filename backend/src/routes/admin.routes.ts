import { Router } from 'express'
import { getDashboardStats, getAllProducts, getAllOrders, updateOrderStatus, getAllUsers } from '../controllers/admin.controller.js'
import { authMiddleware, adminMiddleware } from '../middleware/auth.js'

const router = Router()

router.use(authMiddleware, adminMiddleware)

router.get('/dashboard', getDashboardStats)
router.get('/products', getAllProducts)
router.get('/orders', getAllOrders)
router.put('/orders/:id/status', updateOrderStatus)
router.get('/users', getAllUsers)

export default router
