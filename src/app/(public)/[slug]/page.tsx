import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronRight, Calendar, User, Eye, AlertTriangle, CheckCircle2, ArrowRight } from 'lucide-react'

interface PageProps {
  params: Promise<{ slug: string }>
  searchParams?: Promise<{ preview?: string }>
}

interface ContentBlock {
  id: string
  type: 'text' | 'features' | 'stats' | 'cta'
  title?: string
  subtitle?: string
  content?: string
  items?: Array<{
    title: string
    description?: string
    badge?: string
    icon?: string
    value?: string
    label?: string
  }>
  ctaText?: string
  ctaUrl?: string
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const page = await prisma.page.findUnique({
    where: { slug },
  })

  if (!page || page.status !== 'PUBLISHED') {
    return {
      title: 'Page Not Found | Maa Kaushilya Convent School',
    }
  }

  return {
    title: page.seoTitle || `${page.title} | Maa Kaushilya Convent School`,
    description: page.seoDescription || `Learn more about ${page.title} at Maa Kaushilya Convent School, Jaunpur.`,
    openGraph: {
      title: page.seoTitle || page.title,
      description: page.seoDescription || undefined,
      images: page.ogImage || page.featuredImage ? [page.ogImage || page.featuredImage!] : undefined,
    },
  }
}

