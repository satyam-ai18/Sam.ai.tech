import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { prisma } from '@/lib/db'
import Link from 'next/link'
import Image from 'next/image'
import { Calendar, User, Tag, ChevronRight, ArrowLeft, Share2, Clock } from 'lucide-react'
import { SCHOOL_INFO } from '@/lib/constants'

interface NewsDetailProps {
  params: Promise<{ slug: string }>
}

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: NewsDetailProps): Promise<Metadata> {
  const { slug } = await params
  const article = await prisma.news.findUnique({
    where: { slug },
  })

  if (!article || article.status !== 'PUBLISHED') {
    return { title: `News Article Not Found | ${SCHOOL_INFO.name}` }
  }

  return {
    title: article.seoTitle || `${article.title} | ${SCHOOL_INFO.name}`,
    description: article.seoDescription || article.excerpt || article.title,
    openGraph: {
      title: article.seoTitle || article.title,
      description: article.seoDescription || article.excerpt || undefined,
      images: article.featuredImage ? [article.featuredImage] : undefined,
    },
  }
}

export default async function NewsDetailPage({ params }: NewsDetailProps) {
  const { slug } = await params
  const article = await prisma.news.findUnique({
    where: { slug },
  })

  if (!article || article.status !== 'PUBLISHED') {
    notFound()
  }

  // Fetch 3 related news articles
  const relatedNews = await prisma.news.findMany({
    where: {
      status: 'PUBLISHED',
      NOT: { id: article.id },
    },
    take: 3,
    orderBy: { publishedAt: 'desc' },
  })

  const publishDate = article.publishedAt || article.createdAt

  return (
    <main style={{ minHeight: '80vh', background: 'hsl(220, 20%, 98%)' }}>
      {/* Header Banner */}
      <section
        style={{
          background: 'linear-gradient(135deg, hsl(220, 65%, 22%) 0%, hsl(220, 55%, 14%) 100%)',
          color: '#ffffff',
          padding: '3.5rem 1.5rem 3rem 1.5rem',
        }}
      >
        <div style={{ maxWidth: '840px', margin: '0 auto' }}>
          {/* Breadcrumbs */}
          <nav
            aria-label="Breadcrumbs"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.8125rem',
              color: 'hsl(220, 20%, 75%)',
              marginBottom: '1.25rem',
            }}
          >
            <Link href="/" style={{ color: '#ffffff', textDecoration: 'none' }}>
              Home
            </Link>
            <ChevronRight size={13} />
            <Link href="/news" style={{ color: '#ffffff', textDecoration: 'none' }}>
              School News
            </Link>
            <ChevronRight size={13} />
            <span style={{ color: 'hsl(40, 95%, 65%)' }}>{article.category}</span>
          </nav>

          <span
            style={{
              display: 'inline-block',
              padding: '0.25rem 0.75rem',
              borderRadius: '4px',
              background: 'hsl(40, 92%, 50%)',
              color: 'hsl(220, 35%, 15%)',
              fontSize: '0.75rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '1rem',
            }}
          >
            {article.category}
          </span>

          <h1
            style={{
              fontSize: '2.5rem',
              fontWeight: 800,
              lineHeight: 1.25,
              margin: '0 0 1.25rem 0',
              fontFamily: 'var(--font-heading, Playfair Display, serif)',
            }}
          >
            {article.title}
          </h1>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1.5rem',
              fontSize: '0.8125rem',
              color: 'hsl(220, 20%, 80%)',
              flexWrap: 'wrap',
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Calendar size={14} />
              {new Date(publishDate).toLocaleDateString(undefined, {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <User size={14} />
              By {article.author}
            </span>
          </div>
        </div>
      </section>

      {/* Article Content */}
      <div style={{ maxWidth: '840px', margin: '-1.5rem auto 4rem auto', padding: '0 1.5rem' }}>
        <article
          style={{
            background: '#ffffff',
            borderRadius: '16px',
            boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.05)',
            border: '1px solid hsl(220, 20%, 92%)',
            overflow: 'hidden',
          }}
        >
          {article.featuredImage && (
            <div style={{ position: 'relative', width: '100%', height: '380px', background: 'hsl(220, 20%, 95%)' }}>
              <Image
                src={article.featuredImage}
                alt={article.title}
                fill
                priority
                style={{ objectFit: 'cover' }}
              />
            </div>
          )}

          <div style={{ padding: '2.5rem' }}>
            {article.excerpt && (
              <p
                style={{
                  fontSize: '1.1875rem',
                  fontWeight: 500,
                  color: 'hsl(220, 40%, 25%)',
                  lineHeight: 1.6,
                  borderLeft: '4px solid hsl(40, 92%, 50%)',
                  paddingLeft: '1.25rem',
                  margin: '0 0 2rem 0',
                }}
              >
                {article.excerpt}
              </p>
            )}

            <div
              style={{
                fontSize: '1.0625rem',
                lineHeight: 1.8,
                color: 'hsl(220, 25%, 25%)',
                whiteSpace: 'pre-wrap',
              }}
            >
              {article.content}
            </div>

            {/* Back link */}
            <div
              style={{
                borderTop: '1px solid hsl(220, 20%, 92%)',
                marginTop: '3rem',
                paddingTop: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Link
                href="/news"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  color: 'hsl(220, 65%, 28%)',
                  textDecoration: 'none',
                }}
              >
                <ArrowLeft size={16} />
                <span>Back to All School News</span>
              </Link>
            </div>
          </div>
        </article>

        {/* Related News */}
        {relatedNews.length > 0 && (
          <div style={{ marginTop: '3.5rem' }}>
            <h3
              style={{
                fontSize: '1.5rem',
                fontFamily: 'var(--font-heading, Playfair Display, serif)',
                fontWeight: 700,
                color: 'hsl(220, 35%, 15%)',
                marginBottom: '1.5rem',
              }}
            >
              More Recent Stories
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
              {relatedNews.map((rn) => (
                <Link
                  key={rn.id}
                  href={`/news/${rn.slug}`}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <div
                    style={{
                      background: '#ffffff',
                      borderRadius: '12px',
                      border: '1px solid hsl(220, 20%, 90%)',
                      overflow: 'hidden',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    {rn.featuredImage && (
                      <div style={{ position: 'relative', width: '100%', height: '140px' }}>
                        <Image src={rn.featuredImage} alt={rn.title} fill style={{ objectFit: 'cover' }} />
                      </div>
                    )}
                    <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'hsl(40, 92%, 45%)', textTransform: 'uppercase' }}>
                          {rn.category}
                        </span>
                        <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: '0.35rem 0', color: 'hsl(220, 35%, 15%)' }}>
                          {rn.title}
                        </h4>
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'hsl(220, 15%, 55%)' }}>
                        {new Date(rn.publishedAt || rn.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
