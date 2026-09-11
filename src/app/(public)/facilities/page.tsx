import { Metadata } from 'next'
import { prisma } from '@/lib/db'
import { PageHeader } from '@/components/ui/Typography'
import { Section } from '@/components/ui/Section'
import { PublicCard } from '@/components/ui/Card'
import { SCHOOL_INFO } from '@/lib/constants'
import { parseJsonField } from '@/lib/utils'
import { Building2, CheckCircle2 } from 'lucide-react'
import Image from 'next/image'

export const metadata: Metadata = {
  title: `Campus Facilities | ${SCHOOL_INFO.name}`,
  description: `Discover modern smart classrooms, science and computer labs, library, and sports grounds at ${SCHOOL_INFO.name}.`,
}

export const dynamic = 'force-dynamic'

const DEFAULT_FACILITIES = [
  {
    id: 'fac-1',
    title: 'Smart Classrooms',
    description: 'Digitally-equipped classrooms featuring interactive displays, audiovisual aids, and ergonomic seating.',
    features: JSON.stringify(['Interactive Flat Panels', 'High-Speed Wi-Fi', 'Ergonomic Furniture', 'Climate Control']),
    image: null,
  },
  {
    id: 'fac-2',
    title: 'Composite Science Laboratory',
    description: 'Fully equipped physics, chemistry, and biology stations designed for safe hands-on experimentation.',
    features: JSON.stringify(['Precision Equipment', 'Safety Gear & Showers', 'Demonstration Station', 'Specimen Collection']),
    image: null,
  },
  {
    id: 'fac-3',
    title: 'Modern Computer Center',
    description: 'High-speed networked systems providing students foundational coding, digital literacy, and AI fundamentals.',
    features: JSON.stringify(['Dedicated Workstations', 'Coding & Robotics Tools', 'Safe Internet Access', 'UPS Backup']),
    image: null,
  },
  {
    id: 'fac-4',
    title: 'Sports Grounds & Athletic Track',
    description: 'Expansive outdoor grounds for cricket, football, volleyball, athletics, and physical training under expert coaches.',
    features: JSON.stringify(['Cricket Pitch', 'Volleyball Court', 'Athletic Running Track', 'Indoor Games Arena']),
    image: null,
  },
]

export default async function FacilitiesPage() {
  let facilities = DEFAULT_FACILITIES
  try {
    const res = await prisma.facility.findMany({
      where: { isActive: true, status: 'PUBLISHED' },
      orderBy: { order: 'asc' },
    })
    if (res.length > 0) facilities = res as any
  } catch (error) {
    console.warn('DB not available for FacilitiesPage, using defaults:', error)
  }

  return (
    <main>
      <PageHeader
        badge="Facilities"
        title="Campus Facilities"
        description="Essential learning spaces, science and computer laboratories, library, and sports areas supporting our students' everyday growth."
      />

      <Section>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          {facilities.map((fac) => {
            const features = parseJsonField<string[]>(fac.features, [])

            return (
              <PublicCard key={fac.id} style={{ padding: '2rem', display: 'flex', flexDirection: 'column' }}>
                {fac.image && (
                  <div style={{ position: 'relative', width: '100%', height: '170px', borderRadius: '10px', overflow: 'hidden', marginBottom: '1.25rem' }}>
                    <Image src={fac.image} alt={fac.title} fill sizes="(max-width: 768px) 100vw, 360px" style={{ objectFit: 'cover' }} />
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '10px',
                      background: 'var(--color-primary-muted, hsl(220, 65%, 95%))',
                      color: 'var(--color-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Building2 size={22} />
                  </div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: 'var(--color-text)' }}>
                    {fac.title}
                  </h3>
                </div>

                <p style={{ fontSize: '0.9375rem', color: 'var(--color-text-muted)', lineHeight: 1.6, marginBottom: '1.5rem', flex: 1 }}>
                  {fac.description}
                </p>

                {features.length > 0 && (
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {features.map((feat, idx) => (
                      <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'hsl(220, 25%, 30%)' }}>
                        <CheckCircle2 size={15} style={{ color: 'hsl(140, 70%, 40%)', flexShrink: 0 }} />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </PublicCard>
            )
          })}
        </div>
      </Section>
    </main>
  )
}
