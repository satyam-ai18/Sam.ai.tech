import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse, handleApiError } from '@/lib/errors'
import { hasPermission, PERMISSIONS } from '@/lib/permissions'
import { logActivity } from '@/lib/audit'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session?.user) return errorResponse(401)
    const userRole = (session.user as any)?.role
    if (!hasPermission(userRole, PERMISSIONS.MANAGE_NOTICES)) return errorResponse(403)
    const notice = await prisma.notice.findUnique({ where: { id: params.id } })
    if (!notice) return errorResponse(404)
    return successResponse(notice)
  } catch (error) { return handleApiError(error) }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session?.user) return errorResponse(401)
    const userRole = (session.user as any)?.role
    if (!hasPermission(userRole, PERMISSIONS.MANAGE_NOTICES)) return errorResponse(403)

    const existing = await prisma.notice.findUnique({ where: { id: params.id } })
    if (!existing) return errorResponse(404)

    const body = await req.json()
    const updateData: any = { ...body }
    if (body.date) updateData.date = new Date(body.date)
    if (body.expiryDate) updateData.expiryDate = new Date(body.expiryDate)
    else if (body.expiryDate === '') updateData.expiryDate = null

    const updated = await prisma.notice.update({ where: { id: params.id }, data: updateData })

    await logActivity({
      userId: session.user.id,
      userName: session.user.name || session.user.email || 'Admin',
      action: 'UPDATE_NOTICE', module: 'notices', recordId: params.id,
      details: `Updated notice: "${updated.title}" — Published: ${updated.isPublished}`,
    })

    return successResponse(updated)
  } catch (error) { return handleApiError(error) }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session?.user) return errorResponse(401)
    const userRole = (session.user as any)?.role
    if (!hasPermission(userRole, PERMISSIONS.MANAGE_NOTICES)) return errorResponse(403)

    const existing = await prisma.notice.findUnique({ where: { id: params.id } })
    if (!existing) return errorResponse(404)

    await prisma.notice.delete({ where: { id: params.id } })

    await logActivity({
      userId: session.user.id,
      userName: session.user.name || session.user.email || 'Admin',
      action: 'DELETE_NOTICE', module: 'notices', recordId: params.id,
      details: `Deleted notice: "${existing.title}"`,
    })

    return successResponse({ message: 'Notice deleted' })
  } catch (error) { return handleApiError(error) }
}
