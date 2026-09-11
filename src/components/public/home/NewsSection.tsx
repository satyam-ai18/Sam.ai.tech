import Link from 'next/link'
import { formatDateShort, truncate } from '@/lib/utils'
import { Calendar, ArrowRight } from 'lucide-react'
import styles from './NewsSection.module.css'

interface NewsItem {
  id: string
  title: string
  slug: string
  excerpt?: string | null
  featuredImage?: string | null
  category: string
  author: string
  publishedAt?: Date | null
}

export function NewsSection({ news }: { news: NewsItem[] }) {
  const [featured, ...rest] = news

  return (
    <section className={`section ${styles.section}`} id="news" aria-labelledby="news-heading">
      <div className="container">
        <div className={styles.header}>
          <div>
            <div className="section-badge primary">News & Updates</div>
            <h2 id="news-heading" className="section-title" style={{ textAlign: 'left', marginInline: 0, marginBottom: 0 }}>
              Latest News
            </h2>
          </div>
          <Link href="/news" className="btn btn-outline btn-sm">
            All News <ArrowRight size={15} />
          </Link>
        </div>

        <div className={styles.grid}>
          {/* Featured */}
          {featured && (
            <Link href={`/news/${featured.slug}`} className={styles.featuredCard}>
              <div className={styles.featuredImg}>
                {featured.featuredImage ? (
                  <img src={featured.featuredImage} alt={featured.title} className={styles.img} loading="lazy" />
                ) : (
                  <div className={styles.imgPlaceholder} />
                )}
                <span className={styles.categoryBadge}>{featured.category}</span>
              </div>
              <div className={styles.featuredBody}>
                <div className={styles.meta}>
                  <Calendar size={13} />
                  {featured.publishedAt ? formatDateShort(featured.publishedAt) : 'Recent'}
                  <span>·</span>
                  {featured.author}
                </div>
                <h3 className={styles.featuredTitle}>{featured.title}</h3>
                {featured.excerpt && <p className={styles.excerpt}>{truncate(featured.excerpt, 140)}</p>}
                <span className={styles.readMore}>Read More →</span>
              </div>
            </Link>
          )}

          {/* Side list */}
          <div className={styles.sideList}>
            {rest.map(item => (
              <Link key={item.id} href={`/news/${item.slug}`} className={styles.newsCard}>
                <div className={styles.newsImg}>
                  {item.featuredImage ? (
                    <img src={item.featuredImage} alt={item.title} className={styles.img} loading="lazy" />
                  ) : (
                    <div className={styles.imgPlaceholder} />
                  )}
                </div>
                <div className={styles.newsBody}>
                  <div className={styles.meta}>
                    <span className={styles.newsCat}>{item.category}</span>
                    <span className={styles.newsDate}>{item.publishedAt ? formatDateShort(item.publishedAt) : 'Recent'}</span>
                  </div>
                  <h3 className={styles.newsTitle}>{truncate(item.title, 70)}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
