import { Request, Response, NextFunction } from 'express'
import { verifyToken, type JwtPayload } from '../utils/jwt.js'

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload
    }
  }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const token =
    req.cookies?.token ||
    req.headers.authorization?.replace('Bearer ', '')

  if (!token) {
    return res.status(401).json({ error: 'Silakan login terlebih dahulu' })
  }

  try {
    const decoded = verifyToken(token)
    req.user = decoded
    next()
  } catch {
    return res.status(401).json({ error: 'Token tidak valid atau sudah expired' })
  }
}

export const optionalAuth = (req: Request, _res: Response, next: NextFunction) => {
  const token =
    req.cookies?.token ||
    req.headers.authorization?.replace('Bearer ', '')

  if (token) {
    try {
      req.user = verifyToken(token)
    } catch {
      // Token invalid, continue without user
    }
  }
  next()
}

export const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Akses ditolak. Hanya admin yang diizinkan.' })
  }
  next()
}
