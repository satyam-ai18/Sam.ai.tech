import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse, handleApiError } from '@/lib/errors'
import { hasPermission, PERMISSIONS } from '@/lib/permissions'
import { logActivity } from '@/lib/audit'

export const dynamic = 'force-dynamic'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) return errorResponse(401)

    const userRole = (session.user as any)?.role
    if (!hasPermission(userRole, PERMISSIONS.MANAGE_ACADEMICS)) {
      return errorResponse(403, 'Permission denied: manage_academics required')
    }

    const item = await prisma.subject.findUnique({
      where: { id: params.id },
    })

    if (!item) return errorResponse(404, 'Subject not found')
    return successResponse(item)
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
    if (!hasPermission(userRole, PERMISSIONS.MANAGE_ACADEMICS)) {
      return errorResponse(403, 'Permission denied: manage_academics required')
    }

    const item = await prisma.subject.findUnique({ where: { id: params.id } })
    if (!item) return errorResponse(404, 'Subject not found')

    const body = await req.json()
    const { name, code, description, classes, icon, order, isActive } = body

    const updateData: any = {}
    if (name !== undefined) updateData.name = name.trim()
    if (code !== undefined) updateData.code = code
    if (description !== undefined) updateData.description = description
    if (classes !== undefined) {
      updateData.classes = Array.isArray(classes) ? JSON.stringify(classes) : classes
    }
    if (icon !== undefined) updateData.icon = icon
    if (order !== undefined) updateData.order = order
    if (isActive !== undefined) updateData.isActive = isActive

    const updated = await prisma.subject.update({
      where: { id: params.id },
      data: updateData,
    })

    await logActivity({
      userId: session.user.id,
      userName: session.user.name || session.user.email || 'Admin',
      action: 'UPDATE_SUBJECT',
      module: 'academics',
      recordId: item.id,
      details: `Updated subject: ${updated.name}`,
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
    if (!hasPermission(userRole, PERMISSIONS.MANAGE_ACADEMICS)) {
      return errorResponse(403, 'Permission denied: manage_academics required')
    }

    const item = await prisma.subject.findUnique({ where: { id: params.id } })
    if (!item) return errorResponse(404, 'Subject not found')

    await prisma.subject.delete({ where: { id: params.id } })

    await logActivity({
      userId: session.user.id,
      userName: session.user.name || session.user.email || 'Admin',
      action: 'DELETE_SUBJECT',
      module: 'academics',
      recordId: params.id,
      details: `Deleted subject: ${item.name}`,
    })

    return successResponse({ message: 'Subject deleted successfully' })
  } catch (error) {
    return handleApiError(error)
  }
}
