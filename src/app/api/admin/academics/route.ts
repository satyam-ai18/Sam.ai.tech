import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse, handleApiError } from '@/lib/errors'
import { hasPermission, PERMISSIONS } from '@/lib/permissions'
import { logActivity } from '@/lib/audit'

export const dynamic = 'force-dynamic'

function generateSlug(text: string): string {
  return text
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
    if (!hasPermission(userRole, PERMISSIONS.MANAGE_ACADEMICS)) {
      return errorResponse(403, 'Permission denied: manage_academics required')
    }

    const items = await prisma.academic.findMany({
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
    if (!hasPermission(userRole, PERMISSIONS.MANAGE_ACADEMICS)) {
      return errorResponse(403, 'Permission denied: manage_academics required')
    }

    const body = await req.json()
    const {
      title,
      slug: customSlug,
      description,
      fullDescription,
      image,
      subjects,
      highlights,
      features,
      ageGroup,
      eligibility,
      order,
      status,
      seoTitle,
      seoDescription,
    } = body

    if (!title?.trim()) {
      return errorResponse(400, 'Program title is required')
    }

    let slug = customSlug?.trim() ? generateSlug(customSlug) : generateSlug(title)
    const existing = await prisma.academic.findUnique({ where: { slug } })
    if (existing) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`
    }

    const item = await prisma.academic.create({
      data: {
        title: title.trim(),
        slug,
        description: description || '',
        fullDescription: fullDescription || null,
        image: image || null,
        subjects: Array.isArray(subjects) ? JSON.stringify(subjects) : subjects || '[]',
        highlights: Array.isArray(highlights) ? JSON.stringify(highlights) : highlights || '[]',
        features: Array.isArray(features) ? JSON.stringify(features) : features || '[]',
        ageGroup: ageGroup || null,
        eligibility: eligibility || null,
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
      action: 'CREATE_ACADEMIC_PROGRAM',
      module: 'academics',
      recordId: item.id,
      details: `Created academic program: ${item.title}`,
    })

    return successResponse(item, 201)
  } catch (error) {
    return handleApiError(error)
  }
}
