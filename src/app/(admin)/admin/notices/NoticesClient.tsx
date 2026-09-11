'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { TableContainer, Table, Thead, Tbody, Tr, Th, Td, Badge } from '@/components/admin/ui/Table'
import { ConfirmDialog } from '@/components/admin/ui/ConfirmDialog'
import { useToast } from '@/components/admin/ui/Toast'
import { MediaPickerModal } from '@/components/admin/ui/MediaPickerModal'
import { Plus, Search, Edit2, Trash2, Eye, EyeOff, X, Save, Loader2, Paperclip, ChevronLeft, ChevronRight, Pin } from 'lucide-react'

interface NoticeItem {
  id: string; title: string; description: string; category: string
  attachment?: string; date: string; expiryDate?: string
  isImportant: boolean; isPublished: boolean; createdAt: string
}

const NOTICE_CATEGORIES = ['general', 'academic', 'exam', 'fee', 'sports', 'events', 'holiday', 'recruitment']

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '0.625rem 0.875rem', borderRadius: '8px',
  border: '1px solid hsl(220, 20%, 82%)', fontSize: '0.9375rem', fontFamily: 'inherit',
  background: '#fff', boxSizing: 'border-box',
}
const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '0.875rem', fontWeight: 600,
  marginBottom: '0.4rem', color: 'hsl(220, 25%, 25%)',
}

