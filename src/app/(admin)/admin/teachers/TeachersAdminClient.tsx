'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/admin/ui/Card'
import { TableContainer, Table, Thead, Tbody, Tr, Th, Td, Badge } from '@/components/admin/ui/Table'
import { ConfirmDialog } from '@/components/admin/ui/ConfirmDialog'
import { useToast } from '@/components/admin/ui/Toast'
import { MediaPickerModal } from '@/components/admin/ui/MediaPickerModal'
import {
  Users,
  Plus,
  Search,
  Edit2,
  Trash2,
  Image as ImageIcon,
  Loader2,
  X,
  Star,
  Mail,
  Phone,
} from 'lucide-react'
import Image from 'next/image'

interface TeacherItem {
  id: string
  name: string
  slug?: string | null
  designation: string
  qualification: string
  department: string
  bio?: string | null
  photo?: string | null
  experience?: string | null
  specialization?: string | null
  email?: string | null
  phone?: string | null
  order: number
  status: string
  isActive: boolean
  isFeatured: boolean
}

const DEPARTMENTS = [
  'Leadership & Administration',
  'Science',
  'Mathematics',
  'Languages (English & Hindi)',
  'Social Sciences',
  'Computer Science & ICT',
  'Arts & Cultural',
  'Physical Education & Sports',
  'Pre-Primary & Kindergarten',
]

