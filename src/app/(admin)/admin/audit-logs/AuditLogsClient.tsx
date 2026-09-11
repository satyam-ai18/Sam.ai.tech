'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/admin/ui/Card'
import { TableContainer, Table, Thead, Tbody, Tr, Th, Td, Badge } from '@/components/admin/ui/Table'
import {
  History,
  Search,
  Filter,
  Calendar,
  User,
  Activity,
  ArrowLeft,
  ArrowRight,
  RefreshCw,
  Clock,
  ShieldAlert,
  FileText,
} from 'lucide-react'

interface AuditLogItem {
  id: string
  userId?: string | null
  userName?: string | null
  action: string
  module: string
  recordId?: string | null
  details?: string | null
  ipAddress?: string | null
  createdAt: string
}

interface AuditLogsClientProps {
  initialLogs: AuditLogItem[]
  initialTotal: number
}

const MODULES = [
  'all', 'admissions', 'media', 'gallery', 'academics', 'teachers',
  'facilities', 'achievements', 'news', 'events', 'notices', 'pages',
  'homepage', 'navigation', 'users', 'settings', 'auth'
]

const ACTIONS = [
  'all', 'CREATE', 'UPDATE', 'DELETE', 'PUBLISH', 'UNPUBLISH', 'LOGIN',
  'FAILED_LOGIN', 'UPLOAD_MEDIA', 'STATUS_CHANGE'
]

