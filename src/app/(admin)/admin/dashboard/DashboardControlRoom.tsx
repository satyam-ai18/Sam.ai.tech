'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  Search,
  Plus,
  Download,
  FileText,
  Calendar,
  Bell,
  UserPlus,
  Building2,
  Trophy,
  Image as ImageIcon,
  FolderOpen,
  UserCheck,
  Globe,
  Loader2,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Shield,
  Layers,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/admin/ui/Card'
import { TableContainer, Table, Thead, Tbody, Tr, Th, Td, Badge } from '@/components/admin/ui/Table'
import { DashboardCharts } from '@/components/admin/charts/DashboardCharts'
import { hasPermission, PERMISSIONS } from '@/lib/permissions'

interface SearchResult {
  id: string
  title: string
  subtitle?: string
  type: string
  url: string
}

interface DashboardControlRoomProps {
  userRole: string
  userName: string
  totalAdmissions: number
  classStats: Array<{ className: string; count: number }>
  statusStats: Array<{ status: string; count: number; color: string }>
  monthlyStats: Array<{ month: string; count: number }>
  recentAdmissions: any[]
  recentNews: any[]
  recentEvents: any[]
  recentPages: any[]
  recentLogs: any[]
}

export function DashboardControlRoom({
  userRole,
  userName,
  totalAdmissions,
  classStats,
  statusStats,
  monthlyStats,
  recentAdmissions,
  recentNews,
  recentEvents,
  recentPages,
  recentLogs,
}: DashboardControlRoomProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setSearchQuery(val)

    if (val.trim().length >= 2) {
      setIsSearching(true)
      setIsDropdownOpen(true)
      try {
        const res = await fetch(`/api/admin/search?q=${encodeURIComponent(val.trim())}`)
        const json = await res.json()
        if (json.success) {
          setSearchResults(json.data.results)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setIsSearching(false)
      }
    } else {
      setSearchResults([])
      setIsDropdownOpen(false)
    }
  }

  // Quick actions permitted for active user
  const quickActions = [
    {
      label: 'Manage Admissions',
      href: '/admin/admissions',
      icon: <UserCheck size={15} />,
      perm: PERMISSIONS.MANAGE_ADMISSIONS,
      bg: 'hsl(220, 70%, 35%)',
      color: '#fff',
    },
    {
      label: 'Add News',
      href: '/admin/news',
      icon: <FileText size={15} />,
      perm: PERMISSIONS.MANAGE_NEWS,
      bg: '#ffffff',
      color: 'hsl(220, 30%, 25%)',
    },
    {
      label: 'Add Event',
      href: '/admin/events',
      icon: <Calendar size={15} />,
      perm: PERMISSIONS.MANAGE_EVENTS,
      bg: '#ffffff',
      color: 'hsl(220, 30%, 25%)',
    },
    {
      label: 'Add Notice',
      href: '/admin/notices',
      icon: <Bell size={15} />,
      perm: PERMISSIONS.MANAGE_NOTICES,
      bg: '#ffffff',
      color: 'hsl(220, 30%, 25%)',
    },
    {
      label: 'Add Teacher',
      href: '/admin/teachers',
      icon: <UserPlus size={15} />,
      perm: PERMISSIONS.MANAGE_TEACHERS,
      bg: '#ffffff',
      color: 'hsl(220, 30%, 25%)',
    },
    {
      label: 'Add Facility',
      href: '/admin/facilities',
      icon: <Building2 size={15} />,
      perm: PERMISSIONS.MANAGE_FACILITIES,
      bg: '#ffffff',
      color: 'hsl(220, 30%, 25%)',
    },
    {
      label: 'Add Achievement',
      href: '/admin/achievements',
      icon: <Trophy size={15} />,
      perm: PERMISSIONS.MANAGE_ACHIEVEMENTS,
      bg: '#ffffff',
      color: 'hsl(220, 30%, 25%)',
    },
    {
      label: 'Upload Media',
      href: '/admin/media',
      icon: <FolderOpen size={15} />,
      perm: PERMISSIONS.MANAGE_MEDIA,
      bg: '#ffffff',
      color: 'hsl(220, 30%, 25%)',
    },
    {
      label: 'Edit Homepage',
      href: '/admin/homepage',
      icon: <Globe size={15} />,
      perm: PERMISSIONS.MANAGE_HOMEPAGE,
      bg: '#ffffff',
      color: 'hsl(220, 30%, 25%)',
    },
  ].filter((a) => hasPermission(userRole, a.perm))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Omni-Search & Quick Actions Header Bar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Search Bar with Results Dropdown */}
        <div style={{ position: 'relative', width: '100%', maxWidth: '720px' }}>
          <div style={{ position: 'relative' }}>
            <Search
              size={18}
              style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'hsl(220, 15%, 50%)' }}
            />
            <input
              type="text"
              placeholder="Omni-Search: Find student admissions, news, notices, faculty, albums, pages..."
              value={searchQuery}
              onChange={handleSearch}
              onFocus={() => {
                if (searchResults.length > 0) setIsDropdownOpen(true)
              }}
              style={{
                width: '100%',
                height: '46px',
                paddingLeft: '2.75rem',
                paddingRight: isSearching ? '2.5rem' : '1rem',
                borderRadius: '10px',
                border: '1px solid hsl(220, 20%, 85%)',
                background: '#ffffff',
                fontSize: '0.9375rem',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                outline: 'none',
              }}
            />
            {isSearching && (
              <Loader2
                size={16}
                className="spin"
                style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'hsl(220, 15%, 50%)' }}
              />
            )}
          </div>

          {/* Search Dropdown */}
          {isDropdownOpen && searchResults.length > 0 && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 6px)',
                left: 0,
                right: 0,
                zIndex: 1000,
                background: '#ffffff',
                borderRadius: '10px',
                border: '1px solid hsl(220, 20%, 88%)',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                maxHeight: '340px',
                overflowY: 'auto',
              }}
            >
              {searchResults.map((res) => (
                <Link
                  key={`${res.type}-${res.id}`}
                  href={res.url}
                  onClick={() => setIsDropdownOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 1rem',
                    borderBottom: '1px solid hsl(220, 20%, 95%)',
                    textDecoration: 'none',
                    color: 'inherit',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'hsl(220, 35%, 15%)' }}>
                      {res.title}
                    </div>
                    {res.subtitle && (
                      <div style={{ fontSize: '0.75rem', color: 'hsl(220, 15%, 50%)', marginTop: '0.15rem' }}>
                        {res.subtitle}
                      </div>
                    )}
                  </div>
                  <span
                    style={{
                      fontSize: '0.6875rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '4px',
                      background: 'hsl(220, 20%, 93%)',
                      color: 'hsl(220, 25%, 35%)',
                    }}
                  >
                    {res.type}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions Buttons */}
        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'hsl(220, 15%, 50%)', display: 'block', marginBottom: '0.5rem' }}>
            Authorized Quick Actions
          </span>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {quickActions.map((act) => (
              <Link key={act.label} href={act.href} style={{ textDecoration: 'none' }}>
                <button
                  type="button"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.45rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid hsl(220, 20%, 85%)',
                    background: act.bg,
                    color: act.color,
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                  }}
                >
                  {act.icon}
                  <span>{act.label}</span>
                </button>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Interactive Admission Analytics */}
      <DashboardCharts
        classStats={classStats}
        statusStats={statusStats}
        monthlyStats={monthlyStats}
        totalAdmissions={totalAdmissions}
      />

      {/* Data Export Bar */}
      <Card style={{ padding: '1.25rem 1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'hsl(220, 35%, 15%)', margin: 0 }}>
              Tabular Data Exports
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'hsl(220, 15%, 50%)', margin: '0.2rem 0 0 0' }}>
              Download official school reports in CSV format for spreadsheet analysis
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {hasPermission(userRole, PERMISSIONS.MANAGE_ADMISSIONS) && (
              <a href="/api/admin/export?type=admissions" download style={{ textDecoration: 'none' }}>
                <button
                  type="button"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.45rem 0.85rem',
                    borderRadius: '6px',
                    border: '1px solid hsl(220, 20%, 85%)',
                    background: '#fff',
                    color: 'hsl(220, 30%, 25%)',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  <Download size={14} />
                  <span>Admissions CSV</span>
                </button>
              </a>
            )}

            {hasPermission(userRole, PERMISSIONS.MANAGE_NEWS) && (
              <a href="/api/admin/export?type=news" download style={{ textDecoration: 'none' }}>
                <button
                  type="button"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.45rem 0.85rem',
                    borderRadius: '6px',
                    border: '1px solid hsl(220, 20%, 85%)',
                    background: '#fff',
                    color: 'hsl(220, 30%, 25%)',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  <Download size={14} />
                  <span>News CSV</span>
                </button>
              </a>
            )}

            {hasPermission(userRole, PERMISSIONS.MANAGE_EVENTS) && (
              <a href="/api/admin/export?type=events" download style={{ textDecoration: 'none' }}>
                <button
                  type="button"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.45rem 0.85rem',
                    borderRadius: '6px',
                    border: '1px solid hsl(220, 20%, 85%)',
                    background: '#fff',
                    color: 'hsl(220, 30%, 25%)',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  <Download size={14} />
                  <span>Events CSV</span>
                </button>
              </a>
            )}

            {hasPermission(userRole, PERMISSIONS.MANAGE_NOTICES) && (
              <a href="/api/admin/export?type=notices" download style={{ textDecoration: 'none' }}>
                <button
                  type="button"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.45rem 0.85rem',
                    borderRadius: '6px',
                    border: '1px solid hsl(220, 20%, 85%)',
                    background: '#fff',
                    color: 'hsl(220, 30%, 25%)',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  <Download size={14} />
                  <span>Notices CSV</span>
                </button>
              </a>
            )}
          </div>
        </div>
      </Card>

      {/* Content Analytics & Recent CMS Activity */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
        {/* Recent CMS Pages & Content */}
        <Card>
          <CardHeader>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <CardTitle>Recent Pages & Publications</CardTitle>
                <CardDescription>Recently modified CMS pages and published news</CardDescription>
              </div>
              <Link href="/admin/pages" style={{ fontSize: '0.8125rem', color: 'hsl(220, 70%, 40%)', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                Pages <ArrowUpRight size={13} />
              </Link>
            </div>
          </CardHeader>
          <CardContent style={{ padding: 0 }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {recentPages.map((p) => (
                <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.85rem 1.5rem', borderBottom: '1px solid hsl(220, 20%, 95%)' }}>
                  <div>
                    <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'hsl(220, 35%, 15%)' }}>{p.title}</span>
                    <span style={{ fontSize: '0.75rem', color: 'hsl(220, 15%, 50%)', display: 'block' }}>/{p.slug}</span>
                  </div>
                  <Badge variant={p.status === 'PUBLISHED' ? 'success' : 'default'}>{p.status}</Badge>
                </div>
              ))}
              {recentNews.slice(0, 3).map((n) => (
                <div key={n.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.85rem 1.5rem', borderBottom: '1px solid hsl(220, 20%, 95%)' }}>
                  <div>
                    <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'hsl(220, 35%, 15%)' }}>{n.title}</span>
                    <span style={{ fontSize: '0.75rem', color: 'hsl(220, 15%, 50%)', display: 'block' }}>News · {n.category}</span>
                  </div>
                  <Badge variant={n.status === 'PUBLISHED' ? 'success' : 'default'}>{n.status}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Live Audit Activity Feed */}
        <Card>
          <CardHeader>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <CardTitle>Audit Log Activity Feed</CardTitle>
                <CardDescription>Live administrative operations and changes</CardDescription>
              </div>
              <Link href="/admin/audit-logs" style={{ fontSize: '0.8125rem', color: 'hsl(220, 70%, 40%)', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                All Logs <ArrowUpRight size={13} />
              </Link>
            </div>
          </CardHeader>
          <CardContent style={{ padding: 0 }}>
            {recentLogs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2.5rem', color: 'hsl(220, 15%, 50%)' }}>
                No audit events recorded yet.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {recentLogs.slice(0, 6).map((log) => (
                  <div key={log.id} style={{ padding: '0.85rem 1.5rem', borderBottom: '1px solid hsl(220, 20%, 95%)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem' }}>
                    <div>
                      <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'hsl(220, 35%, 15%)' }}>
                        {log.details || log.action}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'hsl(220, 15%, 50%)', marginTop: '0.15rem' }}>
                        By <strong>{log.userName || 'System'}</strong> · <span style={{ textTransform: 'uppercase' }}>{log.module}</span>
                      </div>
                    </div>
                    <span style={{ fontSize: '0.71875rem', color: 'hsl(220, 15%, 55%)', whiteSpace: 'nowrap' }}>
                      {new Date(log.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
