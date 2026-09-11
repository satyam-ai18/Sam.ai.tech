import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse, handleApiError } from '@/lib/errors'
import { checkRateLimit } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    // Rate limit: 10 checks per 5 min
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown'
    const rateCheck = checkRateLimit(`status_check_${ip}`, { limit: 10, windowMs: 5 * 60 * 1000 })
    if (rateCheck.isRateLimited) {
      return errorResponse(429, 'Too many status check requests. Please try again later.')
    }

    const ref = req.nextUrl.searchParams.get('ref')?.trim().toUpperCase()
    const dob = req.nextUrl.searchParams.get('dob')?.trim() // Optional DOB verification

    if (!ref) {
      return errorResponse(400, 'Please provide an application reference number')
    }

    const admission = await prisma.admission.findUnique({
      where: { referenceNumber: ref },
      select: {
        referenceNumber: true,
        studentFirstName: true,
        studentLastName: true,
        classApplied: true,
        session: true,
        status: true,
        adminMessage: true,
        studentDob: true,
        createdAt: true,
        updatedAt: true,
        statusHistory: {
          select: {
            fromStatus: true,
            toStatus: true,
            changedBy: true,
            notes: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    })

    if (!admission) {
      return errorResponse(
        404,
        `No application found for reference "${ref}". Please verify the number from your confirmation receipt.`
      )
    }

    // Optional DOB verification — if provided, validate it matches
    if (dob) {
      const inputDate = new Date(dob).toISOString().split('T')[0]
      const recordDate = admission.studentDob.toISOString().split('T')[0]
      if (inputDate !== recordDate) {
        return errorResponse(400, 'The date of birth does not match our records. Please verify and try again.')
      }
    }

    return successResponse({
      referenceNumber: admission.referenceNumber,
      applicantName: `${admission.studentFirstName} ${admission.studentLastName}`,
      classApplied: admission.classApplied,
      session: admission.session,
      status: admission.status,
      adminMessage: admission.adminMessage || null,
      submissionDate: admission.createdAt,
      lastUpdated: admission.updatedAt,
      statusHistory: admission.statusHistory.map(h => ({
        fromStatus: h.fromStatus,
        toStatus: h.toStatus,
        notes: h.notes,
        date: h.createdAt,
      })),
    })
  } catch (error) {
    return handleApiError(error)
  }
}
