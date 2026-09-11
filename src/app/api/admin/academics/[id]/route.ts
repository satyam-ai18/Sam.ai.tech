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

    const item = await prisma.academic.findUnique({
      where: { id: params.id },
    })

    if (!item) return errorResponse(404, 'Academic program not found')
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

    const item = await prisma.academic.findUnique({ where: { id: params.id } })
    if (!item) return errorResponse(404, 'Academic program not found')

    const body = await req.json()
    const {
      title,
      slug,
      description,
      fullDescription,
      image,
      subjects,
      highlights,
      features,
      ageGroup,
      eligibility,
      order,
      status,
      seoTitle,
      seoDescription,
    } = body

    const updateData: any = {}
    if (title !== undefined) updateData.title = title.trim()
    if (slug !== undefined) updateData.slug = slug.trim()
    if (description !== undefined) updateData.description = description
    if (fullDescription !== undefined) updateData.fullDescription = fullDescription
    if (image !== undefined) updateData.image = image
    if (subjects !== undefined) {
      updateData.subjects = Array.isArray(subjects) ? JSON.stringify(subjects) : subjects
    }
    if (highlights !== undefined) {
      updateData.highlights = Array.isArray(highlights) ? JSON.stringify(highlights) : highlights
    }
    if (features !== undefined) {
      updateData.features = Array.isArray(features) ? JSON.stringify(features) : features
    }
    if (ageGroup !== undefined) updateData.ageGroup = ageGroup
    if (eligibility !== undefined) updateData.eligibility = eligibility
    if (order !== undefined) updateData.order = order
    if (status !== undefined) {
      updateData.status = status
      updateData.isActive = status !== 'DRAFT'
    }
    if (seoTitle !== undefined) updateData.seoTitle = seoTitle
    if (seoDescription !== undefined) updateData.seoDescription = seoDescription

    const updated = await prisma.academic.update({
      where: { id: params.id },
      data: updateData,
    })

    await logActivity({
      userId: session.user.id,
      userName: session.user.name || session.user.email || 'Admin',
      action: 'UPDATE_ACADEMIC_PROGRAM',
      module: 'academics',
      recordId: item.id,
      details: `Updated academic program: ${updated.title}`,
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

    const item = await prisma.academic.findUnique({ where: { id: params.id } })
    if (!item) return errorResponse(404, 'Academic program not found')

    await prisma.academic.delete({ where: { id: params.id } })

    await logActivity({
      userId: session.user.id,
      userName: session.user.name || session.user.email || 'Admin',
      action: 'DELETE_ACADEMIC_PROGRAM',
      module: 'academics',
      recordId: params.id,
      details: `Deleted academic program: ${item.title}`,
    })

    return successResponse({ message: 'Academic program deleted successfully' })
  } catch (error) {
    return handleApiError(error)
  }
}
