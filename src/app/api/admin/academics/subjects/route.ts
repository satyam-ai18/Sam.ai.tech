import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse, handleApiError } from '@/lib/errors'
import { hasPermission, PERMISSIONS } from '@/lib/permissions'
import { logActivity } from '@/lib/audit'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return errorResponse(401)

    const userRole = (session.user as any)?.role
    if (!hasPermission(userRole, PERMISSIONS.MANAGE_ACADEMICS)) {
      return errorResponse(403, 'Permission denied: manage_academics required')
    }

    const items = await prisma.subject.findMany({
      orderBy: { order: 'asc' },
    })

    return successResponse(items)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return errorResponse(401)

    const userRole = (session.user as any)?.role
    if (!hasPermission(userRole, PERMISSIONS.MANAGE_ACADEMICS)) {
      return errorResponse(403, 'Permission denied: manage_academics required')
    }

    const body = await req.json()
    const { name, code, description, classes, icon, order, isActive } = body

    if (!name?.trim()) {
      return errorResponse(400, 'Subject name is required')
    }

    const item = await prisma.subject.create({
      data: {
        name: name.trim(),
        code: code || null,
        description: description || null,
        classes: Array.isArray(classes) ? JSON.stringify(classes) : classes || '[]',
        icon: icon || null,
        order: typeof order === 'number' ? order : 0,
        isActive: isActive !== undefined ? isActive : true,
      },
    })

    await logActivity({
      userId: session.user.id,
      userName: session.user.name || session.user.email || 'Admin',
      action: 'CREATE_SUBJECT',
      module: 'academics',
      recordId: item.id,
      details: `Created subject: ${item.name}`,
    })

    return successResponse(item, 201)
  } catch (error) {
    return handleApiError(error)
  }
}
