'use client'

import React, { useState, useEffect } from 'react'
import { Modal } from './Modal'
import { SearchInput } from './SearchInput'
import { Upload, Image as ImageIcon, Check, Loader2 } from 'lucide-react'

interface MediaItem {
  id: string
  url: string
  originalName: string
  altText?: string | null
  type: string
  size: number
}

interface MediaPickerModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (media: { url: string; altText?: string }) => void
  title?: string
}

export function MediaPickerModal({
  isOpen,
  onClose,
  onSelect,
  title = 'Select Image from Media Library',
}: MediaPickerModalProps) {
  const [items, setItems] = useState<MediaItem[]>([])
  const [search, setSearch] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null)
  const [selectedAlt, setSelectedAlt] = useState<string>('')

  const fetchMedia = async (query = '') => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/admin/media?search=${encodeURIComponent(query)}`)
      const json = await res.json()
      if (json.success) {
        // Filter for images only
        const imageItems = (json.data || []).filter((item: MediaItem) =>
          item.type === 'image' || /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(item.url)
        )
        setItems(imageItems)
      }
    } catch (err) {
      console.error('Failed to load media:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      fetchMedia(search)
    }
  }, [isOpen])

  const handleSearchChange = (val: string) => {
    setSearch(val)
    fetchMedia(val)
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('altText', file.name.split('.')[0])

      const res = await fetch('/api/admin/media', {
        method: 'POST',
        body: formData,
      })
      const json = await res.json()
      if (json.success && json.data) {
        setSelectedUrl(json.data.url)
        setSelectedAlt(json.data.altText || '')
        await fetchMedia()
      }
    } catch (err) {
      console.error('Upload failed:', err)
    } finally {
      setIsUploading(false)
    }
  }

  const handleConfirm = () => {
    if (selectedUrl) {
      onSelect({ url: selectedUrl, altText: selectedAlt })
      onClose()
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      maxWidth="lg"
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
          <label
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              border: '1px solid hsl(220, 20%, 80%)',
              background: '#ffffff',
              color: 'hsl(220, 25%, 30%)',
              fontSize: '0.8125rem',
              fontWeight: 600,
              cursor: isUploading ? 'not-allowed' : 'pointer',
            }}
          >
            {isUploading ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <Upload size={15} />}
            <span>{isUploading ? 'Uploading...' : 'Upload New'}</span>
            <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileUpload} disabled={isUploading} />
          </label>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                border: '1px solid hsl(220, 20%, 85%)',
                background: '#ffffff',
                fontSize: '0.875rem',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!selectedUrl}
              onClick={handleConfirm}
              style={{
                padding: '0.5rem 1.25rem',
                borderRadius: '8px',
                border: 'none',
                background: 'hsl(220, 70%, 35%)',
                color: '#ffffff',
                fontWeight: 600,
                fontSize: '0.875rem',
                cursor: selectedUrl ? 'pointer' : 'not-allowed',
                opacity: selectedUrl ? 1 : 0.5,
              }}
            >
              Select Image
            </button>
          </div>
        </div>
      }
    >
      <div style={{ marginBottom: '1.25rem' }}>
        <SearchInput value={search} onChange={handleSearchChange} placeholder="Search media by name or alt..." />
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem', color: 'hsl(220, 70%, 45%)' }}>
          <Loader2 size={28} style={{ animation: 'spin 1s linear infinite' }} />
        </div>
      ) : items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'hsl(220, 15%, 50%)' }}>
          <ImageIcon size={36} style={{ opacity: 0.5, marginBottom: '0.5rem' }} />
          <p style={{ margin: 0, fontSize: '0.875rem' }}>No images found in Media Library. Upload one below.</p>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
            gap: '0.75rem',
            maxHeight: '380px',
            overflowY: 'auto',
            padding: '0.25rem',
          }}
        >
          {items.map((item) => {
            const isSelected = selectedUrl === item.url

            return (
              <div
                key={item.id}
                onClick={() => {
                  setSelectedUrl(item.url)
                  setSelectedAlt(item.altText || item.originalName)
                }}
                style={{
                  position: 'relative',
                  aspectRatio: '1 / 1',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  border: isSelected ? '3px solid hsl(220, 70%, 45%)' : '1px solid hsl(220, 20%, 88%)',
                  background: 'hsl(220, 20%, 96%)',
                  boxShadow: isSelected ? '0 0 0 2px rgba(37, 99, 235, 0.3)' : 'none',
                }}
              >
                <img
                  src={item.url}
                  alt={item.altText || item.originalName}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                {isSelected && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '6px',
                      right: '6px',
                      width: '22px',
                      height: '22px',
                      borderRadius: '50%',
                      background: 'hsl(220, 70%, 45%)',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Check size={14} strokeWidth={3} />
                  </div>
                )}
                <div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)',
                    padding: '0.75rem 0.4rem 0.3rem 0.4rem',
                    color: '#ffffff',
                    fontSize: '0.6875rem',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {item.originalName}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </Modal>
  )
}
