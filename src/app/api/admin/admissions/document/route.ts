import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { errorResponse } from '@/lib/errors'
import { hasPermission, PERMISSIONS } from '@/lib/permissions'
import path from 'path'
import fs from 'fs/promises'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return errorResponse(401)

    const userRole = (session.user as any)?.role
    if (!hasPermission(userRole, PERMISSIONS.MANAGE_ADMISSIONS)) {
      return errorResponse(403, 'Permission denied: manage_admissions required')
    }

    const file = req.nextUrl.searchParams.get('file')
    if (!file) {
      return errorResponse(400, 'File parameter is required')
    }

    // Security check against directory traversal
    const safeBaseName = path.basename(file)
    if (file.includes('..') || safeBaseName !== file) {
      return errorResponse(400, 'Invalid file path request')
    }

    const admissionsDir = path.join(process.cwd(), 'public', 'uploads', 'admissions')
    const filePath = path.join(admissionsDir, safeBaseName)

    try {
      const buffer = await fs.readFile(filePath)
      const ext = path.extname(safeBaseName).toLowerCase()

      let contentType = 'application/octet-stream'
      if (ext === '.pdf') contentType = 'application/pdf'
      else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg'
      else if (ext === '.png') contentType = 'image/png'
      else if (ext === '.webp') contentType = 'image/webp'

      return new NextResponse(buffer, {
        headers: {
          'Content-Type': contentType,
          'Content-Disposition': `inline; filename="${safeBaseName}"`,
          'Cache-Control': 'private, max-age=3600',
        },
      })
    } catch {
      return errorResponse(404, 'Requested document not found on server')
    }
  } catch (error) {
    return errorResponse(500, 'Internal error loading document')
  }
}
