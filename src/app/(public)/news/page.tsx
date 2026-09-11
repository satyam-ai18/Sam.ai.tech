import { Metadata } from 'next'
import { prisma } from '@/lib/db'
import { PageHeader } from '@/components/ui/Typography'
import { Section } from '@/components/ui/Section'
import { PublicCard } from '@/components/ui/Card'
import { SCHOOL_INFO } from '@/lib/constants'
import { Calendar, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: `Latest News & Stories | ${SCHOOL_INFO.name}`,
  description: `Stay informed with the latest announcements, articles, and achievements from ${SCHOOL_INFO.name}.`,
}

export const dynamic = 'force-dynamic'

export default async function NewsPage() {
  let newsList: any[] = []
  try {
    newsList = await prisma.news.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { publishedAt: 'desc' },
    })
  } catch (error) {
    console.warn('DB not available for NewsPage, using defaults:', error)
  }

  return (
    <main>
      <PageHeader
        badge="Updates & Articles"
        title="School News & Stories"
        description="Official press releases, academic achievements, and highlights from across our campus."
      />

      <Section>
        {newsList.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>No published news articles at this moment.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
            {newsList.map((item) => (
              <PublicCard key={item.id} style={{ padding: '2rem', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginBottom: '0.75rem' }}>
                  <Calendar size={14} />
                  <span>
                    {item.publishedAt ? new Date(item.publishedAt).toLocaleDateString() : 'Recent'}
                  </span>
                  <span>•</span>
                  <span style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{item.category}</span>
                </div>

                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text)', margin: '0 0 0.75rem 0', lineHeight: 1.35 }}>
                  {item.title}
                </h3>

                {item.excerpt && (
                  <p style={{ fontSize: '0.9375rem', color: 'var(--color-text-muted)', lineHeight: 1.6, marginBottom: '1.5rem', flex: 1 }}>
                    {item.excerpt}
                  </p>
                )}

                <div style={{ marginTop: 'auto' }}>
                  <div
                    style={{
                      fontSize: '0.875rem',
                      lineHeight: 1.6,
                      color: 'var(--color-text)',
                      background: 'hsl(220, 20%, 97%)',
                      padding: '1rem',
                      borderRadius: '8px',
                    }}
                    dangerouslySetInnerHTML={{ __html: item.content }}
                  />
                </div>
              </PublicCard>
            ))}
          </div>
        )}
      </Section>
    </main>
  )
}
