import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse, handleApiError } from '@/lib/errors'
import { hasPermission, PERMISSIONS } from '@/lib/permissions'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return errorResponse(401)

    const userRole = (session.user as any)?.role
    if (!hasPermission(userRole, PERMISSIONS.MANAGE_ADMISSIONS)) {
      return errorResponse(403, 'Permission denied: manage_admissions required')
    }

    const params = req.nextUrl.searchParams
    const search = params.get('search') || ''
    const status = params.get('status') || ''
    const classFilter = params.get('class') || ''
    const session_filter = params.get('session') || ''
    const dateFrom = params.get('dateFrom') || ''
    const dateTo = params.get('dateTo') || ''
    const page = Math.max(1, parseInt(params.get('page') || '1'))
    const pageSize = Math.min(100, parseInt(params.get('pageSize') || '20'))
    const sortBy = params.get('sortBy') || 'createdAt'
    const sortOrder = params.get('sortOrder') === 'asc' ? 'asc' : 'desc'
    const exportCsv = params.get('export') === 'csv'

    // Build where clause
    const where: any = {}
    if (search) {
      where.OR = [
        { studentFirstName: { contains: search } },
        { studentLastName: { contains: search } },
        { referenceNumber: { contains: search.toUpperCase() } },
        { phone: { contains: search } },
      ]
    }
    if (status) where.status = status
    if (classFilter) where.classApplied = classFilter
    if (session_filter) where.session = session_filter
    if (dateFrom || dateTo) {
      where.createdAt = {}
      if (dateFrom) where.createdAt.gte = new Date(dateFrom)
      if (dateTo) where.createdAt.lte = new Date(dateTo + 'T23:59:59Z')
    }

    // Handle CSV export
    if (exportCsv) {
      const admissions = await prisma.admission.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        select: {
          referenceNumber: true,
          studentFirstName: true,
          studentLastName: true,
          studentGender: true,
          studentDob: true,
          classApplied: true,
          session: true,
          phone: true,
          email: true,
          fatherName: true,
          motherName: true,
          city: true,
          state: true,
          status: true,
          createdAt: true,
        },
      })

      const headers = [
        'Reference Number', 'First Name', 'Last Name', 'Gender', 'DOB',
        'Class Applied', 'Session', 'Phone', 'Email', 'Father Name', 'Mother Name',
        'City', 'State', 'Status', 'Submitted At'
      ]

      const rows = admissions.map(a => [
        a.referenceNumber,
        a.studentFirstName,
        a.studentLastName,
        a.studentGender,
        a.studentDob.toISOString().split('T')[0],
        a.classApplied,
        a.session || '',
        a.phone,
        a.email || '',
        a.fatherName,
        a.motherName,
        a.city,
        a.state,
        a.status,
        a.createdAt.toISOString(),
      ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))

      const csv = [headers.map(h => `"${h}"`).join(','), ...rows].join('\r\n')

      return new Response(csv, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="admissions-${Date.now()}.csv"`,
        },
      })
    }

    // Paginated list
    const [total, admissions] = await Promise.all([
      prisma.admission.count({ where }),
      prisma.admission.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          referenceNumber: true,
          studentFirstName: true,
          studentLastName: true,
          classApplied: true,
          session: true,
          status: true,
          phone: true,
          email: true,
          city: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
    ])

    // Stats
    const [submitted, underReview, verified, approved, rejected] = await Promise.all([
      prisma.admission.count({ where: { status: 'SUBMITTED' } }),
      prisma.admission.count({ where: { status: 'UNDER_REVIEW' } }),
      prisma.admission.count({ where: { status: 'VERIFIED' } }),
      prisma.admission.count({ where: { status: 'APPROVED' } }),
      prisma.admission.count({ where: { status: 'REJECTED' } }),
    ])

    return successResponse({
      admissions,
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
      stats: {
        total: submitted + underReview + verified + approved + rejected,
        submitted,
        underReview,
        verified,
        approved,
        rejected,
      },
    })
  } catch (error) {
    return handleApiError(error)
  }
}
