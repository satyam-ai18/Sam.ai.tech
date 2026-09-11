import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { queryAuditLogs } from '@/lib/audit'
import { successResponse, errorResponse, handleApiError } from '@/lib/errors'
import { hasPermission, PERMISSIONS } from '@/lib/permissions'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return errorResponse(401)

    const userRole = (session.user as any)?.role
    if (!hasPermission(userRole, PERMISSIONS.VIEW_AUDIT_LOGS)) {
      return errorResponse(403, 'Permission denied: view_audit_logs required')
    }

    const { searchParams } = req.nextUrl
    const search = searchParams.get('search') || undefined
    const auditModule = searchParams.get('module') || undefined
    const action = searchParams.get('action') || undefined
    const userId = searchParams.get('userId') || undefined
    const startDate = searchParams.get('startDate') || undefined
    const endDate = searchParams.get('endDate') || undefined
    const page = parseInt(searchParams.get('page') || '1', 10)
    const pageSize = parseInt(searchParams.get('pageSize') || '25', 10)

    const result = await queryAuditLogs({
      search,
      module: auditModule,
      action,
      userId,
      startDate,
      endDate,
      page,
      pageSize,
    })

    return successResponse(result)
  } catch (error) {
    return handleApiError(error)
  }
}
