import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { hasPermission, PERMISSIONS } from '@/lib/permissions'
import { AdmissionsClient } from './AdmissionsClient'
import Link from 'next/link'
import { Settings, ClipboardList } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AdminAdmissionsPage() {
  const session = await auth()
  if (!session?.user) redirect('/auth/login')

  const userRole = (session.user as any)?.role
  if (!hasPermission(userRole, PERMISSIONS.MANAGE_ADMISSIONS)) {
    redirect('/admin/dashboard')
  }

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'hsl(220, 70%, 94%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'hsl(220, 65%, 28%)' }}>
            <ClipboardList size={24} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>Admissions Management</h1>
            <p style={{ fontSize: '0.9rem', color: 'hsl(220, 15%, 50%)', margin: '0.25rem 0 0 0' }}>
              Review, process, and manage all admission applications
            </p>
          </div>
        </div>
        <Link
          href="/admin/admissions/settings"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1.25rem', background: 'hsl(220, 20%, 96%)', border: '1px solid hsl(220, 20%, 85%)', borderRadius: '8px', textDecoration: 'none', color: 'hsl(220, 35%, 20%)', fontWeight: 600, fontSize: '0.875rem' }}
        >
          <Settings size={16} /> Admission Settings
        </Link>
      </div>

      <AdmissionsClient userRole={userRole} />
    </div>
  )
}
