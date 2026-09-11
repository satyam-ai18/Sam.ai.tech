import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { errorResponse } from '@/lib/errors'
import { hasPermission, PERMISSIONS } from '@/lib/permissions'

export const dynamic = 'force-dynamic'

function escapeCsvField(field: any): string {
  if (field === null || field === undefined) return '""'
  const str = String(field).replace(/"/g, '""')
  return `"${str}"`
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return errorResponse(401)

    const userRole = (session.user as any)?.role
    const type = req.nextUrl.searchParams.get('type') || 'admissions'
    const today = new Date().toISOString().split('T')[0]

    let csvContent = ''
    let filename = `export_${type}_${today}.csv`

    if (type === 'admissions') {
      if (!hasPermission(userRole, PERMISSIONS.MANAGE_ADMISSIONS)) {
        return errorResponse(403, 'Permission denied: manage_admissions required')
      }

      const records = await prisma.admission.findMany({
        orderBy: { createdAt: 'desc' },
      })

      const headers = [
        'Reference Number', 'Student Name', 'Gender', 'DOB', 'Class Applied',
        'Father Name', 'Mother Name', 'Phone', 'Email', 'Address', 'Status', 'Date Applied'
      ]

      const rows = records.map((r) => [
        r.referenceNumber,
        `${r.studentFirstName} ${r.studentLastName}`,
        r.studentGender,
        r.studentDob,
        r.classApplied,
        r.fatherName,
        r.motherName,
        r.phone,
        r.email || '',
        `${r.address}, ${r.city}, ${r.state} - ${r.pincode}`,
        r.status,
        new Date(r.createdAt).toLocaleDateString('en-IN'),
      ])

      csvContent = [
        headers.map(escapeCsvField).join(','),
        ...rows.map((row) => row.map(escapeCsvField).join(',')),
      ].join('\r\n')
    } else if (type === 'news') {
      if (!hasPermission(userRole, PERMISSIONS.MANAGE_NEWS)) {
        return errorResponse(403, 'Permission denied: manage_news required')
      }

      const records = await prisma.news.findMany({
        orderBy: { createdAt: 'desc' },
      })

      const headers = ['Title', 'Slug', 'Category', 'Author', 'Status', 'Published Date', 'Created Date']
      const rows = records.map((n) => [
        n.title,
        n.slug,
        n.category,
        n.author,
        n.status,
        n.publishedAt ? new Date(n.publishedAt).toLocaleDateString('en-IN') : 'Unpublished',
        new Date(n.createdAt).toLocaleDateString('en-IN'),
      ])

      csvContent = [
        headers.map(escapeCsvField).join(','),
        ...rows.map((row) => row.map(escapeCsvField).join(',')),
      ].join('\r\n')
    } else if (type === 'events') {
      if (!hasPermission(userRole, PERMISSIONS.MANAGE_EVENTS)) {
        return errorResponse(403, 'Permission denied: manage_events required')
      }

      const records = await prisma.event.findMany({
        orderBy: { startDate: 'desc' },
      })

      const headers = ['Title', 'Slug', 'Start Date', 'End Date', 'Location', 'Status', 'Registration Required']
      const rows = records.map((e) => [
        e.title,
        e.slug,
        new Date(e.startDate).toLocaleDateString('en-IN'),
        e.endDate ? new Date(e.endDate).toLocaleDateString('en-IN') : '',
        e.location || '',
        e.status,
        e.registrationUrl ? 'Yes' : 'No',
      ])

      csvContent = [
        headers.map(escapeCsvField).join(','),
        ...rows.map((row) => row.map(escapeCsvField).join(',')),
      ].join('\r\n')
    } else if (type === 'notices') {
      if (!hasPermission(userRole, PERMISSIONS.MANAGE_NOTICES)) {
        return errorResponse(403, 'Permission denied: manage_notices required')
      }

      const records = await prisma.notice.findMany({
        orderBy: { date: 'desc' },
      })

      const headers = ['Title', 'Category', 'Date', 'Expiry Date', 'Important', 'Published']
      const rows = records.map((n) => [
        n.title,
        n.category,
        new Date(n.date).toLocaleDateString('en-IN'),
        n.expiryDate ? new Date(n.expiryDate).toLocaleDateString('en-IN') : '',
        n.isImportant ? 'Yes' : 'No',
        n.isPublished ? 'Yes' : 'No',
      ])

      csvContent = [
        headers.map(escapeCsvField).join(','),
        ...rows.map((row) => row.map(escapeCsvField).join(',')),
      ].join('\r\n')
    } else {
      return errorResponse(400, 'Unsupported export dataset type')
    }

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    return errorResponse(500, 'Export generation failed')
  }
}
