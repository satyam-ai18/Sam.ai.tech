import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse, handleApiError } from '@/lib/errors'
import { hasPermission, PERMISSIONS } from '@/lib/permissions'
import { logActivity } from '@/lib/audit'
import { notifyStatusChanged } from '@/lib/notifications'

export const dynamic = 'force-dynamic'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) return errorResponse(401)

    const userRole = (session.user as any)?.role
    if (!hasPermission(userRole, PERMISSIONS.MANAGE_ADMISSIONS)) {
      return errorResponse(403)
    }

    const admission = await prisma.admission.findUnique({
      where: { id: params.id },
      include: {
        documents: { orderBy: { createdAt: 'asc' } },
        statusHistory: { orderBy: { createdAt: 'asc' } },
      },
    })

    if (!admission) return errorResponse(404, 'Application not found')

    return successResponse(admission)
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
    if (!hasPermission(userRole, PERMISSIONS.MANAGE_ADMISSIONS)) {
      return errorResponse(403)
    }

    const body = await req.json()
    const { status, adminNotes, internalNotes, adminMessage, reviewedBy } = body

    const existing = await prisma.admission.findUnique({
      where: { id: params.id },
      select: { status: true, studentFirstName: true, studentLastName: true, email: true, referenceNumber: true },
    })
    if (!existing) return errorResponse(404, 'Application not found')

    const validStatuses = ['SUBMITTED', 'UNDER_REVIEW', 'VERIFIED', 'APPROVED', 'REJECTED']

    const updateData: any = {}
    if (status && validStatuses.includes(status)) updateData.status = status
    if (adminNotes !== undefined) updateData.adminNotes = adminNotes
    if (internalNotes !== undefined) updateData.internalNotes = internalNotes
    if (adminMessage !== undefined) updateData.adminMessage = adminMessage
    if (reviewedBy !== undefined) updateData.reviewedBy = reviewedBy

    const updated = await prisma.admission.update({
      where: { id: params.id },
      data: updateData,
    })

    // Record status history if status changed
    if (status && status !== existing.status) {
      await prisma.admissionStatusHistory.create({
        data: {
          admissionId: params.id,
          fromStatus: existing.status,
          toStatus: status,
          changedBy: session.user.name || session.user.email || 'Admin',
          notes: adminNotes || undefined,
        },
      })

      // Send notification (abstracted — won't fake-send if no provider)
      await notifyStatusChanged(
        existing.referenceNumber,
        `${existing.studentFirstName} ${existing.studentLastName}`,
        status,
        adminMessage,
        existing.email || undefined
      )
    }

    await logActivity({
      userId: session.user.id,
      userName: session.user.name || session.user.email || 'Admin',
      action: 'UPDATE_ADMISSION',
      module: 'admissions',
      recordId: params.id,
      details: `Updated application ${existing.referenceNumber}${status && status !== existing.status ? ` → status: ${status}` : ''}`,
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
    // Only SUPER_ADMIN can delete applications
    if (userRole?.toUpperCase() !== 'SUPER_ADMIN') {
      return errorResponse(403, 'Only Super Admin can delete admission applications')
    }

    const existing = await prisma.admission.findUnique({
      where: { id: params.id },
      select: { referenceNumber: true },
    })
    if (!existing) return errorResponse(404)

    await prisma.admission.delete({ where: { id: params.id } })

    await logActivity({
      userId: session.user.id,
      userName: session.user.name || session.user.email || 'Admin',
      action: 'DELETE_ADMISSION',
      module: 'admissions',
      recordId: params.id,
      details: `Deleted application ${existing.referenceNumber}`,
    })

    return successResponse({ message: 'Application deleted' })
  } catch (error) {
    return handleApiError(error)
  }
}
