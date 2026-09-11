import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse, handleApiError } from '@/lib/errors'
import { hasPermission, PERMISSIONS } from '@/lib/permissions'
import { logActivity } from '@/lib/audit'

export const dynamic = 'force-dynamic'

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return errorResponse(401)

    const userRole = (session.user as any)?.role
    if (!hasPermission(userRole, PERMISSIONS.MANAGE_FACILITIES)) {
      return errorResponse(403, 'Permission denied: manage_facilities required')
    }

    const items = await prisma.facility.findMany({
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
    if (!hasPermission(userRole, PERMISSIONS.MANAGE_FACILITIES)) {
      return errorResponse(403, 'Permission denied: manage_facilities required')
    }

    const body = await req.json()
    const {
      title,
      slug: customSlug,
      description,
      content,
      image,
      images,
      icon,
      features,
      order,
      status,
      seoTitle,
      seoDescription,
    } = body

    if (!title?.trim()) {
      return errorResponse(400, 'Facility title is required')
    }

    let slug = customSlug?.trim() ? generateSlug(customSlug) : generateSlug(title)
    const existing = await prisma.facility.findUnique({ where: { slug } })
    if (existing) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`
    }

    const facility = await prisma.facility.create({
      data: {
        title: title.trim(),
        slug,
        description: description || '',
        content: content || null,
        image: image || null,
        images: Array.isArray(images) ? JSON.stringify(images) : images || '[]',
        icon: icon || 'Building2',
        features: Array.isArray(features) ? JSON.stringify(features) : features || '[]',
        order: typeof order === 'number' ? order : 0,
        status: status || 'PUBLISHED',
        isActive: status !== 'DRAFT',
        seoTitle: seoTitle || null,
        seoDescription: seoDescription || null,
      },
    })

    await logActivity({
      userId: session.user.id,
      userName: session.user.name || session.user.email || 'Admin',
      action: 'CREATE_FACILITY',
      module: 'facilities',
      recordId: facility.id,
      details: `Created campus facility: ${facility.title}`,
    })

    return successResponse(facility, 201)
  } catch (error) {
    return handleApiError(error)
  }
}
