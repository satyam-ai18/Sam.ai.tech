import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse, handleApiError } from '@/lib/errors'
import { checkRateLimit } from '@/lib/rate-limit'
import { notifyAdmissionSubmitted } from '@/lib/notifications'
import { logActivity } from '@/lib/audit'
import path from 'path'
import fs from 'fs/promises'
import { v4 as uuidv4 } from 'uuid'

export const dynamic = 'force-dynamic'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB per file

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg', 'image/png', 'image/webp',
  'application/pdf',
])

const DANGEROUS_EXTENSIONS = new Set([
  '.exe', '.bat', '.cmd', '.sh', '.php', '.js', '.ts', '.py',
  '.pl', '.cgi', '.msi', '.vbs', '.scr', '.dll', '.html', '.htm',
])

/**
 * Generate a unique admission reference number: MK-YYYY-XXXX
 * Retries with different random numbers if collision occurs.
 */
async function generateUniqueReference(session: string): Promise<string> {
  const year = new Date().getFullYear()
  for (let attempt = 0; attempt < 10; attempt++) {
    const num = Math.floor(1000 + Math.random() * 9000)
    const ref = `MK-${year}-${num}`
    const existing = await prisma.admission.findUnique({ where: { referenceNumber: ref } })
    if (!existing) return ref
  }
  // Fallback: use timestamp suffix for guaranteed uniqueness
  return `MK-${year}-${Date.now().toString().slice(-6)}`
}

