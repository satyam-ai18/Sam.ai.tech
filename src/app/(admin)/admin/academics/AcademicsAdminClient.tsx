'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/admin/ui/Card'
import { TableContainer, Table, Thead, Tbody, Tr, Th, Td, Badge } from '@/components/admin/ui/Table'
import { ConfirmDialog } from '@/components/admin/ui/ConfirmDialog'
import { useToast } from '@/components/admin/ui/Toast'
import { MediaPickerModal } from '@/components/admin/ui/MediaPickerModal'
import {
  BookOpen,
  Plus,
  Search,
  Edit2,
  Trash2,
  Image as ImageIcon,
  Loader2,
  X,
  Save,
  Layers,
  GraduationCap,
} from 'lucide-react'
import Image from 'next/image'

interface AcademicItem {
  id: string
  title: string
  slug: string
  description: string
  fullDescription?: string | null
  image?: string | null
  subjects: string
  highlights: string
  features: string
  ageGroup?: string | null
  eligibility?: string | null
  order: number
  status: string
  isActive: boolean
}

interface SubjectItem {
  id: string
  name: string
  code?: string | null
  description?: string | null
  classes: string
  icon?: string | null
  order: number
  isActive: boolean
}

export function AcademicsAdminClient() {
  const { success, error: showError } = useToast()
  const [activeTab, setActiveTab] = useState<'programs' | 'subjects'>('programs')

  // Programs state
  const [programs, setPrograms] = useState<AcademicItem[]>([])
  const [loadingPrograms, setLoadingPrograms] = useState(true)
  const [programModal, setProgramModal] = useState<AcademicItem | null>(null)
  const [isNewProgram, setIsNewProgram] = useState(false)
  const [isSavingProgram, setIsSavingProgram] = useState(false)
  const [programForm, setProgramForm] = useState({
    title: '',
    slug: '',
    description: '',
    fullDescription: '',
    image: '',
    subjectsText: '',
    highlightsText: '',
    featuresText: '',
    ageGroup: '',
    eligibility: '',
    order: 0,
    status: 'PUBLISHED',
  })

  // Subjects state
  const [subjects, setSubjects] = useState<SubjectItem[]>([])
  const [loadingSubjects, setLoadingSubjects] = useState(true)
  const [subjectModal, setSubjectModal] = useState<SubjectItem | null>(null)
  const [isNewSubject, setIsNewSubject] = useState(false)
  const [isSavingSubject, setIsSavingSubject] = useState(false)
  const [subjectForm, setSubjectForm] = useState({
    name: '',
    code: '',
    description: '',
    classesText: '',
    icon: '',
    order: 0,
    isActive: true,
  })

  // Media Picker
  const [showMediaPicker, setShowMediaPicker] = useState(false)

  // Delete Confirm
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'program' | 'subject'; id: string; name: string } | null>(null)

  const fetchPrograms = useCallback(async () => {
    setLoadingPrograms(true)
    try {
      const res = await fetch('/api/admin/academics')
      const json = await res.json()
      if (json.success) setPrograms(json.data)
      else showError(json.error?.message || 'Failed to load programs')
    } catch {
      showError('Network error loading programs')
    } finally {
      setLoadingPrograms(false)
    }
  }, [showError])

  const fetchSubjects = useCallback(async () => {
    setLoadingSubjects(true)
    try {
      const res = await fetch('/api/admin/academics/subjects')
      const json = await res.json()
      if (json.success) setSubjects(json.data)
      else showError(json.error?.message || 'Failed to load subjects')
    } catch {
      showError('Network error loading subjects')
    } finally {
      setLoadingSubjects(false)
    }
  }, [showError])

  useEffect(() => {
    fetchPrograms()
    fetchSubjects()
  }, [fetchPrograms, fetchSubjects])

  // Program Handlers
  const openCreateProgram = () => {
    setIsNewProgram(true)
    setProgramForm({
      title: '',
      slug: '',
      description: '',
      fullDescription: '',
      image: '',
      subjectsText: '',
      highlightsText: '',
      featuresText: '',
      ageGroup: '',
      eligibility: '',
      order: programs.length,
      status: 'PUBLISHED',
    })
    setProgramModal({} as any)
  }

  const openEditProgram = (p: AcademicItem) => {
    setIsNewProgram(false)
    setProgramModal(p)
    let parsedSubs = ''
    let parsedHigh = ''
    let parsedFeat = ''
    try { parsedSubs = JSON.parse(p.subjects || '[]').join(', ') } catch { parsedSubs = p.subjects || '' }
    try { parsedHigh = JSON.parse(p.highlights || '[]').join('\n') } catch { parsedHigh = p.highlights || '' }
    try { parsedFeat = JSON.parse(p.features || '[]').join('\n') } catch { parsedFeat = p.features || '' }

    setProgramForm({
      title: p.title,
      slug: p.slug,
      description: p.description,
      fullDescription: p.fullDescription || '',
      image: p.image || '',
      subjectsText: parsedSubs,
      highlightsText: parsedHigh,
      featuresText: parsedFeat,
      ageGroup: p.ageGroup || '',
      eligibility: p.eligibility || '',
      order: p.order,
      status: p.status,
    })
  }

  const handleSaveProgram = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!programForm.title.trim()) return

    setIsSavingProgram(true)
    try {
      const subjectsArray = programForm.subjectsText.split(',').map((s) => s.trim()).filter(Boolean)
      const highlightsArray = programForm.highlightsText.split('\n').map((s) => s.trim()).filter(Boolean)
      const featuresArray = programForm.featuresText.split('\n').map((s) => s.trim()).filter(Boolean)

      const payload = {
        title: programForm.title,
        slug: programForm.slug,
        description: programForm.description,
        fullDescription: programForm.fullDescription,
        image: programForm.image,
        subjects: subjectsArray,
        highlights: highlightsArray,
        features: featuresArray,
        ageGroup: programForm.ageGroup,
        eligibility: programForm.eligibility,
        order: programForm.order,
        status: programForm.status,
      }

      const url = isNewProgram ? '/api/admin/academics' : `/api/admin/academics/${programModal?.id}`
      const method = isNewProgram ? 'POST' : 'PATCH'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      if (json.success) {
        success(isNewProgram ? 'Program created successfully' : 'Program updated successfully')
        setProgramModal(null)
        fetchPrograms()
      } else {
        showError(json.error?.message || 'Failed to save program')
      }
    } catch {
      showError('Network error saving program')
    } finally {
      setIsSavingProgram(false)
    }
  }

  // Subject Handlers
  const openCreateSubject = () => {
    setIsNewSubject(true)
    setSubjectForm({
      name: '',
      code: '',
      description: '',
      classesText: '',
      icon: '',
      order: subjects.length,
      isActive: true,
    })
    setSubjectModal({} as any)
  }

  const openEditSubject = (s: SubjectItem) => {
    setIsNewSubject(false)
    setSubjectModal(s)
    let parsedClasses = ''
    try { parsedClasses = JSON.parse(s.classes || '[]').join(', ') } catch { parsedClasses = s.classes || '' }
    setSubjectForm({
      name: s.name,
      code: s.code || '',
      description: s.description || '',
      classesText: parsedClasses,
      icon: s.icon || '',
      order: s.order,
      isActive: s.isActive,
    })
  }

  const handleSaveSubject = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!subjectForm.name.trim()) return

    setIsSavingSubject(true)
    try {
      const classesArray = subjectForm.classesText.split(',').map((c) => c.trim()).filter(Boolean)
      const payload = {
        name: subjectForm.name,
        code: subjectForm.code,
        description: subjectForm.description,
        classes: classesArray,
        icon: subjectForm.icon,
        order: subjectForm.order,
        isActive: subjectForm.isActive,
      }

      const url = isNewSubject ? '/api/admin/academics/subjects' : `/api/admin/academics/subjects/${subjectModal?.id}`
      const method = isNewSubject ? 'POST' : 'PATCH'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      if (json.success) {
        success(isNewSubject ? 'Subject added successfully' : 'Subject updated successfully')
        setSubjectModal(null)
        fetchSubjects()
      } else {
        showError(json.error?.message || 'Failed to save subject')
      }
    } catch {
      showError('Network error saving subject')
    } finally {
      setIsSavingSubject(false)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    try {
      const url = deleteTarget.type === 'program'
        ? `/api/admin/academics/${deleteTarget.id}`
        : `/api/admin/academics/subjects/${deleteTarget.id}`

      const res = await fetch(url, { method: 'DELETE' })
      const json = await res.json()
      if (json.success) {
        success(`${deleteTarget.type === 'program' ? 'Program' : 'Subject'} deleted successfully`)
        setDeleteTarget(null)
        if (deleteTarget.type === 'program') fetchPrograms()
        else fetchSubjects()
      } else {
        showError(json.error?.message || 'Failed to delete')
      }
    } catch {
      showError('Network error deleting item')
    }
  }

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
            Academics CMS
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'hsl(220, 15%, 50%)', margin: '0.25rem 0 0 0' }}>
            Manage CBSE academic programs, grade wings, curriculum details, and subjects directory
          </p>
        </div>

        <button
          type="button"
          onClick={activeTab === 'programs' ? openCreateProgram : openCreateSubject}
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
          <Plus size={16} /> {activeTab === 'programs' ? 'Add Program / Wing' : 'Add Subject'}
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid hsl(220, 20%, 88%)', paddingBottom: '0.5rem' }}>
        <button
          type="button"
          onClick={() => setActiveTab('programs')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.625rem 1.25rem',
            borderRadius: '8px',
            border: 'none',
            background: activeTab === 'programs' ? 'hsl(220, 65%, 28%)' : 'transparent',
            color: activeTab === 'programs' ? '#ffffff' : 'hsl(220, 20%, 40%)',
            fontWeight: 600,
            fontSize: '0.875rem',
            cursor: 'pointer',
          }}
        >
          <GraduationCap size={16} />
          <span>Academic Programs & Wings ({programs.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('subjects')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.625rem 1.25rem',
            borderRadius: '8px',
            border: 'none',
            background: activeTab === 'subjects' ? 'hsl(220, 65%, 28%)' : 'transparent',
            color: activeTab === 'subjects' ? '#ffffff' : 'hsl(220, 20%, 40%)',
            fontWeight: 600,
            fontSize: '0.875rem',
            cursor: 'pointer',
          }}
        >
          <BookOpen size={16} />
          <span>Subjects Directory ({subjects.length})</span>
        </button>
      </div>

      {/* Programs Tab Content */}
      {activeTab === 'programs' && (
        <Card>
          <CardContent style={{ padding: 0 }}>
            {loadingPrograms ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: 'hsl(220, 15%, 50%)' }}>
                <Loader2 size={24} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 0.5rem auto' }} />
                Loading academic programs...
              </div>
            ) : programs.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: 'hsl(220, 15%, 50%)' }}>
                <GraduationCap size={40} style={{ margin: '0 auto 0.75rem auto', color: 'hsl(220, 15%, 65%)' }} />
                <h3 style={{ margin: '0 0 0.25rem 0', color: 'hsl(220, 35%, 20%)' }}>No Programs Configured</h3>
                <p style={{ margin: 0 }}>Click "Add Program / Wing" to create academic programs.</p>
              </div>
            ) : (
              <TableContainer>
                <Table>
                  <Thead>
                    <Tr>
                      <Th>Program / Wing</Th>
                      <Th>Age Group</Th>
                      <Th>Subjects</Th>
                      <Th>Order</Th>
                      <Th>Status</Th>
                      <Th style={{ textAlign: 'right' }}>Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {programs.map((p) => {
                      let subs: string[] = []
                      try { subs = JSON.parse(p.subjects || '[]') } catch { subs = [] }

                      return (
                        <Tr key={p.id}>
                          <Td>
                            <span style={{ fontWeight: 700, color: 'hsl(220, 35%, 15%)' }}>{p.title}</span>
                            <div style={{ fontSize: '0.75rem', color: 'hsl(220, 15%, 55%)' }}>/{p.slug}</div>
                          </Td>
                          <Td>
                            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'hsl(40, 92%, 40%)' }}>
                              {p.ageGroup || '—'}
                            </span>
                          </Td>
                          <Td>
                            <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap', maxWidth: '300px' }}>
                              {subs.slice(0, 4).map((s, idx) => (
                                <Badge key={idx} variant="default">{s}</Badge>
                              ))}
                              {subs.length > 4 && <Badge variant="default">+{subs.length - 4}</Badge>}
                            </div>
                          </Td>
                          <Td>{p.order}</Td>
                          <Td>
                            <Badge variant={p.status === 'PUBLISHED' ? 'success' : 'default'}>
                              {p.status}
                            </Badge>
                          </Td>
                          <Td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                              <button
                                type="button"
                                title="Edit Program"
                                onClick={() => openEditProgram(p)}
                                style={{ padding: '0.35rem 0.5rem', borderRadius: '6px', border: '1px solid hsl(220, 20%, 85%)', background: '#fff', cursor: 'pointer' }}
                              >
                                <Edit2 size={13} />
                              </button>
                              <button
                                type="button"
                                title="Delete Program"
                                onClick={() => setDeleteTarget({ type: 'program', id: p.id, name: p.title })}
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
      )}

      {/* Subjects Tab Content */}
      {activeTab === 'subjects' && (
        <Card>
          <CardContent style={{ padding: 0 }}>
            {loadingSubjects ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: 'hsl(220, 15%, 50%)' }}>
                <Loader2 size={24} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 0.5rem auto' }} />
                Loading subjects...
              </div>
            ) : subjects.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: 'hsl(220, 15%, 50%)' }}>
                <BookOpen size={40} style={{ margin: '0 auto 0.75rem auto', color: 'hsl(220, 15%, 65%)' }} />
                <h3 style={{ margin: '0 0 0.25rem 0', color: 'hsl(220, 35%, 20%)' }}>No Subjects Added</h3>
                <p style={{ margin: 0 }}>Click "Add Subject" to configure academic subjects taught at the school.</p>
              </div>
            ) : (
              <TableContainer>
                <Table>
                  <Thead>
                    <Tr>
                      <Th>Subject Name</Th>
                      <Th>Subject Code</Th>
                      <Th>Assigned Classes</Th>
                      <Th>Order</Th>
                      <Th>Active</Th>
                      <Th style={{ textAlign: 'right' }}>Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {subjects.map((s) => {
                      let classes: string[] = []
                      try { classes = JSON.parse(s.classes || '[]') } catch { classes = [] }

                      return (
                        <Tr key={s.id}>
                          <Td>
                            <span style={{ fontWeight: 700, color: 'hsl(220, 35%, 15%)' }}>{s.name}</span>
                          </Td>
                          <Td>
                            <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{s.code || '—'}</span>
                          </Td>
                          <Td>
                            <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                              {classes.map((c, idx) => (
                                <Badge key={idx} variant="info">{c}</Badge>
                              ))}
                            </div>
                          </Td>
                          <Td>{s.order}</Td>
                          <Td>
                            <Badge variant={s.isActive ? 'success' : 'default'}>
                              {s.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </Td>
                          <Td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                              <button
                                type="button"
                                title="Edit Subject"
                                onClick={() => openEditSubject(s)}
                                style={{ padding: '0.35rem 0.5rem', borderRadius: '6px', border: '1px solid hsl(220, 20%, 85%)', background: '#fff', cursor: 'pointer' }}
                              >
                                <Edit2 size={13} />
                              </button>
                              <button
                                type="button"
                                title="Delete Subject"
                                onClick={() => setDeleteTarget({ type: 'subject', id: s.id, name: s.name })}
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
      )}

      {/* Program Modal */}
      {programModal && (
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
          onClick={() => setProgramModal(null)}
        >
          <div
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '620px',
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
                {isNewProgram ? 'Create Academic Program / Wing' : 'Edit Academic Program'}
              </h3>
              <button
                type="button"
                onClick={() => setProgramModal(null)}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveProgram} style={{ padding: '1.25rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={labelStyle}>Program Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Middle Wing (Classes 6 to 8)"
                    value={programForm.title}
                    onChange={(e) => setProgramForm({ ...programForm, title: e.target.value })}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Age Group / Eligibility</label>
                  <input
                    type="text"
                    placeholder="e.g. 11 to 14 Years"
                    value={programForm.ageGroup}
                    onChange={(e) => setProgramForm({ ...programForm, ageGroup: e.target.value })}
                    style={inputStyle}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={labelStyle}>Overview / Short Description *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Summary of learning methodology and focus areas..."
                  value={programForm.description}
                  onChange={(e) => setProgramForm({ ...programForm, description: e.target.value })}
                  style={inputStyle}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={labelStyle}>Subjects (comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. English, Mathematics, Science, Social Studies, Hindi, Sanskrit, ICT"
                  value={programForm.subjectsText}
                  onChange={(e) => setProgramForm({ ...programForm, subjectsText: e.target.value })}
                  style={inputStyle}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={labelStyle}>Curriculum Highlights (one per line)</label>
                <textarea
                  rows={3}
                  placeholder="Hands-on science experiments&#10;Integrated STEM curriculum&#10;Experiential field projects"
                  value={programForm.highlightsText}
                  onChange={(e) => setProgramForm({ ...programForm, highlightsText: e.target.value })}
                  style={inputStyle}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={labelStyle}>Program Image URL</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    placeholder="/uploads/... or image link"
                    value={programForm.image}
                    onChange={(e) => setProgramForm({ ...programForm, image: e.target.value })}
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
                    value={programForm.status}
                    onChange={(e) => setProgramForm({ ...programForm, status: e.target.value })}
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
                    value={programForm.order}
                    onChange={(e) => setProgramForm({ ...programForm, order: parseInt(e.target.value) || 0 })}
                    style={inputStyle}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setProgramModal(null)}
                  style={{ padding: '0.625rem 1.25rem', borderRadius: '8px', border: '1px solid hsl(220, 20%, 85%)', background: '#fff', fontSize: '0.875rem', cursor: 'pointer', fontWeight: 600 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingProgram}
                  style={{
                    padding: '0.625rem 1.5rem',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'hsl(220, 70%, 35%)',
                    color: '#fff',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    cursor: isSavingProgram ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  {isSavingProgram && <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />}
                  <span>{isNewProgram ? 'Create Program' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Subject Modal */}
      {subjectModal && (
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
          onClick={() => setSubjectModal(null)}
        >
          <div
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '520px',
              background: '#ffffff',
              borderRadius: '12px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid hsl(220, 20%, 90%)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, margin: 0, color: 'hsl(220, 35%, 15%)' }}>
                {isNewSubject ? 'Add Subject to Curriculum' : 'Edit Subject'}
              </h3>
              <button
                type="button"
                onClick={() => setSubjectModal(null)}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveSubject} style={{ padding: '1.25rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={labelStyle}>Subject Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mathematics"
                    value={subjectForm.name}
                    onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Code</label>
                  <input
                    type="text"
                    placeholder="e.g. 041"
                    value={subjectForm.code}
                    onChange={(e) => setSubjectForm({ ...subjectForm, code: e.target.value })}
                    style={inputStyle}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={labelStyle}>Assigned Classes / Programs (comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. Primary, Middle, Secondary"
                  value={subjectForm.classesText}
                  onChange={(e) => setSubjectForm({ ...subjectForm, classesText: e.target.value })}
                  style={inputStyle}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={labelStyle}>Subject Description</label>
                <textarea
                  rows={2}
                  placeholder="Focus, pedagogy, or syllabus overview..."
                  value={subjectForm.description}
                  onChange={(e) => setSubjectForm({ ...subjectForm, description: e.target.value })}
                  style={inputStyle}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <label style={labelStyle}>Display Order</label>
                  <input
                    type="number"
                    value={subjectForm.order}
                    onChange={(e) => setSubjectForm({ ...subjectForm, order: parseInt(e.target.value) || 0 })}
                    style={inputStyle}
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingTop: '1.75rem' }}>
                  <input
                    type="checkbox"
                    id="subj-active"
                    checked={subjectForm.isActive}
                    onChange={(e) => setSubjectForm({ ...subjectForm, isActive: e.target.checked })}
                  />
                  <label htmlFor="subj-active" style={{ fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}>
                    Active in Curriculum
                  </label>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setSubjectModal(null)}
                  style={{ padding: '0.625rem 1.25rem', borderRadius: '8px', border: '1px solid hsl(220, 20%, 85%)', background: '#fff', fontSize: '0.875rem', cursor: 'pointer', fontWeight: 600 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingSubject}
                  style={{
                    padding: '0.625rem 1.5rem',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'hsl(220, 70%, 35%)',
                    color: '#fff',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    cursor: isSavingSubject ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  {isSavingSubject && <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />}
                  <span>{isNewSubject ? 'Add Subject' : 'Save Changes'}</span>
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
            setProgramForm((prev) => ({ ...prev, image: media.url }))
            setShowMediaPicker(false)
          }}
          onClose={() => setShowMediaPicker(false)}
        />
      )}

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title={`Delete ${deleteTarget?.type === 'program' ? 'Academic Program' : 'Subject'}`}
        message={`Are you sure you want to delete "${deleteTarget?.name}"?`}
        confirmText="Delete"
        danger
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  )
}
