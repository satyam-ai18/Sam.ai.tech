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
    const section = await prisma.aboutSection.findUnique({
      where: { key: 'principal' },
    })
    return successResponse(section)
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
    const { heading, subheading, content, image, designation, qualification, isVisible } = body

    const updated = await prisma.aboutSection.upsert({
      where: { key: 'principal' },
      update: {
        heading: heading || "Principal's Message",
        subheading: subheading || 'A Word from Our Principal',
        content: content || '',
        image,
        designation: designation || 'Principal',
        qualification: qualification || 'M.Ed, M.A. English',
        isVisible: isVisible !== undefined ? isVisible : true,
      },
      create: {
        key: 'principal',
        heading: heading || "Principal's Message",
        subheading: subheading || 'A Word from Our Principal',
        content: content || '',
        image,
        designation: designation || 'Principal',
        qualification: qualification || 'M.Ed, M.A. English',
        isVisible: isVisible !== undefined ? isVisible : true,
      },
    })

    await logActivity({
      userId: session.user.id,
      userName: session.user.name || 'Admin',
      action: 'UPDATE_PRINCIPAL_MESSAGE',
      module: 'website',
      recordId: updated.id,
      details: `Updated Principal's message and details [Visible: ${updated.isVisible}]`,
    })

    revalidatePath('/')
    return successResponse(updated)
  } catch (error) {
    return handleApiError(error)
  }
}
