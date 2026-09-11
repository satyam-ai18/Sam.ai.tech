'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, StatCard } from '@/components/admin/ui/Card'
import { TableContainer, Table, Thead, Tbody, Tr, Th, Td, Badge } from '@/components/admin/ui/Table'
import { ConfirmDialog } from '@/components/admin/ui/ConfirmDialog'
import { useToast } from '@/components/admin/ui/Toast'
import {
  Search, Filter, Download, Eye, ChevronLeft, ChevronRight,
  Users, Clock, CheckCircle2, XCircle, FileCheck, Loader2,
  X, Save, ChevronDown, Calendar, FileText, Phone, Mail,
  MapPin, School, User, GraduationCap, MessageSquare,
} from 'lucide-react'
import Link from 'next/link'

const STATUSES = ['SUBMITTED', 'UNDER_REVIEW', 'VERIFIED', 'APPROVED', 'REJECTED']

const STATUS_COLORS: Record<string, { bg: string; color: string; label: string }> = {
  SUBMITTED: { bg: 'hsl(220, 70%, 94%)', color: 'hsl(220, 65%, 28%)', label: 'Submitted' },
  UNDER_REVIEW: { bg: 'hsl(40, 95%, 90%)', color: 'hsl(40, 95%, 30%)', label: 'Under Review' },
  VERIFIED: { bg: 'hsl(260, 60%, 92%)', color: 'hsl(260, 60%, 35%)', label: 'Verified' },
  APPROVED: { bg: 'hsl(140, 60%, 92%)', color: 'hsl(140, 70%, 25%)', label: 'Approved' },
  REJECTED: { bg: 'hsl(0, 80%, 93%)', color: 'hsl(0, 70%, 40%)', label: 'Rejected' },
}

interface Application {
  id: string
  referenceNumber: string
  studentFirstName: string
  studentLastName: string
  classApplied: string
  session?: string
  status: string
  phone: string
  email?: string
  city: string
  createdAt: string
}

interface Stats {
  total: number
  submitted: number
  underReview: number
  verified: number
  approved: number
  rejected: number
}

