'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/admin/ui/Card'
import { TableContainer, Table, Thead, Tbody, Tr, Th, Td, Badge } from '@/components/admin/ui/Table'
import { ConfirmDialog } from '@/components/admin/ui/ConfirmDialog'
import { useToast } from '@/components/admin/ui/Toast'
import { MediaPickerModal } from '@/components/admin/ui/MediaPickerModal'
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  X,
  Save,
  Loader2,
  Image as ImageIcon,
  Images,
  ArrowUp,
  ArrowDown,
  Star,
  ExternalLink,
  Calendar,
} from 'lucide-react'
import Image from 'next/image'

interface MediaItem {
  id: string
  url: string
  caption?: string | null
  altText?: string | null
  isFeatured?: boolean
  order: number
}

interface AlbumItem {
  id: string
  title: string
  slug: string
  description?: string | null
  coverImage?: string | null
  category: string
  eventDate?: string | null
  order: number
  status: string
  isActive: boolean
  seoTitle?: string | null
  seoDescription?: string | null
  mediaCount?: number
  media?: MediaItem[]
}

const GALLERY_CATEGORIES = ['general', 'annual-function', 'sports', 'campus', 'academic', 'celebrations', 'exhibitions']

export function GalleryAdminClient() {
  const { success, error: showError } = useToast()
  const [albums, setAlbums] = useState<AlbumItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')

  // Album Create/Edit Modal
  const [editingAlbum, setEditingAlbum] = useState<AlbumItem | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [form, setForm] = useState({
    title: '',
    slug: '',
    description: '',
    coverImage: '',
    category: 'general',
    eventDate: '',
    order: 0,
    status: 'PUBLISHED',
    seoTitle: '',
    seoDescription: '',
  })

  // Media Manager Modal
  const [managingAlbum, setManagingAlbum] = useState<AlbumItem | null>(null)
  const [albumMedia, setAlbumMedia] = useState<MediaItem[]>([])
  const [isLoadingMedia, setIsLoadingMedia] = useState(false)

  // Media Picker Modals
  const [showCoverPicker, setShowCoverPicker] = useState(false)
  const [showAddMediaPicker, setShowAddMediaPicker] = useState(false)

  // Delete Confirm
  const [deleteTarget, setDeleteTarget] = useState<AlbumItem | null>(null)

  const fetchAlbums = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/gallery')
      const json = await res.json()
      if (json.success) {
        setAlbums(json.data)
      } else {
        showError(json.error?.message || 'Failed to load albums')
      }
    } catch {
      showError('Network error loading albums')
    } finally {
      setLoading(false)
    }
  }, [showError])

  useEffect(() => {
    fetchAlbums()
  }, [fetchAlbums])

  const openCreateModal = () => {
    setIsNew(true)
    setForm({
      title: '',
      slug: '',
      description: '',
      coverImage: '',
      category: 'general',
      eventDate: '',
      order: albums.length,
      status: 'PUBLISHED',
      seoTitle: '',
      seoDescription: '',
    })
    setEditingAlbum({} as any)
  }

  const openEditModal = (album: AlbumItem) => {
    setIsNew(false)
    setEditingAlbum(album)
    setForm({
      title: album.title,
      slug: album.slug,
      description: album.description || '',
      coverImage: album.coverImage || '',
      category: album.category || 'general',
      eventDate: album.eventDate ? album.eventDate.split('T')[0] : '',
      order: album.order,
      status: album.status,
      seoTitle: album.seoTitle || '',
      seoDescription: album.seoDescription || '',
    })
  }

  const handleSaveAlbum = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) return

    setIsSaving(true)
    try {
      const url = isNew ? '/api/admin/gallery' : `/api/admin/gallery/${editingAlbum?.id}`
      const method = isNew ? 'POST' : 'PATCH'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const json = await res.json()

      if (json.success) {
        success(isNew ? 'Album created successfully' : 'Album updated successfully')
        setEditingAlbum(null)
        fetchAlbums()
      } else {
        showError(json.error?.message || 'Failed to save album')
      }
    } catch {
      showError('Network error saving album')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteAlbum = async () => {
    if (!deleteTarget) return
    try {
      const res = await fetch(`/api/admin/gallery/${deleteTarget.id}`, {
        method: 'DELETE',
      })
      const json = await res.json()
      if (json.success) {
        success('Album deleted successfully')
        setDeleteTarget(null)
        fetchAlbums()
      } else {
        showError(json.error?.message || 'Failed to delete album')
      }
    } catch {
      showError('Network error deleting album')
    }
  }

  // Manage Photos Workflow
  const openMediaManager = async (album: AlbumItem) => {
    setManagingAlbum(album)
    setIsLoadingMedia(true)
    try {
      const res = await fetch(`/api/admin/gallery/${album.id}`)
      const json = await res.json()
      if (json.success) {
        setAlbumMedia(json.data.media || [])
      } else {
        showError(json.error?.message || 'Failed to fetch album photos')
      }
    } catch {
      showError('Network error fetching album photos')
    } finally {
      setIsLoadingMedia(false)
    }
  }

  const handleAddMediaToAlbum = async (selected: { url: string; altText?: string }) => {
    if (!managingAlbum) return
    try {
      const res = await fetch(`/api/admin/gallery/${managingAlbum.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mediaToAdd: [{ url: selected.url, altText: selected.altText || '' }],
        }),
      })
      const json = await res.json()
      if (json.success) {
        setAlbumMedia(json.data.media || [])
        success('Photo added to album')
        setShowAddMediaPicker(false)
        fetchAlbums()
      } else {
        showError(json.error?.message || 'Failed to add photo')
      }
    } catch {
      showError('Network error adding photo')
    }
  }

  const handleDeletePhotoFromAlbum = async (mediaId: string) => {
    if (!managingAlbum) return
    try {
      const res = await fetch(`/api/admin/gallery/${managingAlbum.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mediaToDelete: [mediaId],
        }),
      })
      const json = await res.json()
      if (json.success) {
        setAlbumMedia((prev) => prev.filter((m) => m.id !== mediaId))
        success('Photo removed from album')
        fetchAlbums()
      } else {
        showError(json.error?.message || 'Failed to remove photo')
      }
    } catch {
      showError('Network error removing photo')
    }
  }

  const handleSetCover = async (photoUrl: string) => {
    if (!managingAlbum) return
    try {
      const res = await fetch(`/api/admin/gallery/${managingAlbum.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          coverImage: photoUrl,
        }),
      })
      const json = await res.json()
      if (json.success) {
        setManagingAlbum(json.data)
        success('Album cover updated')
        fetchAlbums()
      } else {
        showError(json.error?.message || 'Failed to set cover')
      }
    } catch {
      showError('Network error updating cover')
    }
  }

  const filteredAlbums = albums.filter((a) => {
    const matchSearch =
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      (a.description && a.description.toLowerCase().includes(search.toLowerCase()))
    const matchCat = categoryFilter === 'all' || a.category === categoryFilter
    return matchSearch && matchCat
  })

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.625rem 0.875rem',
    borderRadius: '8px',
    border: '1px solid hsl(220, 20%, 82%)',
    fontSize: '0.9375rem',
    fontFamily: 'inherit',
    background: '#fff',
    boxSizing: 'border-box',
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '0.875rem',
    fontWeight: 600,
    marginBottom: '0.4rem',
    color: 'hsl(220, 25%, 25%)',
  }

  return (
    <div>
      {/* Top action bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'hsl(220, 35%, 15%)', margin: 0 }}>
            Gallery & Albums CMS
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'hsl(220, 15%, 50%)', margin: '0.25rem 0 0 0' }}>
            Organize photo albums, annual sports, science exhibitions, functions, and campus life memories
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
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
            cursor: 'pointer',
          }}
        >
          <Plus size={16} /> Add Album
        </button>
      </div>

      {/* Filter and Search */}
      <Card style={{ marginBottom: '1.5rem' }}>
        <CardContent style={{ padding: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: '2 1 220px' }}>
            <Search size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'hsl(220, 15%, 50%)' }} />
            <input
              type="text"
              placeholder="Search albums..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ ...inputStyle, paddingLeft: '2.5rem' }}
            />
          </div>

          <div style={{ flex: '1 1 180px' }}>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              style={inputStyle}
            >
              <option value="all">All Categories</option>
              {GALLERY_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c.replace('-', ' ').toUpperCase()}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Albums Table */}
      <Card>
        <CardContent style={{ padding: 0 }}>
          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'hsl(220, 15%, 50%)' }}>
              <Loader2 size={24} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 0.5rem auto' }} />
              Loading albums...
            </div>
          ) : filteredAlbums.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'hsl(220, 15%, 50%)' }}>
              <Images size={40} style={{ margin: '0 auto 0.75rem auto', color: 'hsl(220, 15%, 65%)' }} />
              <h3 style={{ margin: '0 0 0.25rem 0', color: 'hsl(220, 35%, 20%)' }}>No Albums Found</h3>
              <p style={{ margin: 0 }}>Click "Add Album" above to create your first school photo album.</p>
            </div>
          ) : (
            <TableContainer>
              <Table>
                <Thead>
                  <Tr>
                    <Th>Cover</Th>
                    <Th>Album Title</Th>
                    <Th>Category</Th>
                    <Th>Photos</Th>
                    <Th>Event Date</Th>
                    <Th>Status</Th>
                    <Th style={{ textAlign: 'right' }}>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {filteredAlbums.map((a) => (
                    <Tr key={a.id}>
                      <Td style={{ width: '64px' }}>
                        <div style={{ position: 'relative', width: '56px', height: '40px', borderRadius: '6px', overflow: 'hidden', background: 'hsl(220, 20%, 94%)' }}>
                          {a.coverImage ? (
                            <Image src={a.coverImage} alt={a.title} fill sizes="56px" style={{ objectFit: 'cover' }} />
                          ) : (
                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <ImageIcon size={18} style={{ color: 'hsl(220, 15%, 60%)' }} />
                            </div>
                          )}
                        </div>
                      </Td>
                      <Td>
                        <span style={{ fontWeight: 600, color: 'hsl(220, 35%, 15%)' }}>{a.title}</span>
                        <div style={{ fontSize: '0.75rem', color: 'hsl(220, 15%, 55%)' }}>/{a.slug}</div>
                      </Td>
                      <Td>
                        <Badge variant="default">{a.category}</Badge>
                      </Td>
                      <Td>
                        <span style={{ fontWeight: 600, color: 'hsl(220, 60%, 35%)' }}>
                          {a.mediaCount || 0} photos
                        </span>
                      </Td>
                      <Td>
                        {a.eventDate ? (
                          <span style={{ fontSize: '0.8125rem' }}>{new Date(a.eventDate).toLocaleDateString()}</span>
                        ) : (
                          <span style={{ color: 'hsl(220, 15%, 60%)' }}>—</span>
                        )}
                      </Td>
                      <Td>
                        <Badge variant={a.status === 'PUBLISHED' ? 'success' : 'default'}>
                          {a.status}
                        </Badge>
                      </Td>
                      <Td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                          <button
                            type="button"
                            title="Manage Photos"
                            onClick={() => openMediaManager(a)}
                            style={{ padding: '0.35rem 0.65rem', borderRadius: '6px', border: '1px solid hsl(220, 65%, 40%)', background: 'hsl(220, 65%, 96%)', color: 'hsl(220, 65%, 35%)', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                          >
                            <Images size={13} /> Photos
                          </button>
                          <a
                            href={`/gallery/${a.slug}`}
                            target="_blank"
                            rel="noreferrer"
                            title="View Public Page"
                            style={{ padding: '0.35rem 0.5rem', borderRadius: '6px', border: '1px solid hsl(220, 20%, 85%)', background: '#fff', color: 'hsl(220, 30%, 25%)', display: 'flex', alignItems: 'center' }}
                          >
                            <ExternalLink size={13} />
                          </a>
                          <button
                            type="button"
                            title="Edit Album"
                            onClick={() => openEditModal(a)}
                            style={{ padding: '0.35rem 0.5rem', borderRadius: '6px', border: '1px solid hsl(220, 20%, 85%)', background: '#fff', color: 'hsl(220, 30%, 25%)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            type="button"
                            title="Delete Album"
                            onClick={() => setDeleteTarget(a)}
                            style={{ padding: '0.35rem 0.5rem', borderRadius: '6px', border: '1px solid hsl(0, 75%, 85%)', background: 'hsl(0, 100%, 98%)', color: 'hsl(0, 75%, 45%)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Album Create/Edit Modal */}
      {editingAlbum && (
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
          onClick={() => setEditingAlbum(null)}
        >
          <div
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '560px',
              maxHeight: '90vh',
              overflowY: 'auto',
              background: '#ffffff',
              borderRadius: '12px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid hsl(220, 20%, 90%)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, margin: 0, color: 'hsl(220, 35%, 15%)' }}>
                {isNew ? 'Create New Photo Album' : 'Edit Album Details'}
              </h3>
              <button
                type="button"
                onClick={() => setEditingAlbum(null)}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'hsl(220, 15%, 50%)' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveAlbum} style={{ padding: '1.25rem' }}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={labelStyle}>Album Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Annual Sports Day 2026"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  style={inputStyle}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={labelStyle}>Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    style={inputStyle}
                  >
                    {GALLERY_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c.replace('-', ' ').toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Event Date</label>
                  <input
                    type="date"
                    value={form.eventDate}
                    onChange={(e) => setForm({ ...form, eventDate: e.target.value })}
                    style={inputStyle}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={labelStyle}>Cover Image</label>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <input
                    type="text"
                    placeholder="/uploads/... or external URL"
                    value={form.coverImage}
                    onChange={(e) => setForm({ ...form, coverImage: e.target.value })}
                    style={{ ...inputStyle, flex: 1 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCoverPicker(true)}
                    style={{
                      padding: '0.625rem 0.875rem',
                      borderRadius: '8px',
                      border: '1px solid hsl(220, 20%, 82%)',
                      background: 'hsl(220, 20%, 96%)',
                      cursor: 'pointer',
                      fontWeight: 600,
                      fontSize: '0.8125rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <ImageIcon size={14} /> Browse Media
                  </button>
                </div>
                {form.coverImage && (
                  <div style={{ marginTop: '0.5rem', position: 'relative', width: '120px', height: '75px', borderRadius: '6px', overflow: 'hidden', border: '1px solid hsl(220, 20%, 85%)' }}>
                    <Image src={form.coverImage} alt="Cover preview" fill sizes="120px" style={{ objectFit: 'cover' }} />
                  </div>
                )}
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={labelStyle}>Description</label>
                <textarea
                  rows={3}
                  placeholder="Summary of this photo collection..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  style={{ ...inputStyle, resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <label style={labelStyle}>Publication Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    style={inputStyle}
                  >
                    <option value="PUBLISHED">Published</option>
                    <option value="DRAFT">Draft (Hidden)</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Display Order</label>
                  <input
                    type="number"
                    value={form.order}
                    onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })}
                    style={inputStyle}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setEditingAlbum(null)}
                  style={{ padding: '0.625rem 1.25rem', borderRadius: '8px', border: '1px solid hsl(220, 20%, 85%)', background: '#fff', fontSize: '0.875rem', cursor: 'pointer', fontWeight: 600 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  style={{
                    padding: '0.625rem 1.5rem',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'hsl(220, 70%, 35%)',
                    color: '#fff',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    cursor: isSaving ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  {isSaving && <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />}
                  <span>{isNew ? 'Create Album' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Album Photo Manager Modal */}
      {managingAlbum && (
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
          onClick={() => setManagingAlbum(null)}
        >
          <div
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '850px',
              maxHeight: '88vh',
              display: 'flex',
              flexDirection: 'column',
              background: '#ffffff',
              borderRadius: '12px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
              overflow: 'hidden',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid hsl(220, 20%, 90%)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 700, margin: 0, color: 'hsl(220, 35%, 15%)' }}>
                  Manage Album Photos: {managingAlbum.title}
                </h3>
                <span style={{ fontSize: '0.8125rem', color: 'hsl(220, 15%, 50%)' }}>
                  {albumMedia.length} Photos in this album
                </span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={() => setShowAddMediaPicker(true)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.5rem 1rem',
                    borderRadius: '6px',
                    background: 'hsl(220, 70%, 35%)',
                    color: '#fff',
                    border: 'none',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  <Plus size={14} /> Add from Media Library
                </button>
                <button
                  type="button"
                  onClick={() => setManagingAlbum(null)}
                  style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'hsl(220, 15%, 50%)' }}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Photos Grid */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem' }}>
              {isLoadingMedia ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'hsl(220, 15%, 50%)' }}>
                  <Loader2 size={24} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 0.5rem auto' }} />
                  Loading photos...
                </div>
              ) : albumMedia.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', border: '2px dashed hsl(220, 20%, 88%)', borderRadius: '8px' }}>
                  <Images size={40} style={{ color: 'hsl(220, 15%, 65%)', margin: '0 auto 0.5rem auto' }} />
                  <p style={{ margin: 0, color: 'hsl(220, 20%, 40%)', fontWeight: 600 }}>No photos added to this album yet</p>
                  <p style={{ margin: '0.25rem 0 1rem 0', fontSize: '0.8125rem', color: 'hsl(220, 15%, 55%)' }}>
                    Select photos from your Media Library to attach them to this collection.
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowAddMediaPicker(true)}
                    style={{
                      padding: '0.5rem 1rem',
                      borderRadius: '6px',
                      background: 'hsl(220, 70%, 35%)',
                      color: '#fff',
                      border: 'none',
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Add First Photo
                  </button>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem' }}>
                  {albumMedia.map((m) => {
                    const isCover = managingAlbum.coverImage === m.url
                    return (
                      <div
                        key={m.id}
                        style={{
                          borderRadius: '8px',
                          border: isCover ? '2px solid hsl(40, 95%, 45%)' : '1px solid hsl(220, 20%, 88%)',
                          overflow: 'hidden',
                          background: '#fff',
                          display: 'flex',
                          flexDirection: 'column',
                          position: 'relative',
                        }}
                      >
                        <div style={{ position: 'relative', width: '100%', aspectRatio: '4/3', background: 'hsl(220, 20%, 96%)' }}>
                          <Image src={m.url} alt={m.altText || 'Album photo'} fill sizes="180px" style={{ objectFit: 'cover' }} />
                          {isCover && (
                            <span style={{ position: 'absolute', top: '0.35rem', left: '0.35rem', background: 'hsl(40, 95%, 45%)', color: '#fff', fontSize: '0.6875rem', fontWeight: 700, padding: '2px 6px', borderRadius: '4px' }}>
                              Cover Photo
                            </span>
                          )}
                        </div>
                        <div style={{ padding: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid hsl(220, 20%, 92%)' }}>
                          <button
                            type="button"
                            title="Set as album cover"
                            onClick={() => handleSetCover(m.url)}
                            style={{
                              border: 'none',
                              background: 'transparent',
                              color: isCover ? 'hsl(40, 95%, 45%)' : 'hsl(220, 15%, 50%)',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                            }}
                          >
                            <Star size={13} fill={isCover ? 'currentColor' : 'none'} />
                            <span>{isCover ? 'Cover' : 'Make Cover'}</span>
                          </button>
                          <button
                            type="button"
                            title="Remove from album"
                            onClick={() => handleDeletePhotoFromAlbum(m.id)}
                            style={{
                              border: 'none',
                              background: 'transparent',
                              color: 'hsl(0, 75%, 50%)',
                              cursor: 'pointer',
                              padding: '2px 4px',
                            }}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div style={{ padding: '0.875rem 1.25rem', borderTop: '1px solid hsl(220, 20%, 90%)', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setManagingAlbum(null)}
                style={{ padding: '0.5rem 1.25rem', borderRadius: '6px', border: 'none', background: 'hsl(220, 70%, 35%)', color: '#fff', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Media Picker for Cover Image */}
      {showCoverPicker && (
        <MediaPickerModal
          isOpen={showCoverPicker}
          onSelect={(media) => {
            setForm((prev) => ({ ...prev, coverImage: media.url }))
            setShowCoverPicker(false)
          }}
          onClose={() => setShowCoverPicker(false)}
        />
      )}

      {/* Media Picker for Adding to Album */}
      {showAddMediaPicker && (
        <MediaPickerModal
          isOpen={showAddMediaPicker}
          onSelect={handleAddMediaToAlbum}
          onClose={() => setShowAddMediaPicker(false)}
        />
      )}

      {/* Delete Album Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete Album"
        message={`Are you sure you want to delete album "${deleteTarget?.title}"? All attached photo associations will be deleted.`}
        confirmText="Delete Album"
        danger
        onConfirm={handleDeleteAlbum}
        onCancel={() => setDeleteTarget(null)}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  )
}
