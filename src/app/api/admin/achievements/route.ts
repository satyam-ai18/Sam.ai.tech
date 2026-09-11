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
    if (!hasPermission(userRole, PERMISSIONS.MANAGE_ACHIEVEMENTS)) {
      return errorResponse(403, 'Permission denied: manage_achievements required')
    }

    const category = req.nextUrl.searchParams.get('category')
    const where: any = {}
    if (category && category !== 'all') {
      where.category = category
    }

    const items = await prisma.achievement.findMany({
      where,
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
    if (!hasPermission(userRole, PERMISSIONS.MANAGE_ACHIEVEMENTS)) {
      return errorResponse(403, 'Permission denied: manage_achievements required')
    }

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

    if (!title?.trim()) {
      return errorResponse(400, 'Achievement title is required')
    }

    const achievement = await prisma.achievement.create({
      data: {
        title: title.trim(),
        description: description || null,
        studentName: studentName || null,
        category: category || 'general',
        award: award || null,
        position: position || null,
        date: date ? new Date(date) : null,
        year: year || null,
        image: image || null,
        status: status || 'PUBLISHED',
        isVisible: isVisible !== undefined ? isVisible : (status !== 'DRAFT'),
        order: typeof order === 'number' ? order : 0,
      },
    })

    await logActivity({
      userId: session.user.id,
      userName: session.user.name || session.user.email || 'Admin',
      action: 'CREATE_ACHIEVEMENT',
      module: 'achievements',
      recordId: achievement.id,
      details: `Created achievement: ${achievement.title}`,
    })

    return successResponse(achievement, 201)
  } catch (error) {
    return handleApiError(error)
  }
}
