'use client'

import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/admin/ui/Card'
import { TableContainer, Table, Thead, Tbody, Tr, Th, Td, Badge } from '@/components/admin/ui/Table'
import { ConfirmDialog } from '@/components/admin/ui/ConfirmDialog'
import { MediaPickerModal } from '@/components/admin/ui/MediaPickerModal'
import { useToast } from '@/components/admin/ui/Toast'
import {
  Globe,
  Home,
  Navigation as NavIcon,
  FileText,
  Star,
  FolderOpen,
  Settings,
  Info,
  User,
  CheckCircle2,
  Save,
  Loader2,
  Image as ImageIcon,
  Plus,
  ArrowUp,
  ArrowDown,
  Edit2,
  Trash2,
  X,
  ExternalLink,
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface AboutData {
  id?: string
  key: string
  heading: string
  subheading?: string | null
  content: string
  image?: string | null
  isVisible: boolean
}

interface PrincipalData {
  id?: string
  key: string
  heading: string
  subheading?: string | null
  content: string
  image?: string | null
  designation?: string | null
  qualification?: string | null
  isVisible: boolean
}

interface CoreValueItem {
  id: string
  title: string
  description: string
  icon: string
  order: number
  isActive: boolean
}

interface WebsiteClientProps {
  initialAbout: AboutData | null
  initialPrincipal: PrincipalData | null
  initialCoreValues: CoreValueItem[]
}

export function WebsiteClient({
  initialAbout,
  initialPrincipal,
  initialCoreValues,
}: WebsiteClientProps) {
  const { success, error: showError } = useToast()
  const [activeTab, setActiveTab] = useState<'about' | 'principal' | 'why_us'>('about')
  const [isSaving, setIsSaving] = useState(false)

  // About State
  const [aboutForm, setAboutForm] = useState({
    heading: initialAbout?.heading || 'Welcome to Maa Kaushilya Convent School',
    subheading: initialAbout?.subheading || 'Nurturing Young Minds for a Brighter Tomorrow',
    content: initialAbout?.content || '',
    image: initialAbout?.image || '',
    isVisible: initialAbout?.isVisible !== false,
  })

  // Principal State
  const [principalForm, setPrincipalForm] = useState({
    heading: initialPrincipal?.heading || "Principal's Desk",
    subheading: initialPrincipal?.subheading || 'A Message from Our Leadership',
    name: initialPrincipal?.designation || 'Dr. Shailendra Pratap Singh',
    designation: initialPrincipal?.designation || 'Principal',
    qualification: initialPrincipal?.qualification || 'M.Ed, M.A. English, Ph.D in Education',
    content: initialPrincipal?.content || '',
    image: initialPrincipal?.image || '',
    isVisible: initialPrincipal?.isVisible !== false,
  })

  // Core Values State
  const [coreValues, setCoreValues] = useState<CoreValueItem[]>(initialCoreValues)
  const [editingValue, setEditingValue] = useState<CoreValueItem | null>(null)
  const [valueModalOpen, setValueModalOpen] = useState(false)
  const [valueForm, setValueForm] = useState({
    title: '',
    description: '',
    icon: 'BookOpen',
    isActive: true,
  })
  const [deleteTarget, setDeleteTarget] = useState<CoreValueItem | null>(null)

  // Media Picker State
  const [pickerTarget, setPickerTarget] = useState<'about_image' | 'principal_image' | null>(null)

  // Save About Section
  const handleSaveAbout = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      const res = await fetch('/api/admin/about', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: 'about',
          ...aboutForm,
        }),
      })
      const json = await res.json()
      if (json.success) {
        success('About School section saved and published')
      } else {
        showError(json.error?.message || 'Failed to save about section')
      }
    } catch {
      showError('Network error')
    } finally {
      setIsSaving(false)
    }
  }

  // Save Principal Section
  const handleSavePrincipal = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      const res = await fetch('/api/admin/principal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(principalForm),
      })
      const json = await res.json()
      if (json.success) {
        success("Principal's message saved and published")
      } else {
        showError(json.error?.message || 'Failed to save principal message')
      }
    } catch {
      showError('Network error')
    } finally {
      setIsSaving(false)
    }
  }

  // Core Values Functions
  const handleSaveCoreValue = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      if (editingValue) {
        // Update
        const res = await fetch('/api/admin/why-us', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingValue.id,
            ...valueForm,
          }),
        })
        const json = await res.json()
        if (json.success) {
          setCoreValues((prev) =>
            prev.map((v) => (v.id === editingValue.id ? { ...v, ...valueForm } : v))
          )
          success(`Updated: "${valueForm.title}"`)
          setValueModalOpen(false)
        } else {
          showError(json.error?.message || 'Failed to update')
        }
      } else {
        // Create
        const maxOrder = coreValues.length > 0 ? Math.max(...coreValues.map((v) => v.order)) : 0
        const res = await fetch('/api/admin/why-us', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...valueForm,
            order: maxOrder + 1,
          }),
        })
        const json = await res.json()
        if (json.success) {
          setCoreValues((prev) => [...prev, json.data])
          success(`Added: "${valueForm.title}"`)
          setValueModalOpen(false)
        } else {
          showError(json.error?.message || 'Failed to add')
        }
      }
    } catch {
      showError('Network error')
    } finally {
      setIsSaving(false)
    }
  }

  const handleMoveValue = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= coreValues.length) return

    const newItems = [...coreValues]
    const temp = newItems[index]
    newItems[index] = newItems[targetIndex]
    newItems[targetIndex] = temp

    const updated = newItems.map((item, idx) => ({ ...item, order: idx + 1 }))
    setCoreValues(updated)

    try {
      await fetch('/api/admin/why-us', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reorder: true,
          items: updated.map((it) => ({ id: it.id, order: it.order })),
        }),
      })
    } catch {
      showError('Failed to save order')
    }
  }

  const handleDeleteValueConfirm = async () => {
    if (!deleteTarget) return
    try {
      const res = await fetch(`/api/admin/why-us?id=${deleteTarget.id}`, {
        method: 'DELETE',
      })
      const json = await res.json()
      if (json.success) {
        setCoreValues((prev) => prev.filter((v) => v.id !== deleteTarget.id))
        success(`Removed: "${deleteTarget.title}"`)
        setDeleteTarget(null)
      } else {
        showError(json.error?.message || 'Failed to delete')
      }
    } catch {
      showError('Network error')
    }
  }

  return (
    <div>
      {/* Overview Cards */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'hsl(220, 35%, 15%)', margin: 0 }}>
          Website Management Hub
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'hsl(220, 15%, 50%)', margin: '0.25rem 0 1.25rem 0' }}>
          Central control for school public portal sections, pages, navigation menus, and institutional copy
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          {[
            { title: 'Homepage Builder', desc: '17 live sections & order', href: '/admin/homepage', icon: <Home size={18} />, color: 'hsl(220, 70%, 35%)', bg: 'hsl(220, 70%, 95%)' },
            { title: 'Navigation Menus', desc: 'Header & footer links', href: '/admin/navigation', icon: <NavIcon size={18} />, color: 'hsl(140, 70%, 30%)', bg: 'hsl(140, 60%, 93%)' },
            { title: 'CMS Pages', desc: 'Static articles & guides', href: '/admin/pages', icon: <FileText size={18} />, color: 'hsl(270, 60%, 45%)', bg: 'hsl(270, 70%, 95%)' },
            { title: 'Testimonials', desc: 'Parent & student reviews', href: '/admin/testimonials', icon: <Star size={18} />, color: 'hsl(40, 95%, 35%)', bg: 'hsl(40, 95%, 93%)' },
            { title: 'Media Library', desc: 'Photos, logos & banners', href: '/admin/media', icon: <FolderOpen size={18} />, color: 'hsl(190, 80%, 35%)', bg: 'hsl(190, 80%, 94%)' },
            { title: 'System Settings', desc: 'Identity & contact channels', href: '/admin/settings', icon: <Settings size={18} />, color: 'hsl(340, 70%, 45%)', bg: 'hsl(340, 70%, 95%)' },
          ].map((card) => (
            <Link
              key={card.title}
              href={card.href}
              style={{
                background: '#ffffff',
                border: '1px solid hsl(220, 20%, 90%)',
                borderRadius: '10px',
                padding: '1.125rem',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.875rem',
                transition: 'all 0.15s ease',
              }}
            >
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '8px',
                  background: card.bg,
                  color: card.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {card.icon}
              </div>
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'hsl(220, 35%, 15%)' }}>{card.title}</div>
                <div style={{ fontSize: '0.75rem', color: 'hsl(220, 15%, 50%)', marginTop: '0.2rem' }}>{card.desc}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Tabs for In-Place Content Editors */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid hsl(220, 20%, 88%)', marginBottom: '1.5rem' }}>
        <button
          type="button"
          onClick={() => setActiveTab('about')}
          style={{
            padding: '0.75rem 1.25rem',
            border: 'none',
            borderBottom: activeTab === 'about' ? '2.5px solid hsl(220, 70%, 35%)' : '2.5px solid transparent',
            background: 'none',
            fontWeight: 600,
            fontSize: '0.875rem',
            color: activeTab === 'about' ? 'hsl(220, 70%, 35%)' : 'hsl(220, 15%, 50%)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
          }}
        >
          <Info size={16} />
          About School CMS
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('principal')}
          style={{
            padding: '0.75rem 1.25rem',
            border: 'none',
            borderBottom: activeTab === 'principal' ? '2.5px solid hsl(220, 70%, 35%)' : '2.5px solid transparent',
            background: 'none',
            fontWeight: 600,
            fontSize: '0.875rem',
            color: activeTab === 'principal' ? 'hsl(220, 70%, 35%)' : 'hsl(220, 15%, 50%)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
          }}
        >
          <User size={16} />
          Principal's Desk CMS
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('why_us')}
          style={{
            padding: '0.75rem 1.25rem',
            border: 'none',
            borderBottom: activeTab === 'why_us' ? '2.5px solid hsl(220, 70%, 35%)' : '2.5px solid transparent',
            background: 'none',
            fontWeight: 600,
            fontSize: '0.875rem',
            color: activeTab === 'why_us' ? 'hsl(220, 70%, 35%)' : 'hsl(220, 15%, 50%)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
          }}
        >
          <CheckCircle2 size={16} />
          Why Choose Us (Core Values)
        </button>
      </div>

      {/* Tab 1: About School */}
      {activeTab === 'about' && (
        <form onSubmit={handleSaveAbout}>
          <Card>
            <CardHeader>
              <div>
                <CardTitle>About Maa Kaushilya Convent School</CardTitle>
                <CardDescription>Published on the homepage About section and dedicated /about page</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Section Heading *
                  </label>
                  <input
                    type="text"
                    required
                    value={aboutForm.heading}
                    onChange={(e) => setAboutForm({ ...aboutForm, heading: e.target.value })}
                    style={{ width: '100%', height: '42px', padding: '0 0.875rem', borderRadius: '8px', border: '1px solid hsl(220, 20%, 85%)', fontSize: '0.9375rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Subheading / Tagline
                  </label>
                  <input
                    type="text"
                    value={aboutForm.subheading || ''}
                    onChange={(e) => setAboutForm({ ...aboutForm, subheading: e.target.value })}
                    style={{ width: '100%', height: '42px', padding: '0 0.875rem', borderRadius: '8px', border: '1px solid hsl(220, 20%, 85%)', fontSize: '0.9375rem' }}
                  />
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Campus / Feature Image
                  </label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                      type="text"
                      placeholder="/uploads/campus.jpg"
                      value={aboutForm.image || ''}
                      onChange={(e) => setAboutForm({ ...aboutForm, image: e.target.value })}
                      style={{ flex: 1, height: '42px', padding: '0 0.875rem', borderRadius: '8px', border: '1px solid hsl(220, 20%, 85%)', fontSize: '0.875rem' }}
                    />
                    <button
                      type="button"
                      onClick={() => setPickerTarget('about_image')}
                      style={{ height: '42px', padding: '0 0.875rem', borderRadius: '8px', border: '1px solid hsl(220, 20%, 80%)', background: '#ffffff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8125rem', fontWeight: 600 }}
                    >
                      <ImageIcon size={15} /> Select
                    </button>
                  </div>
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Full Story / Narrative Content *
                  </label>
                  <textarea
                    rows={6}
                    required
                    value={aboutForm.content}
                    onChange={(e) => setAboutForm({ ...aboutForm, content: e.target.value })}
                    style={{ width: '100%', padding: '0.875rem', borderRadius: '8px', border: '1px solid hsl(220, 20%, 85%)', fontSize: '0.9375rem', resize: 'vertical' }}
                  />
                </div>

                <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="checkbox"
                    id="aboutVis"
                    checked={aboutForm.isVisible}
                    onChange={(e) => setAboutForm({ ...aboutForm, isVisible: e.target.checked })}
                    style={{ width: '16px', height: '16px', accentColor: 'hsl(220, 70%, 35%)' }}
                  />
                  <label htmlFor="aboutVis" style={{ fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}>
                    Section active and visible across the school portal
                  </label>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button
                  type="submit"
                  disabled={isSaving}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.75rem 1.75rem',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'hsl(220, 70%, 35%)',
                    color: '#ffffff',
                    fontSize: '0.9375rem',
                    fontWeight: 700,
                    cursor: isSaving ? 'not-allowed' : 'pointer',
                  }}
                >
                  {isSaving ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={16} />}
                  <span>Save About Content</span>
                </button>
              </div>
            </CardContent>
          </Card>
        </form>
      )}

      {/* Tab 2: Principal's Desk */}
      {activeTab === 'principal' && (
        <form onSubmit={handleSavePrincipal}>
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Principal's Desk CMS</CardTitle>
                <CardDescription>Manage message, portrait, and credentials of the School Principal</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Section Heading
                  </label>
                  <input
                    type="text"
                    value={principalForm.heading}
                    onChange={(e) => setPrincipalForm({ ...principalForm, heading: e.target.value })}
                    style={{ width: '100%', height: '42px', padding: '0 0.875rem', borderRadius: '8px', border: '1px solid hsl(220, 20%, 85%)', fontSize: '0.9375rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Principal Name & Designation *
                  </label>
                  <input
                    type="text"
                    required
                    value={principalForm.designation || ''}
                    onChange={(e) => setPrincipalForm({ ...principalForm, designation: e.target.value })}
                    style={{ width: '100%', height: '42px', padding: '0 0.875rem', borderRadius: '8px', border: '1px solid hsl(220, 20%, 85%)', fontSize: '0.9375rem' }}
                  />
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Academic Qualifications & Degrees
                  </label>
                  <input
                    type="text"
                    value={principalForm.qualification || ''}
                    onChange={(e) => setPrincipalForm({ ...principalForm, qualification: e.target.value })}
                    placeholder="e.g. M.Ed, M.A. English, B.Sc"
                    style={{ width: '100%', height: '42px', padding: '0 0.875rem', borderRadius: '8px', border: '1px solid hsl(220, 20%, 85%)', fontSize: '0.9375rem' }}
                  />
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Principal Portrait Photo
                  </label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                      type="text"
                      placeholder="/uploads/principal.jpg"
                      value={principalForm.image || ''}
                      onChange={(e) => setPrincipalForm({ ...principalForm, image: e.target.value })}
                      style={{ flex: 1, height: '42px', padding: '0 0.875rem', borderRadius: '8px', border: '1px solid hsl(220, 20%, 85%)', fontSize: '0.875rem' }}
                    />
                    <button
                      type="button"
                      onClick={() => setPickerTarget('principal_image')}
                      style={{ height: '42px', padding: '0 0.875rem', borderRadius: '8px', border: '1px solid hsl(220, 20%, 80%)', background: '#ffffff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8125rem', fontWeight: 600 }}
                    >
                      <ImageIcon size={15} /> Select
                    </button>
                  </div>
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Principal's Message Content *
                  </label>
                  <textarea
                    rows={6}
                    required
                    value={principalForm.content}
                    onChange={(e) => setPrincipalForm({ ...principalForm, content: e.target.value })}
                    style={{ width: '100%', padding: '0.875rem', borderRadius: '8px', border: '1px solid hsl(220, 20%, 85%)', fontSize: '0.9375rem', resize: 'vertical' }}
                  />
                </div>

                <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="checkbox"
                    id="princVis"
                    checked={principalForm.isVisible}
                    onChange={(e) => setPrincipalForm({ ...principalForm, isVisible: e.target.checked })}
                    style={{ width: '16px', height: '16px', accentColor: 'hsl(220, 70%, 35%)' }}
                  />
                  <label htmlFor="princVis" style={{ fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}>
                    Display Principal's Desk on the homepage
                  </label>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button
                  type="submit"
                  disabled={isSaving}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.75rem 1.75rem',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'hsl(220, 70%, 35%)',
                    color: '#ffffff',
                    fontSize: '0.9375rem',
                    fontWeight: 700,
                    cursor: isSaving ? 'not-allowed' : 'pointer',
                  }}
                >
                  {isSaving ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={16} />}
                  <span>Save Principal Details</span>
                </button>
              </div>
            </CardContent>
          </Card>
        </form>
      )}

      {/* Tab 3: Why Choose Us (Core Values) */}
      {activeTab === 'why_us' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
            <button
              type="button"
              onClick={() => {
                setEditingValue(null)
                setValueForm({ title: '', description: '', icon: 'BookOpen', isActive: true })
                setValueModalOpen(true)
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                border: 'none',
                background: 'hsl(220, 70%, 35%)',
                color: '#ffffff',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <Plus size={15} /> Add Value Item
            </button>
          </div>

          <Card>
            <CardHeader>
              <div>
                <CardTitle>Why Choose Us / Core Values ({coreValues.length} Items)</CardTitle>
                <CardDescription>Highlighted educational pillars and institutional strengths</CardDescription>
              </div>
            </CardHeader>
            <CardContent style={{ padding: 0 }}>
              <TableContainer>
                <Table>
                  <Thead>
                    <Tr>
                      <Th style={{ width: '90px' }}>Order</Th>
                      <Th>Value Title</Th>
                      <Th>Description</Th>
                      <Th style={{ width: '100px' }}>Icon Key</Th>
                      <Th style={{ width: '100px', textAlign: 'right' }}>Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {coreValues.map((val, index) => (
                      <Tr key={val.id}>
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
                              {val.order}
                            </span>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <button
                                type="button"
                                title="Move Up"
                                disabled={index === 0}
                                onClick={() => handleMoveValue(index, 'up')}
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
                                disabled={index === coreValues.length - 1}
                                onClick={() => handleMoveValue(index, 'down')}
                                style={{
                                  border: 'none',
                                  background: 'transparent',
                                  cursor: index === coreValues.length - 1 ? 'not-allowed' : 'pointer',
                                  padding: '1px',
                                  opacity: index === coreValues.length - 1 ? 0.25 : 0.8,
                                  color: 'hsl(220, 35%, 25%)',
                                }}
                              >
                                <ArrowDown size={13} />
                              </button>
                            </div>
                          </div>
                        </Td>
                        <Td>
                          <span style={{ fontWeight: 600, color: 'hsl(220, 35%, 15%)' }}>{val.title}</span>
                        </Td>
                        <Td>
                          <span style={{ fontSize: '0.8125rem', color: 'hsl(220, 15%, 45%)' }}>{val.description}</span>
                        </Td>
                        <Td>
                          <code style={{ fontSize: '0.75rem', background: 'hsl(220, 20%, 95%)', padding: '0.2rem 0.4rem', borderRadius: '4px' }}>
                            {val.icon}
                          </code>
                        </Td>
                        <Td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingValue(val)
                                setValueForm({
                                  title: val.title,
                                  description: val.description,
                                  icon: val.icon,
                                  isActive: val.isActive,
                                })
                                setValueModalOpen(true)
                              }}
                              style={{
                                border: '1px solid hsl(220, 20%, 85%)',
                                background: '#ffffff',
                                padding: '0.35rem 0.5rem',
                                borderRadius: '6px',
                                cursor: 'pointer',
                              }}
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(val)}
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
                    ))}
                  </Tbody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Core Value Modal */}
      {valueModalOpen && (
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
              maxWidth: '480px',
              width: '100%',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              overflow: 'hidden',
            }}
          >
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid hsl(220, 20%, 90%)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 700, margin: 0, color: 'hsl(220, 35%, 15%)' }}>
                {editingValue ? 'Edit Core Value' : 'Add Core Value'}
              </h2>
              <button
                type="button"
                onClick={() => setValueModalOpen(false)}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'hsl(220, 15%, 50%)' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveCoreValue} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CBSE Excellence"
                  value={valueForm.title}
                  onChange={(e) => setValueForm({ ...valueForm, title: e.target.value })}
                  style={{ width: '100%', height: '40px', padding: '0 0.875rem', borderRadius: '8px', border: '1px solid hsl(220, 20%, 85%)', fontSize: '0.9375rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Description *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Why is this pillar important to students?"
                  value={valueForm.description}
                  onChange={(e) => setValueForm({ ...valueForm, description: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid hsl(220, 20%, 85%)', fontSize: '0.875rem', resize: 'vertical' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Lucide Icon Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. BookOpen, Award, Shield, Users"
                  value={valueForm.icon}
                  onChange={(e) => setValueForm({ ...valueForm, icon: e.target.value })}
                  style={{ width: '100%', height: '40px', padding: '0 0.875rem', borderRadius: '8px', border: '1px solid hsl(220, 20%, 85%)', fontSize: '0.875rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setValueModalOpen(false)}
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
                  disabled={isSaving}
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
                    cursor: isSaving ? 'not-allowed' : 'pointer',
                  }}
                >
                  {isSaving && <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />}
                  <span>{editingValue ? 'Save Changes' : 'Add Item'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Media Picker */}
      {pickerTarget && (
        <MediaPickerModal
          isOpen={true}
          onClose={() => setPickerTarget(null)}
          onSelect={(media) => {
            if (pickerTarget === 'about_image') {
              setAboutForm((prev) => ({ ...prev, image: media.url }))
            } else if (pickerTarget === 'principal_image') {
              setPrincipalForm((prev) => ({ ...prev, image: media.url }))
            }
            setPickerTarget(null)
          }}
          title={pickerTarget === 'about_image' ? 'Select About Campus Image' : "Select Principal's Portrait"}
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete Core Value"
        message={`Are you sure you want to delete "${deleteTarget?.title}" from Why Choose Us?`}
        confirmText="Delete Value"
        isDestructive={true}
        onConfirm={handleDeleteValueConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
