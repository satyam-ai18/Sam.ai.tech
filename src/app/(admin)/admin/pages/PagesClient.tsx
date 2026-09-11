'use client'

import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/admin/ui/Card'
import { TableContainer, Table, Thead, Tbody, Tr, Th, Td, Badge } from '@/components/admin/ui/Table'
import { ConfirmDialog } from '@/components/admin/ui/ConfirmDialog'
import { MediaPickerModal } from '@/components/admin/ui/MediaPickerModal'
import { useToast } from '@/components/admin/ui/Toast'
import {
  FileText,
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  Search,
  Loader2,
  Image as ImageIcon,
  Eye,
  CheckCircle,
  XCircle,
  X,
} from 'lucide-react'
import Link from 'next/link'

interface PageItem {
  id: string
  title: string
  slug: string
  content: string
  heroHeading?: string | null
  heroSubtitle?: string | null
  blocks?: string | null
  featuredImage?: string | null
  status: 'DRAFT' | 'PUBLISHED'
  seoTitle?: string | null
  seoDescription?: string | null
  ogImage?: string | null
  createdBy?: string | null
  publishedAt?: string | Date | null
  updatedAt: string | Date
}

interface PagesClientProps {
  initialPages: PageItem[]
}

export function PagesClient({ initialPages }: PagesClientProps) {
  const { success, error: showError } = useToast()
  const [pages, setPages] = useState<PageItem[]>(initialPages)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PUBLISHED' | 'DRAFT'>('ALL')
  const [isLoading, setIsLoading] = useState(false)

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPage, setEditingPage] = useState<PageItem | null>(null)
  const [isPickerOpen, setIsPickerOpen] = useState(false)

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    heroHeading: '',
    heroSubtitle: '',
    content: '',
    blocks: '',
    featuredImage: '',
    status: 'PUBLISHED' as 'DRAFT' | 'PUBLISHED',
    seoTitle: '',
    seoDescription: '',
  })

  // Delete State
  const [deleteTarget, setDeleteTarget] = useState<PageItem | null>(null)

  const slugify = (text: string) =>
    text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '')

  const handleTitleChange = (val: string) => {
    setFormData((prev) => ({
      ...prev,
      title: val,
      // Auto generate slug only when creating new page
      slug: editingPage ? prev.slug : slugify(val),
    }))
  }

  const openCreateModal = () => {
    setEditingPage(null)
    setFormData({
      title: '',
      slug: '',
      heroHeading: '',
      heroSubtitle: '',
      content: '',
      blocks: '',
      featuredImage: '',
      status: 'PUBLISHED',
      seoTitle: '',
      seoDescription: '',
    })
    setIsModalOpen(true)
  }

  const openEditModal = (page: PageItem) => {
    setEditingPage(page)
    setFormData({
      title: page.title,
      slug: page.slug,
      heroHeading: page.heroHeading || '',
      heroSubtitle: page.heroSubtitle || '',
      content: page.content || '',
      blocks: page.blocks || '',
      featuredImage: page.featuredImage || '',
      status: page.status,
      seoTitle: page.seoTitle || '',
      seoDescription: page.seoDescription || '',
    })
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (editingPage) {
        // Update
        const res = await fetch('/api/admin/pages', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingPage.id,
            ...formData,
          }),
        })
        const json = await res.json()
        if (json.success) {
          setPages((prev) =>
            prev.map((p) =>
              p.id === editingPage.id
                ? { ...p, ...formData, updatedAt: new Date().toISOString() }
                : p
            )
          )
          success(`Updated page: "${formData.title}"`)
          setIsModalOpen(false)
        } else {
          showError(json.error?.message || 'Failed to update page')
        }
      } else {
        // Create
        const res = await fetch('/api/admin/pages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        })
        const json = await res.json()
        if (json.success) {
          setPages((prev) => [json.data, ...prev])
          success(`Created page: "${formData.title}"`)
          setIsModalOpen(false)
        } else {
          showError(json.error?.message || 'Failed to create page')
        }
      }
    } catch {
      showError('Network error while saving page')
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleStatus = async (page: PageItem) => {
    const nextStatus: 'DRAFT' | 'PUBLISHED' = page.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED'
    try {
      const res = await fetch('/api/admin/pages', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: page.id, status: nextStatus }),
      })
      const json = await res.json()
      if (json.success) {
        setPages((prev) =>
          prev.map((p) => (p.id === page.id ? { ...p, status: nextStatus } : p))
        )
        success(`Page is now ${nextStatus.toLowerCase()}`)
      } else {
        showError('Failed to update status')
      }
    } catch {
      showError('Network error')
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    setIsLoading(true)
    try {
      const res = await fetch(`/api/admin/pages?id=${deleteTarget.id}`, {
        method: 'DELETE',
      })
      const json = await res.json()
      if (json.success) {
        setPages((prev) => prev.filter((p) => p.id !== deleteTarget.id))
        success(`Deleted page: "${deleteTarget.title}"`)
        setDeleteTarget(null)
      } else {
        showError(json.error?.message || 'Failed to delete page')
      }
    } catch {
      showError('Network error while deleting page')
    } finally {
      setIsLoading(false)
    }
  }

  const filteredPages = pages.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.slug.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'hsl(220, 35%, 15%)', margin: 0 }}>
            CMS Custom Pages
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'hsl(220, 15%, 50%)', margin: '0.25rem 0 0 0' }}>
            Publish custom static pages, curriculum notes, policy documents, and informational articles
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.625rem 1.125rem',
            borderRadius: '8px',
            background: 'hsl(220, 70%, 35%)',
            color: '#ffffff',
            fontSize: '0.875rem',
            fontWeight: 600,
            border: 'none',
            cursor: 'pointer',
          }}
        >
          <Plus size={16} />
          Create New Page
        </button>
      </div>

      {/* Filter Bar */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
          <Search
            size={16}
            style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'hsl(220, 15%, 50%)' }}
          />
          <input
            type="text"
            placeholder="Search pages by title or slug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              height: '40px',
              paddingLeft: '2.5rem',
              paddingRight: '1rem',
              borderRadius: '8px',
              border: '1px solid hsl(220, 20%, 88%)',
              background: '#ffffff',
              fontSize: '0.875rem',
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {(['ALL', 'PUBLISHED', 'DRAFT'] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              style={{
                padding: '0 1rem',
                height: '40px',
                borderRadius: '8px',
                border: '1px solid',
                borderColor: statusFilter === st ? 'hsl(220, 70%, 35%)' : 'hsl(220, 20%, 88%)',
                background: statusFilter === st ? 'hsl(220, 70%, 96%)' : '#ffffff',
                color: statusFilter === st ? 'hsl(220, 70%, 35%)' : 'hsl(220, 15%, 40%)',
                fontSize: '0.8125rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>All Pages ({filteredPages.length})</CardTitle>
            <CardDescription>Custom content pages accessible via /{'{slug}'}</CardDescription>
          </div>
        </CardHeader>
        <CardContent style={{ padding: 0 }}>
          <TableContainer>
            <Table>
              <Thead>
                <Tr>
                  <Th>Page Title</Th>
                  <Th>Public URL</Th>
                  <Th>Status</Th>
                  <Th>Last Updated</Th>
                  <Th style={{ textAlign: 'right' }}>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredPages.length === 0 ? (
                  <Tr>
                    <Td colSpan={5} style={{ textAlign: 'center', padding: '2.5rem', color: 'hsl(220, 15%, 50%)' }}>
                      No pages found matching your filters.
                    </Td>
                  </Tr>
                ) : (
                  filteredPages.map((page) => (
                    <Tr key={page.id}>
                      <Td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div
                            style={{
                              width: '34px',
                              height: '34px',
                              borderRadius: '6px',
                              background: 'hsl(220, 70%, 95%)',
                              color: 'hsl(220, 70%, 40%)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <FileText size={17} />
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: 'hsl(220, 35%, 15%)' }}>{page.title}</div>
                            {page.seoTitle && (
                              <div style={{ fontSize: '0.75rem', color: 'hsl(220, 15%, 50%)' }}>
                                SEO: {page.seoTitle}
                              </div>
                            )}
                          </div>
                        </div>
                      </Td>
                      <Td>
                        <code style={{ fontSize: '0.8125rem', background: 'hsl(220, 20%, 95%)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                          /{page.slug}
                        </code>
                      </Td>
                      <Td>
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(page)}
                          style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 0 }}
                        >
                          <Badge variant={page.status === 'PUBLISHED' ? 'success' : 'warning'}>
                            {page.status}
                          </Badge>
                        </button>
                      </Td>
                      <Td>
                        <span style={{ fontSize: '0.8125rem', color: 'hsl(220, 15%, 50%)' }}>
                          {new Date(page.updatedAt).toLocaleDateString()}
                        </span>
                      </Td>
                      <Td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                          <Link
                            href={page.status === 'DRAFT' ? `/${page.slug}?preview=true` : `/${page.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={page.status === 'DRAFT' ? 'Preview Draft (Admin Auth)' : 'View Published Page'}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                              padding: '0.35rem 0.5rem',
                              borderRadius: '6px',
                              border: page.status === 'DRAFT' ? '1px solid hsl(38, 90%, 75%)' : '1px solid hsl(220, 20%, 85%)',
                              background: page.status === 'DRAFT' ? 'hsl(40, 90%, 96%)' : '#ffffff',
                              color: page.status === 'DRAFT' ? 'hsl(35, 90%, 35%)' : 'hsl(220, 70%, 45%)',
                              textDecoration: 'none',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                            }}
                          >
                            <ExternalLink size={13} />
                            <span>{page.status === 'DRAFT' ? 'Preview' : 'View'}</span>
                          </Link>
                          <button
                            type="button"
                            onClick={() => openEditModal(page)}
                            title="Edit Page"
                            style={{
                              border: '1px solid hsl(220, 20%, 85%)',
                              background: '#ffffff',
                              padding: '0.35rem 0.5rem',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              color: 'hsl(220, 35%, 25%)',
                            }}
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(page)}
                            title="Delete Page"
                            style={{
                              border: '1px solid hsl(0, 70%, 90%)',
                              background: 'hsl(0, 80%, 98%)',
                              padding: '0.35rem 0.5rem',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              color: 'hsl(0, 70%, 45%)',
                            }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </Td>
                    </Tr>
                  ))
                )}
              </Tbody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Page Modal */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            background: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '12px',
              maxWidth: '750px',
              width: '100%',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              overflow: 'hidden',
            }}
          >
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid hsl(220, 20%, 90%)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 700, margin: 0, color: 'hsl(220, 35%, 15%)' }}>
                {editingPage ? `Edit Page: ${editingPage.title}` : 'Create New CMS Page'}
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'hsl(220, 15%, 50%)' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', overflowY: 'auto', padding: '1.5rem', gap: '1.25rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Page Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Academic Curriculum 2024"
                    value={formData.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    style={{ width: '100%', height: '40px', padding: '0 0.875rem', borderRadius: '8px', border: '1px solid hsl(220, 20%, 85%)', fontSize: '0.9375rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Slug URL *
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ height: '40px', padding: '0 0.75rem', display: 'flex', alignItems: 'center', background: 'hsl(220, 20%, 95%)', border: '1px solid hsl(220, 20%, 85%)', borderRight: 'none', borderTopLeftRadius: '8px', borderBottomLeftRadius: '8px', fontSize: '0.875rem', color: 'hsl(220, 15%, 50%)' }}>
                      /
                    </span>
                    <input
                      type="text"
                      required
                      placeholder="academic-curriculum"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: slugify(e.target.value) })}
                      style={{ flex: 1, height: '40px', padding: '0 0.875rem', borderTopRightRadius: '8px', borderBottomRightRadius: '8px', border: '1px solid hsl(220, 20%, 85%)', fontSize: '0.9375rem' }}
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Hero Heading (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="Defaults to Page Title if blank"
                    value={formData.heroHeading}
                    onChange={(e) => setFormData({ ...formData, heroHeading: e.target.value })}
                    style={{ width: '100%', height: '40px', padding: '0 0.875rem', borderRadius: '8px', border: '1px solid hsl(220, 20%, 85%)', fontSize: '0.875rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Hero Subtitle (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="Descriptive subtitle beneath hero title"
                    value={formData.heroSubtitle}
                    onChange={(e) => setFormData({ ...formData, heroSubtitle: e.target.value })}
                    style={{ width: '100%', height: '40px', padding: '0 0.875rem', borderRadius: '8px', border: '1px solid hsl(220, 20%, 85%)', fontSize: '0.875rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Publication Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  style={{ width: '100%', height: '40px', padding: '0 0.875rem', borderRadius: '8px', border: '1px solid hsl(220, 20%, 85%)', fontSize: '0.875rem', background: '#ffffff' }}
                >
                  <option value="PUBLISHED">Published (Visible to public visitors)</option>
                  <option value="DRAFT">Draft (Hidden from public; previewable by Admins)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Featured Banner Image
                </label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    placeholder="/uploads/page-banner.jpg"
                    value={formData.featuredImage}
                    onChange={(e) => setFormData({ ...formData, featuredImage: e.target.value })}
                    style={{ flex: 1, height: '40px', padding: '0 0.875rem', borderRadius: '8px', border: '1px solid hsl(220, 20%, 85%)', fontSize: '0.875rem' }}
                  />
                  <button
                    type="button"
                    onClick={() => setIsPickerOpen(true)}
                    style={{ height: '40px', padding: '0 0.875rem', borderRadius: '8px', border: '1px solid hsl(220, 20%, 80%)', background: '#ffffff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8125rem', fontWeight: 600 }}
                  >
                    <ImageIcon size={15} /> Select
                  </button>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Page Content (Markdown / Text) *
                </label>
                <textarea
                  rows={6}
                  required
                  placeholder="Write the full body content of this page here..."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid hsl(220, 20%, 85%)', fontSize: '0.875rem', fontFamily: 'monospace', resize: 'vertical' }}
                />
              </div>

              {/* Reusable Content Blocks */}
              <div style={{ background: 'hsl(220, 20%, 98%)', padding: '1rem', borderRadius: '8px', border: '1px solid hsl(220, 20%, 90%)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: 'hsl(220, 35%, 20%)' }}>
                      Structured Reusable Blocks (JSON)
                    </label>
                    <span style={{ fontSize: '0.75rem', color: 'hsl(220, 15%, 50%)' }}>
                      Add custom interactive blocks: Feature Cards, Statistics, CTA Banners
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={() => {
                        const sampleFeatures = [
                          {
                            id: `blk_${Date.now()}`,
                            type: 'features',
                            title: 'Key Highlights',
                            items: [
                              { title: 'Holistic Development', description: 'Nurturing academic, creative, and physical excellence.', badge: 'Core Value' },
                              { title: 'Digital Classrooms', description: 'Smart boards and digital interactive learning tools.', badge: 'Smart' },
                              { title: 'Safe Transport', description: 'GPS-enabled school buses with professional drivers.', badge: 'Safe' },
                            ],
                          },
                        ]
                        setFormData((prev) => ({ ...prev, blocks: JSON.stringify(sampleFeatures, null, 2) }))
                      }}
                      style={{ fontSize: '0.6875rem', padding: '0.25rem 0.5rem', borderRadius: '4px', border: '1px solid hsl(220, 20%, 85%)', background: '#ffffff', cursor: 'pointer', fontWeight: 600 }}
                    >
                      + Feature Cards
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const sampleStats = [
                          {
                            id: `blk_${Date.now()}`,
                            type: 'stats',
                            title: 'Our School By The Numbers',
                            items: [
                              { value: '1,200+', label: 'Happy Students' },
                              { value: '65+', label: 'Qualified Faculty' },
                              { value: '100%', label: 'Board Exam Pass Rate' },
                              { value: '25:1', label: 'Student-Teacher Ratio' },
                            ],
                          },
                        ]
                        setFormData((prev) => ({ ...prev, blocks: JSON.stringify(sampleStats, null, 2) }))
                      }}
                      style={{ fontSize: '0.6875rem', padding: '0.25rem 0.5rem', borderRadius: '4px', border: '1px solid hsl(220, 20%, 85%)', background: '#ffffff', cursor: 'pointer', fontWeight: 600 }}
                    >
                      + Stats Counters
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const sampleCta = [
                          {
                            id: `blk_${Date.now()}`,
                            type: 'cta',
                            title: 'Ready to Enroll Your Child?',
                            content: 'Admissions are currently open for the upcoming academic session. Apply online in just a few minutes.',
                            ctaText: 'Apply For Admission',
                            ctaUrl: '/admissions/apply',
                          },
                        ]
                        setFormData((prev) => ({ ...prev, blocks: JSON.stringify(sampleCta, null, 2) }))
                      }}
                      style={{ fontSize: '0.6875rem', padding: '0.25rem 0.5rem', borderRadius: '4px', border: '1px solid hsl(220, 20%, 85%)', background: '#ffffff', cursor: 'pointer', fontWeight: 600 }}
                    >
                      + CTA Banner
                    </button>
                    {formData.blocks && (
                      <button
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, blocks: '' }))}
                        style={{ fontSize: '0.6875rem', padding: '0.25rem 0.5rem', borderRadius: '4px', border: '1px solid hsl(0, 70%, 85%)', background: 'hsl(0, 80%, 98%)', color: 'hsl(0, 70%, 45%)', cursor: 'pointer', fontWeight: 600 }}
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>
                <textarea
                  rows={4}
                  placeholder='Optional JSON array of blocks, e.g. [{"id":"1","type":"features","title":"Highlights","items":[]}]'
                  value={formData.blocks}
                  onChange={(e) => setFormData({ ...formData, blocks: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid hsl(220, 20%, 85%)', fontSize: '0.75rem', fontFamily: 'monospace' }}
                />
              </div>

              <div style={{ borderTop: '1px solid hsl(220, 20%, 92%)', paddingTop: '1rem' }}>
                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'hsl(220, 35%, 20%)', marginBottom: '0.75rem' }}>
                  Search Engine Optimization (SEO)
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.3rem' }}>
                      SEO Meta Title
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. School Curriculum | MK Convent School"
                      value={formData.seoTitle}
                      onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
                      style={{ width: '100%', height: '38px', padding: '0 0.75rem', borderRadius: '6px', border: '1px solid hsl(220, 20%, 85%)', fontSize: '0.8125rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.3rem' }}>
                      SEO Meta Description
                    </label>
                    <input
                      type="text"
                      placeholder="Brief overview for search engines..."
                      value={formData.seoDescription}
                      onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })}
                      style={{ width: '100%', height: '38px', padding: '0 0.75rem', borderRadius: '6px', border: '1px solid hsl(220, 20%, 85%)', fontSize: '0.8125rem' }}
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    padding: '0.625rem 1.25rem',
                    borderRadius: '8px',
                    border: '1px solid hsl(220, 20%, 85%)',
                    background: '#ffffff',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.625rem 1.5rem',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'hsl(220, 70%, 35%)',
                    color: '#ffffff',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                  }}
                >
                  {isLoading && <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />}
                  <span>{editingPage ? 'Save Page Changes' : 'Publish Page'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Media Picker */}
      {isPickerOpen && (
        <MediaPickerModal
          isOpen={true}
          onClose={() => setIsPickerOpen(false)}
          onSelect={(media) => {
            setFormData((prev) => ({ ...prev, featuredImage: media.url }))
            setIsPickerOpen(false)
          }}
          title="Select Page Featured Banner"
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete CMS Page"
        message={`Are you sure you want to delete the page "${deleteTarget?.title}"? Public visitors will no longer be able to access /${deleteTarget?.slug}.`}
        confirmText="Delete Page"
        isDestructive={true}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
