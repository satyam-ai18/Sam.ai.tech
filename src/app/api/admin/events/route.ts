import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse, handleApiError } from '@/lib/errors'
import { hasPermission, PERMISSIONS } from '@/lib/permissions'
import { logActivity } from '@/lib/audit'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const EventSchema = z.object({
  title: z.string().min(1).max(500),
  slug: z.string().min(1).max(300).regex(/^[a-z0-9-]+$/),
  description: z.string().min(1),
  image: z.string().optional(),
  startDate: z.string().min(1),
  endDate: z.string().optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  location: z.string().optional(),
  registrationUrl: z.string().url().optional().or(z.literal('')),
  category: z.string().default('general'),
  status: z.enum(['DRAFT', 'PUBLISHED']).default('DRAFT'),
  seoTitle: z.string().max(200).optional(),
  seoDescription: z.string().max(400).optional(),
})

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return errorResponse(401)
    const userRole = (session.user as any)?.role
    if (!hasPermission(userRole, PERMISSIONS.MANAGE_EVENTS)) return errorResponse(403)

    const params = req.nextUrl.searchParams
    const search = params.get('search') || ''
    const status = params.get('status') || ''
    const page = Math.max(1, parseInt(params.get('page') || '1'))
    const pageSize = 20

    const where: any = {}
    if (search) where.OR = [{ title: { contains: search } }, { location: { contains: search } }]
    if (status) where.status = status

    const [total, events] = await Promise.all([
      prisma.event.count({ where }),
      prisma.event.findMany({
        where,
        orderBy: { startDate: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ])

    return successResponse({ events, pagination: { total, page, pageSize, totalPages: Math.ceil(total / pageSize) } })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return errorResponse(401)
    const userRole = (session.user as any)?.role
    if (!hasPermission(userRole, PERMISSIONS.MANAGE_EVENTS)) return errorResponse(403)

    const body = await req.json()
    const parsed = EventSchema.safeParse(body)
    if (!parsed.success) return errorResponse(422, 'Validation failed', parsed.error.errors)

    const existing = await prisma.event.findUnique({ where: { slug: parsed.data.slug } })
    if (existing) return errorResponse(409, `Slug "${parsed.data.slug}" already taken`)

    const event = await prisma.event.create({
      data: {
        ...parsed.data,
        startDate: new Date(parsed.data.startDate),
        endDate: parsed.data.endDate ? new Date(parsed.data.endDate) : null,
        registrationUrl: parsed.data.registrationUrl || null,
      },
    })

    await logActivity({
      userId: session.user.id,
      userName: session.user.name || session.user.email || 'Admin',
      action: 'CREATE_EVENT',
      module: 'events',
      recordId: event.id,
      details: `Created event: "${event.title}" on ${event.startDate.toLocaleDateString()}`,
    })

    return successResponse(event, 201)
  } catch (error) {
    return handleApiError(error)
  }
}
