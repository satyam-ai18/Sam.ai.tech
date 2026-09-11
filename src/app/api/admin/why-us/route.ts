import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse, handleApiError } from '@/lib/errors'
import { hasPermission, PERMISSIONS } from '@/lib/permissions'
import { logActivity } from '@/lib/audit'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const whyUsSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  icon: z.string().default('BookOpen'),
  order: z.number().default(0),
  isActive: z.boolean().default(true),
})

export async function GET() {
  try {
    const items = await prisma.coreValue.findMany({
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
    const role = (session.user as any)?.role
    if (!hasPermission(role, PERMISSIONS.MANAGE_WEBSITE)) return errorResponse(403)

    const body = await req.json()

    // Batch reorder
    if (body.reorder && Array.isArray(body.items)) {
      await prisma.$transaction(
        body.items.map((item: { id: string; order: number }) =>
          prisma.coreValue.update({
            where: { id: item.id },
            data: { order: item.order },
          })
        )
      )
      revalidatePath('/')
      return successResponse({ message: 'Core values reordered successfully' })
    }

    const validated = whyUsSchema.parse(body)
    const count = await prisma.coreValue.count()
    const item = await prisma.coreValue.create({
      data: {
        ...validated,
        order: validated.order || count + 1,
      },
    })

    await logActivity({
      userId: session.user.id,
      userName: session.user.name || 'Admin',
      action: 'CREATE_WHY_US_ITEM',
      module: 'website',
      recordId: item.id,
      details: `Created Why Choose Us item: "${item.title}"`,
    })

    revalidatePath('/')
    revalidatePath('/about')
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
    if (!hasPermission(role, PERMISSIONS.MANAGE_WEBSITE)) return errorResponse(403)

    const body = await req.json()
    const { id, ...data } = body
    if (!id) return errorResponse(400, 'ID is required')

    const updated = await prisma.coreValue.update({
      where: { id },
      data,
    })

    await logActivity({
      userId: session.user.id,
      userName: session.user.name || 'Admin',
      action: 'UPDATE_WHY_US_ITEM',
      module: 'website',
      recordId: id,
      details: `Updated Why Choose Us item: "${updated.title}"`,
    })

    revalidatePath('/')
    revalidatePath('/about')
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
    if (!hasPermission(role, PERMISSIONS.MANAGE_WEBSITE)) return errorResponse(403)

    const id = req.nextUrl.searchParams.get('id')
    if (!id) return errorResponse(400, 'ID is required')

    const item = await prisma.coreValue.findUnique({ where: { id } })
    if (!item) return errorResponse(404, 'Item not found')

    await prisma.coreValue.delete({ where: { id } })

    await logActivity({
      userId: session.user.id,
      userName: session.user.name || 'Admin',
      action: 'DELETE_WHY_US_ITEM',
      module: 'website',
      recordId: id,
      details: `Deleted Why Choose Us item: "${item.title}"`,
    })

    revalidatePath('/')
    revalidatePath('/about')
    return successResponse({ message: 'Item deleted successfully' })
  } catch (error) {
    return handleApiError(error)
  }
}
