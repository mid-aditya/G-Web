import { Router } from 'express'
import { register, login, logout, me, updateProfile, addAddress } from '../controllers/auth.controller.js'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()

router.post('/register', register)
router.post('/login', login)
router.post('/logout', logout)
router.get('/me', authMiddleware, me)
router.put('/profile', authMiddleware, updateProfile)
router.post('/addresses', authMiddleware, addAddress)

export default router
