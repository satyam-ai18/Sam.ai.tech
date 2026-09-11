import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse, handleApiError } from '@/lib/errors'
import { ROLES, hasPermission, PERMISSIONS } from '@/lib/permissions'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return errorResponse(401)
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
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

    if (!user || !user.isActive) {
      return errorResponse(401, 'User account is deactivated or not found')
    }

    // Build permissions list for frontend
    const userRole = user.role
    const permissions = Object.values(PERMISSIONS).filter((p) =>
      hasPermission(userRole, p)
    )

    return successResponse({
      ...user,
      permissions,
      isSuperAdmin: user.role.toUpperCase() === ROLES.SUPER_ADMIN,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
