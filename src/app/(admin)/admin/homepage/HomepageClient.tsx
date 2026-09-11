'use client'

import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/admin/ui/Card'
import { TableContainer, Table, Thead, Tbody, Tr, Th, Td, Badge } from '@/components/admin/ui/Table'
import { MediaPickerModal } from '@/components/admin/ui/MediaPickerModal'
import { useToast } from '@/components/admin/ui/Toast'
import {
  LayoutGrid,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Edit2,
  Image as ImageIcon,
  Loader2,
  X,
  ExternalLink,
} from 'lucide-react'

interface HomepageSectionItem {
  id: string
  sectionId: string
  label: string
  title?: string | null
  subtitle?: string | null
  content?: string | null
  image?: string | null
  buttonText?: string | null
  buttonUrl?: string | null
  order: number
  isVisible: boolean
  status?: string | null
}

interface HomepageClientProps {
  initialSections: HomepageSectionItem[]
}

export function HomepageClient({ initialSections }: HomepageClientProps) {
  const { success, error: showError } = useToast()
  const [sections, setSections] = useState<HomepageSectionItem[]>(initialSections)
  const [editingSection, setEditingSection] = useState<HomepageSectionItem | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isPickerOpen, setIsPickerOpen] = useState(false)

  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    image: '',
    buttonText: '',
    buttonUrl: '',
    isVisible: true,
  })

  const openEditModal = (sec: HomepageSectionItem) => {
    setEditingSection(sec)
    setFormData({
      title: sec.title || '',
      subtitle: sec.subtitle || '',
      image: sec.image || '',
      buttonText: sec.buttonText || '',
      buttonUrl: sec.buttonUrl || '',
      isVisible: sec.isVisible,
    })
  }

  const handleToggleVisibility = async (sec: HomepageSectionItem) => {
    const nextVis = !sec.isVisible
    try {
      const res = await fetch('/api/admin/homepage', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: sec.id, isVisible: nextVis }),
      })
      const json = await res.json()
      if (json.success) {
        setSections((prev) =>
          prev.map((s) => (s.id === sec.id ? { ...s, isVisible: nextVis } : s))
        )
        success(`Section "${sec.label}" is now ${nextVis ? 'visible' : 'hidden'} on homepage`)
      } else {
        showError('Failed to toggle visibility')
      }
    } catch {
      showError('Network error')
    }
  }

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= sections.length) return

    const newSections = [...sections]
    const temp = newSections[index]
    newSections[index] = newSections[targetIndex]
    newSections[targetIndex] = temp

    // Reassign order
    const updatedOrder = newSections.map((sec, idx) => ({
      ...sec,
      order: idx + 1,
    }))

    setSections(updatedOrder)

    try {
      const res = await fetch('/api/admin/homepage', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reorder: true,
          sections: updatedOrder.map((s) => ({ id: s.id, order: s.order })),
        }),
      })
      const json = await res.json()
      if (!json.success) {
        showError('Failed to update section order')
      }
    } catch {
      showError('Network error while reordering')
    }
  }

  const handleSaveDetails = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingSection) return
    setIsLoading(true)

    try {
      const res = await fetch('/api/admin/homepage', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingSection.id,
          ...formData,
        }),
      })
      const json = await res.json()
      if (json.success) {
        setSections((prev) =>
          prev.map((s) => (s.id === editingSection.id ? { ...s, ...formData } : s))
        )
        success(`Updated section "${editingSection.label}"`)
        setEditingSection(null)
      } else {
        showError(json.error?.message || 'Failed to update section')
      }
    } catch {
      showError('Network error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'hsl(220, 35%, 15%)', margin: 0 }}>
            Homepage Sections & Layout
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'hsl(220, 15%, 50%)', margin: '0.25rem 0 0 0' }}>
            Control the display order, visibility, custom titles, and call-to-action buttons for all 17 homepage components
          </p>
        </div>

        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.625rem 1.125rem',
            borderRadius: '8px',
            background: 'hsl(220, 70%, 95%)',
            color: 'hsl(220, 70%, 35%)',
            fontSize: '0.875rem',
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          <span>View Public Homepage</span>
          <ExternalLink size={14} />
        </a>
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Homepage Layout ({sections.length} Sections)</CardTitle>
            <CardDescription>Live ordering on public front page. Use arrow buttons to move sections up or down.</CardDescription>
          </div>
        </CardHeader>
        <CardContent style={{ padding: 0 }}>
          <TableContainer>
            <Table>
              <Thead>
                <Tr>
                  <Th style={{ width: '90px' }}>Order</Th>
                  <Th>Section Name</Th>
                  <Th>Section Key</Th>
                  <Th style={{ width: '130px' }}>Visibility</Th>
                  <Th style={{ width: '100px', textAlign: 'right' }}>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {sections.map((sec, index) => (
                  <Tr key={sec.id}>
                    <Td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '26px',
                            height: '26px',
                            borderRadius: '6px',
                            background: 'hsl(220, 20%, 94%)',
                            fontWeight: 700,
                            fontSize: '0.8125rem',
                            color: 'hsl(220, 35%, 25%)',
                          }}
                        >
                          {sec.order}
                        </span>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <button
                            type="button"
                            title="Move Up"
                            disabled={index === 0}
                            onClick={() => handleMove(index, 'up')}
                            style={{
                              border: 'none',
                              background: 'transparent',
                              cursor: index === 0 ? 'not-allowed' : 'pointer',
                              padding: '1px',
                              opacity: index === 0 ? 0.25 : 0.8,
                              color: 'hsl(220, 35%, 25%)',
                            }}
                          >
                            <ArrowUp size={13} />
                          </button>
                          <button
                            type="button"
                            title="Move Down"
                            disabled={index === sections.length - 1}
                            onClick={() => handleMove(index, 'down')}
                            style={{
                              border: 'none',
                              background: 'transparent',
                              cursor: index === sections.length - 1 ? 'not-allowed' : 'pointer',
                              padding: '1px',
                              opacity: index === sections.length - 1 ? 0.25 : 0.8,
                              color: 'hsl(220, 35%, 25%)',
                            }}
                          >
                            <ArrowDown size={13} />
                          </button>
                        </div>
                      </div>
                    </Td>
                    <Td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '6px',
                            background: 'hsl(40, 95%, 94%)',
                            color: 'hsl(40, 95%, 35%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <LayoutGrid size={16} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: 'hsl(220, 35%, 15%)' }}>{sec.label}</div>
                          {sec.title && (
                            <div style={{ fontSize: '0.75rem', color: 'hsl(220, 15%, 50%)' }}>
                              Custom: "{sec.title}"
                            </div>
                          )}
                        </div>
                      </div>
                    </Td>
                    <Td>
                      <code style={{ fontSize: '0.8125rem', background: 'hsl(220, 20%, 95%)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                        {sec.sectionId}
                      </code>
                    </Td>
                    <Td>
                      <button
                        type="button"
                        onClick={() => handleToggleVisibility(sec)}
                        style={{
                          border: 'none',
                          background: 'transparent',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                        }}
                      >
                        <Badge variant={sec.isVisible ? 'success' : 'default'}>
                          {sec.isVisible ? (
                            <>
                              <Eye size={12} /> Visible
                            </>
                          ) : (
                            <>
                              <EyeOff size={12} /> Hidden
                            </>
                          )}
                        </Badge>
                      </button>
                    </Td>
                    <Td style={{ textAlign: 'right' }}>
                      <button
                        type="button"
                        onClick={() => openEditModal(sec)}
                        title="Edit Section Details"
                        style={{
                          border: '1px solid hsl(220, 20%, 85%)',
                          background: '#ffffff',
                          padding: '0.35rem 0.6rem',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          color: 'hsl(220, 35%, 25%)',
                        }}
                      >
                        <Edit2 size={14} />
                      </button>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Edit Section Modal */}
      {editingSection && (
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
              maxWidth: '560px',
              width: '100%',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              overflow: 'hidden',
            }}
          >
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid hsl(220, 20%, 90%)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 700, margin: 0, color: 'hsl(220, 35%, 15%)' }}>
                Edit Section: {editingSection.label}
              </h2>
              <button
                type="button"
                onClick={() => setEditingSection(null)}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'hsl(220, 15%, 50%)' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveDetails} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Custom Section Heading (Optional)
                </label>
                <input
                  type="text"
                  placeholder={`Default: ${editingSection.label}`}
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  style={{ width: '100%', height: '40px', padding: '0 0.875rem', borderRadius: '8px', border: '1px solid hsl(220, 20%, 85%)', fontSize: '0.9375rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Custom Section Subtitle / Tagline (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Optional section description or subtitle"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  style={{ width: '100%', height: '40px', padding: '0 0.875rem', borderRadius: '8px', border: '1px solid hsl(220, 20%, 85%)', fontSize: '0.9375rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Section Background or Banner Image
                </label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    placeholder="/uploads/section-bg.jpg"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    CTA Button Text
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. View All"
                    value={formData.buttonText}
                    onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                    style={{ width: '100%', height: '40px', padding: '0 0.875rem', borderRadius: '8px', border: '1px solid hsl(220, 20%, 85%)', fontSize: '0.875rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    CTA Button URL
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. /admissions"
                    value={formData.buttonUrl}
                    onChange={(e) => setFormData({ ...formData, buttonUrl: e.target.value })}
                    style={{ width: '100%', height: '40px', padding: '0 0.875rem', borderRadius: '8px', border: '1px solid hsl(220, 20%, 85%)', fontSize: '0.875rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingTop: '0.25rem' }}>
                <input
                  type="checkbox"
                  id="sectionVisible"
                  checked={formData.isVisible}
                  onChange={(e) => setFormData({ ...formData, isVisible: e.target.checked })}
                  style={{ width: '16px', height: '16px', accentColor: 'hsl(220, 70%, 35%)' }}
                />
                <label htmlFor="sectionVisible" style={{ fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}>
                  Display this section on public homepage
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setEditingSection(null)}
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
                  <span>Save Changes</span>
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
            setFormData((prev) => ({ ...prev, image: media.url }))
            setIsPickerOpen(false)
          }}
          title="Select Section Image"
        />
      )}
    </div>
  )
}
