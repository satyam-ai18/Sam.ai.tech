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
    if (!hasPermission(userRole, PERMISSIONS.MANAGE_EVENTS)) return errorResponse(403)
    const event = await prisma.event.findUnique({ where: { id: params.id } })
    if (!event) return errorResponse(404)
    return successResponse(event)
  } catch (error) { return handleApiError(error) }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session?.user) return errorResponse(401)
    const userRole = (session.user as any)?.role
    if (!hasPermission(userRole, PERMISSIONS.MANAGE_EVENTS)) return errorResponse(403)

    const body = await req.json()
    const existing = await prisma.event.findUnique({ where: { id: params.id } })
    if (!existing) return errorResponse(404)

    if (body.slug && body.slug !== existing.slug) {
      const taken = await prisma.event.findUnique({ where: { slug: body.slug } })
      if (taken) return errorResponse(409, `Slug "${body.slug}" already taken`)
    }

    const updateData: any = { ...body }
    if (body.startDate) updateData.startDate = new Date(body.startDate)
    if (body.endDate) updateData.endDate = new Date(body.endDate)
    else if (body.endDate === '') updateData.endDate = null
    if (!body.registrationUrl) updateData.registrationUrl = null

    const updated = await prisma.event.update({ where: { id: params.id }, data: updateData })

    await logActivity({
      userId: session.user.id,
      userName: session.user.name || session.user.email || 'Admin',
      action: 'UPDATE_EVENT', module: 'events', recordId: params.id,
      details: `Updated event: "${updated.title}"`,
    })

    return successResponse(updated)
  } catch (error) { return handleApiError(error) }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session?.user) return errorResponse(401)
    const userRole = (session.user as any)?.role
    if (!hasPermission(userRole, PERMISSIONS.MANAGE_EVENTS)) return errorResponse(403)

    const existing = await prisma.event.findUnique({ where: { id: params.id } })
    if (!existing) return errorResponse(404)

    await prisma.event.delete({ where: { id: params.id } })

    await logActivity({
      userId: session.user.id,
      userName: session.user.name || session.user.email || 'Admin',
      action: 'DELETE_EVENT', module: 'events', recordId: params.id,
      details: `Deleted event: "${existing.title}"`,
    })

    return successResponse({ message: 'Event deleted' })
  } catch (error) { return handleApiError(error) }
}
