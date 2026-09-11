import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse, handleApiError } from '@/lib/errors'
import { hasPermission, PERMISSIONS, ROLES } from '@/lib/permissions'
import { logActivity } from '@/lib/audit'
import bcrypt from 'bcryptjs'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return errorResponse(401)

    const userRole = (session.user as any)?.role
    if (!hasPermission(userRole, PERMISSIONS.MANAGE_USERS)) {
      return errorResponse(403, 'Permission denied: manage_users required')
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return successResponse(users)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return errorResponse(401)

    const userRole = (session.user as any)?.role
    if (!hasPermission(userRole, PERMISSIONS.MANAGE_USERS)) {
      return errorResponse(403, 'Permission denied: manage_users required')
    }

    const body = await req.json()
    const { name, email, password, role } = body

    if (!name?.trim()) return errorResponse(400, 'Name is required')
    if (!email?.trim()) return errorResponse(400, 'Email is required')
    if (!password || password.length < 8) {
      return errorResponse(400, 'Password must be at least 8 characters')
    }

    const normalizedEmail = email.trim().toLowerCase()
    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } })
    if (existing) {
      return errorResponse(409, 'A user with this email already exists')
    }

    const validRoles = Object.values(ROLES)
    const assignedRole = validRoles.includes(role) ? role : ROLES.EDITOR

    // Privilege escalation check: Non-SUPER_ADMIN cannot create a SUPER_ADMIN
    if (assignedRole === ROLES.SUPER_ADMIN && userRole !== ROLES.SUPER_ADMIN) {
      return errorResponse(403, 'Only Super Admins can create another Super Admin')
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        role: assignedRole,
        status: 'ACTIVE',
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        isActive: true,
        createdAt: true,
      },
    })

    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || undefined
    await logActivity({
      userId: session.user.id,
      userName: session.user.name || session.user.email || 'Admin',
      action: 'CREATE_USER',
      module: 'users',
      recordId: newUser.id,
      details: `Created admin user ${newUser.name} (${newUser.email}) with role ${newUser.role}`,
      ipAddress: ip,
    })

    return successResponse(newUser, 201)
  } catch (error) {
    return handleApiError(error)
  }
}
