import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { hasPermission, PERMISSIONS } from '@/lib/permissions'
import { AdmissionSettingsClient } from './AdmissionSettingsClient'
import { Settings } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AdmissionSettingsPage() {
  const session = await auth()
  if (!session?.user) redirect('/auth/login')

  const userRole = (session.user as any)?.role
  if (!hasPermission(userRole, PERMISSIONS.MANAGE_ADMISSIONS)) {
    redirect('/admin/dashboard')
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1000px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'hsl(220, 70%, 94%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'hsl(220, 65%, 28%)' }}>
          <Settings size={24} />
        </div>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>Admission System Settings</h1>
          <p style={{ fontSize: '0.9rem', color: 'hsl(220, 15%, 50%)', margin: '0.25rem 0 0 0' }}>
            Control the admission system, session, class availability and page content
          </p>
        </div>
      </div>
      <AdmissionSettingsClient />
    </div>
  )
}
