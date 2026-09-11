import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse, handleApiError } from '@/lib/errors'
import { hasPermission, PERMISSIONS } from '@/lib/permissions'
import { logActivity } from '@/lib/audit'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const createNavSchema = z.object({
  label: z.string().min(1, 'Label is required'),
  url: z.string().min(1, 'URL is required'),
  target: z.enum(['_self', '_blank']).default('_self'),
  parentId: z.string().nullable().optional(),
  order: z.number().default(0),
  isActive: z.boolean().default(true),
})

export async function GET() {
  try {
    const items = await prisma.navigationItem.findMany({
      orderBy: { order: 'asc' },
      include: {
        children: {
          orderBy: { order: 'asc' },
        },
      },
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
    const role = (session.user as any)?.role
    if (!hasPermission(role, PERMISSIONS.MANAGE_NAVIGATION)) return errorResponse(403)

    const body = await req.json()

    // Handle batch reorder
    if (body.reorder && Array.isArray(body.items)) {
      await prisma.$transaction(
        body.items.map((item: { id: string; order: number }) =>
          prisma.navigationItem.update({
            where: { id: item.id },
            data: { order: item.order },
          })
        )
      )
      await logActivity({
        userId: session.user.id,
        userName: session.user.name || 'Admin',
        action: 'REORDER_NAVIGATION',
        module: 'navigation',
        details: `Reordered navigation items`,
      })
      revalidatePath('/')
      return successResponse({ message: 'Navigation order updated successfully' })
    }

    const validated = createNavSchema.parse(body)
    const count = await prisma.navigationItem.count()
    const item = await prisma.navigationItem.create({
      data: {
        ...validated,
        order: validated.order || count + 1,
      },
    })

    await logActivity({
      userId: session.user.id,
      userName: session.user.name || 'Admin',
      action: 'CREATE_NAV_ITEM',
      module: 'navigation',
      recordId: item.id,
      details: `Added menu item: ${item.label} (${item.url})`,
    })

    revalidatePath('/')
    return successResponse(item, 201)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return errorResponse(401)
    const role = (session.user as any)?.role
    if (!hasPermission(role, PERMISSIONS.MANAGE_NAVIGATION)) return errorResponse(403)

    const body = await req.json()
    const { id, ...data } = body
    if (!id) return errorResponse(400, 'Navigation Item ID is required')

    const updated = await prisma.navigationItem.update({
      where: { id },
      data,
    })

    await logActivity({
      userId: session.user.id,
      userName: session.user.name || 'Admin',
      action: 'UPDATE_NAV_ITEM',
      module: 'navigation',
      recordId: id,
      details: `Updated menu item: ${updated.label}`,
    })

    revalidatePath('/')
    return successResponse(updated)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return errorResponse(401)
    const role = (session.user as any)?.role
    if (!hasPermission(role, PERMISSIONS.MANAGE_NAVIGATION)) return errorResponse(403)

    const id = req.nextUrl.searchParams.get('id')
    if (!id) return errorResponse(400, 'ID is required')

    const existing = await prisma.navigationItem.findUnique({ where: { id } })
    if (!existing) return errorResponse(404, 'Item not found')

    // Delete item (and any children)
    await prisma.navigationItem.deleteMany({
      where: { OR: [{ id }, { parentId: id }] },
    })

    await logActivity({
      userId: session.user.id,
      userName: session.user.name || 'Admin',
      action: 'DELETE_NAV_ITEM',
      module: 'navigation',
      recordId: id,
      details: `Deleted menu item: ${existing.label}`,
    })

    revalidatePath('/')
    return successResponse({ message: 'Navigation item deleted successfully' })
  } catch (error) {
    return handleApiError(error)
  }
}
