import { prisma } from '@/lib/db'
import Link from 'next/link'
import type { Metadata } from 'next'
import { CalendarDays, MapPin, Clock, ArrowRight, Calendar } from 'lucide-react'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Admissions | Maa Kaushilya Convent School',
  description: 'Apply for admission to Maa Kaushilya Convent School, Jaunpur. Learn about the admission process, requirements, and available classes.',
}

async function getAdmissionSettings() {
  const map: Record<string, string> = {}
  try {
    const settings = await prisma.setting.findMany({ where: { group: 'admission' } })
    for (const s of settings) { map[s.key] = s.value }
  } catch (error) {
    console.warn('DB not available for AdmissionSettings, using defaults:', error)
  }
  const defaults: Record<string, string> = {
    admission_enabled: 'true',
    admission_session: '2025-26',
    admission_start_date: '',
    admission_end_date: '',
    admission_heading: 'Admissions Open',
    admission_intro: 'Maa Kaushilya Convent School welcomes applications for all classes.',
    admission_available_classes: JSON.stringify(['Nursery','LKG','UKG','Class 1','Class 2','Class 3','Class 4','Class 5','Class 6','Class 7','Class 8','Class 9','Class 10']),
    admission_class_status: '{}',
    admission_instructions: 'Fill all fields accurately and upload clear document copies.',
    admission_required_documents: JSON.stringify(['Birth Certificate','Previous Class Marksheet','Passport Size Photo','Aadhar Card (Child)']),
    admission_contact_info: 'For queries: 8858514567 | mkconventschool@gmail.com',
  }
  for (const [k, v] of Object.entries(defaults)) {
    if (!(k in map)) map[k] = v
  }
  return map
}

