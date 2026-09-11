import { queryAuditLogs } from '@/lib/audit'
import { Breadcrumbs } from '@/components/admin/ui/Breadcrumbs'
import { AuditLogsClient } from './AuditLogsClient'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Audit Logs & Activity Trail | Admin Dashboard',
}

export const dynamic = 'force-dynamic'

export default async function AdminAuditLogsPage() {
  const result = await queryAuditLogs({ page: 1, pageSize: 25 })

  return (
    <div>
      <Breadcrumbs items={[{ label: 'System' }, { label: 'Audit Logs' }]} />
      <AuditLogsClient
        initialLogs={result.logs.map((l) => ({
          ...l,
          createdAt: l.createdAt.toISOString(),
        }))}
        initialTotal={result.total}
      />
    </div>
  )
}
