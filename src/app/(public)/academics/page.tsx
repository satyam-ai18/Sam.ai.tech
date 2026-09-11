import { Metadata } from 'next'
import { prisma } from '@/lib/db'
import { PageHeader } from '@/components/ui/Typography'
import { Section } from '@/components/ui/Section'
import { PublicCard } from '@/components/ui/Card'
import { SCHOOL_INFO } from '@/lib/constants'
import { parseJsonField } from '@/lib/utils'
import { BookOpen, GraduationCap, CheckCircle2, Sparkles } from 'lucide-react'
import Image from 'next/image'

export const metadata: Metadata = {
  title: `Academic Programs & Curriculum | ${SCHOOL_INFO.name}`,
  description: `Explore academic curriculum from Pre-Primary, Primary to Middle and Secondary at ${SCHOOL_INFO.name}. CBSE aligned holistic learning.`,
}

export const dynamic = 'force-dynamic'

const DEFAULT_PROGRAMS = [
  {
    id: 'prog-1',
    title: 'Pre-Primary Wing (Nursery, LKG, UKG)',
    ageGroup: '3 – 5 Years',
    description: 'Play-based early childhood education fostering motor skills, phonics, number sense, and social interaction.',
    subjects: JSON.stringify(['Early Literacy & Phonics', 'Numeracy', 'Environmental Awareness', 'Art & Craft', 'Music & Rhymes']),
    highlights: JSON.stringify(['Activity-based pedagogy', 'Safe thematic play area', 'Personalized child care', 'Regular parent updates']),
    image: null,
  },
  {
    id: 'prog-2',
    title: 'Primary Wing (Classes 1 – 5)',
    ageGroup: '6 – 10 Years',
    description: 'Building strong conceptual foundations in languages, mathematics, environmental studies, and computer basics.',
    subjects: JSON.stringify(['English', 'Hindi', 'Mathematics', 'Environmental Studies', 'Computer Science', 'General Knowledge']),
    highlights: JSON.stringify(['Smart classroom integration', 'Hands-on experiential learning', 'Sports & physical training', 'Creative expression']),
    image: null,
  },
  {
    id: 'prog-3',
    title: 'Middle Wing (Classes 6 – 8)',
    ageGroup: '11 – 13 Years',
    description: 'Transitioning from concrete to abstract reasoning with formal science, social sciences, and advanced computational skills.',
    subjects: JSON.stringify(['English', 'Hindi', 'Sanskrit', 'Mathematics', 'Science (Phy/Chem/Bio)', 'Social Science', 'Computer Applications']),
    highlights: JSON.stringify(['Science lab experiments', 'Olympiad & competitive exam foundation', 'Inter-house competitions', 'Leadership clubs']),
    image: null,
  },
  {
    id: 'prog-4',
    title: 'Secondary Wing (Classes 9 – 10)',
    ageGroup: '14 – 15 Years',
    description: 'Rigorous CBSE curriculum preparation focusing on analytical depth, board examination mastery, and career orientation.',
    subjects: JSON.stringify(['English Communicative/Language', 'Hindi Course A/B', 'Mathematics Standard/Basic', 'Science', 'Social Science', 'Information Technology']),
    highlights: JSON.stringify(['Comprehensive board prep', 'Pre-board simulation exams', 'Career counseling seminars', 'Remedial coaching sessions']),
    image: null,
  },
]

