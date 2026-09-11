import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse, handleApiError } from '@/lib/errors'
import { hasPermission, PERMISSIONS } from '@/lib/permissions'
import { logActivity } from '@/lib/audit'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const pageSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug must only contain lowercase letters, numbers, and hyphens'),
  content: z.string().default(''),
  heroHeading: z.string().nullable().optional(),
  heroSubtitle: z.string().nullable().optional(),
  blocks: z.string().nullable().optional(),
  featuredImage: z.string().nullable().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED']).default('PUBLISHED'),
  seoTitle: z.string().nullable().optional(),
  seoDescription: z.string().nullable().optional(),
  ogImage: z.string().nullable().optional(),
  publishedAt: z.string().nullable().optional(),
})

export async function GET(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get('id')
    if (id) {
      const page = await prisma.page.findUnique({ where: { id } })
      if (!page) return errorResponse(404, 'Page not found')
      return successResponse(page)
    }

    const pages = await prisma.page.findMany({
      orderBy: { updatedAt: 'desc' },
    })
    return successResponse(pages)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return errorResponse(401)
    const role = (session.user as any)?.role
    if (!hasPermission(role, PERMISSIONS.MANAGE_PAGES)) return errorResponse(403)

    const body = await req.json()
    const validated = pageSchema.parse(body)

    // Check slug uniqueness
    const existing = await prisma.page.findUnique({ where: { slug: validated.slug } })
    if (existing) {
      return errorResponse(422, 'A page with this slug URL already exists. Please choose a different slug.')
    }

    const page = await prisma.page.create({
      data: {
        ...validated,
        publishedAt: validated.status === 'PUBLISHED'
          ? (validated.publishedAt ? new Date(validated.publishedAt) : new Date())
          : null,
        createdBy: session.user.email || session.user.name || 'Admin',
      },
    })

    await logActivity({
      userId: session.user.id,
      userName: session.user.name || 'Admin',
      action: 'CREATE_PAGE',
      module: 'pages',
      recordId: page.id,
      details: `Created CMS page: "${page.title}" (/${page.slug})`,
    })

    revalidatePath(`/${page.slug}`)
    return successResponse(page, 201)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return errorResponse(401)
    const role = (session.user as any)?.role
    if (!hasPermission(role, PERMISSIONS.MANAGE_PAGES)) return errorResponse(403)

    const body = await req.json()
    const { id, ...data } = body
    if (!id) return errorResponse(400, 'Page ID is required')

    // If slug changed, verify uniqueness
    if (data.slug) {
      const conflict = await prisma.page.findFirst({
        where: { slug: data.slug, NOT: { id } },
      })
      if (conflict) {
        return errorResponse(422, 'A page with this slug already exists')
      }
    }

    if (data.publishedAt && typeof data.publishedAt === 'string') {
      data.publishedAt = new Date(data.publishedAt)
    } else if (data.status === 'PUBLISHED' && !data.publishedAt) {
      data.publishedAt = new Date()
    } else if (data.status === 'DRAFT') {
      data.publishedAt = null
    }

    const page = await prisma.page.update({
      where: { id },
      data: {
        ...data,
        updatedBy: session.user.email || session.user.name || 'Admin',
      },
    })

    await logActivity({
      userId: session.user.id,
      userName: session.user.name || 'Admin',
      action: 'UPDATE_PAGE',
      module: 'pages',
      recordId: page.id,
      details: `Updated CMS page: "${page.title}" [${page.status}]`,
    })

    revalidatePath(`/${page.slug}`)
    revalidatePath('/admin/pages')
    return successResponse(page)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return errorResponse(401)
    const role = (session.user as any)?.role
    if (!hasPermission(role, PERMISSIONS.MANAGE_PAGES)) return errorResponse(403)

    const id = req.nextUrl.searchParams.get('id')
    if (!id) return errorResponse(400, 'ID is required')

    const page = await prisma.page.findUnique({ where: { id } })
    if (!page) return errorResponse(404, 'Page not found')

    await prisma.page.delete({ where: { id } })

    await logActivity({
      userId: session.user.id,
      userName: session.user.name || 'Admin',
      action: 'DELETE_PAGE',
      module: 'pages',
      recordId: id,
      details: `Deleted page: "${page.title}" (/${page.slug})`,
    })

    revalidatePath(`/${page.slug}`)
    return successResponse({ message: 'Page deleted successfully' })
  } catch (error) {
    return handleApiError(error)
  }
}
