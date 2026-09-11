'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/admin/ui/Card'
import { TableContainer, Table, Thead, Tbody, Tr, Th, Td, Badge } from '@/components/admin/ui/Table'
import { ConfirmDialog } from '@/components/admin/ui/ConfirmDialog'
import { useToast } from '@/components/admin/ui/Toast'
import { MediaPickerModal } from '@/components/admin/ui/MediaPickerModal'
import {
  Plus, Search, Edit2, Trash2, Eye, EyeOff, X, Save, Loader2,
  Image as ImageIcon, ExternalLink, ChevronLeft, ChevronRight, FileText
} from 'lucide-react'
import Image from 'next/image'

interface NewsItem {
  id: string
  title: string
  slug: string
  excerpt?: string
  featuredImage?: string
  category: string
  author: string
  status: string
  publishedAt?: string
  createdAt: string
}

const NEWS_CATEGORIES = ['general', 'academic', 'sports', 'events', 'achievements', 'announcements']

function generateSlug(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '0.625rem 0.875rem', borderRadius: '8px',
  border: '1px solid hsl(220, 20%, 82%)', fontSize: '0.9375rem', fontFamily: 'inherit',
  background: '#fff', boxSizing: 'border-box',
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '0.875rem', fontWeight: 600,
  marginBottom: '0.4rem', color: 'hsl(220, 25%, 25%)',
}

