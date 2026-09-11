import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse, handleApiError } from '@/lib/errors'
import { hasPermission, PERMISSIONS, ROLES } from '@/lib/permissions'
import { logActivity } from '@/lib/audit'
import bcrypt from 'bcryptjs'

export const dynamic = 'force-dynamic'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) return errorResponse(401)

    const userRole = (session.user as any)?.role
    if (!hasPermission(userRole, PERMISSIONS.MANAGE_USERS)) {
      return errorResponse(403, 'Permission denied: manage_users required')
    }

    const user = await prisma.user.findUnique({
      where: { id: params.id },
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
    })

    if (!user) return errorResponse(404, 'User not found')
    return successResponse(user)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) return errorResponse(401)

    const userRole = (session.user as any)?.role
    const currentUserId = (session.user as any)?.id
    if (!hasPermission(userRole, PERMISSIONS.MANAGE_USERS)) {
      return errorResponse(403, 'Permission denied: manage_users required')
    }

    const targetUser = await prisma.user.findUnique({ where: { id: params.id } })
    if (!targetUser) return errorResponse(404, 'User not found')

    const body = await req.json()
    const { name, email, role, status, password } = body

    const updateData: any = {}
    if (name !== undefined) updateData.name = name.trim()

    if (email !== undefined && email.trim().toLowerCase() !== targetUser.email) {
      const existing = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } })
      if (existing) return errorResponse(409, 'Email address is already in use')
      updateData.email = email.trim().toLowerCase()
    }

    // Role assignment logic & self-escalation protection
    if (role !== undefined) {
      const validRoles = Object.values(ROLES)
      if (!validRoles.includes(role)) return errorResponse(400, 'Invalid role')

      if (params.id === currentUserId && role !== targetUser.role) {
        return errorResponse(403, 'You cannot change your own role')
      }

      if (role === ROLES.SUPER_ADMIN && userRole !== ROLES.SUPER_ADMIN) {
        return errorResponse(403, 'Only Super Admins can promote to Super Admin')
      }
      updateData.role = role
    }

    // Status toggle & self-deactivation protection
    if (status !== undefined) {
      if (params.id === currentUserId && status !== 'ACTIVE') {
        return errorResponse(403, 'You cannot deactivate your own account')
      }
      updateData.status = status
      updateData.isActive = status === 'ACTIVE'
    }

    // Optional password reset
    if (password) {
      if (password.length < 8) {
        return errorResponse(400, 'Password must be at least 8 characters')
      }
      updateData.password = await bcrypt.hash(password, 12)
    }

    const updated = await prisma.user.update({
      where: { id: params.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        isActive: true,
        lastLogin: true,
        updatedAt: true,
      },
    })

    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || undefined
    await logActivity({
      userId: session.user.id,
      userName: session.user.name || session.user.email || 'Admin',
      action: 'UPDATE_USER',
      module: 'users',
      recordId: updated.id,
      details: `Updated user ${updated.name} (${updated.email})`,
      ipAddress: ip,
    })

    return successResponse(updated)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) return errorResponse(401)

    const userRole = (session.user as any)?.role
    const currentUserId = (session.user as any)?.id
    if (!hasPermission(userRole, PERMISSIONS.MANAGE_USERS)) {
      return errorResponse(403, 'Permission denied: manage_users required')
    }

    if (params.id === currentUserId) {
      return errorResponse(400, 'You cannot delete your own account')
    }

    const targetUser = await prisma.user.findUnique({ where: { id: params.id } })
    if (!targetUser) return errorResponse(404, 'User not found')

    await prisma.user.delete({ where: { id: params.id } })

    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || undefined
    await logActivity({
      userId: session.user.id,
      userName: session.user.name || session.user.email || 'Admin',
      action: 'DELETE_USER',
      module: 'users',
      recordId: params.id,
      details: `Deleted user ${targetUser.name} (${targetUser.email})`,
      ipAddress: ip,
    })

    return successResponse({ message: 'User deleted successfully' })
  } catch (error) {
    return handleApiError(error)
  }
}