export function TeachersAdminClient() {
  const { success, error: showError } = useToast()
  const [teachers, setTeachers] = useState<TeacherItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [deptFilter, setDeptFilter] = useState('all')

  // Modal
  const [editingTeacher, setEditingTeacher] = useState<TeacherItem | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [form, setForm] = useState({
    name: '',
    designation: '',
    qualification: '',
    department: DEPARTMENTS[0],
    bio: '',
    photo: '',
    experience: '',
    specialization: '',
    email: '',
    phone: '',
    order: 0,
    status: 'ACTIVE',
    isFeatured: false,
  })

  // Media Picker
  const [showMediaPicker, setShowMediaPicker] = useState(false)

  // Delete Confirm
  const [deleteTarget, setDeleteTarget] = useState<TeacherItem | null>(null)

  const fetchTeachers = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/teachers')
      const json = await res.json()
      if (json.success) setTeachers(json.data)
      else showError(json.error?.message || 'Failed to load teachers')
    } catch {
      showError('Network error loading teachers')
    } finally {
      setLoading(false)
    }
  }, [showError])

  useEffect(() => {
    fetchTeachers()
  }, [fetchTeachers])

  const openCreateModal = () => {
    setIsNew(true)
    setForm({
      name: '',
      designation: '',
      qualification: '',
      department: DEPARTMENTS[0],
      bio: '',
      photo: '',
      experience: '',
      specialization: '',
      email: '',
      phone: '',
      order: teachers.length,
      status: 'ACTIVE',
      isFeatured: false,
    })
    setEditingTeacher({} as any)
  }

  const openEditModal = (t: TeacherItem) => {
    setIsNew(false)
    setEditingTeacher(t)
    setForm({
      name: t.name,
      designation: t.designation,
      qualification: t.qualification || '',
      department: t.department || DEPARTMENTS[0],
      bio: t.bio || '',
      photo: t.photo || '',
      experience: t.experience || '',
      specialization: t.specialization || '',
      email: t.email || '',
      phone: t.phone || '',
      order: t.order,
      status: t.status || 'ACTIVE',
      isFeatured: t.isFeatured || false,
    })
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim() || !form.designation.trim()) return

    setIsSaving(true)
    try {
      const url = isNew ? '/api/admin/teachers' : `/api/admin/teachers/${editingTeacher?.id}`
      const method = isNew ? 'POST' : 'PATCH'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const json = await res.json()
      if (json.success) {
        success(isNew ? 'Teacher profile created' : 'Teacher profile updated')
        setEditingTeacher(null)
        fetchTeachers()
      } else {
        showError(json.error?.message || 'Failed to save teacher')
      }
    } catch {
      showError('Network error saving teacher')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      const res = await fetch(`/api/admin/teachers/${deleteTarget.id}`, { method: 'DELETE' })
      const json = await res.json()
      if (json.success) {
        success('Teacher profile removed')
        setDeleteTarget(null)
        fetchTeachers()
      } else {
        showError(json.error?.message || 'Failed to delete teacher')
      }
    } catch {
      showError('Network error deleting teacher')
    }
  }

  const filteredTeachers = teachers.filter((t) => {
    const matchSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.designation.toLowerCase().includes(search.toLowerCase()) ||
      t.department.toLowerCase().includes(search.toLowerCase())
    const matchDept = deptFilter === 'all' || t.department === deptFilter
    return matchSearch && matchDept
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
            Teachers & Staff Directory CMS
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'hsl(220, 15%, 50%)', margin: '0.25rem 0 0 0' }}>
            Manage faculty profiles, leadership, designations, qualifications, and department info
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
          <Plus size={16} /> Add Teacher / Staff
        </button>
      </div>

      {/* Filter and Search Bar */}
      <Card style={{ marginBottom: '1.5rem' }}>
        <CardContent style={{ padding: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: '2 1 220px' }}>
            <Search size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'hsl(220, 15%, 50%)' }} />
            <input
              type="text"
              placeholder="Search faculty by name or designation..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ ...inputStyle, paddingLeft: '2.5rem' }}
            />
          </div>

          <div style={{ flex: '1 1 200px' }}>
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              style={inputStyle}
            >
              <option value="all">All Departments</option>
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Teachers Table */}
      <Card>
        <CardContent style={{ padding: 0 }}>
          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'hsl(220, 15%, 50%)' }}>
              <Loader2 size={24} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 0.5rem auto' }} />
              Loading faculty members...
            </div>
          ) : filteredTeachers.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'hsl(220, 15%, 50%)' }}>
              <Users size={40} style={{ margin: '0 auto 0.75rem auto', color: 'hsl(220, 15%, 65%)' }} />
              <h3 style={{ margin: '0 0 0.25rem 0', color: 'hsl(220, 35%, 20%)' }}>No Faculty Profiles</h3>
              <p style={{ margin: 0 }}>Click "Add Teacher / Staff" to add faculty members.</p>
            </div>
          ) : (
            <TableContainer>
              <Table>
                <Thead>
                  <Tr>
                    <Th>Photo</Th>
                    <Th>Name & Designation</Th>
                    <Th>Department</Th>
                    <Th>Qualification</Th>
                    <Th>Order</Th>
                    <Th>Status</Th>
                    <Th style={{ textAlign: 'right' }}>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {filteredTeachers.map((t) => (
                    <Tr key={t.id}>
                      <Td style={{ width: '56px' }}>
                        <div style={{ position: 'relative', width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden', background: 'hsl(220, 20%, 92%)' }}>
                          {t.photo ? (
                            <Image src={t.photo} alt={t.name} fill sizes="40px" style={{ objectFit: 'cover' }} />
                          ) : (
                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'hsl(220, 65%, 35%)' }}>
                              {t.name.charAt(0)}
                            </div>
                          )}
                        </div>
                      </Td>
                      <Td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <span style={{ fontWeight: 700, color: 'hsl(220, 35%, 15%)' }}>{t.name}</span>
                          {t.isFeatured && <Star size={13} fill="hsl(40, 95%, 45%)" color="hsl(40, 95%, 45%)" />}
                        </div>
                        <div style={{ fontSize: '0.8125rem', color: 'hsl(40, 92%, 40%)', fontWeight: 600 }}>
                          {t.designation}
                        </div>
                      </Td>
                      <Td>
                        <Badge variant="default">{t.department}</Badge>
                      </Td>
                      <Td>
                        <span style={{ fontSize: '0.8125rem', color: 'hsl(220, 20%, 35%)' }}>
                          {t.qualification || '—'}
                        </span>
                      </Td>
                      <Td>{t.order}</Td>
                      <Td>
                        <Badge variant={t.status === 'ACTIVE' ? 'success' : 'default'}>
                          {t.status}
                        </Badge>
                      </Td>
                      <Td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                          <button
                            type="button"
                            title="Edit"
                            onClick={() => openEditModal(t)}
                            style={{ padding: '0.35rem 0.5rem', borderRadius: '6px', border: '1px solid hsl(220, 20%, 85%)', background: '#fff', cursor: 'pointer' }}
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            type="button"
                            title="Delete"
                            onClick={() => setDeleteTarget(t)}
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
      {editingTeacher && (
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
          onClick={() => setEditingTeacher(null)}
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
                {isNew ? 'Add Teacher / Faculty Member' : 'Edit Faculty Details'}
              </h3>
              <button
                type="button"
                onClick={() => setEditingTeacher(null)}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} style={{ padding: '1.25rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={labelStyle}>Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Ramesh Gupta"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Designation *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Senior PGT Physics"
                    value={form.designation}
                    onChange={(e) => setForm({ ...form, designation: e.target.value })}
                    style={inputStyle}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={labelStyle}>Department</label>
                  <select
                    value={form.department}
                    onChange={(e) => setForm({ ...form, department: e.target.value })}
                    style={inputStyle}
                  >
                    {DEPARTMENTS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Highest Qualification</label>
                  <input
                    type="text"
                    placeholder="e.g. M.Sc, B.Ed"
                    value={form.qualification}
                    onChange={(e) => setForm({ ...form, qualification: e.target.value })}
                    style={inputStyle}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={labelStyle}>Experience</label>
                  <input
                    type="text"
                    placeholder="e.g. 12+ Years"
                    value={form.experience}
                    onChange={(e) => setForm({ ...form, experience: e.target.value })}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Specialization / Subject</label>
                  <input
                    type="text"
                    placeholder="e.g. Optics & Modern Physics"
                    value={form.specialization}
                    onChange={(e) => setForm({ ...form, specialization: e.target.value })}
                    style={inputStyle}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={labelStyle}>Profile Photo</label>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <input
                    type="text"
                    placeholder="/uploads/... or image URL"
                    value={form.photo}
                    onChange={(e) => setForm({ ...form, photo: e.target.value })}
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

              <div style={{ marginBottom: '1rem' }}>
                <label style={labelStyle}>Short Biography</label>
                <textarea
                  rows={2}
                  placeholder="Teaching philosophy and background..."
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  style={inputStyle}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <label style={labelStyle}>Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    style={inputStyle}
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
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

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={form.isFeatured}
                    onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                  />
                  Feature on Homepage Staff Carousel
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setEditingTeacher(null)}
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
                  <span>{isNew ? 'Create Profile' : 'Save Changes'}</span>
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
            setForm((prev) => ({ ...prev, photo: media.url }))
            setShowMediaPicker(false)
          }}
          onClose={() => setShowMediaPicker(false)}
        />
      )}

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete Faculty Profile"
        message={`Are you sure you want to delete profile for "${deleteTarget?.name}"?`}
        confirmText="Delete Profile"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  )
}