interface Pagination {
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export function AdmissionsClient({ userRole }: { userRole: string }) {
  const { success, error: showError } = useToast()
  const [applications, setApplications] = useState<Application[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [pagination, setPagination] = useState<Pagination>({ total: 0, page: 1, pageSize: 20, totalPages: 0 })
  const [isLoading, setIsLoading] = useState(true)

  // Filters
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [classFilter, setClassFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [page, setPage] = useState(1)
  const [isExporting, setIsExporting] = useState(false)

  // Detail modal state
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [detail, setDetail] = useState<any>(null)
  const [isLoadingDetail, setIsLoadingDetail] = useState(false)
  const [editStatus, setEditStatus] = useState('')
  const [editAdminNotes, setEditAdminNotes] = useState('')
  const [editInternalNotes, setEditInternalNotes] = useState('')
  const [editAdminMessage, setEditAdminMessage] = useState('')
  const [isSavingDetail, setIsSavingDetail] = useState(false)

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = useState<Application | null>(null)

  const fetchApplications = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(page),
        ...(search && { search }),
        ...(statusFilter && { status: statusFilter }),
        ...(classFilter && { class: classFilter }),
        ...(dateFrom && { dateFrom }),
        ...(dateTo && { dateTo }),
      })
      const res = await fetch(`/api/admin/admissions?${params}`)
      const json = await res.json()
      if (json.success) {
        setApplications(json.data.admissions)
        setPagination(json.data.pagination)
        setStats(json.data.stats)
      }
    } catch {
      showError('Failed to load applications')
    } finally {
      setIsLoading(false)
    }
  }, [page, search, statusFilter, classFilter, dateFrom, dateTo])

  useEffect(() => { fetchApplications() }, [fetchApplications])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    fetchApplications()
  }

  const openDetail = async (id: string) => {
    setSelectedId(id)
    setIsLoadingDetail(true)
    try {
      const res = await fetch(`/api/admin/admissions/${id}`)
      const json = await res.json()
      if (json.success) {
        setDetail(json.data)
        setEditStatus(json.data.status)
        setEditAdminNotes(json.data.adminNotes || '')
        setEditInternalNotes(json.data.internalNotes || '')
        setEditAdminMessage(json.data.adminMessage || '')
      }
    } catch {
      showError('Failed to load application details')
    } finally {
      setIsLoadingDetail(false)
    }
  }

  const closeDetail = () => {
    setSelectedId(null)
    setDetail(null)
  }

  const handleSaveDetail = async () => {
    if (!detail) return
    setIsSavingDetail(true)
    try {
      const res = await fetch(`/api/admin/admissions/${detail.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: editStatus,
          adminNotes: editAdminNotes,
          internalNotes: editInternalNotes,
          adminMessage: editAdminMessage,
        }),
      })
      const json = await res.json()
      if (json.success) {
        success('Application updated successfully')
        closeDetail()
        fetchApplications()
      } else {
        showError(json.error?.message || 'Update failed')
      }
    } catch {
      showError('Network error')
    } finally {
      setIsSavingDetail(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      const res = await fetch(`/api/admin/admissions/${deleteTarget.id}`, { method: 'DELETE' })
      const json = await res.json()
      if (json.success) {
        success('Application deleted')
        setDeleteTarget(null)
        fetchApplications()
      } else {
        showError(json.error?.message || 'Delete failed')
      }
    } catch {
      showError('Network error')
    }
  }

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const params = new URLSearchParams({
        export: 'csv',
        ...(search && { search }),
        ...(statusFilter && { status: statusFilter }),
        ...(classFilter && { class: classFilter }),
        ...(dateFrom && { dateFrom }),
        ...(dateTo && { dateTo }),
      })
      const res = await fetch(`/api/admin/admissions?${params}`)
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `admissions-${Date.now()}.csv`
      a.click()
      window.URL.revokeObjectURL(url)
      success('Export downloaded successfully')
    } catch {
      showError('Export failed')
    } finally {
      setIsExporting(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid hsl(220, 20%, 82%)',
    fontSize: '0.875rem', fontFamily: 'inherit', background: '#fff',
  }

  return (
    <div>
      {/* Stats */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <StatCard title="Total" value={stats.total} icon={<Users size={20} />} />
          <StatCard title="Submitted" value={stats.submitted} icon={<FileText size={20} />} />
          <StatCard title="Under Review" value={stats.underReview} icon={<Clock size={20} />} />
          <StatCard title="Verified" value={stats.verified} icon={<FileCheck size={20} />} />
          <StatCard title="Approved" value={stats.approved} icon={<CheckCircle2 size={20} />} />
          <StatCard title="Rejected" value={stats.rejected} icon={<XCircle size={20} />} />
        </div>
      )}

      {/* Filters */}
      <Card style={{ marginBottom: '1.5rem' }}>
        <CardContent style={{ padding: '1.25rem' }}>
          <form onSubmit={handleSearch} style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'flex-end' }}>
            <div style={{ flex: '2 1 200px' }}>
              <div style={{ position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'hsl(220, 15%, 55%)' }} />
                <input style={{ ...inputStyle, paddingLeft: '2.25rem', width: '100%', boxSizing: 'border-box' }}
                  value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or reference..." />
              </div>
            </div>
            <select style={inputStyle} value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }}>
              <option value="">All Statuses</option>
              {STATUSES.map(s => <option key={s} value={s}>{STATUS_COLORS[s].label}</option>)}
            </select>
            <input style={inputStyle} type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} title="From date" />
            <input style={inputStyle} type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} title="To date" />
            <button type="submit" style={{ padding: '0.5rem 1rem', background: 'hsl(220, 65%, 28%)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Filter size={15} /> Filter
            </button>
            <button type="button" onClick={handleExport} disabled={isExporting}
              style={{ padding: '0.5rem 1rem', background: 'hsl(140, 60%, 28%)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              {isExporting ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <Download size={15} />}
              {isExporting ? 'Exporting...' : 'Export CSV'}
            </button>
            {(search || statusFilter || dateFrom || dateTo) && (
              <button type="button" onClick={() => { setSearch(''); setStatusFilter(''); setDateFrom(''); setDateTo(''); setPage(1) }}
                style={{ padding: '0.5rem', background: 'hsl(0, 0%, 92%)', border: 'none', borderRadius: '8px', cursor: 'pointer' }} title="Clear filters">
                <X size={15} />
              </button>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Applications Table */}
      <TableContainer>
        <Table>
          <Thead>
            <Tr>
              <Th>Reference</Th>
              <Th>Student Name</Th>
              <Th>Class</Th>
              <Th>Phone</Th>
              <Th>City</Th>
              <Th>Submitted</Th>
              <Th>Status</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {isLoading ? (
              <Tr><Td colSpan={8} style={{ textAlign: 'center', padding: '3rem' }}>
                <Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} />
              </Td></Tr>
            ) : applications.length === 0 ? (
              <Tr><Td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: 'hsl(220, 15%, 50%)' }}>
                No applications found
              </Td></Tr>
            ) : applications.map(app => {
              const sc = STATUS_COLORS[app.status] || STATUS_COLORS.SUBMITTED
              return (
                <Tr key={app.id}>
                  <Td><code style={{ fontFamily: 'monospace', fontWeight: 700, color: 'hsl(220, 65%, 28%)', fontSize: '0.8125rem' }}>{app.referenceNumber}</code></Td>
                  <Td style={{ fontWeight: 600 }}>{app.studentFirstName} {app.studentLastName}</Td>
                  <Td>{app.classApplied}</Td>
                  <Td>{app.phone}</Td>
                  <Td>{app.city}</Td>
                  <Td style={{ color: 'hsl(220, 15%, 50%)', fontSize: '0.875rem' }}>
                    {new Date(app.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </Td>
                  <Td>
                    <span style={{ padding: '0.25rem 0.75rem', borderRadius: '20px', fontWeight: 700, fontSize: '0.75rem', background: sc.bg, color: sc.color }}>
                      {sc.label}
                    </span>
                  </Td>
                  <Td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => openDetail(app.id)}
                        style={{ padding: '0.375rem 0.625rem', background: 'hsl(220, 70%, 94%)', color: 'hsl(220, 65%, 28%)', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8125rem', fontWeight: 600 }}>
                        <Eye size={13} /> View
                      </button>
                      {userRole?.toUpperCase() === 'SUPER_ADMIN' && (
                        <button onClick={() => setDeleteTarget(app)}
                          style={{ padding: '0.375rem 0.625rem', background: 'hsl(0, 80%, 95%)', color: 'hsl(0, 70%, 40%)', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8125rem', fontWeight: 600 }}>
                          Del
                        </button>
                      )}
                    </div>
                  </Td>
                </Tr>
              )
            })}
          </Tbody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.875rem', color: 'hsl(220, 15%, 50%)' }}>
            Showing {(page - 1) * pagination.pageSize + 1}–{Math.min(page * pagination.pageSize, pagination.total)} of {pagination.total}
          </span>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              style={{ padding: '0.375rem 0.75rem', border: '1px solid hsl(220, 20%, 82%)', borderRadius: '6px', background: '#fff', cursor: page === 1 ? 'not-allowed' : 'pointer' }}>
              <ChevronLeft size={16} />
            </button>
            <span style={{ padding: '0.375rem 0.75rem', fontWeight: 600 }}>{page} / {pagination.totalPages}</span>
            <button onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))} disabled={page === pagination.totalPages}
              style={{ padding: '0.375rem 0.75rem', border: '1px solid hsl(220, 20%, 82%)', borderRadius: '6px', background: '#fff', cursor: page === pagination.totalPages ? 'not-allowed' : 'pointer' }}>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Application Detail Modal */}
      {selectedId && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 1000, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '1.5rem', overflowY: 'auto' }}>
          <div style={{ background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '800px', position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.5rem', borderBottom: '1px solid hsl(220, 20%, 92%)' }}>
              <h2 style={{ fontWeight: 800, fontSize: '1.125rem', margin: 0 }}>
                {detail ? `Application: ${detail.referenceNumber}` : 'Loading...'}
              </h2>
              <button onClick={closeDetail} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem' }}><X size={22} /></button>
            </div>

            {isLoadingDetail || !detail ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem', gap: '0.75rem' }}>
                <Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} /> Loading...
              </div>
            ) : (
              <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', maxHeight: '80vh', overflowY: 'auto' }}>
                {/* Student Info */}
                <section>
                  <h3 style={{ fontWeight: 700, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'hsl(220, 25%, 40%)', marginBottom: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <User size={15} /> Student Information
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', background: 'hsl(220, 20%, 97%)', padding: '1rem', borderRadius: '10px' }}>
                    {[
                      ['Full Name', `${detail.studentFirstName} ${detail.studentLastName}`],
                      ['Gender', detail.studentGender],
                      ['Date of Birth', new Date(detail.studentDob).toLocaleDateString('en-IN')],
                      ['Class Applied', detail.classApplied],
                      ['Session', detail.session || '-'],
                    ].map(([label, val]) => (
                      <div key={label}>
                        <span style={{ fontSize: '0.75rem', color: 'hsl(220, 15%, 50%)', display: 'block' }}>{label}</span>
                        <span style={{ fontWeight: 700, fontSize: '0.9375rem' }}>{val}</span>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Parent Info */}
                <section>
                  <h3 style={{ fontWeight: 700, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'hsl(220, 25%, 40%)', marginBottom: '0.875rem' }}>Parent / Guardian</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', background: 'hsl(220, 20%, 97%)', padding: '1rem', borderRadius: '10px' }}>
                    {[
                      ["Father's Name", detail.fatherName],
                      ['Father Occupation', detail.fatherOccupation || '-'],
                      ['Father Phone', detail.fatherPhone || '-'],
                      ["Mother's Name", detail.motherName],
                      ['Mother Occupation', detail.motherOccupation || '-'],
                      ['Primary Phone', detail.phone],
                      ['Email', detail.email || '-'],
                    ].map(([label, val]) => (
                      <div key={label}>
                        <span style={{ fontSize: '0.75rem', color: 'hsl(220, 15%, 50%)', display: 'block' }}>{label}</span>
                        <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>{val}</span>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Address & School */}
                <section>
                  <h3 style={{ fontWeight: 700, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'hsl(220, 25%, 40%)', marginBottom: '0.875rem' }}>Address & Previous School</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', background: 'hsl(220, 20%, 97%)', padding: '1rem', borderRadius: '10px' }}>
                    {[
                      ['Address', detail.address],
                      ['City', detail.city],
                      ['State', detail.state],
                      ['PIN Code', detail.pincode],
                      ['Previous School', detail.previousSchool || '-'],
                      ['Previous Class', detail.previousClass || '-'],
                      ['Previous Board', detail.previousBoard || '-'],
                    ].map(([label, val]) => (
                      <div key={label}>
                        <span style={{ fontSize: '0.75rem', color: 'hsl(220, 15%, 50%)', display: 'block' }}>{label}</span>
                        <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>{val}</span>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Documents */}
                {detail.documents?.length > 0 && (
                  <section>
                    <h3 style={{ fontWeight: 700, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'hsl(220, 25%, 40%)', marginBottom: '0.875rem' }}>Uploaded Documents</h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {detail.documents.map((doc: any) => (
                        <a key={doc.id} href={doc.url} target="_blank" rel="noopener noreferrer"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 0.875rem', background: 'hsl(220, 70%, 94%)', color: 'hsl(220, 65%, 28%)', borderRadius: '8px', textDecoration: 'none', fontWeight: 600, fontSize: '0.875rem' }}>
                          <FileText size={14} /> {doc.name}
                        </a>
                      ))}
                    </div>
                  </section>
                )}

                {/* Status History */}
                {detail.statusHistory?.length > 0 && (
                  <section>
                    <h3 style={{ fontWeight: 700, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'hsl(220, 25%, 40%)', marginBottom: '0.875rem' }}>Status History</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {detail.statusHistory.map((h: any, i: number) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.875rem', padding: '0.75rem', background: 'hsl(220, 20%, 97%)', borderRadius: '8px' }}>
                          <span style={{ fontSize: '0.75rem', color: 'hsl(220, 15%, 50%)', whiteSpace: 'nowrap', paddingTop: '0.1rem' }}>
                            {new Date(h.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <div>
                            <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>
                              {h.fromStatus ? `${h.fromStatus} → ${h.toStatus}` : h.toStatus}
                            </span>
                            {h.changedBy && <span style={{ color: 'hsl(220, 15%, 50%)', fontSize: '0.8125rem', marginLeft: '0.5rem' }}>by {h.changedBy}</span>}
                            {h.notes && <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8125rem', color: 'hsl(220, 15%, 45%)' }}>{h.notes}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Admin Controls */}
                <section style={{ borderTop: '2px solid hsl(220, 20%, 92%)', paddingTop: '1.25rem' }}>
                  <h3 style={{ fontWeight: 700, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'hsl(220, 25%, 40%)', marginBottom: '0.875rem' }}>Admin Controls</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.4rem' }}>Update Status</label>
                      <select value={editStatus} onChange={e => setEditStatus(e.target.value)}
                        style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid hsl(220, 20%, 82%)', fontSize: '0.9375rem' }}>
                        {STATUSES.map(s => <option key={s} value={s}>{STATUS_COLORS[s].label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.4rem' }}>Public Status Message (shown to applicant)</label>
                      <input value={editAdminMessage} onChange={e => setEditAdminMessage(e.target.value)} placeholder="Optional message visible to applicant"
                        style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid hsl(220, 20%, 82%)', fontSize: '0.9375rem', boxSizing: 'border-box' }} />
                    </div>
                  </div>
                  <div style={{ marginTop: '1rem' }}>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.4rem' }}>Admin Notes (visible to admin team)</label>
                    <textarea value={editAdminNotes} onChange={e => setEditAdminNotes(e.target.value)} rows={2}
                      style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid hsl(220, 20%, 82%)', fontSize: '0.9375rem', resize: 'vertical', boxSizing: 'border-box' }}
                      placeholder="Notes for admin team..." />
                  </div>
                  <div style={{ marginTop: '0.75rem' }}>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.4rem' }}>Internal Notes (private)</label>
                    <textarea value={editInternalNotes} onChange={e => setEditInternalNotes(e.target.value)} rows={2}
                      style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid hsl(220, 20%, 82%)', fontSize: '0.9375rem', resize: 'vertical', boxSizing: 'border-box' }}
                      placeholder="Internal-only notes..." />
                  </div>
                  <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                    <button onClick={closeDetail} style={{ padding: '0.625rem 1.25rem', border: '1px solid hsl(220, 20%, 82%)', borderRadius: '8px', background: '#fff', cursor: 'pointer', fontWeight: 600 }}>
                      Cancel
                    </button>
                    <button onClick={handleSaveDetail} disabled={isSavingDetail}
                      style={{ padding: '0.625rem 1.5rem', background: 'hsl(220, 65%, 28%)', color: '#fff', border: 'none', borderRadius: '8px', cursor: isSavingDetail ? 'not-allowed' : 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {isSavingDetail ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={15} />}
                      {isSavingDetail ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </section>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteTarget && (
        <ConfirmDialog
          isOpen={!!deleteTarget}
          title="Delete Application"
          message={`Permanently delete application ${deleteTarget.referenceNumber} for ${deleteTarget.studentFirstName} ${deleteTarget.studentLastName}? This cannot be undone.`}
          confirmText="Delete"
          danger
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  )
}
