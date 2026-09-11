import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse, handleApiError } from '@/lib/errors'
import { hasPermission, PERMISSIONS } from '@/lib/permissions'
import { logActivity } from '@/lib/audit'
import { revalidatePath } from 'next/cache'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const [sections, coreValues] = await Promise.all([
      prisma.aboutSection.findMany({ orderBy: { order: 'asc' } }),
      prisma.coreValue.findMany({ orderBy: { order: 'asc' } }),
    ])
    return successResponse({ sections, coreValues })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return errorResponse(401)
    const role = (session.user as any)?.role
    if (!hasPermission(role, PERMISSIONS.MANAGE_WEBSITE)) return errorResponse(403)

    const body = await req.json()
    const { key, heading, subheading, content, image, isVisible } = body
    if (!key) return errorResponse(400, 'Section key is required')

    const updated = await prisma.aboutSection.upsert({
      where: { key },
      update: {
        heading,
        subheading,
        content,
        image,
        isVisible: isVisible !== undefined ? isVisible : true,
      },
      create: {
        key,
        heading,
        subheading,
        content,
        image,
        isVisible: isVisible !== undefined ? isVisible : true,
      },
    })

    await logActivity({
      userId: session.user.id,
      userName: session.user.name || 'Admin',
      action: 'UPDATE_ABOUT_SECTION',
      module: 'website',
      recordId: updated.id,
      details: `Updated about section: ${key}`,
    })

    revalidatePath('/')
    revalidatePath('/about')
    revalidatePath('/mission-vision')
    return successResponse(updated)
  } catch (error) {
    return handleApiError(error)
  }
}
