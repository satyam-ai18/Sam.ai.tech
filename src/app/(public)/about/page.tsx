import { Metadata } from 'next'
import { prisma } from '@/lib/db'
import { PageHeader } from '@/components/ui/Typography'
import { Section } from '@/components/ui/Section'
import { PublicCard } from '@/components/ui/Card'
import { SCHOOL_INFO } from '@/lib/constants'

export const metadata: Metadata = {
  title: `About Us | ${SCHOOL_INFO.name}`,
  description: `Learn about ${SCHOOL_INFO.name}, our heritage, values, and educational philosophy in Jaunpur, UP.`,
}

export const dynamic = 'force-dynamic'

export default async function AboutPage() {
  let aboutData = null
  let coreValues: any[] = []
  try {
    const res = await Promise.all([
      prisma.aboutSection.findUnique({ where: { key: 'about' } }),
      prisma.coreValue.findMany({ where: { isActive: true }, orderBy: { order: 'asc' } }),
    ])
    aboutData = res[0]
    coreValues = res[1]
  } catch (error) {
    console.warn('DB not available for AboutPage, using defaults:', error)
  }

  return (
    <main>
      <PageHeader
        badge="About Our School"
        title={aboutData?.heading || 'About Maa Kaushilya Convent School'}
        description={aboutData?.subheading || 'A premier CBSE pattern institution dedicated to academic excellence and moral foundation.'}
      />

      <Section title="Our Story & Philosophy" badge="Heritage" centered>
        <div style={{ maxWidth: '800px', margin: '0 auto', fontSize: '1.0625rem', lineHeight: 1.8, color: 'hsl(220, 20%, 25%)' }}>
          {aboutData?.content ? (
            <div dangerouslySetInnerHTML={{ __html: aboutData.content }} />
          ) : (
            <p>
              Maa Kaushilya Convent School is a premier Co-Ed English Medium CBSE pattern institution located in Jaunpur, Uttar Pradesh.
            </p>
          )}
        </div>
      </Section>

      {coreValues.length > 0 && (
        <Section title="Our Core Values" subtitle="Principles that guide our educators, students, and curriculum" badge="Foundation" style={{ background: 'var(--color-bg, hsl(220, 20%, 98%))' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {coreValues.map((val) => (
              <PublicCard key={val.id} style={{ padding: '1.75rem' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-text, hsl(220, 20%, 15%))', marginBottom: '0.5rem' }}>
                  {val.title}
                </h3>
                <p style={{ fontSize: '0.9375rem', color: 'var(--color-text-muted, hsl(220, 15%, 45%))', lineHeight: 1.6, margin: 0 }}>
                  {val.description}
                </p>
              </PublicCard>
            ))}
          </div>
        </Section>
      )}
    </main>
  )
}
