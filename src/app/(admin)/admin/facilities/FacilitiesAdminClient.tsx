'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/admin/ui/Card'
import { TableContainer, Table, Thead, Tbody, Tr, Th, Td, Badge } from '@/components/admin/ui/Table'
import { ConfirmDialog } from '@/components/admin/ui/ConfirmDialog'
import { useToast } from '@/components/admin/ui/Toast'
import { MediaPickerModal } from '@/components/admin/ui/MediaPickerModal'
import {
  Building2,
  Plus,
  Search,
  Edit2,
  Trash2,
  Image as ImageIcon,
  Loader2,
  X,
  CheckCircle2,
} from 'lucide-react'
import Image from 'next/image'

interface FacilityItem {
  id: string
  title: string
  slug: string
  description: string
  content?: string | null
  image?: string | null
  icon?: string | null
  features: string
  order: number
  status: string
  isActive: boolean
}

export function FacilitiesAdminClient() {
  const { success, error: showError } = useToast()
  const [facilities, setFacilities] = useState<FacilityItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  // Modal
  const [editingFacility, setEditingFacility] = useState<FacilityItem | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [form, setForm] = useState({
    title: '',
    slug: '',
    description: '',
    content: '',
    image: '',
    icon: 'Building2',
    featuresText: '',
    order: 0,
    status: 'PUBLISHED',
  })

  // Media Picker
  const [showMediaPicker, setShowMediaPicker] = useState(false)

  // Delete Confirm
  const [deleteTarget, setDeleteTarget] = useState<FacilityItem | null>(null)

  const fetchFacilities = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/facilities')
      const json = await res.json()
      if (json.success) setFacilities(json.data)
      else showError(json.error?.message || 'Failed to load facilities')
    } catch {
      showError('Network error loading facilities')
    } finally {
      setLoading(false)
    }
  }, [showError])

  useEffect(() => {
    fetchFacilities()
  }, [fetchFacilities])

  const openCreateModal = () => {
    setIsNew(true)
    setForm({
      title: '',
      slug: '',
      description: '',
      content: '',
      image: '',
      icon: 'Building2',
      featuresText: '',
      order: facilities.length,
      status: 'PUBLISHED',
    })
    setEditingFacility({} as any)
  }

  const openEditModal = (f: FacilityItem) => {
    setIsNew(false)
    setEditingFacility(f)
    let parsedFeatures = ''
    try { parsedFeatures = JSON.parse(f.features || '[]').join('\n') } catch { parsedFeatures = f.features || '' }

    setForm({
      title: f.title,
      slug: f.slug,
      description: f.description,
      content: f.content || '',
      image: f.image || '',
      icon: f.icon || 'Building2',
      featuresText: parsedFeatures,
      order: f.order,
      status: f.status || 'PUBLISHED',
    })
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) return

    setIsSaving(true)
    try {
      const featuresArray = form.featuresText.split('\n').map((s) => s.trim()).filter(Boolean)
      const payload = {
        title: form.title,
        slug: form.slug,
        description: form.description,
        content: form.content,
        image: form.image,
        icon: form.icon,
        features: featuresArray,
        order: form.order,
        status: form.status,
      }

      const url = isNew ? '/api/admin/facilities' : `/api/admin/facilities/${editingFacility?.id}`
      const method = isNew ? 'POST' : 'PATCH'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      if (json.success) {
        success(isNew ? 'Facility created successfully' : 'Facility updated successfully')
        setEditingFacility(null)
        fetchFacilities()
      } else {
        showError(json.error?.message || 'Failed to save facility')
      }
    } catch {
      showError('Network error saving facility')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      const res = await fetch(`/api/admin/facilities/${deleteTarget.id}`, { method: 'DELETE' })
      const json = await res.json()
      if (json.success) {
        success('Facility removed successfully')
        setDeleteTarget(null)
        fetchFacilities()
      } else {
        showError(json.error?.message || 'Failed to delete facility')
      }
    } catch {
      showError('Network error deleting facility')
    }
  }

  const filtered = facilities.filter(
    (f) =>
      f.title.toLowerCase().includes(search.toLowerCase()) ||
      f.description.toLowerCase().includes(search.toLowerCase())
  )

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
            Campus Facilities CMS
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'hsl(220, 15%, 50%)', margin: '0.25rem 0 0 0' }}>
            Manage laboratories, smart classrooms, sports infrastructure, libraries, and campus amenities
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
          <Plus size={16} /> Add Facility
        </button>
      </div>

      {/* Search Bar */}
      <Card style={{ marginBottom: '1.5rem' }}>
        <CardContent style={{ padding: '1rem' }}>
          <div style={{ position: 'relative', maxWidth: '400px' }}>
            <Search size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'hsl(220, 15%, 50%)' }} />
            <input
              type="text"
              placeholder="Search facilities..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ ...inputStyle, paddingLeft: '2.5rem' }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Facilities Table */}
      <Card>
        <CardContent style={{ padding: 0 }}>
          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'hsl(220, 15%, 50%)' }}>
              <Loader2 size={24} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 0.5rem auto' }} />
              Loading facilities...
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'hsl(220, 15%, 50%)' }}>
              <Building2 size={40} style={{ margin: '0 auto 0.75rem auto', color: 'hsl(220, 15%, 65%)' }} />
              <h3 style={{ margin: '0 0 0.25rem 0', color: 'hsl(220, 35%, 20%)' }}>No Facilities Added</h3>
              <p style={{ margin: 0 }}>Click "Add Facility" to configure your school campus facilities.</p>
            </div>
          ) : (
            <TableContainer>
              <Table>
                <Thead>
                  <Tr>
                    <Th>Cover</Th>
                    <Th>Facility Title</Th>
                    <Th>Key Features</Th>
                    <Th>Order</Th>
                    <Th>Status</Th>
                    <Th style={{ textAlign: 'right' }}>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {filtered.map((f) => {
                    let feats: string[] = []
                    try { feats = JSON.parse(f.features || '[]') } catch { feats = [] }

                    return (
                      <Tr key={f.id}>
                        <Td style={{ width: '64px' }}>
                          <div style={{ position: 'relative', width: '56px', height: '40px', borderRadius: '6px', overflow: 'hidden', background: 'hsl(220, 20%, 94%)' }}>
                            {f.image ? (
                              <Image src={f.image} alt={f.title} fill sizes="56px" style={{ objectFit: 'cover' }} />
                            ) : (
                              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Building2 size={18} style={{ color: 'hsl(220, 15%, 60%)' }} />
                              </div>
                            )}
                          </div>
                        </Td>
                        <Td>
                          <span style={{ fontWeight: 700, color: 'hsl(220, 35%, 15%)' }}>{f.title}</span>
                          <div style={{ fontSize: '0.75rem', color: 'hsl(220, 15%, 55%)' }}>/{f.slug}</div>
                        </Td>
                        <Td>
                          <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap', maxWidth: '320px' }}>
                            {feats.slice(0, 3).map((feat, idx) => (
                              <Badge key={idx} variant="default">{feat}</Badge>
                            ))}
                            {feats.length > 3 && <Badge variant="default">+{feats.length - 3}</Badge>}
                          </div>
                        </Td>
                        <Td>{f.order}</Td>
                        <Td>
                          <Badge variant={f.status === 'PUBLISHED' ? 'success' : 'default'}>
                            {f.status}
                          </Badge>
                        </Td>
                        <Td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                            <button
                              type="button"
                              title="Edit"
                              onClick={() => openEditModal(f)}
                              style={{ padding: '0.35rem 0.5rem', borderRadius: '6px', border: '1px solid hsl(220, 20%, 85%)', background: '#fff', cursor: 'pointer' }}
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              type="button"
                              title="Delete"
                              onClick={() => setDeleteTarget(f)}
                              style={{ padding: '0.35rem 0.5rem', borderRadius: '6px', border: '1px solid hsl(0, 75%, 85%)', background: 'hsl(0, 100%, 98%)', color: 'hsl(0, 75%, 45%)', cursor: 'pointer' }}
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </Td>
                      </Tr>
                    )
                  })}
                </Tbody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Modal */}
      {editingFacility && (
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
          onClick={() => setEditingFacility(null)}
        >
          <div
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '600px',
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
                {isNew ? 'Add Campus Facility' : 'Edit Facility Details'}
              </h3>
              <button
                type="button"
                onClick={() => setEditingFacility(null)}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} style={{ padding: '1.25rem' }}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={labelStyle}>Facility Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Composite Science & Robotics Lab"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  style={inputStyle}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={labelStyle}>Short Summary *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Concise overview of facilities, equipment, safety and features..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  style={inputStyle}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={labelStyle}>Feature Bullet Points (one per line)</label>
                <textarea
                  rows={3}
                  placeholder="Microscopes and chemistry apparatus&#10;Smart interactive digital board&#10;Full safety gear & first aid stations"
                  value={form.featuresText}
                  onChange={(e) => setForm({ ...form, featuresText: e.target.value })}
                  style={inputStyle}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={labelStyle}>Facility Image</label>
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
                  <label style={labelStyle}>Status</label>
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
                  onClick={() => setEditingFacility(null)}
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
                  <span>{isNew ? 'Create Facility' : 'Save Changes'}</span>
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
        title="Delete Facility"
        message={`Are you sure you want to delete facility "${deleteTarget?.title}"?`}
        confirmText="Delete Facility"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  )
}