export default async function AdmissionsPage() {
  const settings = await getAdmissionSettings()

  const admissionEnabled = settings.admission_enabled === 'true'
  const session = settings.admission_session
  const startDate = settings.admission_start_date
  const endDate = settings.admission_end_date
  const heading = settings.admission_heading
  const intro = settings.admission_intro
  const instructions = settings.admission_instructions
  const contactInfo = settings.admission_contact_info
  const availableClasses: string[] = JSON.parse(settings.admission_available_classes || '[]')
  const classStatus: Record<string, string> = JSON.parse(settings.admission_class_status || '{}')
  const requiredDocs: string[] = JSON.parse(settings.admission_required_documents || '[]')

  const admissionSteps = [
    { num: 1, title: 'Fill Online Form', desc: 'Complete the multi-step online application form with accurate student and parent details.' },
    { num: 2, title: 'Document Verification', desc: 'Submit required original documents to the school office for verification.' },
    { num: 3, title: 'Assessment', desc: 'Students may be called for an age-appropriate interaction or assessment.' },
    { num: 4, title: 'Admission Confirmation', desc: 'Receive final admission confirmation and complete enrollment formalities.' },
  ]

  const statusColors: Record<string, { bg: string; color: string }> = {
    'Open': { bg: 'hsl(140, 60%, 92%)', color: 'hsl(140, 70%, 25%)' },
    'Closed': { bg: 'hsl(0, 60%, 93%)', color: 'hsl(0, 70%, 40%)' },
    'Coming Soon': { bg: 'hsl(40, 95%, 90%)', color: 'hsl(40, 95%, 30%)' },
  }

  return (
    <main>
      {/* Hero Banner */}
      <div style={{ background: 'linear-gradient(135deg, hsl(220, 65%, 15%), hsl(220, 55%, 28%))', padding: '5rem 2rem 4rem', textAlign: 'center' }}>
        <span style={{ display: 'inline-block', padding: '0.375rem 1rem', background: admissionEnabled ? 'hsl(140, 60%, 30%)' : 'hsl(0, 60%, 35%)', color: '#fff', borderRadius: '20px', fontSize: '0.8125rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1.25rem' }}>
          {admissionEnabled ? `Session ${session} — Admissions Open` : 'Admissions Currently Closed'}
        </span>
        <h1 style={{ color: '#fff', fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 900, margin: '0 0 1rem 0', lineHeight: 1.2 }}>{heading}</h1>
        <p style={{ color: 'rgba(255,255,255,0.8)', maxWidth: '600px', margin: '0 auto 2.5rem', lineHeight: 1.8, fontSize: '1.0625rem' }}>{intro}</p>
        {admissionEnabled && (
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/admissions/apply" style={{ padding: '0.9rem 2.25rem', background: 'hsl(42, 90%, 55%)', color: 'hsl(220, 65%, 12%)', borderRadius: '10px', textDecoration: 'none', fontWeight: 800, fontSize: '1rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              Apply Online <ArrowRight size={18} />
            </Link>
            <Link href="/admissions/status" style={{ padding: '0.9rem 2.25rem', background: 'rgba(255,255,255,0.12)', color: '#fff', borderRadius: '10px', textDecoration: 'none', fontWeight: 700, fontSize: '1rem', border: '2px solid rgba(255,255,255,0.3)' }}>
              Track Application Status
            </Link>
          </div>
        )}
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '4rem 1.5rem' }}>

        {/* Important Dates */}
        {(startDate || endDate) && (
          <section style={{ marginBottom: '4rem' }}>
            <h2 style={{ fontSize: '1.625rem', fontWeight: 800, marginBottom: '1.5rem', color: 'hsl(220, 35%, 15%)' }}>Important Dates</h2>
            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
              {startDate && (
                <div style={{ flex: '1 1 220px', padding: '1.5rem', background: 'hsl(140, 60%, 97%)', borderRadius: '12px', border: '1px solid hsl(140, 60%, 88%)' }}>
                  <Calendar size={22} style={{ color: 'hsl(140, 70%, 30%)', marginBottom: '0.75rem' }} />
                  <div style={{ fontSize: '0.8125rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'hsl(140, 50%, 35%)', marginBottom: '0.375rem' }}>Admission Opens</div>
                  <div style={{ fontWeight: 800, fontSize: '1.125rem', color: 'hsl(220, 35%, 15%)' }}>{new Date(startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                </div>
              )}
              {endDate && (
                <div style={{ flex: '1 1 220px', padding: '1.5rem', background: 'hsl(0, 60%, 97%)', borderRadius: '12px', border: '1px solid hsl(0, 60%, 90%)' }}>
                  <Clock size={22} style={{ color: 'hsl(0, 70%, 40%)', marginBottom: '0.75rem' }} />
                  <div style={{ fontSize: '0.8125rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'hsl(0, 50%, 40%)', marginBottom: '0.375rem' }}>Last Date to Apply</div>
                  <div style={{ fontWeight: 800, fontSize: '1.125rem', color: 'hsl(220, 35%, 15%)' }}>{new Date(endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Available Classes */}
        <section style={{ marginBottom: '4rem' }}>
          <h2 style={{ fontSize: '1.625rem', fontWeight: 800, marginBottom: '0.5rem', color: 'hsl(220, 35%, 15%)' }}>Class-wise Admission Status</h2>
          <p style={{ color: 'hsl(220, 15%, 50%)', marginBottom: '1.5rem' }}>Availability for Session {session}</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.875rem' }}>
            {availableClasses.map(cls => {
              const status = classStatus[cls] || 'Open'
              const sc = statusColors[status] || statusColors['Open']
              return (
                <div key={cls} style={{ padding: '1rem', background: '#fff', borderRadius: '10px', border: '1px solid hsl(220, 20%, 90%)', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center', textAlign: 'center' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'hsl(220, 35%, 15%)' }}>{cls}</span>
                  <span style={{ padding: '0.25rem 0.75rem', borderRadius: '20px', fontWeight: 700, fontSize: '0.75rem', background: sc.bg, color: sc.color }}>{status}</span>
                </div>
              )
            })}
          </div>
        </section>

        {/* Admission Process */}
        <section style={{ marginBottom: '4rem' }}>
          <h2 style={{ fontSize: '1.625rem', fontWeight: 800, marginBottom: '1.5rem', color: 'hsl(220, 35%, 15%)' }}>Admission Process</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
            {admissionSteps.map(step => (
              <div key={step.num} style={{ padding: '1.75rem', background: '#fff', borderRadius: '14px', border: '1px solid hsl(220, 20%, 90%)', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'hsl(220, 65%, 28%)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.125rem', marginBottom: '1rem' }}>{step.num}</div>
                <h3 style={{ fontWeight: 800, fontSize: '1rem', marginBottom: '0.5rem', color: 'hsl(220, 35%, 15%)' }}>{step.title}</h3>
                <p style={{ color: 'hsl(220, 15%, 45%)', fontSize: '0.875rem', lineHeight: 1.6, margin: 0 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Instructions & Required Documents */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', marginBottom: '4rem' }}>
          {instructions && (
            <section>
              <h2 style={{ fontSize: '1.375rem', fontWeight: 800, marginBottom: '1rem', color: 'hsl(220, 35%, 15%)' }}>Application Instructions</h2>
              <div style={{ padding: '1.5rem', background: 'hsl(220, 70%, 98%)', borderRadius: '12px', border: '1px solid hsl(220, 40%, 90%)' }}>
                <p style={{ color: 'hsl(220, 25%, 30%)', lineHeight: 1.8, margin: 0 }}>{instructions}</p>
              </div>
            </section>
          )}
          {requiredDocs.length > 0 && (
            <section>
              <h2 style={{ fontSize: '1.375rem', fontWeight: 800, marginBottom: '1rem', color: 'hsl(220, 35%, 15%)' }}>Required Documents</h2>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {requiredDocs.map((doc, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', background: '#fff', borderRadius: '8px', border: '1px solid hsl(220, 20%, 90%)' }}>
                    <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'hsl(220, 65%, 28%)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.75rem', flexShrink: 0 }}>{i + 1}</span>
                    <span style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{doc}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        {/* Contact Info */}
        {contactInfo && (
          <section style={{ padding: '2rem', background: 'hsl(220, 65%, 28%)', borderRadius: '16px', color: '#fff', textAlign: 'center' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.75rem' }}>Admission Helpdesk</h2>
            <p style={{ color: 'rgba(255,255,255,0.85)', margin: '0 0 1.5rem 0', lineHeight: 1.7 }}>{contactInfo}</p>
            {admissionEnabled && (
              <Link href="/admissions/apply" style={{ padding: '0.875rem 2.25rem', background: 'hsl(42, 90%, 55%)', color: 'hsl(220, 65%, 12%)', borderRadius: '10px', textDecoration: 'none', fontWeight: 800, fontSize: '1rem', display: 'inline-block' }}>
                Apply for Admission
              </Link>
            )}
          </section>
        )}
      </div>
    </main>
  )
}
