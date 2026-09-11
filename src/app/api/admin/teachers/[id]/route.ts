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
    if (!hasPermission(userRole, PERMISSIONS.MANAGE_TEACHERS)) {
      return errorResponse(403, 'Permission denied: manage_teachers required')
    }

    const item = await prisma.teacher.findUnique({
      where: { id: params.id },
    })

    if (!item) return errorResponse(404, 'Teacher not found')
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
    if (!hasPermission(userRole, PERMISSIONS.MANAGE_TEACHERS)) {
      return errorResponse(403, 'Permission denied: manage_teachers required')
    }

    const item = await prisma.teacher.findUnique({ where: { id: params.id } })
    if (!item) return errorResponse(404, 'Teacher not found')

    const body = await req.json()
    const {
      name,
      designation,
      qualification,
      department,
      bio,
      photo,
      experience,
      specialization,
      email,
      phone,
      facebookUrl,
      linkedinUrl,
      order,
      status,
      isFeatured,
    } = body

    const updateData: any = {}
    if (name !== undefined) updateData.name = name.trim()
    if (designation !== undefined) updateData.designation = designation.trim()
    if (qualification !== undefined) updateData.qualification = qualification
    if (department !== undefined) updateData.department = department
    if (bio !== undefined) updateData.bio = bio
    if (photo !== undefined) updateData.photo = photo
    if (experience !== undefined) updateData.experience = experience
    if (specialization !== undefined) updateData.specialization = specialization
    if (email !== undefined) updateData.email = email
    if (phone !== undefined) updateData.phone = phone
    if (facebookUrl !== undefined) updateData.facebookUrl = facebookUrl
    if (linkedinUrl !== undefined) updateData.linkedinUrl = linkedinUrl
    if (order !== undefined) updateData.order = order
    if (status !== undefined) {
      updateData.status = status
      updateData.isActive = status !== 'INACTIVE'
    }
    if (isFeatured !== undefined) updateData.isFeatured = Boolean(isFeatured)

    const updated = await prisma.teacher.update({
      where: { id: params.id },
      data: updateData,
    })

    await logActivity({
      userId: session.user.id,
      userName: session.user.name || session.user.email || 'Admin',
      action: 'UPDATE_TEACHER',
      module: 'teachers',
      recordId: item.id,
      details: `Updated teacher profile: ${updated.name}`,
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
    if (!hasPermission(userRole, PERMISSIONS.MANAGE_TEACHERS)) {
      return errorResponse(403, 'Permission denied: manage_teachers required')
    }

    const item = await prisma.teacher.findUnique({ where: { id: params.id } })
    if (!item) return errorResponse(404, 'Teacher not found')

    await prisma.teacher.delete({ where: { id: params.id } })

    await logActivity({
      userId: session.user.id,
      userName: session.user.name || session.user.email || 'Admin',
      action: 'DELETE_TEACHER',
      module: 'teachers',
      recordId: params.id,
      details: `Deleted teacher profile: ${item.name}`,
    })

    return successResponse({ message: 'Teacher deleted successfully' })
  } catch (error) {
    return handleApiError(error)
  }
}
