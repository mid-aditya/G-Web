import { Router } from 'express'
import { createOrder, getOrders, getOrder, cancelOrder, handleMidtransCallback } from '../controllers/order.controller.js'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()

// Midtrans callback (webhook) - no auth needed
router.post('/webhook/midtrans', handleMidtransCallback)

// Protected routes
router.use(authMiddleware)
router.post('/', createOrder)
router.get('/', getOrders)
router.get('/:id', getOrder)
router.post('/:id/cancel', cancelOrder)

export default router
