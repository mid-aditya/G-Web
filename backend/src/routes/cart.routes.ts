import { Router } from 'express'
import { getCart, addToCart, updateCartItem, removeFromCart, clearCart } from '../controllers/cart.controller.js'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()

router.use(authMiddleware)

router.get('/', getCart)
router.post('/', addToCart)
router.put('/:id', updateCartItem)
router.delete('/:id', removeFromCart)
router.delete('/', clearCart)

export default router
