import { getAllSettings } from '@/lib/settings'
import { Breadcrumbs } from '@/components/admin/ui/Breadcrumbs'
import { SettingsClient } from './SettingsClient'

export const dynamic = 'force-dynamic'

export default async function AdminSettingsPage() {
  const settings = await getAllSettings()

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Settings' }]} />

      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'hsl(220, 35%, 15%)', margin: 0 }}>
          System Settings
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'hsl(220, 15%, 50%)', margin: '0.25rem 0 0 0' }}>
          Centralized configuration for school identity, contact channels, social profiles, and operational parameters
        </p>
      </div>

      <SettingsClient initialSettings={settings} />
    </div>
  )
}
