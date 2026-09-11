'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  ChevronLeft,
  ChevronRight,
  X,
  Calendar,
  Tag,
  ArrowLeft,
  Eye,
  Images,
} from 'lucide-react'

interface MediaItem {
  id: string
  url: string
  caption?: string | null
  altText?: string | null
}

interface Album {
  id: string
  title: string
  slug: string
  description?: string | null
  coverImage?: string | null
  category: string
  eventDate?: string | null
  media: MediaItem[]
}

interface AlbumDetailClientProps {
  album: Album
}

export function AlbumDetailClient({ album }: AlbumDetailClientProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const handleNext = useCallback(() => {
    if (lightboxIndex !== null) {
      setLightboxIndex((prev) => ((prev! + 1) % album.media.length))
    }
  }, [lightboxIndex, album.media.length])

  const handlePrev = useCallback(() => {
    if (lightboxIndex !== null) {
      setLightboxIndex((prev) => (prev! - 1 + album.media.length) % album.media.length)
    }
  }, [lightboxIndex, album.media.length])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (lightboxIndex === null) return
      if (e.key === 'Escape') setLightboxIndex(null)
      if (e.key === 'ArrowRight') handleNext()
      if (e.key === 'ArrowLeft') handlePrev()
    },
    [lightboxIndex, handleNext, handlePrev]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return (
    <div>
      {/* Back Link and Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <Link
          href="/gallery"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            color: 'var(--color-primary, hsl(220, 65%, 28%))',
            fontSize: '0.9375rem',
            fontWeight: 600,
            textDecoration: 'none',
            marginBottom: '1.5rem',
          }}
        >
          <ArrowLeft size={16} /> Back to All Albums
        </Link>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
          <span
            style={{
              padding: '0.25rem 0.75rem',
              borderRadius: '20px',
              background: 'var(--color-primary-muted, hsl(220, 65%, 95%))',
              color: 'var(--color-primary, hsl(220, 65%, 28%))',
              fontSize: '0.8125rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            {album.category}
          </span>
          {album.eventDate && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.875rem', color: 'var(--color-text-muted, hsl(220, 15%, 50%))' }}>
              <Calendar size={14} />
              {new Date(album.eventDate).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          )}
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.875rem', color: 'var(--color-text-muted, hsl(220, 15%, 50%))' }}>
            <Images size={14} />
            {album.media.length} Photographs
          </span>
        </div>

        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--color-text, hsl(220, 35%, 15%))', margin: '0 0 1rem 0' }}>
          {album.title}
        </h1>

        {album.description && (
          <p style={{ fontSize: '1.0625rem', color: 'var(--color-text-muted, hsl(220, 15%, 45%))', maxWidth: '800px', lineHeight: 1.7, margin: 0 }}>
            {album.description}
          </p>
        )}
      </div>

      {/* Image Gallery Grid */}
      {album.media.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', background: '#f8fafc', borderRadius: '12px', border: '1px dashed hsl(220, 20%, 88%)' }}>
          <p style={{ fontSize: '1.0625rem', color: 'hsl(220, 15%, 45%)', margin: 0 }}>
            No photos have been uploaded to this album yet.
          </p>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '1.5rem',
          }}
        >
          {album.media.map((item, idx) => (
            <button
              key={item.id}
              type="button"
              aria-label={`View photograph ${idx + 1}: ${item.caption || album.title}`}
              onClick={() => setLightboxIndex(idx)}
              style={{
                position: 'relative',
                borderRadius: '12px',
                overflow: 'hidden',
                aspectRatio: '4/3',
                background: 'hsl(220, 20%, 94%)',
                cursor: 'pointer',
                border: 'none',
                padding: 0,
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                display: 'block',
                width: '100%',
                textAlign: 'left',
              }}
            >
              <Image
                src={item.url}
                alt={item.altText || item.caption || album.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                loading="lazy"
                style={{ objectFit: 'cover' }}
              />

              {/* Hover overlay */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, rgba(15, 23, 42, 0.75) 0%, transparent 60%)',
                  opacity: 0,
                  transition: 'opacity 0.2s ease',
                  display: 'flex',
                  alignItems: 'flex-end',
                  padding: '1rem',
                  pointerEvents: 'none',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = '0')}
              >
                <div style={{ color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.caption || 'Click to expand'}
                  </span>
                  <Eye size={16} />
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Lightbox with Next / Previous & Keyboard Access */}
      {lightboxIndex !== null && album.media[lightboxIndex] && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Image viewer"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 2000,
            background: 'rgba(10, 15, 30, 0.95)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
          }}
          onClick={() => setLightboxIndex(null)}
        >
          {/* Top toolbar */}
          <div
            style={{
              position: 'absolute',
              top: '1.5rem',
              left: '1.5rem',
              right: '1.5rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              zIndex: 2010,
              color: '#ffffff',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <span style={{ fontSize: '0.9375rem', fontWeight: 600, opacity: 0.85 }}>
              Photo {lightboxIndex + 1} of {album.media.length}
            </span>
            <button
              type="button"
              aria-label="Close photo viewer"
              onClick={() => setLightboxIndex(null)}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.15)',
                border: 'none',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'background 0.15s ease',
              }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Previous Arrow */}
          <button
            type="button"
            aria-label="Previous photograph"
            onClick={(e) => {
              e.stopPropagation()
              handlePrev()
            }}
            style={{
              position: 'absolute',
              left: '1.5rem',
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 2010,
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.15)',
              border: 'none',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <ChevronLeft size={28} />
          </button>

          {/* Next Arrow */}
          <button
            type="button"
            aria-label="Next photograph"
            onClick={(e) => {
              e.stopPropagation()
              handleNext()
            }}
            style={{
              position: 'absolute',
              right: '1.5rem',
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 2010,
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.15)',
              border: 'none',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <ChevronRight size={28} />
          </button>

          {/* Centered Image */}
          <div
            style={{
              position: 'relative',
              width: '85vw',
              maxWidth: '1100px',
              height: '70vh',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={album.media[lightboxIndex].url}
              alt={album.media[lightboxIndex].altText || album.media[lightboxIndex].caption || album.title}
              fill
              sizes="100vw"
              priority
              style={{ objectFit: 'contain' }}
            />
          </div>

          {/* Caption */}
          {album.media[lightboxIndex].caption && (
            <div
              style={{
                position: 'absolute',
                bottom: '1.5rem',
                color: '#ffffff',
                background: 'rgba(0, 0, 0, 0.65)',
                padding: '0.625rem 1.25rem',
                borderRadius: '8px',
                fontSize: '0.9375rem',
                maxWidth: '80vw',
                textAlign: 'center',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {album.media[lightboxIndex].caption}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
