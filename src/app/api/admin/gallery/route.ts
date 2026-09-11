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
    if (!hasPermission(userRole, PERMISSIONS.MANAGE_GALLERY)) {
      return errorResponse(403, 'Permission denied: manage_gallery required')
    }

    const albums = await prisma.galleryAlbum.findMany({
      include: {
        _count: { select: { media: true } },
      },
      orderBy: { order: 'asc' },
    })

    const data = albums.map((a) => ({
      ...a,
      mediaCount: a._count.media,
    }))

    return successResponse(data)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return errorResponse(401)

    const userRole = (session.user as any)?.role
    if (!hasPermission(userRole, PERMISSIONS.MANAGE_GALLERY)) {
      return errorResponse(403, 'Permission denied: manage_gallery required')
    }

    const body = await req.json()
    const { title, slug: customSlug, description, coverImage, category, eventDate, order, status, seoTitle, seoDescription } = body

    if (!title?.trim()) {
      return errorResponse(400, 'Album title is required')
    }

    let slug = customSlug?.trim() ? generateSlug(customSlug) : generateSlug(title)

    // Check slug uniqueness
    const existing = await prisma.galleryAlbum.findUnique({ where: { slug } })
    if (existing) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`
    }

    const album = await prisma.galleryAlbum.create({
      data: {
        title: title.trim(),
        slug,
        description: description || null,
        coverImage: coverImage || null,
        category: category || 'general',
        eventDate: eventDate ? new Date(eventDate) : null,
        order: typeof order === 'number' ? order : 0,
        status: status || 'PUBLISHED',
        isActive: status !== 'DRAFT',
        seoTitle: seoTitle || null,
        seoDescription: seoDescription || null,
      },
      include: {
        _count: { select: { media: true } },
      },
    })

    await logActivity({
      userId: session.user.id,
      userName: session.user.name || session.user.email || 'Admin',
      action: 'CREATE_GALLERY_ALBUM',
      module: 'gallery',
      recordId: album.id,
      details: `Created gallery album: ${album.title}`,
    })

    return successResponse(album, 201)
  } catch (error) {
    return handleApiError(error)
  }
}
