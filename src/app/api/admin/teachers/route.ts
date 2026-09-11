import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse, handleApiError } from '@/lib/errors'
import { hasPermission, PERMISSIONS } from '@/lib/permissions'
import { logActivity } from '@/lib/audit'

export const dynamic = 'force-dynamic'

function generateSlug(name: string): string {
  return name
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
    if (!hasPermission(userRole, PERMISSIONS.MANAGE_TEACHERS)) {
      return errorResponse(403, 'Permission denied: manage_teachers required')
    }

    const department = req.nextUrl.searchParams.get('department')
    const where: any = {}
    if (department && department !== 'all') {
      where.department = department
    }

    const items = await prisma.teacher.findMany({
      where,
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

    const userRole = (session.user as any)?.role
    if (!hasPermission(userRole, PERMISSIONS.MANAGE_TEACHERS)) {
      return errorResponse(403, 'Permission denied: manage_teachers required')
    }

    const body = await req.json()
    const {
      name,
      designation,
      qualification,
      department,
      bio,
      photo,
      experience,
      specialization,
      email,
      phone,
      facebookUrl,
      linkedinUrl,
      order,
      status,
      isFeatured,
    } = body

    if (!name?.trim() || !designation?.trim()) {
      return errorResponse(400, 'Teacher name and designation are required')
    }

    let slug = generateSlug(name)
    const existing = await prisma.teacher.findUnique({ where: { slug } })
    if (existing) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`
    }

    const teacher = await prisma.teacher.create({
      data: {
        name: name.trim(),
        slug,
        designation: designation.trim(),
        qualification: qualification || '',
        department: department || 'General',
        bio: bio || null,
        photo: photo || null,
        experience: experience || null,
        specialization: specialization || null,
        email: email || null,
        phone: phone || null,
        facebookUrl: facebookUrl || null,
        linkedinUrl: linkedinUrl || null,
        order: typeof order === 'number' ? order : 0,
        status: status || 'ACTIVE',
        isActive: status !== 'INACTIVE',
        isFeatured: Boolean(isFeatured),
      },
    })

    await logActivity({
      userId: session.user.id,
      userName: session.user.name || session.user.email || 'Admin',
      action: 'CREATE_TEACHER',
      module: 'teachers',
      recordId: teacher.id,
      details: `Created teacher profile: ${teacher.name} (${teacher.designation})`,
    })

    return successResponse(teacher, 201)
  } catch (error) {
    return handleApiError(error)
  }
}
