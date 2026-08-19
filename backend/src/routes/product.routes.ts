import { Router } from 'express'
import { getProducts, getProduct, getCategories, createProduct, updateProduct, deleteProduct } from '../controllers/product.controller.js'
import { authMiddleware, adminMiddleware } from '../middleware/auth.js'

const router = Router()

// Public
router.get('/', getProducts)
router.get('/categories', getCategories)
router.get('/:slug', getProduct)

// Admin only
router.post('/', authMiddleware, adminMiddleware, createProduct)
router.put('/:id', authMiddleware, adminMiddleware, updateProduct)
router.delete('/:id', authMiddleware, adminMiddleware, deleteProduct)

export default router
