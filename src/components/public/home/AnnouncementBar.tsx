'use client'

import { useEffect, useRef, useState } from 'react'
import { Megaphone } from 'lucide-react'
import Link from 'next/link'
import styles from './AnnouncementBar.module.css'

interface Notice {
  id: string
  title: string
  isImportant: boolean
}

export function AnnouncementBar({ notices }: { notices: Notice[] }) {
  const texts = notices.map(n => n.title)
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % texts.length), 4000)
    return () => clearInterval(t)
  }, [texts.length])

  return (
    <div className={styles.bar} role="marquee" aria-live="polite">
      <div className="container">
        <div className={styles.inner}>
          <div className={styles.label}>
            <Megaphone size={14} />
            Latest News
          </div>
          <div className={styles.ticker}>
            <span key={idx} className={styles.text}>
              {texts[idx]}
            </span>
          </div>
          <Link href="/notices" className={styles.viewAll}>View All →</Link>
        </div>
      </div>
    </div>
  )
}
