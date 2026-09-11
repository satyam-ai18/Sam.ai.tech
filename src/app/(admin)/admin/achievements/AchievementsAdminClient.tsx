'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/admin/ui/Card'
import { TableContainer, Table, Thead, Tbody, Tr, Th, Td, Badge } from '@/components/admin/ui/Table'
import { ConfirmDialog } from '@/components/admin/ui/ConfirmDialog'
import { useToast } from '@/components/admin/ui/Toast'
import { MediaPickerModal } from '@/components/admin/ui/MediaPickerModal'
import {
  Trophy,
  Plus,
  Search,
  Edit2,
  Trash2,
  Image as ImageIcon,
  Loader2,
  X,
  Award,
  Calendar,
} from 'lucide-react'
import Image from 'next/image'

interface AchievementItem {
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
  status: string
  isVisible: boolean
  order: number
}

const ACHIEVEMENT_CATEGORIES = ['academic', 'sports', 'cultural', 'science-olympiad', 'arts', 'general']

export function AchievementsAdminClient() {
  const { success, error: showError } = useToast()
  const [achievements, setAchievements] = useState<AchievementItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('all')

  // Modal
  const [editingItem, setEditingItem] = useState<AchievementItem | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [form, setForm] = useState({
    title: '',
    description: '',
    studentName: '',
    category: 'general',
    award: '',
    position: '',
    date: '',
    year: '2026',
    image: '',
    status: 'PUBLISHED',
    isVisible: true,
    order: 0,
  })

  // Media Picker
  const [showMediaPicker, setShowMediaPicker] = useState(false)

  // Delete Confirm
  const [deleteTarget, setDeleteTarget] = useState<AchievementItem | null>(null)

  const fetchAchievements = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/achievements')
      const json = await res.json()
      if (json.success) setAchievements(json.data)
      else showError(json.error?.message || 'Failed to load achievements')
    } catch {
      showError('Network error loading achievements')
    } finally {
      setLoading(false)
    }
  }, [showError])

  useEffect(() => {
    fetchAchievements()
  }, [fetchAchievements])

  const openCreateModal = () => {
    setIsNew(true)
    setForm({
      title: '',
      description: '',
      studentName: '',
      category: 'general',
      award: '',
      position: '',
      date: '',
      year: '2026',
      image: '',
      status: 'PUBLISHED',
      isVisible: true,
      order: achievements.length,
    })
    setEditingItem({} as any)
  }

  const openEditModal = (item: AchievementItem) => {
    setIsNew(false)
    setEditingItem(item)
    setForm({
      title: item.title,
      description: item.description || '',
      studentName: item.studentName || '',
      category: item.category || 'general',
      award: item.award || '',
      position: item.position || '',
      date: item.date ? item.date.split('T')[0] : '',
      year: item.year || '2026',
      image: item.image || '',
      status: item.status || 'PUBLISHED',
      isVisible: item.isVisible !== undefined ? item.isVisible : true,
      order: item.order,
    })
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) return

    setIsSaving(true)
    try {
      const url = isNew ? '/api/admin/achievements' : `/api/admin/achievements/${editingItem?.id}`
      const method = isNew ? 'POST' : 'PATCH'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const json = await res.json()
      if (json.success) {
        success(isNew ? 'Achievement created' : 'Achievement updated')
        setEditingItem(null)
        fetchAchievements()
      } else {
        showError(json.error?.message || 'Failed to save achievement')
      }
    } catch {
      showError('Network error saving achievement')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      const res = await fetch(`/api/admin/achievements/${deleteTarget.id}`, { method: 'DELETE' })
      const json = await res.json()
      if (json.success) {
        success('Achievement deleted')
        setDeleteTarget(null)
        fetchAchievements()
      } else {
        showError(json.error?.message || 'Failed to delete achievement')
      }
    } catch {
      showError('Network error deleting achievement')
    }
  }

  const filtered = achievements.filter((a) => {
    const matchSearch =
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      (a.studentName && a.studentName.toLowerCase().includes(search.toLowerCase())) ||
      (a.award && a.award.toLowerCase().includes(search.toLowerCase()))
    const matchCat = catFilter === 'all' || a.category === catFilter
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
            Achievements & Honors CMS
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'hsl(220, 15%, 50%)', margin: '0.25rem 0 0 0' }}>
            Record student accolades, CBSE board merit, sports trophies, Olympiad ranks, and cultural honors
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
          <Plus size={16} /> Add Achievement
        </button>
      </div>

      {/* Filter and Search */}
      <Card style={{ marginBottom: '1.5rem' }}>
        <CardContent style={{ padding: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: '2 1 220px' }}>
            <Search size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'hsl(220, 15%, 50%)' }} />
            <input
              type="text"
              placeholder="Search achievements by title, student name or award..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ ...inputStyle, paddingLeft: '2.5rem' }}
            />
          </div>

          <div style={{ flex: '1 1 180px' }}>
            <select
              value={catFilter}
              onChange={(e) => setCatFilter(e.target.value)}
              style={inputStyle}
            >
              <option value="all">All Categories</option>
              {ACHIEVEMENT_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c.replace('-', ' ').toUpperCase()}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent style={{ padding: 0 }}>
          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'hsl(220, 15%, 50%)' }}>
              <Loader2 size={24} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 0.5rem auto' }} />
              Loading achievements...
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'hsl(220, 15%, 50%)' }}>
              <Trophy size={40} style={{ margin: '0 auto 0.75rem auto', color: 'hsl(220, 15%, 65%)' }} />
              <h3 style={{ margin: '0 0 0.25rem 0', color: 'hsl(220, 35%, 20%)' }}>No Achievements Recorded</h3>
              <p style={{ margin: 0 }}>Click "Add Achievement" to log awards and honors.</p>
            </div>
          ) : (
            <TableContainer>
              <Table>
                <Thead>
                  <Tr>
                    <Th>Photo / Cert</Th>
                    <Th>Achievement Title</Th>
                    <Th>Student / Team</Th>
                    <Th>Category</Th>
                    <Th>Award / Rank</Th>
                    <Th>Year</Th>
                    <Th>Status</Th>
                    <Th style={{ textAlign: 'right' }}>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {filtered.map((a) => (
                    <Tr key={a.id}>
                      <Td style={{ width: '64px' }}>
                        <div style={{ position: 'relative', width: '56px', height: '40px', borderRadius: '6px', overflow: 'hidden', background: 'hsl(220, 20%, 94%)' }}>
                          {a.image ? (
                            <Image src={a.image} alt={a.title} fill sizes="56px" style={{ objectFit: 'cover' }} />
                          ) : (
                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Trophy size={18} style={{ color: 'hsl(40, 92%, 45%)' }} />
                            </div>
                          )}
                        </div>
                      </Td>
                      <Td>
                        <span style={{ fontWeight: 700, color: 'hsl(220, 35%, 15%)' }}>{a.title}</span>
                      </Td>
                      <Td>
                        <span style={{ fontWeight: 600, color: 'hsl(220, 65%, 28%)' }}>
                          {a.studentName || '—'}
                        </span>
                      </Td>
                      <Td>
                        <Badge variant="default">{a.category}</Badge>
                      </Td>
                      <Td>
                        <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'hsl(40, 92%, 40%)' }}>
                          {a.position || a.award || 'Winner'}
                        </span>
                      </Td>
                      <Td>{a.year || '—'}</Td>
                      <Td>
                        <Badge variant={a.isVisible ? 'success' : 'default'}>
                          {a.isVisible ? 'Visible' : 'Hidden'}
                        </Badge>
                      </Td>
                      <Td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                          <button
                            type="button"
                            title="Edit"
                            onClick={() => openEditModal(a)}
                            style={{ padding: '0.35rem 0.5rem', borderRadius: '6px', border: '1px solid hsl(220, 20%, 85%)', background: '#fff', cursor: 'pointer' }}
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            type="button"
                            title="Delete"
                            onClick={() => setDeleteTarget(a)}
                            style={{ padding: '0.35rem 0.5rem', borderRadius: '6px', border: '1px solid hsl(0, 75%, 85%)', background: 'hsl(0, 100%, 98%)', color: 'hsl(0, 75%, 45%)', cursor: 'pointer' }}
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

      {/* Modal */}
      {editingItem && (
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
          onClick={() => setEditingItem(null)}
        >
          <div
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '580px',
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
                {isNew ? 'Add Student Achievement' : 'Edit Achievement'}
              </h3>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} style={{ padding: '1.25rem' }}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={labelStyle}>Achievement / Competition Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. State Level Science Olympiad Gold Medal"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  style={inputStyle}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={labelStyle}>Student / Team Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Aarav Sharma (Class 8)"
                    value={form.studentName}
                    onChange={(e) => setForm({ ...form, studentName: e.target.value })}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    style={inputStyle}
                  >
                    {ACHIEVEMENT_CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c.replace('-', ' ').toUpperCase()}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={labelStyle}>Award / Position</label>
                  <input
                    type="text"
                    placeholder="e.g. 1st Rank / Gold Medal"
                    value={form.position}
                    onChange={(e) => setForm({ ...form, position: e.target.value })}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Year</label>
                  <input
                    type="text"
                    placeholder="e.g. 2026"
                    value={form.year}
                    onChange={(e) => setForm({ ...form, year: e.target.value })}
                    style={inputStyle}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={labelStyle}>Description / Citation</label>
                <textarea
                  rows={2}
                  placeholder="Accolade details, organizers, and merit points..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  style={inputStyle}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={labelStyle}>Certificate / Award Image</label>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <input
                    type="text"
                    placeholder="/uploads/... or image URL"
                    value={form.image}
                    onChange={(e) => setForm({ ...form, image: e.target.value })}
                    style={{ ...inputStyle, flex: 1 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowMediaPicker(true)}
                    style={{ padding: '0.625rem 0.875rem', borderRadius: '8px', border: '1px solid hsl(220, 20%, 82%)', background: 'hsl(220, 20%, 96%)', cursor: 'pointer', fontWeight: 600, fontSize: '0.8125rem' }}
                  >
                    Browse Media
                  </button>
                </div>
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
                    <option value="DRAFT">Draft</option>
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
                  onClick={() => setEditingItem(null)}
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
                  <span>{isNew ? 'Add Achievement' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Media Picker */}
      {showMediaPicker && (
        <MediaPickerModal
          isOpen={showMediaPicker}
          onSelect={(media) => {
            setForm((prev) => ({ ...prev, image: media.url }))
            setShowMediaPicker(false)
          }}
          onClose={() => setShowMediaPicker(false)}
        />
      )}

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete Achievement"
        message={`Are you sure you want to delete achievement "${deleteTarget?.title}"?`}
        confirmText="Delete"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  )
}
