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
    if (!hasPermission(userRole, PERMISSIONS.MANAGE_FACILITIES)) {
      return errorResponse(403, 'Permission denied: manage_facilities required')
    }

    const item = await prisma.facility.findUnique({
      where: { id: params.id },
    })

    if (!item) return errorResponse(404, 'Facility not found')
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
    if (!hasPermission(userRole, PERMISSIONS.MANAGE_FACILITIES)) {
      return errorResponse(403, 'Permission denied: manage_facilities required')
    }

    const item = await prisma.facility.findUnique({ where: { id: params.id } })
    if (!item) return errorResponse(404, 'Facility not found')

    const body = await req.json()
    const {
      title,
      slug,
      description,
      content,
      image,
      images,
      icon,
      features,
      order,
      status,
      seoTitle,
      seoDescription,
    } = body

    const updateData: any = {}
    if (title !== undefined) updateData.title = title.trim()
    if (slug !== undefined) updateData.slug = slug.trim()
    if (description !== undefined) updateData.description = description
    if (content !== undefined) updateData.content = content
    if (image !== undefined) updateData.image = image
    if (images !== undefined) {
      updateData.images = Array.isArray(images) ? JSON.stringify(images) : images
    }
    if (icon !== undefined) updateData.icon = icon
    if (features !== undefined) {
      updateData.features = Array.isArray(features) ? JSON.stringify(features) : features
    }
    if (order !== undefined) updateData.order = order
    if (status !== undefined) {
      updateData.status = status
      updateData.isActive = status !== 'DRAFT'
    }
    if (seoTitle !== undefined) updateData.seoTitle = seoTitle
    if (seoDescription !== undefined) updateData.seoDescription = seoDescription

    const updated = await prisma.facility.update({
      where: { id: params.id },
      data: updateData,
    })

    await logActivity({
      userId: session.user.id,
      userName: session.user.name || session.user.email || 'Admin',
      action: 'UPDATE_FACILITY',
      module: 'facilities',
      recordId: item.id,
      details: `Updated facility: ${updated.title}`,
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
    if (!hasPermission(userRole, PERMISSIONS.MANAGE_FACILITIES)) {
      return errorResponse(403, 'Permission denied: manage_facilities required')
    }

    const item = await prisma.facility.findUnique({ where: { id: params.id } })
    if (!item) return errorResponse(404, 'Facility not found')

    await prisma.facility.delete({ where: { id: params.id } })

    await logActivity({
      userId: session.user.id,
      userName: session.user.name || session.user.email || 'Admin',
      action: 'DELETE_FACILITY',
      module: 'facilities',
      recordId: params.id,
      details: `Deleted facility: ${item.title}`,
    })

    return successResponse({ message: 'Facility deleted successfully' })
  } catch (error) {
    return handleApiError(error)
  }
}
