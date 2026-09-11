'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { PublicCard } from '@/components/ui/Card'
import { Search, GraduationCap, Briefcase, Award } from 'lucide-react'

interface Teacher {
  id: string
  name: string
  designation: string
  qualification: string
  department: string
  bio?: string | null
  photo?: string | null
  experience?: string | null
  specialization?: string | null
}

interface TeachersClientProps {
  teachers: Teacher[]
}

export function TeachersClient({ teachers }: TeachersClientProps) {
  const [selectedDept, setSelectedDept] = useState('all')
  const [search, setSearch] = useState('')

  const departments = ['all', ...Array.from(new Set(teachers.map((t) => t.department).filter(Boolean)))]

  const filtered = teachers.filter((t) => {
    const matchDept = selectedDept === 'all' || t.department === selectedDept
    const matchSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.designation.toLowerCase().includes(search.toLowerCase()) ||
      t.qualification.toLowerCase().includes(search.toLowerCase()) ||
      (t.specialization && t.specialization.toLowerCase().includes(search.toLowerCase()))
    return matchDept && matchSearch
  })

  return (
    <div>
      {/* Search & Department Filters */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ maxWidth: '480px', margin: '0 auto 1.5rem auto', position: 'relative' }}>
          <Search
            size={16}
            style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'hsl(220, 15%, 50%)' }}
          />
          <input
            type="text"
            placeholder="Search faculty by name, designation or subject..."
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

        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          {departments.map((dept) => (
            <button
              key={dept}
              type="button"
              onClick={() => setSelectedDept(dept)}
              style={{
                padding: '0.45rem 1rem',
                borderRadius: '20px',
                border: '1px solid',
                borderColor: selectedDept === dept ? 'var(--color-primary, hsl(220, 65%, 28%))' : 'hsl(220, 20%, 88%)',
                background: selectedDept === dept ? 'var(--color-primary, hsl(220, 65%, 28%))' : '#ffffff',
                color: selectedDept === dept ? '#ffffff' : 'hsl(220, 20%, 35%)',
                fontSize: '0.8125rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {dept === 'all' ? 'All Departments' : dept}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'hsl(220, 15%, 50%)' }}>
          <p style={{ margin: 0, fontSize: '1.0625rem' }}>No faculty members match your selected criteria.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
          {filtered.map((t) => (
            <PublicCard
              key={t.id}
              style={{
                padding: '2rem',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              {/* Photo or Initials Avatar */}
              <div
                style={{
                  position: 'relative',
                  width: '84px',
                  height: '84px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  background: 'var(--color-primary-muted, hsl(220, 65%, 94%))',
                  marginBottom: '1.25rem',
                  border: '3px solid #ffffff',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {t.photo ? (
                  <Image src={t.photo} alt={t.name} fill sizes="84px" style={{ objectFit: 'cover' }} />
                ) : (
                  <span style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                    {t.name.charAt(0)}
                  </span>
                )}
              </div>

              <span
                style={{
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: 'var(--color-primary)',
                  background: 'var(--color-primary-muted, hsl(220, 65%, 95%))',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  marginBottom: '0.5rem',
                }}
              >
                {t.department}
              </span>

              <h3 style={{ fontSize: '1.1875rem', fontWeight: 700, color: 'var(--color-text)', margin: '0 0 0.25rem 0' }}>
                {t.name}
              </h3>

              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-accent, hsl(40, 92%, 45%))', marginBottom: '0.5rem' }}>
                {t.designation}
              </div>

              {t.qualification && (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginBottom: '0.75rem' }}>
                  <GraduationCap size={14} />
                  <span>{t.qualification}</span>
                </div>
              )}

              {t.experience && (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', color: 'hsl(220, 15%, 50%)', marginBottom: '0.75rem' }}>
                  <Briefcase size={12} />
                  <span>Experience: {t.experience}</span>
                </div>
              )}

              {t.bio && (
                <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', lineHeight: 1.5, margin: '0 0 0.5rem 0', flex: 1 }}>
                  {t.bio}
                </p>
              )}
            </PublicCard>
          ))}
        </div>
      )}
    </div>
  )
}
