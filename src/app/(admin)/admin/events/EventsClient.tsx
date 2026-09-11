'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/admin/ui/Card'
import { TableContainer, Table, Thead, Tbody, Tr, Th, Td, Badge } from '@/components/admin/ui/Table'
import { ConfirmDialog } from '@/components/admin/ui/ConfirmDialog'
import { useToast } from '@/components/admin/ui/Toast'
import { MediaPickerModal } from '@/components/admin/ui/MediaPickerModal'
import { Plus, Search, Edit2, Trash2, Eye, EyeOff, X, Save, Loader2, Image as ImageIcon, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react'

interface EventItem {
  id: string; title: string; slug: string; description: string; image?: string
  startDate: string; endDate?: string; startTime?: string; endTime?: string
  location?: string; registrationUrl?: string; category: string; status: string; createdAt: string
}

const EVENT_CATEGORIES = ['general', 'academic', 'sports', 'cultural', 'science', 'annual', 'workshop']

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

export function EventsClient() {
  const { success, error: showError } = useToast()
  const [items, setItems] = useState<EventItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ total: 0, totalPages: 0 })
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<EventItem | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [showMediaPicker, setShowMediaPicker] = useState(false)

  // Form state
  const [fTitle, setFTitle] = useState('')
  const [fSlug, setFSlug] = useState('')
  const [fDescription, setFDescription] = useState('')
  const [fImage, setFImage] = useState('')
  const [fStartDate, setFStartDate] = useState('')
  const [fEndDate, setFEndDate] = useState('')
  const [fStartTime, setFStartTime] = useState('')
  const [fEndTime, setFEndTime] = useState('')
  const [fLocation, setFLocation] = useState('')
  const [fRegistrationUrl, setFRegistrationUrl] = useState('')
  const [fCategory, setFCategory] = useState('general')
  const [fStatus, setFStatus] = useState<'DRAFT' | 'PUBLISHED'>('DRAFT')

  const fetchEvents = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), ...(search && { search }), ...(statusFilter && { status: statusFilter }) })
      const res = await fetch(`/api/admin/events?${params}`)
      const json = await res.json()
      if (json.success) { setItems(json.data.events); setPagination(json.data.pagination) }
    } catch { showError('Failed to load events') }
    finally { setIsLoading(false) }
  }, [page, search, statusFilter])

  useEffect(() => { fetchEvents() }, [fetchEvents])

  const resetForm = () => {
    setFTitle(''); setFSlug(''); setFDescription(''); setFImage(''); setFStartDate('')
    setFEndDate(''); setFStartTime(''); setFEndTime(''); setFLocation('')
    setFRegistrationUrl(''); setFCategory('general'); setFStatus('DRAFT'); setEditingId(null)
  }

  const openEdit = async (item: EventItem) => {
    setEditingId(item.id)
    const res = await fetch(`/api/admin/events/${item.id}`)
    const json = await res.json()
    if (json.success) {
      const e = json.data
      setFTitle(e.title); setFSlug(e.slug); setFDescription(e.description); setFImage(e.image || '')
      setFStartDate(e.startDate?.split('T')[0] || ''); setFEndDate(e.endDate?.split('T')[0] || '')
      setFStartTime(e.startTime || ''); setFEndTime(e.endTime || '')
      setFLocation(e.location || ''); setFRegistrationUrl(e.registrationUrl || '')
      setFCategory(e.category); setFStatus(e.status as 'DRAFT' | 'PUBLISHED')
      setShowForm(true)
    }
  }

  const handleSave = async (status: 'DRAFT' | 'PUBLISHED') => {
    if (!fTitle.trim() || !fDescription.trim() || !fSlug.trim() || !fStartDate) {
      showError('Title, slug, description and start date are required'); return
    }
    setIsSaving(true)
    try {
      const payload = {
        title: fTitle, slug: fSlug, description: fDescription, image: fImage || undefined,
        startDate: fStartDate, endDate: fEndDate || undefined, startTime: fStartTime || undefined,
        endTime: fEndTime || undefined, location: fLocation || undefined,
        registrationUrl: fRegistrationUrl || undefined, category: fCategory, status,
      }
      const url = editingId ? `/api/admin/events/${editingId}` : '/api/admin/events'
      const method = editingId ? 'PATCH' : 'POST'
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const json = await res.json()
      if (json.success) { success(editingId ? 'Event updated' : 'Event created'); setShowForm(false); resetForm(); fetchEvents() }
      else showError(json.error?.message || 'Save failed')
    } catch { showError('Network error') }
    finally { setIsSaving(false) }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    const res = await fetch(`/api/admin/events/${deleteTarget.id}`, { method: 'DELETE' })
    const json = await res.json()
    if (json.success) { success('Event deleted'); setDeleteTarget(null); fetchEvents() }
    else showError(json.error?.message || 'Delete failed')
  }

  const handleQuickToggle = async (item: EventItem) => {
    const newStatus = item.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED'
    const res = await fetch(`/api/admin/events/${item.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: newStatus }) })
    const json = await res.json()
    if (json.success) { success(`Event ${newStatus === 'PUBLISHED' ? 'published' : 'unpublished'}`); fetchEvents() }
    else showError('Toggle failed')
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1 1 200px' }}>
          <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'hsl(220, 15%, 55%)' }} />
          <input style={{ ...inputStyle, paddingLeft: '2.25rem' }} value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} placeholder="Search events..." />
        </div>
        <select style={{ ...inputStyle, width: 'auto' }} value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }}>
          <option value="">All Statuses</option>
          <option value="DRAFT">Draft</option>
          <option value="PUBLISHED">Published</option>
        </select>
        <button onClick={() => { resetForm(); setShowForm(true) }} style={{ padding: '0.625rem 1.25rem', background: 'hsl(220, 65%, 28%)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap' }}>
          <Plus size={16} /> New Event
        </button>
      </div>

      <TableContainer>
        <Table>
          <Thead>
            <Tr><Th>Title</Th><Th>Date</Th><Th>Location</Th><Th>Category</Th><Th>Status</Th><Th>Actions</Th></Tr>
          </Thead>
          <Tbody>
            {isLoading ? (
              <Tr><Td colSpan={6} style={{ textAlign: 'center', padding: '3rem' }}><Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} /></Td></Tr>
            ) : items.length === 0 ? (
              <Tr><Td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'hsl(220, 15%, 50%)' }}>No events found. Create one!</Td></Tr>
            ) : items.map(item => (
              <Tr key={item.id}>
                <Td><div style={{ fontWeight: 600 }}>{item.title}</div><div style={{ fontSize: '0.8125rem', color: 'hsl(220, 15%, 55%)', fontFamily: 'monospace' }}>/events/{item.slug}</div></Td>
                <Td style={{ fontSize: '0.875rem' }}>{new Date(item.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</Td>
                <Td style={{ fontSize: '0.875rem' }}>{item.location || '—'}</Td>
                <Td><span style={{ fontSize: '0.8125rem', padding: '0.2rem 0.5rem', background: 'hsl(220, 20%, 94%)', borderRadius: '4px', fontWeight: 600 }}>{item.category}</span></Td>
                <Td><Badge variant={item.status === 'PUBLISHED' ? 'success' : 'warning'}>{item.status === 'PUBLISHED' ? 'Published' : 'Draft'}</Badge></Td>
                <Td>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <button onClick={() => openEdit(item)} style={{ padding: '0.375rem', background: 'hsl(220, 70%, 94%)', color: 'hsl(220, 65%, 28%)', border: 'none', borderRadius: '6px', cursor: 'pointer' }}><Edit2 size={14} /></button>
                    <button onClick={() => handleQuickToggle(item)} style={{ padding: '0.375rem', background: item.status === 'PUBLISHED' ? 'hsl(40, 95%, 92%)' : 'hsl(140, 60%, 92%)', color: item.status === 'PUBLISHED' ? 'hsl(40, 95%, 30%)' : 'hsl(140, 70%, 25%)', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                      {item.status === 'PUBLISHED' ? <EyeOff size={14} /> : <Eye size={14} />}
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

      {/* Event Form Modal */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 1000, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '1.5rem', overflowY: 'auto' }}>
          <div style={{ background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '700px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.5rem', borderBottom: '1px solid hsl(220, 20%, 92%)' }}>
              <h2 style={{ fontWeight: 800, fontSize: '1.125rem', margin: 0 }}>{editingId ? 'Edit Event' : 'New Event'}</h2>
              <button onClick={() => { setShowForm(false); resetForm() }} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={22} /></button>
            </div>
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '80vh', overflowY: 'auto' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>Title *</label>
                  <input style={inputStyle} value={fTitle} onChange={e => { setFTitle(e.target.value); if (!editingId) setFSlug(generateSlug(e.target.value)) }} />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>Slug *</label>
                  <input style={{ ...inputStyle, fontFamily: 'monospace' }} value={fSlug} onChange={e => setFSlug(e.target.value)} />
                </div>
                <div><label style={labelStyle}>Start Date *</label><input style={inputStyle} type="date" value={fStartDate} onChange={e => setFStartDate(e.target.value)} /></div>
                <div><label style={labelStyle}>End Date</label><input style={inputStyle} type="date" value={fEndDate} onChange={e => setFEndDate(e.target.value)} /></div>
                <div><label style={labelStyle}>Start Time</label><input style={inputStyle} type="time" value={fStartTime} onChange={e => setFStartTime(e.target.value)} /></div>
                <div><label style={labelStyle}>End Time</label><input style={inputStyle} type="time" value={fEndTime} onChange={e => setFEndTime(e.target.value)} /></div>
                <div style={{ gridColumn: '1 / -1' }}><label style={labelStyle}>Location / Venue</label><input style={inputStyle} value={fLocation} onChange={e => setFLocation(e.target.value)} placeholder="School Auditorium, Ground, etc." /></div>
                <div><label style={labelStyle}>Category</label>
                  <select style={inputStyle} value={fCategory} onChange={e => setFCategory(e.target.value)}>
                    {EVENT_CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                  </select>
                </div>
                <div><label style={labelStyle}>Registration / CTA Link</label><input style={inputStyle} value={fRegistrationUrl} onChange={e => setFRegistrationUrl(e.target.value)} placeholder="https://..." /></div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>Event Image</label>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <input style={{ ...inputStyle, flex: 1 }} value={fImage} onChange={e => setFImage(e.target.value)} placeholder="/uploads/..." />
                    <button type="button" onClick={() => setShowMediaPicker(true)} style={{ padding: '0.625rem 0.875rem', background: 'hsl(220, 20%, 94%)', border: '1px solid hsl(220, 20%, 82%)', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, whiteSpace: 'nowrap', fontSize: '0.875rem' }}>
                      <ImageIcon size={15} /> Pick
                    </button>
                  </div>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>Description *</label>
                  <textarea rows={5} style={{ ...inputStyle, resize: 'vertical' }} value={fDescription} onChange={e => setFDescription(e.target.value)} placeholder="Event details and information..." />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button onClick={() => { setShowForm(false); resetForm() }} style={{ padding: '0.625rem 1.25rem', border: '1px solid hsl(220, 20%, 82%)', borderRadius: '8px', background: '#fff', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
                <button onClick={() => handleSave('DRAFT')} disabled={isSaving} style={{ padding: '0.625rem 1.25rem', background: 'hsl(220, 20%, 94%)', border: '1px solid hsl(220, 20%, 82%)', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>Save Draft</button>
                <button onClick={() => handleSave('PUBLISHED')} disabled={isSaving} style={{ padding: '0.625rem 1.5rem', background: 'hsl(220, 65%, 28%)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {isSaving ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={15} />} {isSaving ? 'Saving...' : 'Publish'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && <ConfirmDialog isOpen={!!deleteTarget} title="Delete Event" message={`Delete "${deleteTarget.title}"?`} confirmText="Delete" danger onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} onClose={() => setDeleteTarget(null)} />}
      {showMediaPicker && <MediaPickerModal isOpen={showMediaPicker} onSelect={media => { setFImage(media.url); setShowMediaPicker(false) }} onClose={() => setShowMediaPicker(false)} />}
    </div>
  )
}