export async function POST(req: NextRequest) {
  try {
    // Rate limiting: max 3 submissions per IP per hour
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown'
    const rateCheck = checkRateLimit(`admission_apply_${ip}`, { limit: 3, windowMs: 60 * 60 * 1000 })
    if (rateCheck.isRateLimited) {
      return errorResponse(429, 'Too many submissions. Please try again later.')
    }

    // Check if admissions are enabled
    const enabledSetting = await prisma.setting.findUnique({ where: { key: 'admission_enabled' } })
    if (enabledSetting?.value === 'false') {
      return errorResponse(400, 'Admission applications are currently closed. Please check back later.')
    }

    // Get current session from settings
    const sessionSetting = await prisma.setting.findUnique({ where: { key: 'admission_session' } })
    const admissionSession = sessionSetting?.value || new Date().getFullYear().toString()

    const formData = await req.formData()

    // ─── Required text fields ───────────────────────────────────────
    const studentFirstName = (formData.get('studentFirstName') as string)?.trim()
    const studentLastName = (formData.get('studentLastName') as string)?.trim()
    const studentGender = (formData.get('studentGender') as string)?.trim()
    const studentDob = (formData.get('studentDob') as string)?.trim()
    const classApplied = (formData.get('classApplied') as string)?.trim()
    const fatherName = (formData.get('fatherName') as string)?.trim()
    const motherName = (formData.get('motherName') as string)?.trim()
    const phone = (formData.get('phone') as string)?.trim()
    const address = (formData.get('address') as string)?.trim()
    const city = (formData.get('city') as string)?.trim()
    const state = (formData.get('state') as string)?.trim()
    const pincode = (formData.get('pincode') as string)?.trim()

    // ─── Optional text fields ─────────────────────────────────────
    const email = (formData.get('email') as string)?.trim() || undefined
    const alternatePhone = (formData.get('alternatePhone') as string)?.trim() || undefined
    const fatherOccupation = (formData.get('fatherOccupation') as string)?.trim() || undefined
    const fatherPhone = (formData.get('fatherPhone') as string)?.trim() || undefined
    const fatherEmail = (formData.get('fatherEmail') as string)?.trim() || undefined
    const motherOccupation = (formData.get('motherOccupation') as string)?.trim() || undefined
    const motherPhone = (formData.get('motherPhone') as string)?.trim() || undefined
    const previousSchool = (formData.get('previousSchool') as string)?.trim() || undefined
    const previousClass = (formData.get('previousClass') as string)?.trim() || undefined
    const previousBoard = (formData.get('previousBoard') as string)?.trim() || undefined
    const previousPercentage = (formData.get('previousPercentage') as string)?.trim() || undefined

    // ─── Server-side validation ───────────────────────────────────
    const errors: string[] = []
    if (!studentFirstName) errors.push('Student first name is required')
    if (!studentLastName) errors.push('Student last name is required')
    if (!studentGender) errors.push('Gender is required')
    if (!studentDob) errors.push('Date of birth is required')
    if (!classApplied) errors.push('Class applied for is required')
    if (!fatherName) errors.push("Father's name is required")
    if (!motherName) errors.push("Mother's name is required")
    if (!phone) errors.push('Primary phone number is required')
    else if (!/^\d{10}$/.test(phone.replace(/\s|-/g, ''))) errors.push('Phone must be a valid 10-digit number')
    if (!address) errors.push('Address is required')
    if (!city) errors.push('City is required')
    if (!state) errors.push('State is required')
    if (!pincode) errors.push('PIN code is required')
    else if (!/^\d{6}$/.test(pincode)) errors.push('PIN code must be 6 digits')
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('Invalid email format')
    if (studentDob && isNaN(Date.parse(studentDob))) errors.push('Invalid date of birth')

    if (errors.length > 0) {
      return errorResponse(422, 'Validation failed', errors)
    }

    // ─── File Uploads ─────────────────────────────────────────────
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'admissions')
    await fs.mkdir(uploadsDir, { recursive: true })

    const uploadedDocuments: Array<{ name: string; url: string; type: string; size: number }> = []

    // Student photo
    const studentPhoto = formData.get('studentPhoto') as File | null
    let studentPhotoUrl: string | undefined

    if (studentPhoto && studentPhoto.size > 0) {
      if (studentPhoto.size > MAX_FILE_SIZE) {
        return errorResponse(422, 'Student photo exceeds 5MB limit')
      }
      if (!ALLOWED_MIME_TYPES.has(studentPhoto.type)) {
        return errorResponse(422, 'Student photo must be JPEG, PNG, WebP or PDF')
      }
      const ext = path.extname(studentPhoto.name).toLowerCase()
      if (DANGEROUS_EXTENSIONS.has(ext)) {
        return errorResponse(422, 'Invalid file type for student photo')
      }
      const filename = `${uuidv4()}${ext}`
      const buffer = Buffer.from(await studentPhoto.arrayBuffer())
      await fs.writeFile(path.join(uploadsDir, filename), buffer)
      studentPhotoUrl = `/uploads/admissions/${filename}`
    }

    // Additional documents (document_0, document_1, ...)
    for (let i = 0; i < 10; i++) {
      const file = formData.get(`document_${i}`) as File | null
      const docName = formData.get(`docName_${i}`) as string | null
      if (!file || file.size === 0) continue

      if (file.size > MAX_FILE_SIZE) {
        return errorResponse(422, `Document "${docName || i}" exceeds 5MB limit`)
      }
      if (!ALLOWED_MIME_TYPES.has(file.type)) {
        return errorResponse(422, `Document "${docName || i}" must be JPEG, PNG, WebP or PDF`)
      }
      const ext = path.extname(file.name).toLowerCase()
      if (DANGEROUS_EXTENSIONS.has(ext)) {
        return errorResponse(422, `Document "${docName || i}" has a forbidden file extension`)
      }

      const filename = `${uuidv4()}${ext}`
      const buffer = Buffer.from(await file.arrayBuffer())
      await fs.writeFile(path.join(uploadsDir, filename), buffer)

      uploadedDocuments.push({
        name: docName || file.name,
        url: `/uploads/admissions/${filename}`,
        type: file.type.startsWith('image/') ? 'image' : 'document',
        size: file.size,
      })
    }

    // ─── Generate Unique Reference Number ────────────────────────
    const referenceNumber = await generateUniqueReference(admissionSession)

    // ─── Save to Database ─────────────────────────────────────────
    const admission = await prisma.admission.create({
      data: {
        referenceNumber,
        status: 'SUBMITTED',
        session: admissionSession,
        studentFirstName,
        studentLastName,
        studentGender,
        studentDob: new Date(studentDob),
        classApplied,
        studentPhoto: studentPhotoUrl,
        phone,
        alternatePhone,
        email,
        address,
        city,
        state,
        pincode,
        fatherName,
        fatherOccupation,
        fatherPhone,
        fatherEmail,
        motherName,
        motherOccupation,
        motherPhone,
        previousSchool,
        previousClass,
        previousBoard,
        previousPercentage,
        documents: {
          create: uploadedDocuments,
        },
        statusHistory: {
          create: {
            fromStatus: undefined,
            toStatus: 'SUBMITTED',
            changedBy: 'System',
            notes: 'Application submitted online',
          },
        },
      },
    })

    // ─── Notification (abstracted) ────────────────────────────────
    await notifyAdmissionSubmitted(
      referenceNumber,
      `${studentFirstName} ${studentLastName}`,
      classApplied,
      email
    )

    // ─── Audit Log ────────────────────────────────────────────────
    await logActivity({
      action: 'SUBMIT_ADMISSION',
      module: 'admissions',
      recordId: admission.id,
      details: `New application: ${referenceNumber} — ${studentFirstName} ${studentLastName} for ${classApplied}`,
    })

    // ─── Get Confirmation Message ─────────────────────────────────
    const confirmSetting = await prisma.setting.findUnique({
      where: { key: 'admission_confirmation_message' },
    })
    const confirmationMessage =
      confirmSetting?.value ||
      'Your application has been received. Please note your reference number.'

    return successResponse({
      referenceNumber,
      studentName: `${studentFirstName} ${studentLastName}`,
      classApplied,
      session: admissionSession,
      submittedAt: admission.createdAt,
      confirmationMessage,
      documentsUploaded: uploadedDocuments.length,
    }, 201)
  } catch (error) {
    return handleApiError(error)
  }
}