export default async function DynamicCMSPage({ params, searchParams }: PageProps) {
  const { slug } = await params
  const resolvedSearchParams = searchParams ? await searchParams : undefined
  const isPreviewRequested = resolvedSearchParams?.preview === 'true'

  const page = await prisma.page.findUnique({
    where: { slug },
  })

  if (!page) {
    notFound()
  }

  // Handle draft permissions
  let isAuthorizedAdmin = false
  if (page.status !== 'PUBLISHED') {
    if (isPreviewRequested) {
      const session = await auth()
      if (session?.user) {
        isAuthorizedAdmin = true
      }
    }

    if (!isAuthorizedAdmin) {
      notFound()
    }
  }

  // Parse structured blocks if present
  let parsedBlocks: ContentBlock[] = []
  if (page.blocks) {
    try {
      parsedBlocks = JSON.parse(page.blocks)
    } catch {
      parsedBlocks = []
    }
  }

  return (
    <main style={{ minHeight: '80vh', background: 'hsl(220, 20%, 98%)' }}>
      {/* Draft Preview Admin Banner */}
      {isAuthorizedAdmin && (
        <div
          style={{
            background: 'linear-gradient(90deg, #d97706, #b45309)',
            color: '#ffffff',
            padding: '0.75rem 1.5rem',
            fontSize: '0.875rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.625rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            position: 'sticky',
            top: 0,
            zIndex: 50,
          }}
        >
          <Eye size={18} />
          <span>
            <strong>ADMIN PREVIEW MODE:</strong> This page is in <code>DRAFT</code> status. It is invisible to general public visitors.
          </span>
          <Link
            href="/admin/pages"
            style={{
              marginLeft: '1rem',
              background: 'rgba(255,255,255,0.2)',
              padding: '0.25rem 0.625rem',
              borderRadius: '4px',
              color: '#ffffff',
              textDecoration: 'none',
              fontSize: '0.75rem',
            }}
          >
            Back to Editor
          </Link>
        </div>
      )}

      {/* Hero Header */}
      <section
        style={{
          background: 'linear-gradient(135deg, hsl(220, 70%, 20%) 0%, hsl(220, 60%, 12%) 100%)',
          color: '#ffffff',
          padding: '4.5rem 1.5rem 3.5rem 1.5rem',
          textAlign: 'center',
          position: 'relative',
        }}
      >
        <div style={{ maxWidth: '850px', margin: '0 auto' }}>
          {/* Breadcrumb */}
          <nav
            aria-label="Breadcrumb"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.875rem',
              color: 'hsl(220, 20%, 75%)',
              marginBottom: '1rem',
            }}
          >
            <Link href="/" style={{ color: '#ffffff', textDecoration: 'none' }}>
              Home
            </Link>
            <ChevronRight size={14} />
            <span style={{ color: 'hsl(40, 95%, 65%)' }}>{page.title}</span>
          </nav>

          <h1
            style={{
              fontSize: '2.5rem',
              fontWeight: 800,
              lineHeight: 1.2,
              marginBottom: page.heroSubtitle ? '0.75rem' : '1rem',
              letterSpacing: '-0.02em',
            }}
          >
            {page.heroHeading || page.title}
          </h1>

          {page.heroSubtitle && (
            <p
              style={{
                fontSize: '1.125rem',
                color: 'hsl(220, 20%, 85%)',
                maxWidth: '650px',
                margin: '0 auto 1.5rem auto',
                lineHeight: 1.5,
              }}
            >
              {page.heroSubtitle}
            </p>
          )}

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1.5rem',
              fontSize: '0.8125rem',
              color: 'hsl(220, 20%, 80%)',
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Calendar size={14} />
              Updated {new Date(page.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
            {page.createdBy && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <User size={14} />
                By {page.createdBy}
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Main Content Container */}
      <div style={{ maxWidth: '960px', margin: '-2rem auto 4rem auto', padding: '0 1.5rem' }}>
        <article
          style={{
            background: '#ffffff',
            borderRadius: '16px',
            boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.05)',
            border: '1px solid hsl(220, 20%, 92%)',
            overflow: 'hidden',
          }}
        >
          {page.featuredImage && (
            <div style={{ position: 'relative', width: '100%', height: '380px', background: 'hsl(220, 20%, 95%)' }}>
              <Image
                src={page.featuredImage}
                alt={page.title}
                fill
                priority
                style={{ objectFit: 'cover' }}
              />
            </div>
          )}

          {page.content && (
            <div
              style={{
                padding: '2.5rem',
                lineHeight: 1.8,
                fontSize: '1.0625rem',
                color: 'hsl(220, 30%, 25%)',
                whiteSpace: 'pre-wrap',
                borderBottom: parsedBlocks.length > 0 ? '1px solid hsl(220, 20%, 92%)' : 'none',
              }}
            >
              {page.content}
            </div>
          )}

          {/* Structured Reusable Content Blocks */}
          {parsedBlocks.length > 0 && (
            <div style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '3rem' }}>
              {parsedBlocks.map((block) => {
                if (block.type === 'text') {
                  return (
                    <div key={block.id}>
                      {block.title && <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'hsl(220, 35%, 15%)', marginBottom: '0.75rem' }}>{block.title}</h2>}
                      {block.content && <p style={{ color: 'hsl(220, 20%, 35%)', lineHeight: 1.7, fontSize: '1rem', whiteSpace: 'pre-wrap' }}>{block.content}</p>}
                    </div>
                  )
                }

                if (block.type === 'features' && block.items) {
                  return (
                    <div key={block.id}>
                      {block.title && <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'hsl(220, 35%, 15%)', marginBottom: '1.25rem' }}>{block.title}</h2>}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
                        {block.items.map((item, idx) => (
                          <div
                            key={idx}
                            style={{
                              background: 'hsl(220, 20%, 98%)',
                              border: '1px solid hsl(220, 20%, 90%)',
                              borderRadius: '12px',
                              padding: '1.25rem',
                            }}
                          >
                            {item.badge && (
                              <span style={{ fontSize: '0.6875rem', fontWeight: 700, background: 'hsl(220, 70%, 93%)', color: 'hsl(220, 70%, 35%)', padding: '0.2rem 0.5rem', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                {item.badge}
                              </span>
                            )}
                            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'hsl(220, 35%, 15%)', margin: item.badge ? '0.5rem 0 0.25rem 0' : '0 0 0.25rem 0' }}>
                              {item.title}
                            </h3>
                            {item.description && (
                              <p style={{ fontSize: '0.875rem', color: 'hsl(220, 15%, 45%)', lineHeight: 1.5, margin: 0 }}>
                                {item.description}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                }

                if (block.type === 'stats' && block.items) {
                  return (
                    <div
                      key={block.id}
                      style={{
                        background: 'linear-gradient(135deg, hsl(220, 70%, 25%), hsl(220, 60%, 15%))',
                        color: '#ffffff',
                        borderRadius: '12px',
                        padding: '2rem 1.5rem',
                      }}
                    >
                      {block.title && <h2 style={{ fontSize: '1.35rem', fontWeight: 700, textAlign: 'center', marginBottom: '1.5rem', color: '#ffffff' }}>{block.title}</h2>}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.5rem', textAlign: 'center' }}>
                        {block.items.map((stat, idx) => (
                          <div key={idx}>
                            <div style={{ fontSize: '2.25rem', fontWeight: 800, color: 'hsl(40, 95%, 60%)', lineHeight: 1 }}>{stat.value}</div>
                            <div style={{ fontSize: '0.875rem', color: 'hsl(220, 20%, 85%)', marginTop: '0.35rem' }}>{stat.label}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                }

                if (block.type === 'cta') {
                  return (
                    <div
                      key={block.id}
                      style={{
                        background: 'hsl(40, 95%, 96%)',
                        border: '1px solid hsl(40, 90%, 80%)',
                        borderRadius: '12px',
                        padding: '2rem',
                        textAlign: 'center',
                      }}
                    >
                      {block.title && <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'hsl(25, 80%, 20%)', margin: '0 0 0.5rem 0' }}>{block.title}</h2>}
                      {block.content && <p style={{ color: 'hsl(25, 60%, 30%)', fontSize: '0.9375rem', maxWidth: '600px', margin: '0 auto 1.25rem auto' }}>{block.content}</p>}
                      {block.ctaText && block.ctaUrl && (
                        <Link
                          href={block.ctaUrl}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            background: 'hsl(220, 70%, 35%)',
                            color: '#ffffff',
                            fontWeight: 600,
                            fontSize: '0.875rem',
                            padding: '0.75rem 1.5rem',
                            borderRadius: '8px',
                            textDecoration: 'none',
                          }}
                        >
                          <span>{block.ctaText}</span>
                          <ArrowRight size={16} />
                        </Link>
                      )}
                    </div>
                  )
                }

                return null
              })}
            </div>
          )}
        </article>
      </div>
    </main>
  )
}

