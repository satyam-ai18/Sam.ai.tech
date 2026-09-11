'use client'

import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/admin/ui/Card'
import { TableContainer, Table, Thead, Tbody, Tr, Th, Td, Badge } from '@/components/admin/ui/Table'
import { ConfirmDialog } from '@/components/admin/ui/ConfirmDialog'
import { MediaPickerModal } from '@/components/admin/ui/MediaPickerModal'
import { useToast } from '@/components/admin/ui/Toast'
import {
  Star,
  Plus,
  ArrowUp,
  ArrowDown,
  Edit2,
  Trash2,
  Image as ImageIcon,
  Loader2,
  X,
  Eye,
  EyeOff,
} from 'lucide-react'
import Image from 'next/image'

interface TestimonialItem {
  id: string
  name: string
  role?: string | null
  content: string
  rating: number
  image?: string | null
  isVisible: boolean
  order: number
}

interface TestimonialsClientProps {
  initialTestimonials: TestimonialItem[]
}

export function TestimonialsClient({ initialTestimonials }: TestimonialsClientProps) {
  const { success, error: showError } = useToast()
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>(initialTestimonials)
  const [isLoading, setIsLoading] = useState(false)

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<TestimonialItem | null>(null)
  const [isPickerOpen, setIsPickerOpen] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    role: '',
    content: '',
    rating: 5,
    image: '',
    isVisible: true,
  })

  // Delete State
  const [deleteTarget, setDeleteTarget] = useState<TestimonialItem | null>(null)

  const openCreateModal = () => {
    setEditingItem(null)
    setFormData({
      name: '',
      role: '',
      content: '',
      rating: 5,
      image: '',
      isVisible: true,
    })
    setIsModalOpen(true)
  }

  const openEditModal = (item: TestimonialItem) => {
    setEditingItem(item)
    setFormData({
      name: item.name,
      role: item.role || '',
      content: item.content,
      rating: item.rating,
      image: item.image || '',
      isVisible: item.isVisible,
    })
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (editingItem) {
        // Update
        const res = await fetch('/api/admin/testimonials', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingItem.id,
            ...formData,
          }),
        })
        const json = await res.json()
        if (json.success) {
          setTestimonials((prev) =>
            prev.map((t) => (t.id === editingItem.id ? { ...t, ...formData } : t))
          )
          success(`Updated testimonial from ${formData.name}`)
          setIsModalOpen(false)
        } else {
          showError(json.error?.message || 'Failed to update testimonial')
        }
      } else {
        // Create
        const maxOrder = testimonials.length > 0 ? Math.max(...testimonials.map((t) => t.order)) : 0
        const res = await fetch('/api/admin/testimonials', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            order: maxOrder + 1,
          }),
        })
        const json = await res.json()
        if (json.success) {
          setTestimonials((prev) => [...prev, json.data])
          success(`Added testimonial from ${formData.name}`)
          setIsModalOpen(false)
        } else {
          showError(json.error?.message || 'Failed to create testimonial')
        }
      }
    } catch {
      showError('Network error while saving testimonial')
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleVisible = async (item: TestimonialItem) => {
    const nextVis = !item.isVisible
    try {
      const res = await fetch('/api/admin/testimonials', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id, isVisible: nextVis }),
      })
      const json = await res.json()
      if (json.success) {
        setTestimonials((prev) =>
          prev.map((t) => (t.id === item.id ? { ...t, isVisible: nextVis } : t))
        )
        success(`Testimonial is now ${nextVis ? 'visible' : 'hidden'}`)
      } else {
        showError('Failed to toggle status')
      }
    } catch {
      showError('Network error')
    }
  }

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= testimonials.length) return

    const newItems = [...testimonials]
    const temp = newItems[index]
    newItems[index] = newItems[targetIndex]
    newItems[targetIndex] = temp

    const updated = newItems.map((item, idx) => ({
      ...item,
      order: idx + 1,
    }))

    setTestimonials(updated)

    try {
      const res = await fetch('/api/admin/testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reorder: true,
          items: updated.map((t) => ({ id: t.id, order: t.order })),
        }),
      })
      const json = await res.json()
      if (!json.success) {
        showError('Failed to update testimonial order')
      }
    } catch {
      showError('Network error while reordering')
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    setIsLoading(true)
    try {
      const res = await fetch(`/api/admin/testimonials?id=${deleteTarget.id}`, {
        method: 'DELETE',
      })
      const json = await res.json()
      if (json.success) {
        setTestimonials((prev) => prev.filter((t) => t.id !== deleteTarget.id))
        success(`Removed testimonial from ${deleteTarget.name}`)
        setDeleteTarget(null)
      } else {
        showError(json.error?.message || 'Failed to delete')
      }
    } catch {
      showError('Network error while deleting')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'hsl(220, 35%, 15%)', margin: 0 }}>
            Parent & Student Testimonials
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'hsl(220, 15%, 50%)', margin: '0.25rem 0 0 0' }}>
            Manage guardian reviews, star ratings, and community feedback featured on the homepage
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
          Add Testimonial
        </button>
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Testimonials ({testimonials.length})</CardTitle>
            <CardDescription>Testimonials displayed in the public homepage carousel/grid</CardDescription>
          </div>
        </CardHeader>
        <CardContent style={{ padding: 0 }}>
          <TableContainer>
            <Table>
              <Thead>
                <Tr>
                  <Th style={{ width: '90px' }}>Order</Th>
                  <Th>Author / Parent</Th>
                  <Th>Rating</Th>
                  <Th>Review Snippet</Th>
                  <Th style={{ width: '120px' }}>Status</Th>
                  <Th style={{ width: '120px', textAlign: 'right' }}>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {testimonials.length === 0 ? (
                  <Tr>
                    <Td colSpan={6} style={{ textAlign: 'center', padding: '2.5rem', color: 'hsl(220, 15%, 50%)' }}>
                      No testimonials added yet. Click "Add Testimonial" to create your first entry.
                    </Td>
                  </Tr>
                ) : (
                  testimonials.map((item, index) => (
                    <Tr key={item.id}>
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
                            {item.order}
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
                              disabled={index === testimonials.length - 1}
                              onClick={() => handleMove(index, 'down')}
                              style={{
                                border: 'none',
                                background: 'transparent',
                                cursor: index === testimonials.length - 1 ? 'not-allowed' : 'pointer',
                                padding: '1px',
                                opacity: index === testimonials.length - 1 ? 0.25 : 0.8,
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
                          {item.image ? (
                            <div style={{ width: '36px', height: '36px', borderRadius: '50%', overflow: 'hidden', position: 'relative' }}>
                              <Image src={item.image} alt={item.name} fill style={{ objectFit: 'cover' }} />
                            </div>
                          ) : (
                            <div
                              style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '50%',
                                background: 'hsl(220, 70%, 94%)',
                                color: 'hsl(220, 70%, 35%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 700,
                                fontSize: '0.875rem',
                              }}
                            >
                              {item.name.charAt(0)}
                            </div>
                          )}
                          <div>
                            <div style={{ fontWeight: 600, color: 'hsl(220, 35%, 15%)' }}>{item.name}</div>
                            {item.role && (
                              <div style={{ fontSize: '0.75rem', color: 'hsl(220, 15%, 50%)' }}>{item.role}</div>
                            )}
                          </div>
                        </div>
                      </Td>
                      <Td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '2px', color: 'hsl(40, 95%, 45%)' }}>
                          {Array.from({ length: item.rating }).map((_, i) => (
                            <Star key={i} size={14} fill="currentColor" />
                          ))}
                        </div>
                      </Td>
                      <Td>
                        <span
                          style={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            fontSize: '0.8125rem',
                            color: 'hsl(220, 20%, 40%)',
                            maxWidth: '380px',
                          }}
                        >
                          "{item.content}"
                        </span>
                      </Td>
                      <Td>
                        <button
                          type="button"
                          onClick={() => handleToggleVisible(item)}
                          style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 0 }}
                        >
                          <Badge variant={item.isVisible ? 'success' : 'default'}>
                            {item.isVisible ? (
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
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                          <button
                            type="button"
                            onClick={() => openEditModal(item)}
                            title="Edit Testimonial"
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
                            onClick={() => setDeleteTarget(item)}
                            title="Delete Testimonial"
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

      {/* Testimonial Modal */}
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
              maxWidth: '540px',
              width: '100%',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              overflow: 'hidden',
            }}
          >
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid hsl(220, 20%, 90%)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 700, margin: 0, color: 'hsl(220, 35%, 15%)' }}>
                {editingItem ? 'Edit Testimonial' : 'Add New Testimonial'}
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'hsl(220, 15%, 50%)' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Author Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rajesh Kumar"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    style={{ width: '100%', height: '40px', padding: '0 0.875rem', borderRadius: '8px', border: '1px solid hsl(220, 20%, 85%)', fontSize: '0.9375rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Role / Relationship
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Parent of Grade 5 Student"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    style={{ width: '100%', height: '40px', padding: '0 0.875rem', borderRadius: '8px', border: '1px solid hsl(220, 20%, 85%)', fontSize: '0.9375rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Star Rating (1 to 5)
                </label>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData({ ...formData, rating: star })}
                      style={{
                        border: 'none',
                        background: 'transparent',
                        cursor: 'pointer',
                        padding: '4px',
                        color: star <= formData.rating ? 'hsl(40, 95%, 45%)' : 'hsl(220, 15%, 80%)',
                      }}
                    >
                      <Star size={24} fill="currentColor" />
                    </button>
                  ))}
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, marginLeft: '0.5rem', color: 'hsl(220, 35%, 25%)' }}>
                    {formData.rating} Stars
                  </span>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Author Photo / Avatar
                </label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    placeholder="/uploads/parent.jpg"
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

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Review / Testimonial Text *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="What does the parent or student say about MK Convent School?"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid hsl(220, 20%, 85%)', fontSize: '0.875rem', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="checkbox"
                  id="testVis"
                  checked={formData.isVisible}
                  onChange={(e) => setFormData({ ...formData, isVisible: e.target.checked })}
                  style={{ width: '16px', height: '16px', accentColor: 'hsl(220, 70%, 35%)' }}
                />
                <label htmlFor="testVis" style={{ fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}>
                  Visible on public website
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
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
                  <span>{editingItem ? 'Save Changes' : 'Add Testimonial'}</span>
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
          title="Select Author Photo"
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete Testimonial"
        message={`Are you sure you want to delete the testimonial from ${deleteTarget?.name}? This action cannot be undone.`}
        confirmText="Delete Testimonial"
        isDestructive={true}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