export function NewsClient() {
  const { success, error: showError } = useToast()
  const [items, setItems] = useState<NewsItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ total: 0, totalPages: 0 })

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<NewsItem | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [showMediaPicker, setShowMediaPicker] = useState(false)

  // Form state
  const [fTitle, setFTitle] = useState('')
  const [fSlug, setFSlug] = useState('')
  const [fExcerpt, setFExcerpt] = useState('')
  const [fContent, setFContent] = useState('')
  const [fFeaturedImage, setFFeaturedImage] = useState('')
  const [fCategory, setFCategory] = useState('general')
  const [fAuthor, setFAuthor] = useState('Admin')
  const [fStatus, setFStatus] = useState<'DRAFT' | 'PUBLISHED'>('DRAFT')
  const [fPublishedAt, setFPublishedAt] = useState('')
  const [fSeoTitle, setFSeoTitle] = useState('')
  const [fSeoDescription, setFSeoDescription] = useState('')

  const fetchNews = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), ...(search && { search }), ...(statusFilter && { status: statusFilter }) })
      const res = await fetch(`/api/admin/news?${params}`)
      const json = await res.json()
      if (json.success) {
        setItems(json.data.news)
        setPagination(json.data.pagination)
      }
    } catch { showError('Failed to load news') }
    finally { setIsLoading(false) }
  }, [page, search, statusFilter])

  useEffect(() => { fetchNews() }, [fetchNews])

  const resetForm = () => {
    setFTitle(''); setFSlug(''); setFExcerpt(''); setFContent(''); setFFeaturedImage('')
    setFCategory('general'); setFAuthor('Admin'); setFStatus('DRAFT'); setFPublishedAt('')
    setFSeoTitle(''); setFSeoDescription(''); setEditingId(null)
  }

  const openCreate = () => { resetForm(); setShowForm(true) }

  const openEdit = async (item: NewsItem) => {
    setEditingId(item.id)
    const res = await fetch(`/api/admin/news/${item.id}`)
    const json = await res.json()
    if (json.success) {
      const n = json.data
      setFTitle(n.title); setFSlug(n.slug); setFExcerpt(n.excerpt || '')
      setFContent(n.content); setFFeaturedImage(n.featuredImage || '')
      setFCategory(n.category); setFAuthor(n.author)
      setFStatus(n.status as 'DRAFT' | 'PUBLISHED')
      setFPublishedAt(n.publishedAt ? n.publishedAt.split('T')[0] : '')
      setFSeoTitle(n.seoTitle || ''); setFSeoDescription(n.seoDescription || '')
      setShowForm(true)
    }
  }

  const handleTitleChange = (val: string) => {
    setFTitle(val)
    if (!editingId) setFSlug(generateSlug(val))
  }

  const handleSave = async (status: 'DRAFT' | 'PUBLISHED') => {
    if (!fTitle.trim() || !fContent.trim() || !fSlug.trim()) {
      showError('Title, slug and content are required')
      return
    }
    setIsSaving(true)
    try {
      const payload = {
        title: fTitle, slug: fSlug, excerpt: fExcerpt, content: fContent,
        featuredImage: fFeaturedImage || undefined, category: fCategory,
        author: fAuthor, status, publishedAt: fPublishedAt || undefined,
        seoTitle: fSeoTitle || undefined, seoDescription: fSeoDescription || undefined,
      }
      const url = editingId ? `/api/admin/news/${editingId}` : '/api/admin/news'
      const method = editingId ? 'PATCH' : 'POST'
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const json = await res.json()
      if (json.success) {
        success(editingId ? 'Article updated' : 'Article created')
        setShowForm(false); resetForm(); fetchNews()
      } else {
        showError(json.error?.message || 'Save failed')
      }
    } catch { showError('Network error') }
    finally { setIsSaving(false) }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    const res = await fetch(`/api/admin/news/${deleteTarget.id}`, { method: 'DELETE' })
    const json = await res.json()
    if (json.success) { success('Article deleted'); setDeleteTarget(null); fetchNews() }
    else showError(json.error?.message || 'Delete failed')
  }

  const handleQuickToggle = async (item: NewsItem) => {
    const newStatus = item.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED'
    const res = await fetch(`/api/admin/news/${item.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: newStatus }) })
    const json = await res.json()
    if (json.success) { success(`Article ${newStatus === 'PUBLISHED' ? 'published' : 'unpublished'}`); fetchNews() }
    else showError(json.error?.message || 'Toggle failed')
  }

  return (
    <div>
      {/* Toolbar */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1 1 200px' }}>
          <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'hsl(220, 15%, 55%)' }} />
          <input style={{ ...inputStyle, paddingLeft: '2.25rem' }} value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} placeholder="Search news..." />
        </div>
        <select style={{ ...inputStyle, width: 'auto' }} value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }}>
          <option value="">All Statuses</option>
          <option value="DRAFT">Draft</option>
          <option value="PUBLISHED">Published</option>
        </select>
        <button onClick={openCreate} style={{ padding: '0.625rem 1.25rem', background: 'hsl(220, 65%, 28%)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap' }}>
          <Plus size={16} /> New Article
        </button>
      </div>

      {/* Table */}
      <TableContainer>
        <Table>
          <Thead>
            <Tr>
              <Th>Title</Th>
              <Th>Category</Th>
              <Th>Author</Th>
              <Th>Status</Th>
              <Th>Published</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {isLoading ? (
              <Tr><Td colSpan={6} style={{ textAlign: 'center', padding: '3rem' }}><Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} /></Td></Tr>
            ) : items.length === 0 ? (
              <Tr><Td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'hsl(220, 15%, 50%)' }}>No news articles found. Create one!</Td></Tr>
            ) : items.map(item => (
              <Tr key={item.id}>
                <Td>
                  <div style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{item.title}</div>
                  <div style={{ fontSize: '0.8125rem', color: 'hsl(220, 15%, 55%)', fontFamily: 'monospace' }}>/news/{item.slug}</div>
                </Td>
                <Td><span style={{ fontSize: '0.8125rem', padding: '0.2rem 0.5rem', background: 'hsl(220, 20%, 94%)', borderRadius: '4px', fontWeight: 600 }}>{item.category}</span></Td>
                <Td style={{ fontSize: '0.875rem' }}>{item.author}</Td>
                <Td>
                  <Badge variant={item.status === 'PUBLISHED' ? 'success' : 'warning'}>
                    {item.status === 'PUBLISHED' ? 'Published' : 'Draft'}
                  </Badge>
                </Td>
                <Td style={{ fontSize: '0.875rem', color: 'hsl(220, 15%, 50%)' }}>
                  {item.publishedAt ? new Date(item.publishedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                </Td>
                <Td>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <button onClick={() => openEdit(item)} title="Edit" style={{ padding: '0.375rem', background: 'hsl(220, 70%, 94%)', color: 'hsl(220, 65%, 28%)', border: 'none', borderRadius: '6px', cursor: 'pointer' }}><Edit2 size={14} /></button>
                    <button onClick={() => handleQuickToggle(item)} title={item.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'} style={{ padding: '0.375rem', background: item.status === 'PUBLISHED' ? 'hsl(40, 95%, 92%)' : 'hsl(140, 60%, 92%)', color: item.status === 'PUBLISHED' ? 'hsl(40, 95%, 30%)' : 'hsl(140, 70%, 25%)', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                      {item.status === 'PUBLISHED' ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                    <a href={`/news/${item.slug}`} target="_blank" rel="noopener noreferrer" style={{ padding: '0.375rem', background: 'hsl(220, 20%, 94%)', color: 'hsl(220, 35%, 30%)', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'inline-flex' }} title="View"><ExternalLink size={14} /></a>
                    <button onClick={() => setDeleteTarget(item)} title="Delete" style={{ padding: '0.375rem', background: 'hsl(0, 80%, 95%)', color: 'hsl(0, 70%, 40%)', border: 'none', borderRadius: '6px', cursor: 'pointer' }}><Trash2 size={14} /></button>
                  </div>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginTop: '1rem' }}>
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ padding: '0.375rem 0.625rem', border: '1px solid hsl(220, 20%, 82%)', borderRadius: '6px', background: '#fff', cursor: 'pointer' }}><ChevronLeft size={15} /></button>
          <span style={{ padding: '0.375rem 0.75rem', fontWeight: 600 }}>{page} / {pagination.totalPages}</span>
          <button onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))} disabled={page === pagination.totalPages} style={{ padding: '0.375rem 0.625rem', border: '1px solid hsl(220, 20%, 82%)', borderRadius: '6px', background: '#fff', cursor: 'pointer' }}><ChevronRight size={15} /></button>
        </div>
      )}

      {/* News Form Modal */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 1000, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '1.5rem', overflowY: 'auto' }}>
          <div style={{ background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '800px', position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.5rem', borderBottom: '1px solid hsl(220, 20%, 92%)' }}>
              <h2 style={{ fontWeight: 800, fontSize: '1.125rem', margin: 0 }}>{editingId ? 'Edit Article' : 'New Article'}</h2>
              <button onClick={() => { setShowForm(false); resetForm() }} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={22} /></button>
            </div>
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '80vh', overflowY: 'auto' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>Title *</label>
                  <input style={inputStyle} value={fTitle} onChange={e => handleTitleChange(e.target.value)} placeholder="Article title" />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>Slug *</label>
                  <input style={{ ...inputStyle, fontFamily: 'monospace' }} value={fSlug} onChange={e => setFSlug(e.target.value)} placeholder="url-friendly-slug" />
                </div>
                <div>
                  <label style={labelStyle}>Category</label>
                  <select style={inputStyle} value={fCategory} onChange={e => setFCategory(e.target.value)}>
                    {NEWS_CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Author</label>
                  <input style={inputStyle} value={fAuthor} onChange={e => setFAuthor(e.target.value)} />
                </div>
                <div>
                  <label style={labelStyle}>Publication Date</label>
                  <input style={inputStyle} type="date" value={fPublishedAt} onChange={e => setFPublishedAt(e.target.value)} />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>Featured Image</label>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <input style={{ ...inputStyle, flex: 1 }} value={fFeaturedImage} onChange={e => setFFeaturedImage(e.target.value)} placeholder="/uploads/..." />
                    <button type="button" onClick={() => setShowMediaPicker(true)} style={{ padding: '0.625rem 0.875rem', background: 'hsl(220, 20%, 94%)', border: '1px solid hsl(220, 20%, 82%)', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, whiteSpace: 'nowrap', fontSize: '0.875rem' }}>
                      <ImageIcon size={15} /> Pick
                    </button>
                  </div>
                  {fFeaturedImage && <div style={{ marginTop: '0.5rem', width: '120px', height: '80px', borderRadius: '8px', overflow: 'hidden', border: '1px solid hsl(220, 20%, 88%)' }}><img src={fFeaturedImage} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div>}
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>Excerpt / Short Description</label>
                  <textarea rows={2} style={{ ...inputStyle, resize: 'vertical' }} value={fExcerpt} onChange={e => setFExcerpt(e.target.value)} placeholder="Brief summary shown in news listings..." />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>Full Content *</label>
                  <textarea rows={10} style={{ ...inputStyle, resize: 'vertical', fontFamily: 'monospace', fontSize: '0.875rem' }} value={fContent} onChange={e => setFContent(e.target.value)} placeholder="Full article content (HTML supported)..." />
                </div>
                <div>
                  <label style={labelStyle}>SEO Title</label>
                  <input style={inputStyle} value={fSeoTitle} onChange={e => setFSeoTitle(e.target.value)} placeholder="SEO title (optional)" />
                </div>
                <div>
                  <label style={labelStyle}>SEO Description</label>
                  <input style={inputStyle} value={fSeoDescription} onChange={e => setFSeoDescription(e.target.value)} placeholder="Meta description (optional)" />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', paddingTop: '0.5rem' }}>
                <button onClick={() => { setShowForm(false); resetForm() }} style={{ padding: '0.625rem 1.25rem', border: '1px solid hsl(220, 20%, 82%)', borderRadius: '8px', background: '#fff', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
                <button onClick={() => handleSave('DRAFT')} disabled={isSaving} style={{ padding: '0.625rem 1.25rem', background: 'hsl(220, 20%, 94%)', border: '1px solid hsl(220, 20%, 82%)', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>Save Draft</button>
                <button onClick={() => handleSave('PUBLISHED')} disabled={isSaving} style={{ padding: '0.625rem 1.5rem', background: 'hsl(220, 65%, 28%)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {isSaving ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={15} />}
                  {isSaving ? 'Saving...' : 'Publish'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <ConfirmDialog isOpen={!!deleteTarget} title="Delete Article" message={`Delete "${deleteTarget.title}"? This cannot be undone.`}
          confirmText="Delete" danger onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} onClose={() => setDeleteTarget(null)} />
      )}

      {showMediaPicker && (
        <MediaPickerModal isOpen={showMediaPicker} onSelect={media => { setFFeaturedImage(media.url); setShowMediaPicker(false) }} onClose={() => setShowMediaPicker(false)} />
      )}
    </div>
  )
}
