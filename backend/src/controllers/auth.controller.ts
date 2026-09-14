import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import { OAuth2Client } from 'google-auth-library'
import prisma from '../config/database.js'
import { generateToken } from '../utils/jwt.js'

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, name, phone, birthDate } = req.body

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, dan nama harus diisi' })
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return res.status(409).json({ error: 'Email sudah terdaftar' })
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        phone,
        birthDate: birthDate ? new Date(birthDate) : undefined,
        role: { connect: { name: 'CUSTOMER' } },
      },
      select: { id: true, email: true, name: true, role: true },
    })

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role.name,
    })

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    })

    res.json({ user, token })
  } catch (error) {
    console.error('Register error:', error)
    res.status(500).json({ error: 'Gagal mendaftar' })
  }
}

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email dan password harus diisi' })
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { role: true },
    })

    if (!user) {
      return res.status(401).json({ error: 'Email atau password salah' })
    }

    const validPassword = await bcrypt.compare(password, user.password)
    if (!validPassword) {
      return res.status(401).json({ error: 'Email atau password salah' })
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role.name,
    })

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        birthDate: user.birthDate,
        role: user.role.name,
        avatar: user.avatar,
      },
      token,
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ error: 'Gagal login' })
  }
}

export const googleLogin = async (req: Request, res: Response) => {
  try {
    const { credential } = req.body

    if (!credential) {
      return res.status(400).json({ error: 'Google credential harus diisi' })
    }

    // Verify the Google ID token
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    })

    const payload = ticket.getPayload()
    if (!payload || !payload.email) {
      return res.status(400).json({ error: 'Data Google tidak valid' })
    }

    const { email, name, picture } = payload

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { email },
      include: { role: true },
    })

    if (!user) {
      // Create new user with random password
      const randomPassword = await bcrypt.hash(Math.random().toString(36).slice(2), 12)
      user = await prisma.user.create({
        data: {
          email,
          password: randomPassword,
          name: name || email.split('@')[0],
          avatar: picture || null,
          role: { connect: { name: 'CUSTOMER' } },
        },
        include: { role: true },
      })
    } else if (picture && user.avatar !== picture) {
      // Update avatar if changed
      user = await prisma.user.update({
        where: { id: user.id },
        data: { avatar: picture },
        include: { role: true },
      })
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role.name,
    })

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        birthDate: user.birthDate,
        role: user.role.name,
        avatar: user.avatar,
      },
      token,
    })
  } catch (error) {
    console.error('Google login error:', error)
    res.status(500).json({ error: 'Gagal login dengan Google' })
  }
}

export const logout = (_req: Request, res: Response) => {
  res.clearCookie('token')
  res.json({ message: 'Berhasil logout' })
}

export const me = async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        birthDate: true,
        avatar: true,
        role: { select: { name: true } },
        addresses: true,
      },
    })

    if (!user) {
      return res.status(404).json({ error: 'User tidak ditemukan' })
    }

    res.json({ ...user, role: user.role.name })
  } catch (error) {
    console.error('Me error:', error)
    res.status(500).json({ error: 'Gagal mengambil data user' })
  }
}

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const { name, phone, birthDate } = req.body

    const user = await prisma.user.update({
      where: { id: req.user!.userId },
      data: {
        ...(name !== undefined && { name }),
        ...(phone !== undefined && { phone }),
        ...(birthDate !== undefined && { birthDate: birthDate ? new Date(birthDate) : null }),
      },
      select: { id: true, email: true, name: true, phone: true, birthDate: true, avatar: true },
    })

    res.json(user)
  } catch (error) {
    console.error('Update profile error:', error)
    res.status(500).json({ error: 'Gagal update profil' })
  }
}

export const addAddress = async (req: Request, res: Response) => {
  try {
    const { label, name, phone, address, city, province, zipCode, isDefault } = req.body

    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId: req.user!.userId, isDefault: true },
        data: { isDefault: false },
      })
    }

    const newAddress = await prisma.address.create({
      data: {
        userId: req.user!.userId,
        label,
        name,
        phone,
        address,
        city,
        province,
        zipCode,
        isDefault,
      },
    })

    res.json(newAddress)
  } catch (error) {
    console.error('Add address error:', error)
    res.status(500).json({ error: 'Gagal menambahkan alamat' })
  }
}
