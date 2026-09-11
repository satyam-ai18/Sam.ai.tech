'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { PublicCard } from '@/components/ui/Card'
import { Trophy, Award, Calendar, Search, Medal } from 'lucide-react'

interface Achievement {
  id: string
  title: string
  description?: string | null
  studentName?: string | null
  category: string
  award?: string | null
  position?: string | null
  date?: string | null
  year?: string | null
  image?: string | null
}

interface AchievementsClientProps {
  achievements: Achievement[]
}

export function AchievementsClient({ achievements }: AchievementsClientProps) {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedYear, setSelectedYear] = useState('all')
  const [search, setSearch] = useState('')

  const categories = ['all', ...Array.from(new Set(achievements.map((a) => a.category).filter((c): c is string => Boolean(c))))]
  const years = ['all', ...Array.from(new Set(achievements.map((a) => a.year).filter((y): y is string => Boolean(y))))]

  const filtered = achievements.filter((a) => {
    const matchCat = selectedCategory === 'all' || a.category === selectedCategory
    const matchYear = selectedYear === 'all' || a.year === selectedYear
    const matchSearch =
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      (a.studentName && a.studentName.toLowerCase().includes(search.toLowerCase())) ||
      (a.award && a.award.toLowerCase().includes(search.toLowerCase()))
    return matchCat && matchYear && matchSearch
  })

  return (
    <div>
      {/* Search and Filters */}
      <div style={{ marginBottom: '3rem' }}>
        <div style={{ maxWidth: '480px', margin: '0 auto 1.5rem auto', position: 'relative' }}>
          <Search
            size={16}
            style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'hsl(220, 15%, 50%)' }}
          />
          <input
            type="text"
            placeholder="Search honors, student names, medals..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '0.625rem 1rem 0.625rem 2.75rem',
              borderRadius: '24px',
              border: '1px solid hsl(220, 20%, 85%)',
              background: '#ffffff',
              fontSize: '0.875rem',
              outline: 'none',
              boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
            }}
          />
        </div>

        {/* Category filter pills */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '0.75rem' }}>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: '0.4rem 1rem',
                borderRadius: '20px',
                border: '1px solid',
                borderColor: selectedCategory === cat ? 'var(--color-primary, hsl(220, 65%, 28%))' : 'hsl(220, 20%, 88%)',
                background: selectedCategory === cat ? 'var(--color-primary, hsl(220, 65%, 28%))' : '#ffffff',
                color: selectedCategory === cat ? '#ffffff' : 'hsl(220, 20%, 35%)',
                fontSize: '0.8125rem',
                fontWeight: 600,
                cursor: 'pointer',
                textTransform: 'capitalize',
                transition: 'all 0.15s ease',
              }}
            >
              {cat === 'all' ? 'All Categories' : cat.replace('-', ' ')}
            </button>
          ))}
        </div>

        {/* Year filter if multiple years exist */}
        {years.length > 2 && (
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            {years.map((yr) => (
              <button
                key={yr}
                type="button"
                onClick={() => setSelectedYear(yr)}
                style={{
                  padding: '0.25rem 0.75rem',
                  borderRadius: '16px',
                  border: '1px solid',
                  borderColor: selectedYear === yr ? 'var(--color-accent, hsl(40, 92%, 45%))' : 'hsl(220, 20%, 90%)',
                  background: selectedYear === yr ? 'var(--color-accent, hsl(40, 92%, 45%))' : 'transparent',
                  color: selectedYear === yr ? '#ffffff' : 'hsl(220, 15%, 45%)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {yr === 'all' ? 'All Years' : yr}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'hsl(220, 15%, 50%)' }}>
          <Trophy size={48} style={{ margin: '0 auto 1rem auto', color: 'hsl(220, 15%, 70%)' }} />
          <p style={{ margin: 0, fontSize: '1.0625rem' }}>No achievements recorded in this selection.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
          {filtered.map((item) => (
            <PublicCard
              key={item.id}
              style={{
                padding: '1.75rem',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {item.image && (
                <div style={{ position: 'relative', width: '100%', height: '170px', borderRadius: '10px', overflow: 'hidden', marginBottom: '1.25rem' }}>
                  <Image src={item.image} alt={item.title} fill sizes="(max-width: 768px) 100vw, 360px" style={{ objectFit: 'cover' }} />
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span
                  style={{
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: 'var(--color-primary, hsl(220, 65%, 28%))',
                    background: 'var(--color-primary-muted, hsl(220, 65%, 95%))',
                    padding: '2px 8px',
                    borderRadius: '12px',
                  }}
                >
                  {item.category}
                </span>

                {item.year && (
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
                    {item.year}
                  </span>
                )}
              </div>

              <h3 style={{ fontSize: '1.1875rem', fontWeight: 700, color: 'var(--color-text)', margin: '0 0 0.5rem 0' }}>
                {item.title}
              </h3>

              {item.studentName && (
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-primary)', marginBottom: '0.35rem' }}>
                  Awarded to: {item.studentName}
                </div>
              )}

              {(item.position || item.award) && (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-accent, hsl(40, 92%, 45%))', marginBottom: '0.75rem' }}>
                  <Medal size={15} />
                  <span>{item.position || item.award}</span>
                </div>
              )}

              {item.description && (
                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', lineHeight: 1.6, margin: 0, flex: 1 }}>
                  {item.description}
                </p>
              )}
            </PublicCard>
          ))}
        </div>
      )}
    </div>
  )
}
