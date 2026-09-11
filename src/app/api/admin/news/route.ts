import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse, handleApiError } from '@/lib/errors'
import { hasPermission, PERMISSIONS } from '@/lib/permissions'
import { logActivity } from '@/lib/audit'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const NewsSchema = z.object({
  title: z.string().min(1).max(500),
  slug: z.string().min(1).max(300).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers, and hyphens only'),
  excerpt: z.string().max(1000).optional(),
  content: z.string().min(1),
  featuredImage: z.string().optional(),
  category: z.string().default('general'),
  author: z.string().default('Admin'),
  status: z.enum(['DRAFT', 'PUBLISHED']).default('DRAFT'),
  publishedAt: z.string().optional(),
  seoTitle: z.string().max(200).optional(),
  seoDescription: z.string().max(400).optional(),
  seoKeywords: z.string().max(500).optional(),
})

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return errorResponse(401)

    const userRole = (session.user as any)?.role
    if (!hasPermission(userRole, PERMISSIONS.MANAGE_NEWS)) return errorResponse(403)

    const params = req.nextUrl.searchParams
    const search = params.get('search') || ''
    const status = params.get('status') || ''
    const category = params.get('category') || ''
    const page = Math.max(1, parseInt(params.get('page') || '1'))
    const pageSize = 20

    const where: any = {}
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { author: { contains: search } },
      ]
    }
    if (status) where.status = status
    if (category) where.category = category

    const [total, news] = await Promise.all([
      prisma.news.count({ where }),
      prisma.news.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          featuredImage: true,
          category: true,
          author: true,
          status: true,
          publishedAt: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
    ])

    return successResponse({ news, pagination: { total, page, pageSize, totalPages: Math.ceil(total / pageSize) } })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return errorResponse(401)

    const userRole = (session.user as any)?.role
    if (!hasPermission(userRole, PERMISSIONS.MANAGE_NEWS)) return errorResponse(403)

    const body = await req.json()
    const parsed = NewsSchema.safeParse(body)
    if (!parsed.success) return errorResponse(422, 'Validation failed', parsed.error.errors)

    // Check slug uniqueness
    const existing = await prisma.news.findUnique({ where: { slug: parsed.data.slug } })
    if (existing) return errorResponse(409, `Slug "${parsed.data.slug}" is already taken. Please choose a different slug.`)

    const news = await prisma.news.create({
      data: {
        ...parsed.data,
        publishedAt: parsed.data.status === 'PUBLISHED'
          ? (parsed.data.publishedAt ? new Date(parsed.data.publishedAt) : new Date())
          : null,
      },
    })

    await logActivity({
      userId: session.user.id,
      userName: session.user.name || session.user.email || 'Admin',
      action: 'CREATE_NEWS',
      module: 'news',
      recordId: news.id,
      details: `Created news: "${news.title}" (${news.status})`,
    })

    return successResponse(news, 201)
  } catch (error) {
    return handleApiError(error)
  }
}
