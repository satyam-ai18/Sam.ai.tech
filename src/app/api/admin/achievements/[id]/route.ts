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
    if (!hasPermission(userRole, PERMISSIONS.MANAGE_ACHIEVEMENTS)) {
      return errorResponse(403, 'Permission denied: manage_achievements required')
    }

    const item = await prisma.achievement.findUnique({
      where: { id: params.id },
    })

    if (!item) return errorResponse(404, 'Achievement not found')
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
    if (!hasPermission(userRole, PERMISSIONS.MANAGE_ACHIEVEMENTS)) {
      return errorResponse(403, 'Permission denied: manage_achievements required')
    }

    const item = await prisma.achievement.findUnique({ where: { id: params.id } })
    if (!item) return errorResponse(404, 'Achievement not found')

    const body = await req.json()
    const {
      title,
      description,
      studentName,
      category,
      award,
      position,
      date,
      year,
      image,
      status,
      isVisible,
      order,
    } = body

    const updateData: any = {}
    if (title !== undefined) updateData.title = title.trim()
    if (description !== undefined) updateData.description = description
    if (studentName !== undefined) updateData.studentName = studentName
    if (category !== undefined) updateData.category = category
    if (award !== undefined) updateData.award = award
    if (position !== undefined) updateData.position = position
    if (date !== undefined) updateData.date = date ? new Date(date) : null
    if (year !== undefined) updateData.year = year
    if (image !== undefined) updateData.image = image
    if (status !== undefined) {
      updateData.status = status
      updateData.isVisible = status !== 'DRAFT'
    }
    if (isVisible !== undefined) updateData.isVisible = isVisible
    if (order !== undefined) updateData.order = order

    const updated = await prisma.achievement.update({
      where: { id: params.id },
      data: updateData,
    })

    await logActivity({
      userId: session.user.id,
      userName: session.user.name || session.user.email || 'Admin',
      action: 'UPDATE_ACHIEVEMENT',
      module: 'achievements',
      recordId: item.id,
      details: `Updated achievement: ${updated.title}`,
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
    if (!hasPermission(userRole, PERMISSIONS.MANAGE_ACHIEVEMENTS)) {
      return errorResponse(403, 'Permission denied: manage_achievements required')
    }

    const item = await prisma.achievement.findUnique({ where: { id: params.id } })
    if (!item) return errorResponse(404, 'Achievement not found')

    await prisma.achievement.delete({ where: { id: params.id } })

    await logActivity({
      userId: session.user.id,
      userName: session.user.name || session.user.email || 'Admin',
      action: 'DELETE_ACHIEVEMENT',
      module: 'achievements',
      recordId: params.id,
      details: `Deleted achievement: ${item.title}`,
    })

    return successResponse({ message: 'Achievement deleted successfully' })
  } catch (error) {
    return handleApiError(error)
  }
}
