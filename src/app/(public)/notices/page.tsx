import { Metadata } from 'next'
import { prisma } from '@/lib/db'
import { PageHeader } from '@/components/ui/Typography'
import { Section } from '@/components/ui/Section'
import { PublicCard } from '@/components/ui/Card'
import { SCHOOL_INFO } from '@/lib/constants'
import { Bell, AlertCircle, Calendar, Download, FileText, Pin } from 'lucide-react'

export const metadata: Metadata = {
  title: `Notice Board | ${SCHOOL_INFO.name}`,
  description: `Official school notices, exam schedules, holidays, and circulars from ${SCHOOL_INFO.name}.`,
}

export const dynamic = 'force-dynamic'

export default async function NoticesPage() {
  const now = new Date()
  let notices: any[] = []

  try {
    notices = await prisma.notice.findMany({
      where: {
        isPublished: true,
        OR: [
          { expiryDate: null },
          { expiryDate: { gte: now } },
        ],
      },
      orderBy: [{ isImportant: 'desc' }, { date: 'desc' }],
    })
  } catch (error) {
    console.warn('DB not available for NoticesPage, using defaults:', error)
  }

  // Separate pinned and regular
  const pinned = notices.filter(n => n.isImportant)
  const regular = notices.filter(n => !n.isImportant)

  const categoryColors: Record<string, { bg: string; color: string }> = {
    general: { bg: 'hsl(220, 20%, 94%)', color: 'hsl(220, 35%, 30%)' },
    academic: { bg: 'hsl(220, 70%, 94%)', color: 'hsl(220, 65%, 28%)' },
    exam: { bg: 'hsl(260, 60%, 94%)', color: 'hsl(260, 60%, 35%)' },
    fee: { bg: 'hsl(140, 60%, 94%)', color: 'hsl(140, 70%, 25%)' },
    sports: { bg: 'hsl(180, 60%, 92%)', color: 'hsl(180, 70%, 25%)' },
    events: { bg: 'hsl(40, 95%, 92%)', color: 'hsl(40, 95%, 30%)' },
    holiday: { bg: 'hsl(0, 60%, 94%)', color: 'hsl(0, 70%, 40%)' },
    recruitment: { bg: 'hsl(300, 40%, 94%)', color: 'hsl(300, 50%, 30%)' },
  }

  return (
    <main>
      <PageHeader
        badge="Official Circulars"
        title="School Notice Board"
        description="Stay up to date with urgent announcements, holiday schedules, and administrative notifications."
      />

      <Section>
        {notices.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>No notices at this time.</p>
        ) : (
          <div style={{ maxWidth: '840px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>

            {/* Pinned / Important */}
            {pinned.length > 0 && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                  <Pin size={16} style={{ color: 'hsl(0, 70%, 50%)' }} />
                  <span style={{ fontWeight: 800, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'hsl(0, 70%, 45%)' }}>Pinned Notices</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {pinned.map(n => (
                    <NoticeCard key={n.id} notice={n} categoryColors={categoryColors} />
                  ))}
                </div>
              </div>
            )}

            {/* Regular Notices */}
            {regular.length > 0 && (
              <div>
                {pinned.length > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                    <Bell size={16} style={{ color: 'hsl(220, 40%, 50%)' }} />
                    <span style={{ fontWeight: 800, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'hsl(220, 40%, 50%)' }}>All Notices</span>
                  </div>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {regular.map(n => (
                    <NoticeCard key={n.id} notice={n} categoryColors={categoryColors} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Section>
    </main>
  )
}

function NoticeCard({ notice, categoryColors }: { notice: any; categoryColors: Record<string, { bg: string; color: string }> }) {
  const cc = categoryColors[notice.category] || categoryColors.general
  return (
    <PublicCard
      style={{
        padding: '1.5rem',
        borderLeft: notice.isImportant ? '4px solid hsl(0, 70%, 50%)' : '1px solid hsl(220, 20%, 92%)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          {notice.isImportant && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', background: 'hsl(0, 80%, 93%)', color: 'hsl(0, 70%, 40%)', fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
              <AlertCircle size={13} /> Important
            </span>
          )}
          <span style={{ display: 'inline-block', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700, background: cc.bg, color: cc.color }}>
            {notice.category.charAt(0).toUpperCase() + notice.category.slice(1)}
          </span>
          <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Calendar size={13} />
            {new Date(notice.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
          {notice.expiryDate && (
            <span style={{ fontSize: '0.75rem', color: 'hsl(0, 50%, 50%)' }}>
              Expires: {new Date(notice.expiryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
            </span>
          )}
        </div>
      </div>

      <h3 style={{ fontSize: '1.1875rem', fontWeight: 700, color: 'var(--color-text)', margin: '0 0 0.5rem 0' }}>
        {notice.title}
      </h3>

      <p style={{ fontSize: '0.9375rem', color: 'var(--color-text-muted)', lineHeight: 1.6, margin: '0 0 0.75rem 0' }}>
        {notice.description}
      </p>

      {notice.attachment && (
        <a
          href={notice.attachment}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.5rem 1rem', background: 'hsl(220, 70%, 94%)', color: 'hsl(220, 65%, 28%)',
            borderRadius: '8px', textDecoration: 'none', fontWeight: 600, fontSize: '0.875rem',
            marginTop: '0.25rem',
          }}
        >
          <FileText size={15} />
          View / Download Attachment
          <Download size={14} />
        </a>
      )}
    </PublicCard>
  )
}
