'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import styles from './GalleryPreview.module.css'
import { Images } from 'lucide-react'

interface GalleryAlbum {
  id: string
  title: string
  slug: string
  category: string
  media: { id: string; url: string; caption?: string | null }[]
}

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
}
const itemVariants = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
}

export function GalleryPreview({ albums }: { albums: GalleryAlbum[] }) {
  const allImages = albums.flatMap(a => a.media.map(m => ({ ...m, albumTitle: a.title })))
  const featured = allImages.slice(0, 8)

  return (
    <section className={`section ${styles.section}`} id="gallery" aria-labelledby="gallery-heading">
      <div className="container">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          viewport={{ once: true, amount: 0.4 }}
        >
          <div className="section-badge primary">Gallery</div>
          <h2 id="gallery-heading" className="section-title">Life at MK Convent</h2>
          <div className="section-divider" />
          <p className="section-subtitle">
            Glimpses of our vibrant campus life, events, sports, and celebrations.
          </p>
        </motion.div>

        {featured.length > 0 ? (
          <motion.div
            className={styles.masonryGrid}
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
          >
            {featured.map((img, i) => (
              <motion.div
                key={img.id}
                className={`${styles.item} ${i === 0 ? styles.featured : ''}`}
                variants={itemVariants}
                whileHover={{ scale: 1.03, transition: { duration: 0.25 } }}
              >
                <img src={img.url} alt={img.caption || img.albumTitle} className={styles.img} loading="lazy" />
                <div className={styles.overlay}>
                  <span className={styles.caption}>{img.caption || img.albumTitle}</span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className={styles.placeholder}>
            <Images size={48} />
            <p>Gallery photos will appear here once uploaded.</p>
          </div>
        )}

        <motion.div
          className={styles.cta}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <Link href="/gallery" className="btn btn-primary">
            View Full Gallery
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
