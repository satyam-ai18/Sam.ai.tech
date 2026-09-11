import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse, handleApiError } from '@/lib/errors'
import { hasPermission, PERMISSIONS } from '@/lib/permissions'
import { logActivity } from '@/lib/audit'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const NoticeSchema = z.object({
  title: z.string().min(1).max(500),
  description: z.string().min(1),
  category: z.string().default('general'),
  attachment: z.string().optional(),
  date: z.string().optional(),
  expiryDate: z.string().optional(),
  isImportant: z.boolean().default(false),
  isPublished: z.boolean().default(false),
})

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return errorResponse(401)
    const userRole = (session.user as any)?.role
    if (!hasPermission(userRole, PERMISSIONS.MANAGE_NOTICES)) return errorResponse(403)

    const params = req.nextUrl.searchParams
    const search = params.get('search') || ''
    const published = params.get('published') || ''
    const category = params.get('category') || ''
    const page = Math.max(1, parseInt(params.get('page') || '1'))
    const pageSize = 20

    const where: any = {}
    if (search) where.OR = [{ title: { contains: search } }, { description: { contains: search } }]
    if (published === 'true') where.isPublished = true
    if (published === 'false') where.isPublished = false
    if (category) where.category = category

    const [total, notices] = await Promise.all([
      prisma.notice.count({ where }),
      prisma.notice.findMany({
        where,
        orderBy: [{ isImportant: 'desc' }, { date: 'desc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ])

    return successResponse({ notices, pagination: { total, page, pageSize, totalPages: Math.ceil(total / pageSize) } })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return errorResponse(401)
    const userRole = (session.user as any)?.role
    if (!hasPermission(userRole, PERMISSIONS.MANAGE_NOTICES)) return errorResponse(403)

    const body = await req.json()
    const parsed = NoticeSchema.safeParse(body)
    if (!parsed.success) return errorResponse(422, 'Validation failed', parsed.error.errors)

    const notice = await prisma.notice.create({
      data: {
        ...parsed.data,
        date: parsed.data.date ? new Date(parsed.data.date) : new Date(),
        expiryDate: parsed.data.expiryDate ? new Date(parsed.data.expiryDate) : null,
      },
    })

    await logActivity({
      userId: session.user.id,
      userName: session.user.name || session.user.email || 'Admin',
      action: 'CREATE_NOTICE', module: 'notices', recordId: notice.id,
      details: `Created notice: "${notice.title}" — Published: ${notice.isPublished}`,
    })

    return successResponse(notice, 201)
  } catch (error) {
    return handleApiError(error)
  }
}