export default async function AcademicsPage() {
  let academics = DEFAULT_PROGRAMS
  let subjects: any[] = []
  try {
    const res = await Promise.all([
      prisma.academic.findMany({
        where: { isActive: true, status: 'PUBLISHED' },
        orderBy: { order: 'asc' },
      }),
      prisma.subject.findMany({
        where: { isActive: true },
        orderBy: { order: 'asc' },
      }),
    ])
    if (res[0].length > 0) academics = res[0] as any
    subjects = res[1]
  } catch (error) {
    console.warn('DB not available for AcademicsPage, using defaults:', error)
  }

  return (
    <main>
      <PageHeader
        badge="Curriculum & Learning"
        title="Academic Excellence"
        description="A structured CBSE pattern educational journey designed to inspire curiosity, critical thinking, and character from early childhood to Class 10."
      />

      {/* Academic Programs & Wings */}
      <Section>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <span style={{ fontSize: '0.8125rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-accent, hsl(40, 92%, 45%))' }}>
            Structured Stages of Education
          </span>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-text)', margin: '0.4rem 0 0.5rem 0' }}>
            Academic Programs & Wings
          </h2>
          <p style={{ color: 'var(--color-text-muted)', maxWidth: '650px', margin: '0 auto', fontSize: '0.9375rem' }}>
            Each wing is tailored to the cognitive and emotional development of students, supported by specialized educators and modern learning resources.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
          {academics.map((prog) => {
            const progSubjects = parseJsonField<string[]>(prog.subjects, [])
            const highlights = parseJsonField<string[]>(prog.highlights, [])

            return (
              <PublicCard key={prog.id} style={{ padding: '2rem', display: 'flex', flexDirection: 'column' }}>
                {prog.image && (
                  <div style={{ position: 'relative', width: '100%', height: '160px', borderRadius: '8px', overflow: 'hidden', marginBottom: '1.25rem' }}>
                    <Image src={prog.image} alt={prog.title} fill sizes="(max-width: 768px) 100vw, 360px" style={{ objectFit: 'cover' }} />
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
                      flexShrink: 0,
                    }}
                  >
                    <BookOpen size={22} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: 'var(--color-text)' }}>
                      {prog.title}
                    </h3>
                    {prog.ageGroup && (
                      <span style={{ fontSize: '0.8125rem', color: 'var(--color-accent, hsl(40, 92%, 45%))', fontWeight: 600 }}>
                        {prog.ageGroup}
                      </span>
                    )}
                  </div>
                </div>

                <p style={{ fontSize: '0.9375rem', color: 'var(--color-text-muted)', lineHeight: 1.6, marginBottom: '1.5rem', flex: 1 }}>
                  {prog.description}
                </p>

                {highlights.length > 0 && (
                  <div style={{ marginBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      {highlights.slice(0, 3).map((h, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8125rem', color: 'var(--color-text)' }}>
                          <CheckCircle2 size={14} style={{ color: 'var(--color-accent, hsl(40, 92%, 45%))', flexShrink: 0 }} />
                          <span>{h}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {progSubjects.length > 0 && (
                  <div style={{ paddingTop: '1rem', borderTop: '1px solid hsl(220, 20%, 94%)' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)' }}>
                      Core Subjects:
                    </span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.5rem' }}>
                      {progSubjects.map((sub, idx) => (
                        <span
                          key={idx}
                          style={{
                            fontSize: '0.75rem',
                            padding: '0.25rem 0.625rem',
                            borderRadius: '4px',
                            background: 'hsl(220, 20%, 94%)',
                            color: 'hsl(220, 30%, 25%)',
                            fontWeight: 600,
                          }}
                        >
                          {sub}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </PublicCard>
            )
          })}
        </div>
      </Section>

      {/* Subjects Directory Section */}
      {subjects.length > 0 && (
        <Section style={{ background: 'hsl(220, 20%, 97%)' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-accent, hsl(40, 92%, 45%))' }}>
              Academic Breadth
            </span>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-text)', margin: '0.4rem 0 0.5rem 0' }}>
              Curriculum Subjects Directory
            </h2>
            <p style={{ color: 'var(--color-text-muted)', maxWidth: '600px', margin: '0 auto', fontSize: '0.9375rem' }}>
              Comprehensive CBSE syllabus covering foundational sciences, languages, mathematics, social humanities, and digital literacy.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.25rem' }}>
            {subjects.map((subj) => {
              const classes = parseJsonField<string[]>(subj.classes, [])

              return (
                <div
                  key={subj.id}
                  style={{
                    background: '#ffffff',
                    borderRadius: '12px',
                    border: '1px solid hsl(220, 20%, 90%)',
                    padding: '1.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, margin: 0, color: 'var(--color-text)' }}>
                      {subj.name}
                    </h3>
                    {subj.code && (
                      <span style={{ fontSize: '0.6875rem', fontWeight: 700, background: 'hsl(220, 20%, 94%)', padding: '2px 6px', borderRadius: '4px', color: 'hsl(220, 30%, 30%)' }}>
                        {subj.code}
                      </span>
                    )}
                  </div>

                  {subj.description && (
                    <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', lineHeight: 1.5, margin: '0 0 1rem 0', flex: 1 }}>
                      {subj.description}
                    </p>
                  )}

                  {classes.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: 'auto' }}>
                      {classes.map((c, i) => (
                        <span key={i} style={{ fontSize: '0.6875rem', fontWeight: 600, background: 'var(--color-primary-muted, hsl(220, 65%, 95%))', color: 'var(--color-primary)', padding: '2px 6px', borderRadius: '4px' }}>
                          {c}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </Section>
      )}
    </main>
  )
}
