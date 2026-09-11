import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse, handleApiError } from '@/lib/errors'
import { hasPermission, PERMISSIONS } from '@/lib/permissions'
import { logActivity } from '@/lib/audit'

export const dynamic = 'force-dynamic'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) return errorResponse(401)

    const userRole = (session.user as any)?.role
    if (!hasPermission(userRole, PERMISSIONS.MANAGE_GALLERY)) {
      return errorResponse(403, 'Permission denied: manage_gallery required')
    }

    const album = await prisma.galleryAlbum.findUnique({
      where: { id: params.id },
      include: {
        media: {
          orderBy: { order: 'asc' },
        },
      },
    })

    if (!album) {
      return errorResponse(404, 'Album not found')
    }

    return successResponse(album)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) return errorResponse(401)

    const userRole = (session.user as any)?.role
    if (!hasPermission(userRole, PERMISSIONS.MANAGE_GALLERY)) {
      return errorResponse(403, 'Permission denied: manage_gallery required')
    }

    const album = await prisma.galleryAlbum.findUnique({
      where: { id: params.id },
      include: { media: true },
    })

    if (!album) {
      return errorResponse(404, 'Album not found')
    }

    const body = await req.json()
    const {
      title,
      slug,
      description,
      coverImage,
      category,
      eventDate,
      order,
      status,
      seoTitle,
      seoDescription,
      mediaToAdd, // array of { url, caption, altText }
      mediaToDelete, // array of media item IDs
      mediaOrder, // array of media item IDs in desired order
    } = body

    const updateData: any = {}
    if (title !== undefined) updateData.title = title.trim()
    if (slug !== undefined) updateData.slug = slug.trim()
    if (description !== undefined) updateData.description = description
    if (coverImage !== undefined) updateData.coverImage = coverImage
    if (category !== undefined) updateData.category = category
    if (eventDate !== undefined) updateData.eventDate = eventDate ? new Date(eventDate) : null
    if (order !== undefined) updateData.order = order
    if (status !== undefined) {
      updateData.status = status
      updateData.isActive = status !== 'DRAFT'
    }
    if (seoTitle !== undefined) updateData.seoTitle = seoTitle
    if (seoDescription !== undefined) updateData.seoDescription = seoDescription

    // 1. Delete media items if requested
    if (Array.isArray(mediaToDelete) && mediaToDelete.length > 0) {
      await prisma.galleryMedia.deleteMany({
        where: {
          id: { in: mediaToDelete },
          albumId: album.id,
        },
      })
    }

    // 2. Add new media items if requested
    if (Array.isArray(mediaToAdd) && mediaToAdd.length > 0) {
      const currentCount = album.media.length
      const newItems = mediaToAdd.map((m: any, index: number) => ({
        albumId: album.id,
        url: m.url,
        caption: m.caption || null,
        altText: m.altText || null,
        isFeatured: m.isFeatured || false,
        order: currentCount + index,
      }))

      await prisma.galleryMedia.createMany({
        data: newItems,
      })
    }

    // 3. Reorder media items if requested
    if (Array.isArray(mediaOrder) && mediaOrder.length > 0) {
      for (let i = 0; i < mediaOrder.length; i++) {
        await prisma.galleryMedia.updateMany({
          where: { id: mediaOrder[i], albumId: album.id },
          data: { order: i },
        })
      }
    }

    // Update album
    const updatedAlbum = await prisma.galleryAlbum.update({
      where: { id: params.id },
      data: updateData,
      include: {
        media: { orderBy: { order: 'asc' } },
        _count: { select: { media: true } },
      },
    })

    await logActivity({
      userId: session.user.id,
      userName: session.user.name || session.user.email || 'Admin',
      action: 'UPDATE_GALLERY_ALBUM',
      module: 'gallery',
      recordId: album.id,
      details: `Updated gallery album: ${updatedAlbum.title}`,
    })

    return successResponse(updatedAlbum)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) return errorResponse(401)

    const userRole = (session.user as any)?.role
    if (!hasPermission(userRole, PERMISSIONS.MANAGE_GALLERY)) {
      return errorResponse(403, 'Permission denied: manage_gallery required')
    }

    const album = await prisma.galleryAlbum.findUnique({
      where: { id: params.id },
    })

    if (!album) {
      return errorResponse(404, 'Album not found')
    }

    await prisma.galleryAlbum.delete({
      where: { id: params.id },
    })

    await logActivity({
      userId: session.user.id,
      userName: session.user.name || session.user.email || 'Admin',
      action: 'DELETE_GALLERY_ALBUM',
      module: 'gallery',
      recordId: params.id,
      details: `Deleted gallery album: ${album.title}`,
    })

    return successResponse({ message: 'Album deleted successfully' })
  } catch (error) {
    return handleApiError(error)
  }
}
