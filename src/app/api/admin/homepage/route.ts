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
    const sections = await prisma.homepageSection.findMany({
      orderBy: { order: 'asc' },
    })
    return successResponse(sections)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return errorResponse(401)
    const role = (session.user as any)?.role
    if (!hasPermission(role, PERMISSIONS.MANAGE_HOMEPAGE)) return errorResponse(403)

    const body = await req.json()

    // 1. Batch reorder
    if (body.reorder && Array.isArray(body.sections)) {
      await prisma.$transaction(
        body.sections.map((sec: { id: string; order: number }) =>
          prisma.homepageSection.update({
            where: { id: sec.id },
            data: { order: sec.order },
          })
        )
      )

      await logActivity({
        userId: session.user.id,
        userName: session.user.name || 'Admin',
        action: 'REORDER_HOMEPAGE_SECTIONS',
        module: 'homepage',
        details: 'Reordered homepage sections',
      })

      revalidatePath('/')
      return successResponse({ message: 'Homepage section order updated' })
    }

    // 2. Single section update (toggle visibility or update title/subtitle/CTAs)
    const { id, ...data } = body
    if (!id) return errorResponse(400, 'Section ID is required')

    const updated = await prisma.homepageSection.update({
      where: { id },
      data,
    })

    await logActivity({
      userId: session.user.id,
      userName: session.user.name || 'Admin',
      action: 'UPDATE_HOMEPAGE_SECTION',
      module: 'homepage',
      recordId: id,
      details: `Updated homepage section: ${updated.label} [Visible: ${updated.isVisible}]`,
    })

    revalidatePath('/')
    return successResponse(updated)
  } catch (error) {
    return handleApiError(error)
  }
}
