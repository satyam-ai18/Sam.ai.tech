import { prisma } from '@/lib/db'
import { ApplyClient } from './ApplyClient'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Apply for Admission | Maa Kaushilya Convent School',
  description: 'Fill the online admission application form for Maa Kaushilya Convent School, Jaunpur.',
}

async function getAdmissionSettings() {
  const settings = await prisma.setting.findMany({ where: { group: 'admission' } })
  const map: Record<string, string> = {}
  for (const s of settings) { map[s.key] = s.value }

  const defaults: Record<string, string> = {
    admission_enabled: 'true',
    admission_session: '2025-26',
    admission_available_classes: JSON.stringify(['Nursery','LKG','UKG','Class 1','Class 2','Class 3','Class 4','Class 5','Class 6','Class 7','Class 8','Class 9','Class 10']),
    admission_class_status: '{}',
    admission_required_documents: JSON.stringify(['Birth Certificate','Previous Class Marksheet','Passport Size Photo','Aadhar Card (Child)']),
    admission_confirmation_message: 'Your application has been received. Please note your reference number.',
    admission_contact_info: 'For queries: 8858514567 | mkconventschool@gmail.com',
  }
  for (const [k, v] of Object.entries(defaults)) {
    if (!(k in map)) map[k] = v
  }
  return map as any
}

export default async function AdmissionApplyPage() {
  const settings = await getAdmissionSettings()
  return (
    <main>
      <div style={{ background: 'linear-gradient(135deg, hsl(220, 65%, 18%), hsl(220, 55%, 28%))', padding: '4rem 2rem 3rem', textAlign: 'center' }}>
        <p style={{ color: 'hsl(42, 90%, 70%)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.875rem', marginBottom: '0.75rem' }}>
          Session {settings.admission_session}
        </p>
        <h1 style={{ color: '#fff', fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 900, margin: '0 0 0.75rem 0' }}>
          Online Admission Application
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.75)', maxWidth: '560px', margin: '0 auto', lineHeight: 1.7 }}>
          Maa Kaushilya Convent School, Jaunpur — Fill all details carefully. All fields marked * are required.
        </p>
      </div>

      <div style={{ maxWidth: '820px', margin: '0 auto', padding: '3rem 1.5rem' }}>
        <ApplyClient settings={settings} />
      </div>
    </main>
  )
}
