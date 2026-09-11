import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse, handleApiError } from '@/lib/errors'
import { hasPermission, PERMISSIONS } from '@/lib/permissions'
import { logActivity } from '@/lib/audit'

export const dynamic = 'force-dynamic'

// Default admission setting keys with their default values
const ADMISSION_SETTING_KEYS = [
  { key: 'admission_enabled', value: 'true', type: 'boolean', group: 'admission' },
  { key: 'admission_session', value: '2025-26', type: 'text', group: 'admission' },
  { key: 'admission_start_date', value: '', type: 'text', group: 'admission' },
  { key: 'admission_end_date', value: '', type: 'text', group: 'admission' },
  { key: 'admission_heading', value: 'Admissions Open for 2025–26', type: 'text', group: 'admission' },
  { key: 'admission_intro', value: 'Maa Kaushilya Convent School welcomes applications for all classes. Fill the form carefully with accurate information.', type: 'textarea', group: 'admission' },
  { key: 'admission_available_classes', value: JSON.stringify(['Nursery','LKG','UKG','Class 1','Class 2','Class 3','Class 4','Class 5','Class 6','Class 7','Class 8','Class 9','Class 10']), type: 'json', group: 'admission' },
  { key: 'admission_class_status', value: JSON.stringify({ 'Nursery': 'Open', 'LKG': 'Open', 'UKG': 'Open', 'Class 1': 'Open' }), type: 'json', group: 'admission' },
  { key: 'admission_instructions', value: 'Fill all fields accurately. Upload clear scanned copies of required documents. Keep your reference number safe after submission.', type: 'textarea', group: 'admission' },
  { key: 'admission_required_documents', value: JSON.stringify(['Birth Certificate','Previous Class Marksheet','Transfer Certificate','Passport Size Photo','Aadhar Card (Child)','Aadhar Card (Parent)']), type: 'json', group: 'admission' },
  { key: 'admission_confirmation_message', value: 'Thank you for applying! Your application has been received. Please note your reference number and use it to track your application status.', type: 'textarea', group: 'admission' },
  { key: 'admission_contact_info', value: 'For admission queries: 8858514567 | mkconventschool@gmail.com | Sukkhipur, Jaunpur', type: 'text', group: 'admission' },
]

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) return errorResponse(401)

    // Fetch all admission settings from DB
    const settings = await prisma.setting.findMany({
      where: { group: 'admission' },
    })

    // Build a key-value map, filling missing keys with defaults
    const settingsMap: Record<string, string> = {}
    for (const s of settings) {
      settingsMap[s.key] = s.value
    }

    // Ensure all expected keys are present
    for (const def of ADMISSION_SETTING_KEYS) {
      if (!(def.key in settingsMap)) {
        settingsMap[def.key] = def.value
      }
    }

    return successResponse(settingsMap)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return errorResponse(401)

    const userRole = (session.user as any)?.role
    if (!hasPermission(userRole, PERMISSIONS.MANAGE_ADMISSIONS)) {
      return errorResponse(403, 'Permission denied: manage_admissions required')
    }

    const body = await req.json()
    if (typeof body !== 'object' || !body) {
      return errorResponse(400, 'Request body must be a key-value object')
    }

    // Upsert each provided key
    const upsertOps = Object.entries(body).map(([key, value]) => {
      const def = ADMISSION_SETTING_KEYS.find(d => d.key === key)
      return prisma.setting.upsert({
        where: { key },
        update: { value: String(value) },
        create: {
          key,
          value: String(value),
          type: def?.type || 'text',
          group: 'admission',
        },
      })
    })

    await Promise.all(upsertOps)

    await logActivity({
      userId: session.user.id,
      userName: session.user.name || session.user.email || 'Admin',
      action: 'UPDATE_ADMISSION_SETTINGS',
      module: 'admissions',
      details: `Updated ${Object.keys(body).length} admission setting(s)`,
    })

    return successResponse({ message: 'Admission settings saved successfully' })
  } catch (error) {
    return handleApiError(error)
  }
}
