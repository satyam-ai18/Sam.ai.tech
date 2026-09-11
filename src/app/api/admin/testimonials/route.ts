import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse, handleApiError } from '@/lib/errors'
import { hasPermission, PERMISSIONS } from '@/lib/permissions'
import { logActivity } from '@/lib/audit'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const testimonialSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  role: z.string().default('Parent'),
  content: z.string().min(1, 'Content is required'),
  rating: z.number().min(1).max(5).default(5),
  photo: z.string().nullable().optional(),
  isVisible: z.boolean().default(true),
  order: z.number().default(0),
})

export async function GET() {
  try {
    const items = await prisma.testimonial.findMany({
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
    if (!hasPermission(role, PERMISSIONS.MANAGE_TESTIMONIALS)) return errorResponse(403)

    const body = await req.json()

    // Batch reorder
    if (body.reorder && Array.isArray(body.items)) {
      await prisma.$transaction(
        body.items.map((item: { id: string; order: number }) =>
          prisma.testimonial.update({
            where: { id: item.id },
            data: { order: item.order },
          })
        )
      )
      revalidatePath('/')
      return successResponse({ message: 'Testimonials reordered successfully' })
    }

    const validated = testimonialSchema.parse(body)
    const count = await prisma.testimonial.count()
    const item = await prisma.testimonial.create({
      data: {
        ...validated,
        order: validated.order || count + 1,
      },
    })

    await logActivity({
      userId: session.user.id,
      userName: session.user.name || 'Admin',
      action: 'CREATE_TESTIMONIAL',
      module: 'testimonials',
      recordId: item.id,
      details: `Created testimonial by "${item.name}" (${item.role})`,
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
    if (!hasPermission(role, PERMISSIONS.MANAGE_TESTIMONIALS)) return errorResponse(403)

    const body = await req.json()
    const { id, ...data } = body
    if (!id) return errorResponse(400, 'ID is required')

    const updated = await prisma.testimonial.update({
      where: { id },
      data,
    })

    await logActivity({
      userId: session.user.id,
      userName: session.user.name || 'Admin',
      action: 'UPDATE_TESTIMONIAL',
      module: 'testimonials',
      recordId: id,
      details: `Updated testimonial: "${updated.name}" [Visible: ${updated.isVisible}]`,
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
    if (!hasPermission(role, PERMISSIONS.MANAGE_TESTIMONIALS)) return errorResponse(403)

    const id = req.nextUrl.searchParams.get('id')
    if (!id) return errorResponse(400, 'ID is required')

    const item = await prisma.testimonial.findUnique({ where: { id } })
    if (!item) return errorResponse(404, 'Item not found')

    await prisma.testimonial.delete({ where: { id } })

    await logActivity({
      userId: session.user.id,
      userName: session.user.name || 'Admin',
      action: 'DELETE_TESTIMONIAL',
      module: 'testimonials',
      recordId: id,
      details: `Deleted testimonial from "${item.name}"`,
    })

    revalidatePath('/')
    return successResponse({ message: 'Testimonial deleted successfully' })
  } catch (error) {
    return handleApiError(error)
  }
}
