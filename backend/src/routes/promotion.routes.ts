import { Router } from 'express'
import { getActivePromotions, validatePromo } from '../controllers/promotion.controller.js'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()

router.get('/active', getActivePromotions)
router.post('/validate', authMiddleware, validatePromo)

export default router
