import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { setSettingsBatch } from '@/lib/settings'
import { successResponse, errorResponse, handleApiError } from '@/lib/errors'
import { hasPermission, PERMISSIONS } from '@/lib/permissions'
import { logActivity } from '@/lib/audit'
import { z } from 'zod'

const updateSettingsSchema = z.object({
  settings: z.array(
    z.object({
      key: z.string().min(1),
      value: z.string(),
      group: z.string().optional(),
      type: z.string().optional(),
    })
  ),
})

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return errorResponse(401)
    }

    const group = req.nextUrl.searchParams.get('group')
    const where = group ? { group } : {}

    const settings = await prisma.setting.findMany({
      where,
      orderBy: { key: 'asc' },
    })

    return successResponse(settings)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return errorResponse(401)
    }

    const role = (session.user as any)?.role
    if (!hasPermission(role, PERMISSIONS.MANAGE_SETTINGS)) {
      return errorResponse(403, 'You do not have permission to modify settings')
    }

    const body = await req.json()
    const validated = updateSettingsSchema.parse(body)

    await setSettingsBatch(validated.settings)

    await logActivity({
      userId: session.user.id,
      userName: session.user.name || session.user.email || 'Admin',
      action: 'UPDATE',
      module: 'SETTINGS',
      details: `Updated ${validated.settings.length} system settings`,
    })

    return successResponse({ message: 'Settings updated successfully' })
  } catch (error) {
    return handleApiError(error)
  }
}
