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
    if (!hasPermission(userRole, PERMISSIONS.MANAGE_NEWS)) return errorResponse(403)

    const news = await prisma.news.findUnique({ where: { id: params.id } })
    if (!news) return errorResponse(404, 'News article not found')
    return successResponse(news)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session?.user) return errorResponse(401)
    const userRole = (session.user as any)?.role
    if (!hasPermission(userRole, PERMISSIONS.MANAGE_NEWS)) return errorResponse(403)

    const body = await req.json()
    const existing = await prisma.news.findUnique({ where: { id: params.id } })
    if (!existing) return errorResponse(404, 'News article not found')

    // Slug uniqueness check if changing slug
    if (body.slug && body.slug !== existing.slug) {
      const taken = await prisma.news.findUnique({ where: { slug: body.slug } })
      if (taken) return errorResponse(409, `Slug "${body.slug}" is already taken`)
    }

    const updateData: any = { ...body }
    // Auto-set publishedAt when publishing for first time
    if (body.status === 'PUBLISHED' && !existing.publishedAt) {
      updateData.publishedAt = body.publishedAt ? new Date(body.publishedAt) : new Date()
    } else if (body.publishedAt) {
      updateData.publishedAt = new Date(body.publishedAt)
    }

    const updated = await prisma.news.update({ where: { id: params.id }, data: updateData })

    await logActivity({
      userId: session.user.id,
      userName: session.user.name || session.user.email || 'Admin',
      action: 'UPDATE_NEWS',
      module: 'news',
      recordId: params.id,
      details: `Updated news: "${updated.title}" → ${updated.status}`,
    })

    return successResponse(updated)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session?.user) return errorResponse(401)
    const userRole = (session.user as any)?.role
    if (!hasPermission(userRole, PERMISSIONS.MANAGE_NEWS)) return errorResponse(403)

    const existing = await prisma.news.findUnique({ where: { id: params.id } })
    if (!existing) return errorResponse(404)

    await prisma.news.delete({ where: { id: params.id } })

    await logActivity({
      userId: session.user.id,
      userName: session.user.name || session.user.email || 'Admin',
      action: 'DELETE_NEWS',
      module: 'news',
      recordId: params.id,
      details: `Deleted news: "${existing.title}"`,
    })

    return successResponse({ message: 'News article deleted' })
  } catch (error) {
    return handleApiError(error)
  }
}
