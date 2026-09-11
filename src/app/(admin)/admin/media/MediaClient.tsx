'use client'

import React, { useState, useRef } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/admin/ui/Card'
import { ConfirmDialog } from '@/components/admin/ui/ConfirmDialog'
import { useToast } from '@/components/admin/ui/Toast'
import {
  FolderOpen,
  Upload,
  Search,
  Copy,
  Trash2,
  ExternalLink,
  Eye,
  FileText,
  Loader2,
  Image as ImageIcon,
  Check,
  X,
  Filter,
  Edit2,
  RefreshCw,
  ArrowUpDown,
  Calendar,
} from 'lucide-react'
import Image from 'next/image'

interface MediaItem {
  id: string
  filename: string
  originalName: string
  title?: string | null
  caption?: string | null
  description?: string | null
  url: string
  type: string
  mimeType?: string | null
  size: number
  folder?: string | null
  altText?: string | null
  createdAt: string | Date
}

interface MediaClientProps {
  initialMedia: MediaItem[]
}

export function MediaClient({ initialMedia }: MediaClientProps) {
  const { success, error: showError } = useToast()
  const [mediaList, setMediaList] = useState<MediaItem[]>(initialMedia)
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | 'image' | 'document'>('all')
  const [dateFilter, setDateFilter] = useState<'all' | '7days' | '30days' | 'year'>('all')
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name' | 'size'>('newest')
  const [isUploading, setIsUploading] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // Preview, Edit & Delete State
  const [previewItem, setPreviewItem] = useState<MediaItem | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<MediaItem | null>(null)
  const [editItem, setEditItem] = useState<MediaItem | null>(null)
  const [editForm, setEditForm] = useState({
    title: '',
    altText: '',
    caption: '',
    description: '',
    folder: 'general',
  })
  const [isSavingEdit, setIsSavingEdit] = useState(false)

  // Replace file state
  const [replaceTarget, setReplaceTarget] = useState<MediaItem | null>(null)
  const [isReplacing, setIsReplacing] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const replaceInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)
    let uploadedCount = 0

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', 'general')
      formData.append('altText', file.name)

      try {
        const res = await fetch('/api/admin/media', {
          method: 'POST',
          body: formData,
        })
        const json = await res.json()
        if (json.success) {
          setMediaList((prev) => [json.data, ...prev])
          uploadedCount++
        } else {
          showError(json.error?.message || `Failed to upload ${file.name}`)
        }
      } catch {
        showError(`Network error uploading ${file.name}`)
      }
    }

    setIsUploading(false)
    if (uploadedCount > 0) {
      success(`Successfully uploaded ${uploadedCount} file${uploadedCount > 1 ? 's' : ''}`)
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleOpenEdit = (item: MediaItem) => {
    setEditItem(item)
    setEditForm({
      title: item.title || '',
      altText: item.altText || '',
      caption: item.caption || '',
      description: item.description || '',
      folder: item.folder || 'general',
    })
  }

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editItem) return

    setIsSavingEdit(true)
    try {
      const res = await fetch('/api/admin/media', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editItem.id,
          ...editForm,
        }),
      })
      const json = await res.json()
      if (json.success) {
        setMediaList((prev) =>
          prev.map((m) => (m.id === editItem.id ? { ...m, ...json.data } : m))
        )
        success('Metadata updated successfully')
        setEditItem(null)
      } else {
        showError(json.error?.message || 'Failed to update metadata')
      }
    } catch {
      showError('Network error updating metadata')
    } finally {
      setIsSavingEdit(false)
    }
  }

  const handleTriggerReplace = (item: MediaItem) => {
    setReplaceTarget(item)
    replaceInputRef.current?.click()
  }

  const handleReplaceFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !replaceTarget) return

    setIsReplacing(true)
    try {
      const formData = new FormData()
      formData.append('id', replaceTarget.id)
      formData.append('file', file)

      const res = await fetch('/api/admin/media', {
        method: 'PATCH',
        body: formData,
      })
      const json = await res.json()
      if (json.success) {
        setMediaList((prev) =>
          prev.map((m) => (m.id === replaceTarget.id ? json.data : m))
        )
        success(`Successfully replaced with ${file.name}`)
        setReplaceTarget(null)
      } else {
        showError(json.error?.message || 'Failed to replace file')
      }
    } catch {
      showError('Network error replacing file')
    } finally {
      setIsReplacing(false)
      if (replaceInputRef.current) replaceInputRef.current.value = ''
    }
  }

  const handleCopyUrl = (item: MediaItem) => {
    navigator.clipboard.writeText(item.url)
    setCopiedId(item.id)
    success('Media URL copied to clipboard!')
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    try {
      const res = await fetch(`/api/admin/media?id=${deleteTarget.id}`, {
        method: 'DELETE',
      })
      const json = await res.json()
      if (json.success) {
        setMediaList((prev) => prev.filter((m) => m.id !== deleteTarget.id))
        success(`Deleted: ${deleteTarget.originalName}`)
        setDeleteTarget(null)
      } else {
        showError(json.error?.message || 'Failed to delete file')
      }
    } catch {
      showError('Network error while deleting file')
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const filteredMedia = mediaList
    .filter((item) => {
      const matchesSearch =
        item.originalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.title && item.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.altText && item.altText.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.caption && item.caption.toLowerCase().includes(searchQuery.toLowerCase()))
      const matchesType = typeFilter === 'all' || item.type === typeFilter

      let matchesDate = true
      const itemTime = new Date(item.createdAt).getTime()
      if (dateFilter === '7days') {
        matchesDate = itemTime >= Date.now() - 7 * 24 * 60 * 60 * 1000
      } else if (dateFilter === '30days') {
        matchesDate = itemTime >= Date.now() - 30 * 24 * 60 * 60 * 1000
      } else if (dateFilter === 'year') {
        matchesDate = new Date(item.createdAt).getFullYear() === new Date().getFullYear()
      }

      return matchesSearch && matchesType && matchesDate
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      if (sortBy === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      if (sortBy === 'name') return a.originalName.localeCompare(b.originalName)
      if (sortBy === 'size') return b.size - a.size
      return 0
    })

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'hsl(220, 35%, 15%)', margin: 0 }}>
            Media & Asset Library
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'hsl(220, 15%, 50%)', margin: '0.25rem 0 0 0' }}>
            Upload, inspect, edit metadata, replace, and organize institutional photos, documents, and publications
          </p>
        </div>

        <button
          type="button"
          disabled={isUploading}
          onClick={() => fileInputRef.current?.click()}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.625rem 1.25rem',
            borderRadius: '8px',
            background: 'hsl(220, 70%, 35%)',
            color: '#ffffff',
            fontSize: '0.875rem',
            fontWeight: 600,
            border: 'none',
            cursor: isUploading ? 'not-allowed' : 'pointer',
          }}
        >
          {isUploading ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Upload size={16} />}
          <span>{isUploading ? 'Uploading Files...' : 'Upload Media'}</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,application/pdf"
          onChange={handleFileUpload}
          style={{ display: 'none' }}
        />
        {/* Hidden replace file input */}
        <input
          ref={replaceInputRef}
          type="file"
          accept="image/*,application/pdf"
          onChange={handleReplaceFile}
          style={{ display: 'none' }}
        />
      </div>

      {/* Filter, Sort and Search Bar */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '2 1 240px' }}>
          <Search
            size={16}
            style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'hsl(220, 15%, 50%)' }}
          />
          <input
            type="text"
            placeholder="Search media files by name, title, alt text or caption..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              height: '40px',
              paddingLeft: '2.5rem',
              paddingRight: '1rem',
              borderRadius: '8px',
              border: '1px solid hsl(220, 20%, 88%)',
              background: '#ffffff',
              fontSize: '0.875rem',
              outline: 'none',
            }}
          />
        </div>

        {/* Type Filter */}
        <div style={{ display: 'flex', gap: '0.25rem', background: 'hsl(220, 20%, 94%)', padding: '4px', borderRadius: '8px' }}>
          {(['all', 'image', 'document'] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setTypeFilter(type)}
              style={{
                padding: '0.375rem 0.75rem',
                borderRadius: '6px',
                border: 'none',
                background: typeFilter === type ? '#ffffff' : 'transparent',
                color: typeFilter === type ? 'hsl(220, 35%, 15%)' : 'hsl(220, 15%, 50%)',
                fontWeight: typeFilter === type ? 600 : 500,
                fontSize: '0.8125rem',
                cursor: 'pointer',
                boxShadow: typeFilter === type ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                textTransform: 'capitalize',
              }}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Sort Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#fff', border: '1px solid hsl(220, 20%, 88%)', borderRadius: '8px', padding: '0 0.75rem', height: '40px' }}>
          <ArrowUpDown size={14} style={{ color: 'hsl(220, 15%, 50%)' }} />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            style={{ border: 'none', background: 'transparent', fontSize: '0.8125rem', fontWeight: 600, color: 'hsl(220, 35%, 20%)', outline: 'none', cursor: 'pointer' }}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="name">Name A-Z</option>
            <option value="size">Size (Largest)</option>
          </select>
        </div>

        {/* Date Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#fff', border: '1px solid hsl(220, 20%, 88%)', borderRadius: '8px', padding: '0 0.75rem', height: '40px' }}>
          <Calendar size={14} style={{ color: 'hsl(220, 15%, 50%)' }} />
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value as any)}
            style={{ border: 'none', background: 'transparent', fontSize: '0.8125rem', fontWeight: 600, color: 'hsl(220, 35%, 20%)', outline: 'none', cursor: 'pointer' }}
          >
            <option value="all">All Dates</option>
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="year">This Year</option>
          </select>
        </div>
      </div>

      {/* Media Grid */}
      {filteredMedia.length === 0 ? (
        <Card style={{ padding: '3rem', textAlign: 'center', background: '#f8fafc', border: '2px dashed hsl(220, 20%, 88%)' }}>
          <FolderOpen size={48} style={{ margin: '0 auto 1rem auto', color: 'hsl(220, 15%, 65%)' }} />
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'hsl(220, 35%, 20%)', margin: '0 0 0.5rem 0' }}>
            No media assets found
          </h3>
          <p style={{ fontSize: '0.875rem', color: 'hsl(220, 15%, 50%)', margin: 0 }}>
            {searchQuery || typeFilter !== 'all'
              ? 'Try changing your search query or filters'
              : 'Upload photos or institutional documents to populate your media library'}
          </p>
        </Card>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: '1.25rem',
          }}
        >
          {filteredMedia.map((item) => (
            <div
              key={item.id}
              style={{
                borderRadius: '10px',
                border: '1px solid hsl(220, 20%, 90%)',
                background: '#ffffff',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease',
              }}
            >
              {/* Thumbnail Area */}
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  aspectRatio: '16/10',
                  background: 'hsl(220, 20%, 96%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                }}
              >
                {item.type === 'image' ? (
                  <Image
                    src={item.url}
                    alt={item.altText || item.title || item.originalName}
                    fill
                    sizes="(max-width: 768px) 100vw, 240px"
                    style={{ objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{ textAlign: 'center', padding: '1rem' }}>
                    <FileText size={36} style={{ color: 'hsl(220, 70%, 45%)', margin: '0 auto 0.25rem auto' }} />
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'hsl(220, 25%, 35%)', textTransform: 'uppercase' }}>
                      {item.mimeType?.split('/')[1] || 'PDF'}
                    </span>
                  </div>
                )}

                {/* Quick Action Overlay */}
                <div
                  style={{
                    position: 'absolute',
                    top: '0.5rem',
                    right: '0.5rem',
                    display: 'flex',
                    gap: '0.35rem',
                  }}
                >
                  <button
                    type="button"
                    title="View file"
                    onClick={() => {
                      if (item.type === 'image') setPreviewItem(item)
                      else window.open(item.url, '_blank')
                    }}
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '6px',
                      background: 'rgba(255, 255, 255, 0.9)',
                      border: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      color: 'hsl(220, 35%, 20%)',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                    }}
                  >
                    <Eye size={14} />
                  </button>
                  <button
                    type="button"
                    title="Copy URL"
                    onClick={() => handleCopyUrl(item)}
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '6px',
                      background: 'rgba(255, 255, 255, 0.9)',
                      border: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      color: copiedId === item.id ? 'green' : 'hsl(220, 35%, 20%)',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                    }}
                  >
                    {copiedId === item.id ? <Check size={14} /> : <Copy size={14} />}
                  </button>
                </div>
              </div>

              {/* Info Area */}
              <div style={{ padding: '0.875rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div
                  title={item.title || item.originalName}
                  style={{
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: 'hsl(220, 35%, 15%)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    marginBottom: '0.25rem',
                  }}
                >
                  {item.title || item.originalName}
                </div>
                {item.caption && (
                  <p style={{ fontSize: '0.75rem', color: 'hsl(220, 15%, 50%)', margin: '0 0 0.35rem 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.caption}
                  </p>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'hsl(220, 15%, 55%)', marginTop: 'auto', paddingTop: '0.5rem', borderTop: '1px solid hsl(220, 20%, 94%)' }}>
                  <span>{formatFileSize(item.size)}</span>
                  <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                </div>

                {/* Footer Buttons */}
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(item)}
                    style={{
                      flex: 1,
                      padding: '0.35rem 0.5rem',
                      borderRadius: '6px',
                      border: '1px solid hsl(220, 20%, 88%)',
                      background: '#fff',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: 'hsl(220, 35%, 20%)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.35rem',
                    }}
                  >
                    <Edit2 size={12} /> Edit
                  </button>
                  <button
                    type="button"
                    title="Replace with new file"
                    onClick={() => handleTriggerReplace(item)}
                    style={{
                      padding: '0.35rem 0.5rem',
                      borderRadius: '6px',
                      border: '1px solid hsl(220, 20%, 88%)',
                      background: '#fff',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: 'hsl(220, 35%, 20%)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <RefreshCw size={12} />
                  </button>
                  <button
                    type="button"
                    title="Delete permanently"
                    onClick={() => setDeleteTarget(item)}
                    style={{
                      padding: '0.35rem 0.5rem',
                      borderRadius: '6px',
                      border: '1px solid hsl(0, 75%, 90%)',
                      background: 'hsl(0, 100%, 98%)',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: 'hsl(0, 75%, 45%)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Metadata Edit Modal */}
      {editItem && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1050,
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
          }}
          onClick={() => setEditItem(null)}
        >
          <div
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '520px',
              background: '#ffffff',
              borderRadius: '12px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
              overflow: 'hidden',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid hsl(220, 20%, 90%)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, margin: 0, color: 'hsl(220, 35%, 15%)' }}>
                  Edit Media Metadata
                </h3>
                <span style={{ fontSize: '0.75rem', color: 'hsl(220, 15%, 50%)' }}>
                  {editItem.originalName} ({formatFileSize(editItem.size)})
                </span>
              </div>
              <button
                type="button"
                onClick={() => setEditItem(null)}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'hsl(220, 15%, 50%)' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} style={{ padding: '1.25rem' }}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'hsl(220, 30%, 25%)', marginBottom: '0.25rem' }}>
                  Title
                </label>
                <input
                  type="text"
                  placeholder="Display title"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid hsl(220, 20%, 85%)', fontSize: '0.875rem' }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'hsl(220, 30%, 25%)', marginBottom: '0.25rem' }}>
                  Alt Text (Accessibility & SEO)
                </label>
                <input
                  type="text"
                  placeholder="Descriptive text for screen readers"
                  value={editForm.altText}
                  onChange={(e) => setEditForm({ ...editForm, altText: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid hsl(220, 20%, 85%)', fontSize: '0.875rem' }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'hsl(220, 30%, 25%)', marginBottom: '0.25rem' }}>
                  Caption
                </label>
                <input
                  type="text"
                  placeholder="Visible caption"
                  value={editForm.caption}
                  onChange={(e) => setEditForm({ ...editForm, caption: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid hsl(220, 20%, 85%)', fontSize: '0.875rem' }}
                />
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'hsl(220, 30%, 25%)', marginBottom: '0.25rem' }}>
                  Description / Notes
                </label>
                <textarea
                  rows={3}
                  placeholder="Extended description or administrative notes"
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid hsl(220, 20%, 85%)', fontSize: '0.875rem', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setEditItem(null)}
                  style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid hsl(220, 20%, 85%)', background: '#fff', fontSize: '0.875rem', cursor: 'pointer', fontWeight: 600 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit}
                  style={{
                    padding: '0.5rem 1.25rem',
                    borderRadius: '6px',
                    border: 'none',
                    background: 'hsl(220, 70%, 35%)',
                    color: '#fff',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    cursor: isSavingEdit ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  {isSavingEdit && <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {previewItem && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1100,
            background: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
          }}
          onClick={() => setPreviewItem(null)}
        >
          <div
            style={{
              position: 'relative',
              maxWidth: '90vw',
              maxHeight: '85vh',
              background: '#ffffff',
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ padding: '0.875rem 1.25rem', borderBottom: '1px solid hsl(220, 20%, 90%)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'hsl(220, 35%, 15%)' }}>
                  {previewItem.title || previewItem.originalName}
                </span>
                {previewItem.caption && (
                  <p style={{ margin: 0, fontSize: '0.75rem', color: 'hsl(220, 15%, 50%)' }}>
                    {previewItem.caption}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setPreviewItem(null)}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'hsl(220, 15%, 50%)' }}
              >
                <X size={18} />
              </button>
            </div>
            <div style={{ position: 'relative', width: '800px', maxWidth: '85vw', height: '500px', maxHeight: '70vh' }}>
              <Image
                src={previewItem.url}
                alt={previewItem.altText || previewItem.originalName}
                fill
                style={{ objectFit: 'contain' }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete Media File"
        message={`Are you sure you want to permanently delete "${deleteTarget?.originalName}"? Any page or section referencing this URL will no longer be able to display it.`}
        confirmText="Delete File"
        danger
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  )
}