export function AuditLogsClient({ initialLogs, initialTotal }: AuditLogsClientProps) {
  const [logs, setLogs] = useState<AuditLogItem[]>(initialLogs)
  const [total, setTotal] = useState(initialTotal)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(25)
  const [isLoading, setIsLoading] = useState(false)

  // Filters
  const [search, setSearch] = useState('')
  const [moduleFilter, setModuleFilter] = useState('all')
  const [actionFilter, setActionFilter] = useState('all')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const fetchLogs = async (currentPage = page) => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (moduleFilter !== 'all') params.set('module', moduleFilter)
      if (actionFilter !== 'all') params.set('action', actionFilter)
      if (startDate) params.set('startDate', startDate)
      if (endDate) params.set('endDate', endDate)
      params.set('page', currentPage.toString())
      params.set('pageSize', pageSize.toString())

      const res = await fetch(`/api/admin/audit-logs?${params.toString()}`)
      const json = await res.json()
      if (json.success) {
        setLogs(
          json.data.logs.map((l: any) => ({
            ...l,
            createdAt: typeof l.createdAt === 'string' ? l.createdAt : new Date(l.createdAt).toISOString(),
          }))
        )
        setTotal(json.data.total)
        setPage(currentPage)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleApplyFilters = (e: React.FormEvent) => {
    e.preventDefault()
    fetchLogs(1)
  }

  const handleResetFilters = () => {
    setSearch('')
    setModuleFilter('all')
    setActionFilter('all')
    setStartDate('')
    setEndDate('')
    setTimeout(() => fetchLogs(1), 0)
  }

  const totalPages = Math.ceil(total / pageSize)

  const getActionBadgeVariant = (action: string) => {
    const act = action.toUpperCase()
    if (act.includes('DELETE')) return 'danger'
    if (act.includes('CREATE') || act.includes('PUBLISH')) return 'success'
    if (act.includes('UPDATE')) return 'info'
    if (act.includes('FAIL')) return 'danger'
    return 'default'
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'hsl(220, 35%, 15%)', margin: 0 }}>
            Audit Trail & Activity Logs
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'hsl(220, 15%, 50%)', margin: '0.25rem 0 0 0' }}>
            Comprehensive institutional accountability log tracking administrative logins, content updates, and critical system mutations
          </p>
        </div>

        <button
          type="button"
          disabled={isLoading}
          onClick={() => fetchLogs(page)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            border: '1px solid hsl(220, 20%, 85%)',
            background: '#ffffff',
            color: 'hsl(220, 30%, 25%)',
            fontSize: '0.8125rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <RefreshCw size={14} className={isLoading ? 'spin' : ''} />
          <span>Refresh Logs</span>
        </button>
      </div>

      {/* Filter Bar */}
      <Card style={{ padding: '1.25rem' }}>
        <form onSubmit={handleApplyFilters} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '1rem', alignItems: 'flex-end' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'hsl(220, 20%, 40%)', marginBottom: '0.35rem', textTransform: 'uppercase' }}>
              Search Details
            </label>
            <input
              type="text"
              placeholder="Search user, ID or details..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: '100%', height: '38px', padding: '0 0.75rem', borderRadius: '6px', border: '1px solid hsl(220, 20%, 85%)', fontSize: '0.8125rem' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'hsl(220, 20%, 40%)', marginBottom: '0.35rem', textTransform: 'uppercase' }}>
              Module
            </label>
            <select
              value={moduleFilter}
              onChange={(e) => setModuleFilter(e.target.value)}
              style={{ width: '100%', height: '38px', padding: '0 0.75rem', borderRadius: '6px', border: '1px solid hsl(220, 20%, 85%)', fontSize: '0.8125rem', textTransform: 'capitalize' }}
            >
              {MODULES.map((m) => (
                <option key={m} value={m}>
                  {m === 'all' ? 'All Modules' : m}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'hsl(220, 20%, 40%)', marginBottom: '0.35rem', textTransform: 'uppercase' }}>
              Action
            </label>
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              style={{ width: '100%', height: '38px', padding: '0 0.75rem', borderRadius: '6px', border: '1px solid hsl(220, 20%, 85%)', fontSize: '0.8125rem' }}
            >
              {ACTIONS.map((a) => (
                <option key={a} value={a}>
                  {a === 'all' ? 'All Actions' : a}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'hsl(220, 20%, 40%)', marginBottom: '0.35rem', textTransform: 'uppercase' }}>
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={{ width: '100%', height: '38px', padding: '0 0.75rem', borderRadius: '6px', border: '1px solid hsl(220, 20%, 85%)', fontSize: '0.8125rem' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'hsl(220, 20%, 40%)', marginBottom: '0.35rem', textTransform: 'uppercase' }}>
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={{ width: '100%', height: '38px', padding: '0 0.75rem', borderRadius: '6px', border: '1px solid hsl(220, 20%, 85%)', fontSize: '0.8125rem' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="submit"
              style={{
                flex: 1,
                height: '38px',
                padding: '0 1rem',
                borderRadius: '6px',
                border: 'none',
                background: 'hsl(220, 70%, 35%)',
                color: '#fff',
                fontWeight: 600,
                fontSize: '0.8125rem',
                cursor: 'pointer',
              }}
            >
              Filter
            </button>
            <button
              type="button"
              onClick={handleResetFilters}
              style={{
                height: '38px',
                padding: '0 0.75rem',
                borderRadius: '6px',
                border: '1px solid hsl(220, 20%, 85%)',
                background: '#fff',
                fontSize: '0.8125rem',
                cursor: 'pointer',
              }}
            >
              Reset
            </button>
          </div>
        </form>
      </Card>

      {/* Audit Logs Table */}
      <Card>
        <TableContainer>
          <Table>
            <Thead>
              <Tr>
                <Th>Timestamp</Th>
                <Th>User</Th>
                <Th>Action</Th>
                <Th>Module</Th>
                <Th>Details & Record</Th>
                <Th>IP Address</Th>
              </Tr>
            </Thead>
            <Tbody>
              {logs.length === 0 ? (
                <Tr>
                  <Td colSpan={6} style={{ textAlign: 'center', padding: '3.5rem 1rem', color: 'hsl(220, 15%, 50%)' }}>
                    <History size={36} style={{ opacity: 0.3, margin: '0 auto 0.5rem auto' }} />
                    <p style={{ margin: 0, fontSize: '0.875rem' }}>No audit activity records found matching filters.</p>
                  </Td>
                </Tr>
              ) : (
                logs.map((log) => (
                  <Tr key={log.id}>
                    <Td style={{ whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8125rem', color: 'hsl(220, 15%, 45%)' }}>
                        <Clock size={13} />
                        <span>
                          {new Date(log.createdAt).toLocaleDateString('en-IN', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                          })}
                        </span>
                      </div>
                    </Td>
                    <Td>
                      <span style={{ fontWeight: 600, color: 'hsl(220, 35%, 15%)' }}>
                        {log.userName || 'System'}
                      </span>
                    </Td>
                    <Td>
                      <Badge variant={getActionBadgeVariant(log.action)}>
                        {log.action}
                      </Badge>
                    </Td>
                    <Td>
                      <span
                        style={{
                          textTransform: 'uppercase',
                          fontSize: '0.6875rem',
                          fontWeight: 700,
                          padding: '0.15rem 0.45rem',
                          borderRadius: '4px',
                          background: 'hsl(220, 20%, 93%)',
                          color: 'hsl(220, 25%, 35%)',
                        }}
                      >
                        {log.module}
                      </span>
                    </Td>
                    <Td>
                      <div style={{ maxWidth: '400px' }}>
                        <span style={{ fontSize: '0.8125rem', color: 'hsl(220, 30%, 20%)', display: 'block' }}>
                          {log.details || '—'}
                        </span>
                        {log.recordId && (
                          <code style={{ fontSize: '0.71875rem', color: 'hsl(220, 15%, 50%)' }}>
                            Ref: {log.recordId}
                          </code>
                        )}
                      </div>
                    </Td>
                    <Td>
                      <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'hsl(220, 15%, 45%)' }}>
                        {log.ipAddress || '—'}
                      </span>
                    </Td>
                  </Tr>
                ))
              )}
            </Tbody>
          </Table>
        </TableContainer>

        {/* Pagination Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', borderTop: '1px solid hsl(220, 20%, 92%)', flexWrap: 'wrap', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.8125rem', color: 'hsl(220, 15%, 50%)' }}>
            Showing {logs.length > 0 ? (page - 1) * pageSize + 1 : 0} to {Math.min(page * pageSize, total)} of {total} events
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              type="button"
              disabled={page <= 1 || isLoading}
              onClick={() => fetchLogs(page - 1)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
                padding: '0.35rem 0.75rem',
                borderRadius: '6px',
                border: '1px solid hsl(220, 20%, 85%)',
                background: '#fff',
                fontSize: '0.8125rem',
                cursor: page <= 1 ? 'not-allowed' : 'pointer',
                opacity: page <= 1 ? 0.5 : 1,
              }}
            >
              <ArrowLeft size={13} />
              <span>Previous</span>
            </button>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, padding: '0 0.5rem' }}>
              Page {page} of {Math.max(totalPages, 1)}
            </span>
            <button
              type="button"
              disabled={page >= totalPages || isLoading}
              onClick={() => fetchLogs(page + 1)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
                padding: '0.35rem 0.75rem',
                borderRadius: '6px',
                border: '1px solid hsl(220, 20%, 85%)',
                background: '#fff',
                fontSize: '0.8125rem',
                cursor: page >= totalPages ? 'not-allowed' : 'pointer',
                opacity: page >= totalPages ? 0.5 : 1,
              }}
            >
              <span>Next</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </Card>
    </div>
  )
}
