import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse, handleApiError } from '@/lib/errors'
import { getRecentAuditLogs } from '@/lib/audit'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return errorResponse(401)
    }

    const [
      totalAdmissions,
      pendingAdmissions,
      approvedAdmissions,
      publishedNews,
      upcomingEvents,
      activeNotices,
      galleryItems,
      totalComplaints,
      recentAdmissions,
      recentLogs,
    ] = await Promise.all([
      prisma.admission.count(),
      prisma.admission.count({ where: { status: { in: ['SUBMITTED', 'UNDER_REVIEW'] } } }),
      prisma.admission.count({ where: { status: 'APPROVED' } }),
      prisma.news.count({ where: { status: 'PUBLISHED' } }),
      prisma.event.count({ where: { startDate: { gte: new Date() }, status: 'PUBLISHED' } }),
      prisma.notice.count({ where: { isPublished: true } }),
      prisma.galleryMedia.count(),
      prisma.complaint.count(),
      prisma.admission.findMany({
        take: 6,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          referenceNumber: true,
          studentFirstName: true,
          studentLastName: true,
          classApplied: true,
          status: true,
          createdAt: true,
        },
      }),
      getRecentAuditLogs(8),
    ])

    return successResponse({
      stats: {
        totalAdmissions,
        pendingAdmissions,
        approvedAdmissions,
        publishedNews,
        upcomingEvents,
        activeNotices,
        galleryItems,
        totalComplaints,
      },
      recentAdmissions,
      recentLogs,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