export function NoticesClient() {
  const { success, error: showError } = useToast()
  const [items, setItems] = useState<NoticeItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [publishedFilter, setPublishedFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ total: 0, totalPages: 0 })
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<NoticeItem | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [showMediaPicker, setShowMediaPicker] = useState(false)

  const [fTitle, setFTitle] = useState('')
  const [fDescription, setFDescription] = useState('')
  const [fCategory, setFCategory] = useState('general')
  const [fAttachment, setFAttachment] = useState('')
  const [fDate, setFDate] = useState(new Date().toISOString().split('T')[0])
  const [fExpiryDate, setFExpiryDate] = useState('')
  const [fIsImportant, setFIsImportant] = useState(false)
  const [fIsPublished, setFIsPublished] = useState(false)

  const fetchNotices = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), ...(search && { search }), ...(publishedFilter && { published: publishedFilter }), ...(categoryFilter && { category: categoryFilter }) })
      const res = await fetch(`/api/admin/notices?${params}`)
      const json = await res.json()
      if (json.success) { setItems(json.data.notices); setPagination(json.data.pagination) }
    } catch { showError('Failed to load notices') }
    finally { setIsLoading(false) }
  }, [page, search, publishedFilter, categoryFilter])

  useEffect(() => { fetchNotices() }, [fetchNotices])

  const resetForm = () => {
    setFTitle(''); setFDescription(''); setFCategory('general'); setFAttachment('')
    setFDate(new Date().toISOString().split('T')[0]); setFExpiryDate('')
    setFIsImportant(false); setFIsPublished(false); setEditingId(null)
  }

  const openEdit = async (item: NoticeItem) => {
    setEditingId(item.id)
    setFTitle(item.title); setFDescription(item.description); setFCategory(item.category)
    setFAttachment(item.attachment || ''); setFDate(item.date.split('T')[0])
    setFExpiryDate(item.expiryDate ? item.expiryDate.split('T')[0] : '')
    setFIsImportant(item.isImportant); setFIsPublished(item.isPublished)
    setShowForm(true)
  }

  const handleSave = async () => {
    if (!fTitle.trim() || !fDescription.trim()) { showError('Title and description are required'); return }
    setIsSaving(true)
    try {
      const payload = { title: fTitle, description: fDescription, category: fCategory, attachment: fAttachment || undefined, date: fDate, expiryDate: fExpiryDate || undefined, isImportant: fIsImportant, isPublished: fIsPublished }
      const url = editingId ? `/api/admin/notices/${editingId}` : '/api/admin/notices'
      const method = editingId ? 'PATCH' : 'POST'
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const json = await res.json()
      if (json.success) { success(editingId ? 'Notice updated' : 'Notice created'); setShowForm(false); resetForm(); fetchNotices() }
      else showError(json.error?.message || 'Save failed')
    } catch { showError('Network error') }
    finally { setIsSaving(false) }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    const res = await fetch(`/api/admin/notices/${deleteTarget.id}`, { method: 'DELETE' })
    const json = await res.json()
    if (json.success) { success('Notice deleted'); setDeleteTarget(null); fetchNotices() }
    else showError('Delete failed')
  }

  const handleQuickToggle = async (item: NoticeItem) => {
    const res = await fetch(`/api/admin/notices/${item.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isPublished: !item.isPublished }) })
    const json = await res.json()
    if (json.success) { success(`Notice ${!item.isPublished ? 'published' : 'unpublished'}`); fetchNotices() }
    else showError('Toggle failed')
  }

  const isExpired = (expiryDate?: string) => expiryDate ? new Date(expiryDate) < new Date() : false

  return (
    <div>
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1 1 200px' }}>
          <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'hsl(220, 15%, 55%)' }} />
          <input style={{ ...inputStyle, paddingLeft: '2.25rem' }} value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} placeholder="Search notices..." />
        </div>
        <select style={{ ...inputStyle, width: 'auto' }} value={publishedFilter} onChange={e => { setPublishedFilter(e.target.value); setPage(1) }}>
          <option value="">All</option>
          <option value="true">Published</option>
          <option value="false">Unpublished</option>
        </select>
        <select style={{ ...inputStyle, width: 'auto' }} value={categoryFilter} onChange={e => { setCategoryFilter(e.target.value); setPage(1) }}>
          <option value="">All Categories</option>
          {NOTICE_CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
        </select>
        <button onClick={() => { resetForm(); setShowForm(true) }} style={{ padding: '0.625rem 1.25rem', background: 'hsl(220, 65%, 28%)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap' }}>
          <Plus size={16} /> New Notice
        </button>
      </div>

      <TableContainer>
        <Table>
          <Thead><Tr><Th>Title</Th><Th>Category</Th><Th>Date</Th><Th>Expiry</Th><Th>Flags</Th><Th>Status</Th><Th>Actions</Th></Tr></Thead>
          <Tbody>
            {isLoading ? (
              <Tr><Td colSpan={7} style={{ textAlign: 'center', padding: '3rem' }}><Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} /></Td></Tr>
            ) : items.length === 0 ? (
              <Tr><Td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'hsl(220, 15%, 50%)' }}>No notices found. Create one!</Td></Tr>
            ) : items.map(item => (
              <Tr key={item.id}>
                <Td>
                  <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    {item.isImportant && <Pin size={13} style={{ color: 'hsl(0, 70%, 50%)', flexShrink: 0 }} />}
                    {item.title}
                  </div>
                  {item.attachment && <div style={{ fontSize: '0.8125rem', color: 'hsl(220, 65%, 35%)', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Paperclip size={11} /> Attachment</div>}
                </Td>
                <Td><span style={{ fontSize: '0.8125rem', padding: '0.2rem 0.5rem', background: 'hsl(220, 20%, 94%)', borderRadius: '4px', fontWeight: 600 }}>{item.category}</span></Td>
                <Td style={{ fontSize: '0.875rem' }}>{new Date(item.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</Td>
                <Td style={{ fontSize: '0.875rem', color: isExpired(item.expiryDate) ? 'hsl(0, 70%, 45%)' : 'hsl(220, 15%, 50%)' }}>
                  {item.expiryDate ? new Date(item.expiryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'}
                  {isExpired(item.expiryDate) && <span style={{ fontSize: '0.75rem', marginLeft: '0.3rem' }}>(Expired)</span>}
                </Td>
                <Td>{item.isImportant && <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', background: 'hsl(0, 80%, 93%)', color: 'hsl(0, 70%, 40%)', borderRadius: '4px', fontWeight: 700 }}>Important</span>}</Td>
                <Td><Badge variant={item.isPublished ? 'success' : 'warning'}>{item.isPublished ? 'Published' : 'Draft'}</Badge></Td>
                <Td>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <button onClick={() => openEdit(item)} style={{ padding: '0.375rem', background: 'hsl(220, 70%, 94%)', color: 'hsl(220, 65%, 28%)', border: 'none', borderRadius: '6px', cursor: 'pointer' }}><Edit2 size={14} /></button>
                    <button onClick={() => handleQuickToggle(item)} style={{ padding: '0.375rem', background: item.isPublished ? 'hsl(40, 95%, 92%)' : 'hsl(140, 60%, 92%)', color: item.isPublished ? 'hsl(40, 95%, 30%)' : 'hsl(140, 70%, 25%)', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                      {item.isPublished ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                    <button onClick={() => setDeleteTarget(item)} style={{ padding: '0.375rem', background: 'hsl(0, 80%, 95%)', color: 'hsl(0, 70%, 40%)', border: 'none', borderRadius: '6px', cursor: 'pointer' }}><Trash2 size={14} /></button>
                  </div>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>

      {pagination.totalPages > 1 && (
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginTop: '1rem' }}>
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ padding: '0.375rem 0.625rem', border: '1px solid hsl(220, 20%, 82%)', borderRadius: '6px', background: '#fff', cursor: 'pointer' }}><ChevronLeft size={15} /></button>
          <span style={{ padding: '0.375rem 0.75rem', fontWeight: 600 }}>{page} / {pagination.totalPages}</span>
          <button onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))} disabled={page === pagination.totalPages} style={{ padding: '0.375rem 0.625rem', border: '1px solid hsl(220, 20%, 82%)', borderRadius: '6px', background: '#fff', cursor: 'pointer' }}><ChevronRight size={15} /></button>
        </div>
      )}

      {/* Notice Form Modal */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 1000, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '1.5rem', overflowY: 'auto' }}>
          <div style={{ background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '650px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.5rem', borderBottom: '1px solid hsl(220, 20%, 92%)' }}>
              <h2 style={{ fontWeight: 800, fontSize: '1.125rem', margin: 0 }}>{editingId ? 'Edit Notice' : 'New Notice'}</h2>
              <button onClick={() => { setShowForm(false); resetForm() }} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={22} /></button>
            </div>
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '80vh', overflowY: 'auto' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ gridColumn: '1 / -1' }}><label style={labelStyle}>Title *</label><input style={inputStyle} value={fTitle} onChange={e => setFTitle(e.target.value)} /></div>
                <div><label style={labelStyle}>Category</label>
                  <select style={inputStyle} value={fCategory} onChange={e => setFCategory(e.target.value)}>
                    {NOTICE_CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                  </select>
                </div>
                <div><label style={labelStyle}>Date</label><input style={inputStyle} type="date" value={fDate} onChange={e => setFDate(e.target.value)} /></div>
                <div><label style={labelStyle}>Expiry Date (optional)</label><input style={inputStyle} type="date" value={fExpiryDate} onChange={e => setFExpiryDate(e.target.value)} /></div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>Attachment (PDF URL)</label>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <input style={{ ...inputStyle, flex: 1 }} value={fAttachment} onChange={e => setFAttachment(e.target.value)} placeholder="/uploads/notice.pdf" />
                    <button type="button" onClick={() => setShowMediaPicker(true)} style={{ padding: '0.625rem 0.875rem', background: 'hsl(220, 20%, 94%)', border: '1px solid hsl(220, 20%, 82%)', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, whiteSpace: 'nowrap', fontSize: '0.875rem' }}>
                      <Paperclip size={15} /> Pick
                    </button>
                  </div>
                </div>
                <div style={{ gridColumn: '1 / -1' }}><label style={labelStyle}>Description *</label><textarea rows={4} style={{ ...inputStyle, resize: 'vertical' }} value={fDescription} onChange={e => setFDescription(e.target.value)} /></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input type="checkbox" id="isImportant" checked={fIsImportant} onChange={e => setFIsImportant(e.target.checked)} />
                  <label htmlFor="isImportant" style={{ fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' }}>Mark as Important / Pinned</label>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input type="checkbox" id="isPublished" checked={fIsPublished} onChange={e => setFIsPublished(e.target.checked)} />
                  <label htmlFor="isPublished" style={{ fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' }}>Publish Immediately</label>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button onClick={() => { setShowForm(false); resetForm() }} style={{ padding: '0.625rem 1.25rem', border: '1px solid hsl(220, 20%, 82%)', borderRadius: '8px', background: '#fff', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
                <button onClick={handleSave} disabled={isSaving} style={{ padding: '0.625rem 1.5rem', background: 'hsl(220, 65%, 28%)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {isSaving ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={15} />} {isSaving ? 'Saving...' : 'Save Notice'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && <ConfirmDialog isOpen={!!deleteTarget} title="Delete Notice" message={`Delete "${deleteTarget.title}"?`} confirmText="Delete" danger onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} onClose={() => setDeleteTarget(null)} />}
      {showMediaPicker && <MediaPickerModal isOpen={showMediaPicker} onSelect={media => { setFAttachment(media.url); setShowMediaPicker(false) }} onClose={() => setShowMediaPicker(false)} />}
    </div>
  )
}
