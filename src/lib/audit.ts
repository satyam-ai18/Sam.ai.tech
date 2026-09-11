import { prisma } from '@/lib/db'

export interface LogActivityParams {
  userId?: string
  userName?: string
  action: string
  module: string
  recordId?: string
  details?: string
  ipAddress?: string
}

/**
 * Record an administrative activity in the audit log
 */
export async function logActivity(params: LogActivityParams) {
  try {
    return await prisma.auditLog.create({
      data: {
        userId: params.userId || 'system',
        userName: params.userName || 'Administrator',
        action: params.action,
        module: params.module,
        recordId: params.recordId,
        details: params.details,
        ipAddress: params.ipAddress,
      },
    })
  } catch (error) {
    // Non-blocking error: log to console but don't crash main operation
    console.error('Failed to write audit log:', error)
    return null
  }
}

/**
 * Fetch recent audit logs for dashboard and activity feeds
 */
export async function getRecentAuditLogs(limit = 10) {
  try {
    return await prisma.auditLog.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
    })
  } catch (error) {
    console.error('Failed to fetch audit logs:', error)
    return []
  }
}

export interface AuditLogFilters {
  search?: string
  module?: string
  action?: string
  userId?: string
  startDate?: string
  endDate?: string
  page?: number
  pageSize?: number
}

/**
 * Filtered and paginated audit logs for Audit Log CMS
 */
export async function queryAuditLogs(filters: AuditLogFilters = {}) {
  const {
    search,
    module,
    action,
    userId,
    startDate,
    endDate,
    page = 1,
    pageSize = 25,
  } = filters

  const where: any = {}

  if (search) {
    where.OR = [
      { details: { contains: search } },
      { userName: { contains: search } },
      { recordId: { contains: search } },
      { action: { contains: search } },
    ]
  }

  if (module && module !== 'all') {
    where.module = module
  }

  if (action && action !== 'all') {
    where.action = action
  }

  if (userId && userId !== 'all') {
    where.userId = userId
  }

  if (startDate || endDate) {
    where.createdAt = {}
    if (startDate) where.createdAt.gte = new Date(startDate)
    if (endDate) {
      const end = new Date(endDate)
      end.setHours(23, 59, 59, 999)
      where.createdAt.lte = end
    }
  }

  const [total, logs] = await Promise.all([
    prisma.auditLog.count({ where }),
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ])

  return {
    logs,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  }
}
