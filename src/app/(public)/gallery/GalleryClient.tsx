'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { Images, X, ChevronLeft, ChevronRight, Eye } from 'lucide-react'

interface MediaItem {
  id: string
  url: string
  caption?: string | null
  altText?: string | null
}

interface AlbumItem {
  id: string
  title: string
  slug: string
  description?: string | null
  coverImage?: string | null
  category: string
  media: MediaItem[]
}

interface GalleryClientProps {
  albums: AlbumItem[]
}

export function GalleryClient({ albums }: GalleryClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [activeAlbum, setActiveAlbum] = useState<AlbumItem | null>(null)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const categories = ['all', ...Array.from(new Set(albums.map((a) => a.category)))]

  const filteredAlbums = albums.filter(
    (album) => selectedCategory === 'all' || album.category.toLowerCase() === selectedCategory.toLowerCase()
  )

  const activeMedia = activeAlbum?.media || []

  return (
    <div>
      {/* Category Filters */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '3rem' }}>
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            style={{
              padding: '0.5rem 1.25rem',
              borderRadius: '24px',
              border: '1px solid',
              borderColor: selectedCategory === cat ? 'hsl(220, 65%, 28%)' : 'hsl(220, 20%, 88%)',
              background: selectedCategory === cat ? 'hsl(220, 65%, 28%)' : '#ffffff',
              color: selectedCategory === cat ? '#ffffff' : 'hsl(220, 20%, 40%)',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
              textTransform: 'capitalize',
              transition: 'all 0.15s ease',
            }}
          >
            {cat === 'all' ? 'All Collections' : cat}
          </button>
        ))}
      </div>

      {/* Album Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        {filteredAlbums.map((album) => {
          const cover = album.coverImage || album.media[0]?.url || '/uploads/campus.jpg'

          return (
            <div
              key={album.id}
              onClick={() => setActiveAlbum(album)}
              style={{
                background: '#ffffff',
                borderRadius: '16px',
                border: '1px solid hsl(220, 20%, 90%)',
                overflow: 'hidden',
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.04)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              }}
            >
              <div style={{ position: 'relative', width: '100%', height: '220px', background: 'hsl(220, 20%, 95%)' }}>
                <Image
                  src={cover}
                  alt={album.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 360px"
                  style={{ objectFit: 'cover' }}
                />
                <div
                  style={{
                    position: 'absolute',
                    top: '0.75rem',
                    right: '0.75rem',
                    background: 'rgba(15, 23, 42, 0.75)',
                    backdropFilter: 'blur(4px)',
                    color: '#ffffff',
                    padding: '0.3rem 0.65rem',
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                  }}
                >
                  <Images size={13} />
                  <span>{album.media.length} Photos</span>
                </div>
              </div>

              <div style={{ padding: '1.5rem' }}>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    color: 'hsl(40, 92%, 45%)',
                    letterSpacing: '0.05em',
                  }}
                >
                  {album.category}
                </span>
                <h3
                  style={{
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    color: 'hsl(220, 35%, 15%)',
                    margin: '0.35rem 0 0.5rem 0',
                  }}
                >
                  {album.title}
                </h3>
                {album.description && (
                  <p
                    style={{
                      fontSize: '0.875rem',
                      color: 'hsl(220, 15%, 45%)',
                      lineHeight: 1.5,
                      margin: 0,
                    }}
                  >
                    {album.description}
                  </p>
                )}

                <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid hsl(220, 20%, 94%)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <a
                    href={`/gallery/${album.slug}`}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      color: 'hsl(220, 65%, 28%)',
                      textDecoration: 'none',
                    }}
                  >
                    View Album Page &rarr;
                  </a>
                  <span style={{ fontSize: '0.75rem', color: 'hsl(220, 15%, 55%)' }}>Quick Preview</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Album Viewer Modal */}
      {activeAlbum && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 90,
            background: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
          }}
          onClick={() => setActiveAlbum(null)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              maxWidth: '960px',
              width: '100%',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              overflow: 'hidden',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                padding: '1.25rem 1.75rem',
                borderBottom: '1px solid hsl(220, 20%, 90%)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'hsl(220, 35%, 15%)' }}>
                  {activeAlbum.title}
                </h2>
                <span style={{ fontSize: '0.8125rem', color: 'hsl(220, 15%, 50%)' }}>
                  {activeAlbum.media.length} Photographs
                </span>
              </div>
              <button
                type="button"
                onClick={() => setActiveAlbum(null)}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'hsl(220, 15%, 50%)' }}
              >
                <X size={22} />
              </button>
            </div>

            <div style={{ padding: '1.75rem', overflowY: 'auto' }}>
              {activeAlbum.media.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'hsl(220, 15%, 50%)' }}>
                  No photos uploaded to this album yet.
                </div>
              ) : (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                    gap: '1rem',
                  }}
                >
                  {activeAlbum.media.map((img, idx) => (
                    <div
                      key={img.id}
                      onClick={() => setLightboxIndex(idx)}
                      style={{
                        position: 'relative',
                        height: '160px',
                        borderRadius: '10px',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        background: 'hsl(220, 20%, 95%)',
                      }}
                    >
                      <Image
                        src={img.url}
                        alt={img.altText || activeAlbum.title}
                        fill
                        sizes="(max-width: 768px) 50vw, 220px"
                        style={{ objectFit: 'cover' }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      {lightboxIndex !== null && activeMedia[lightboxIndex] && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            background: 'rgba(0, 0, 0, 0.95)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
          onClick={() => setLightboxIndex(null)}
        >
          <button
            type="button"
            onClick={() => setLightboxIndex(null)}
            style={{
              position: 'absolute',
              top: '1.5rem',
              right: '1.5rem',
              background: 'transparent',
              border: 'none',
              color: '#ffffff',
              cursor: 'pointer',
              zIndex: 110,
            }}
          >
            <X size={28} />
          </button>

          {/* Previous Image */}
          {lightboxIndex > 0 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setLightboxIndex(lightboxIndex - 1)
              }}
              style={{
                position: 'absolute',
                left: '1.5rem',
                background: 'rgba(255, 255, 255, 0.15)',
                border: 'none',
                color: '#ffffff',
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                zIndex: 110,
              }}
            >
              <ChevronLeft size={28} />
            </button>
          )}

          {/* Image */}
          <div
            style={{
              position: 'relative',
              width: '1000px',
              maxWidth: '90vw',
              height: '80vh',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={activeMedia[lightboxIndex].url}
              alt={activeMedia[lightboxIndex].altText || activeAlbum?.title || 'Gallery image'}
              fill
              style={{ objectFit: 'contain' }}
            />
            {activeMedia[lightboxIndex].caption && (
              <div
                style={{
                  position: 'absolute',
                  bottom: '1rem',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: 'rgba(0, 0, 0, 0.75)',
                  color: '#ffffff',
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                }}
              >
                {activeMedia[lightboxIndex].caption}
              </div>
            )}
          </div>

          {/* Next Image */}
          {lightboxIndex < activeMedia.length - 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setLightboxIndex(lightboxIndex + 1)
              }}
              style={{
                position: 'absolute',
                right: '1.5rem',
                background: 'rgba(255, 255, 255, 0.15)',
                border: 'none',
                color: '#ffffff',
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                zIndex: 110,
              }}
            >
              <ChevronRight size={28} />
            </button>
          )}
        </div>
      )}
    </div>
  )
}
