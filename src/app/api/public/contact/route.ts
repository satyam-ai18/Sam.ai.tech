import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse, handleApiError } from '@/lib/errors'
import { checkRateLimit } from '@/lib/rate-limit'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Please enter a valid phone number').max(15).optional().or(z.literal('')),
  subject: z.string().min(3, 'Subject must be at least 3 characters').max(150),
  message: z.string().min(10, 'Message must be at least 10 characters').max(2000),
})

export async function POST(req: NextRequest) {
  try {
    // 1. Rate limiting (max 5 inquiries per 10 minutes per IP)
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1'
    const { isRateLimited } = checkRateLimit(`contact:${ip}`, { limit: 5, windowMs: 10 * 60 * 1000 })
    if (isRateLimited) {
      return errorResponse(429, 'Too many messages sent. Please wait a few minutes before submitting again.')
    }

    const body = await req.json()
    const validated = contactSchema.parse(body)

    // 2. Save inquiry to database
    await prisma.complaint.create({
      data: {
        name: validated.name.trim(),
        email: validated.email.trim().toLowerCase(),
        phone: validated.phone?.trim() || null,
        category: 'inquiry',
        subject: validated.subject.trim(),
        message: validated.message.trim(),
        status: 'PENDING',
      },
    })

    return successResponse({
      message: 'Thank you for reaching out! Your inquiry has been received and our administration office will contact you shortly.',
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse(422, error.errors[0]?.message || 'Validation error')
    }
    return handleApiError(error)
  }
}
