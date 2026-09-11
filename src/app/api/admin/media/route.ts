import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse, handleApiError } from '@/lib/errors'
import { hasPermission, PERMISSIONS } from '@/lib/permissions'
import { logActivity } from '@/lib/audit'
import path from 'path'
import fs from 'fs/promises'
import { v4 as uuidv4 } from 'uuid'

// Whitelist of allowed MIME types
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
  'application/pdf',
])

// Strict blacklist of dangerous extensions
const DANGEROUS_EXTENSIONS = new Set([
  '.exe', '.bat', '.cmd', '.sh', '.php', '.phtml', '.js', '.ts',
  '.py', '.pl', '.cgi', '.msi', '.vbs', '.scr', '.dll', '.com',
  '.jar', '.html', '.htm', '.xhtml',
])

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return errorResponse(401)
    }

    const search = req.nextUrl.searchParams.get('search') || ''
    const folder = req.nextUrl.searchParams.get('folder') || ''
    const type = req.nextUrl.searchParams.get('type') || ''
    const sort = req.nextUrl.searchParams.get('sort') || 'newest'
    const fromDate = req.nextUrl.searchParams.get('fromDate')
    const toDate = req.nextUrl.searchParams.get('toDate')

    const where: any = {}
    if (search) {
      where.OR = [
        { originalName: { contains: search } },
        { title: { contains: search } },
        { altText: { contains: search } },
        { caption: { contains: search } },
      ]
    }
    if (folder && folder !== 'all') {
      where.folder = folder
    }
    if (type && type !== 'all') {
      where.type = type
    }
    if (fromDate || toDate) {
      where.createdAt = {}
      if (fromDate) where.createdAt.gte = new Date(fromDate)
      if (toDate) where.createdAt.lte = new Date(toDate)
    }

    let orderBy: any = { createdAt: 'desc' }
    if (sort === 'oldest') orderBy = { createdAt: 'asc' }
    else if (sort === 'name_asc') orderBy = { originalName: 'asc' }
    else if (sort === 'name_desc') orderBy = { originalName: 'desc' }
    else if (sort === 'size_asc') orderBy = { size: 'asc' }
    else if (sort === 'size_desc') orderBy = { size: 'desc' }

    const items = await prisma.media.findMany({
      where,
      orderBy,
    })

    return successResponse(items)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return errorResponse(401)
    }

    const userRole = (session.user as any)?.role
    if (!hasPermission(userRole, PERMISSIONS.MANAGE_MEDIA)) {
      return errorResponse(403, 'Permission denied: manage_media required')
    }

    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const altText = (formData.get('altText') as string) || ''
    const folder = (formData.get('folder') as string) || 'general'

    if (!file) {
      return errorResponse(400, 'No file uploaded')
    }

    // 1. File size validation
    if (file.size > MAX_FILE_SIZE) {
      return errorResponse(422, 'File size exceeds maximum allowed limit (10MB)')
    }

    // 2. MIME type validation
    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return errorResponse(
        422,
        `Unsupported file type: ${file.type}. Allowed: JPEG, PNG, WebP, GIF, SVG, PDF`
      )
    }

    // 3. Extension validation (reject executable/dangerous files)
    const originalExt = path.extname(file.name).toLowerCase()
    if (DANGEROUS_EXTENSIONS.has(originalExt)) {
      return errorResponse(422, 'Uploaded file contains a forbidden dangerous extension')
    }

    // 4. Secure filename generation
    const secureFilename = `${uuidv4()}${originalExt}`
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
    await fs.mkdir(uploadsDir, { recursive: true })

    const filePath = path.join(uploadsDir, secureFilename)
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    await fs.writeFile(filePath, buffer)

    // 5. Store record in database
    const fileUrl = `/uploads/${secureFilename}`
    const mediaRecord = await prisma.media.create({
      data: {
        filename: secureFilename,
        originalName: file.name,
        url: fileUrl,
        type: file.type.startsWith('image/') ? 'image' : 'document',
        mimeType: file.type,
        size: file.size,
        folder,
        altText: altText || file.name.replace(originalExt, ''),
        uploadedBy: session.user.email || 'Admin',
      },
    })

    await logActivity({
      userId: session.user.id,
      userName: session.user.name || session.user.email || 'Admin',
      action: 'UPLOAD_MEDIA',
      module: 'media',
      recordId: mediaRecord.id,
      details: `Uploaded ${mediaRecord.type}: ${mediaRecord.originalName} (${Math.round(mediaRecord.size / 1024)} KB)`,
    })

    return successResponse(mediaRecord, 201)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return errorResponse(401)
    }

    const userRole = (session.user as any)?.role
    if (!hasPermission(userRole, PERMISSIONS.MANAGE_MEDIA)) {
      return errorResponse(403, 'Permission denied: manage_media required')
    }

    const id = req.nextUrl.searchParams.get('id')
    if (!id) {
      return errorResponse(400, 'Media ID is required')
    }

    const media = await prisma.media.findUnique({ where: { id } })
    if (!media) {
      return errorResponse(404, 'Media item not found')
    }

    // Delete file from disk if it exists
    try {
      const filePath = path.join(process.cwd(), 'public', 'uploads', media.filename)
      await fs.unlink(filePath)
    } catch {
      // File might not exist on disk, ignore error
    }

    // Delete DB record
    await prisma.media.delete({ where: { id } })

    await logActivity({
      userId: session.user.id,
      userName: session.user.name || session.user.email || 'Admin',
      action: 'DELETE_MEDIA',
      module: 'media',
      recordId: id,
      details: `Deleted media file: ${media.originalName}`,
    })

    return successResponse({ message: 'Media item deleted successfully' })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return errorResponse(401)
    }

    const userRole = (session.user as any)?.role
    if (!hasPermission(userRole, PERMISSIONS.MANAGE_MEDIA)) {
      return errorResponse(403, 'Permission denied: manage_media required')
    }

    const contentType = req.headers.get('content-type') || ''
    
    if (contentType.includes('multipart/form-data')) {
      // Form data with optional replace file
      const formData = await req.formData()
      const id = formData.get('id') as string
      if (!id) return errorResponse(400, 'Media ID is required')

      const media = await prisma.media.findUnique({ where: { id } })
      if (!media) return errorResponse(404, 'Media item not found')

      const title = formData.get('title') as string | null
      const altText = formData.get('altText') as string | null
      const caption = formData.get('caption') as string | null
      const description = formData.get('description') as string | null
      const folder = formData.get('folder') as string | null
      const file = formData.get('file') as File | null

      const updateData: any = {}
      if (title !== null) updateData.title = title
      if (altText !== null) updateData.altText = altText
      if (caption !== null) updateData.caption = caption
      if (description !== null) updateData.description = description
      if (folder !== null) updateData.folder = folder

      if (file && file.size > 0) {
        if (file.size > MAX_FILE_SIZE) {
          return errorResponse(422, 'File size exceeds maximum limit (10MB)')
        }
        if (!ALLOWED_MIME_TYPES.has(file.type)) {
          return errorResponse(422, `Unsupported file type: ${file.type}`)
        }
        const originalExt = path.extname(file.name).toLowerCase()
        if (DANGEROUS_EXTENSIONS.has(originalExt)) {
          return errorResponse(422, 'Uploaded file contains a forbidden extension')
        }

        // Remove old file
        try {
          const oldFilePath = path.join(process.cwd(), 'public', 'uploads', media.filename)
          await fs.unlink(oldFilePath)
        } catch {}

        // Write new file
        const secureFilename = `${uuidv4()}${originalExt}`
        const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
        await fs.mkdir(uploadsDir, { recursive: true })
        const newFilePath = path.join(uploadsDir, secureFilename)
        const buffer = Buffer.from(await file.arrayBuffer())
        await fs.writeFile(newFilePath, buffer)

        updateData.filename = secureFilename
        updateData.originalName = file.name
        updateData.url = `/uploads/${secureFilename}`
        updateData.type = file.type.startsWith('image/') ? 'image' : 'document'
        updateData.mimeType = file.type
        updateData.size = file.size
      }

      const updated = await prisma.media.update({
        where: { id },
        data: updateData,
      })

      await logActivity({
        userId: session.user.id,
        userName: session.user.name || session.user.email || 'Admin',
        action: 'UPDATE_MEDIA',
        module: 'media',
        recordId: id,
        details: `Updated metadata/replaced media: ${updated.originalName}`,
      })

      return successResponse(updated)
    } else {
      // JSON body for metadata update
      const body = await req.json()
      const { id, title, altText, caption, description, folder } = body
      if (!id) return errorResponse(400, 'Media ID is required')

      const media = await prisma.media.findUnique({ where: { id } })
      if (!media) return errorResponse(404, 'Media item not found')

      const updated = await prisma.media.update({
        where: { id },
        data: {
          title: title !== undefined ? title : media.title,
          altText: altText !== undefined ? altText : media.altText,
          caption: caption !== undefined ? caption : media.caption,
          description: description !== undefined ? description : media.description,
          folder: folder !== undefined ? folder : media.folder,
        },
      })

      await logActivity({
        userId: session.user.id,
        userName: session.user.name || session.user.email || 'Admin',
        action: 'UPDATE_MEDIA',
        module: 'media',
        recordId: id,
        details: `Updated metadata for media: ${updated.originalName}`,
      })

      return successResponse(updated)
    }
  } catch (error) {
    return handleApiError(error)
  }
}

