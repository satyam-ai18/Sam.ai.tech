'use client'

import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/admin/ui/Card'
import { TableContainer, Table, Thead, Tbody, Tr, Th, Td, Badge } from '@/components/admin/ui/Table'
import { ConfirmDialog } from '@/components/admin/ui/ConfirmDialog'
import { useToast } from '@/components/admin/ui/Toast'
import {
  Navigation as NavIcon,
  Plus,
  ArrowUp,
  ArrowDown,
  Edit2,
  Trash2,
  Check,
  X,
  ExternalLink,
  Loader2,
} from 'lucide-react'

interface NavigationItem {
  id: string
  label: string
  url: string
  target: string
  parentId?: string | null
  order: number
  isActive: boolean
}

interface NavigationClientProps {
  initialItems: NavigationItem[]
}

export function NavigationClient({ initialItems }: NavigationClientProps) {
  const { success, error: showError } = useToast()
  const [items, setItems] = useState<NavigationItem[]>(initialItems)
  const [isLoading, setIsLoading] = useState(false)

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<NavigationItem | null>(null)
  const [formData, setFormData] = useState({
    label: '',
    url: '',
    target: '_self',
    parentId: '',
    isActive: true,
  })

  // Delete State
  const [deleteTarget, setDeleteTarget] = useState<NavigationItem | null>(null)

  const openCreateModal = () => {
    setEditingItem(null)
    setFormData({
      label: '',
      url: '',
      target: '_self',
      parentId: '',
      isActive: true,
    })
    setIsModalOpen(true)
  }

  const openEditModal = (item: NavigationItem) => {
    setEditingItem(item)
    setFormData({
      label: item.label,
      url: item.url,
      target: item.target,
      parentId: item.parentId || '',
      isActive: item.isActive,
    })
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const payload = {
        ...formData,
        parentId: formData.parentId ? formData.parentId : null,
      }

      if (editingItem) {
        // Update
        const res = await fetch('/api/admin/navigation', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingItem.id,
            ...payload,
          }),
        })
        const json = await res.json()
        if (json.success) {
          setItems((prev) =>
            prev.map((it) => (it.id === editingItem.id ? { ...it, ...payload } : it))
          )
          success(`Updated menu item: ${formData.label}`)
          setIsModalOpen(false)
        } else {
          showError(json.error?.message || 'Failed to update item')
        }
      } else {
        // Create
        const maxOrder = items.length > 0 ? Math.max(...items.map((i) => i.order)) : 0
        const res = await fetch('/api/admin/navigation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...payload,
            order: maxOrder + 1,
          }),
        })
        const json = await res.json()
        if (json.success) {
          setItems((prev) => [...prev, json.data])
          success(`Added menu item: ${formData.label}`)
          setIsModalOpen(false)
        } else {
          showError(json.error?.message || 'Failed to add item')
        }
      }
    } catch (err) {
      showError('Network error while saving item')
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleActive = async (item: NavigationItem) => {
    try {
      const nextActive = !item.isActive
      const res = await fetch('/api/admin/navigation', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id, isActive: nextActive }),
      })
      const json = await res.json()
      if (json.success) {
        setItems((prev) =>
          prev.map((it) => (it.id === item.id ? { ...it, isActive: nextActive } : it))
        )
        success(`${item.label} is now ${nextActive ? 'active' : 'hidden'}`)
      } else {
        showError('Failed to toggle status')
      }
    } catch {
      showError('Network error')
    }
  }

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= items.length) return

    const newItems = [...items]
    const temp = newItems[index]
    newItems[index] = newItems[targetIndex]
    newItems[targetIndex] = temp

    // Reassign order numbers
    const updatedOrder = newItems.map((item, idx) => ({
      ...item,
      order: idx + 1,
    }))

    setItems(updatedOrder)

    try {
      const res = await fetch('/api/admin/navigation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reorder: true,
          items: updatedOrder.map((it) => ({ id: it.id, order: it.order })),
        }),
      })
      const json = await res.json()
      if (!json.success) {
        showError('Failed to save order change')
      }
    } catch {
      showError('Network error while reordering')
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    setIsLoading(true)
    try {
      const res = await fetch(`/api/admin/navigation?id=${deleteTarget.id}`, {
        method: 'DELETE',
      })
      const json = await res.json()
      if (json.success) {
        setItems((prev) => prev.filter((it) => it.id !== deleteTarget.id))
        success(`Removed ${deleteTarget.label} from navigation`)
        setDeleteTarget(null)
      } else {
        showError(json.error?.message || 'Failed to delete item')
      }
    } catch {
      showError('Network error while deleting item')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'hsl(220, 35%, 15%)', margin: 0 }}>
            Site Navigation
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'hsl(220, 15%, 50%)', margin: '0.25rem 0 0 0' }}>
            Manage header and footer navigation menus, targets, and display priority
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
          Add Menu Item
        </button>
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Menu Structure ({items.length} Items)</CardTitle>
            <CardDescription>Live header navigation items displayed in public school navbar</CardDescription>
          </div>
        </CardHeader>
        <CardContent style={{ padding: 0 }}>
          <TableContainer>
            <Table>
              <Thead>
                <Tr>
                  <Th style={{ width: '90px' }}>Order</Th>
                  <Th>Menu Label</Th>
                  <Th>Target URL</Th>
                  <Th>Window Target</Th>
                  <Th style={{ width: '120px' }}>Status</Th>
                  <Th style={{ width: '130px', textAlign: 'right' }}>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {items.length === 0 ? (
                  <Tr>
                    <Td colSpan={6} style={{ textAlign: 'center', padding: '2.5rem', color: 'hsl(220, 15%, 50%)' }}>
                      No navigation items found. Click "Add Menu Item" above to add your first menu item.
                    </Td>
                  </Tr>
                ) : (
                  items.map((item, index) => (
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
                              disabled={index === items.length - 1}
                              onClick={() => handleMove(index, 'down')}
                              style={{
                                border: 'none',
                                background: 'transparent',
                                cursor: index === items.length - 1 ? 'not-allowed' : 'pointer',
                                padding: '1px',
                                opacity: index === items.length - 1 ? 0.25 : 0.8,
                                color: 'hsl(220, 35%, 25%)',
                              }}
                            >
                              <ArrowDown size={13} />
                            </button>
                          </div>
                        </div>
                      </Td>
                      <Td>
                        {(() => {
                          const parent = item.parentId ? items.find((p) => p.id === item.parentId) : null
                          return (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', paddingLeft: parent ? '1.5rem' : '0' }}>
                              <div
                                style={{
                                  width: '30px',
                                  height: '30px',
                                  borderRadius: '6px',
                                  background: parent ? 'hsl(220, 20%, 92%)' : 'hsl(220, 70%, 95%)',
                                  color: parent ? 'hsl(220, 30%, 45%)' : 'hsl(220, 70%, 35%)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}
                              >
                                <NavIcon size={15} />
                              </div>
                              <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                  <span style={{ fontWeight: 600, color: 'hsl(220, 35%, 15%)' }}>
                                    {parent && <span style={{ color: 'hsl(220, 15%, 50%)', marginRight: '0.25rem' }}>↳</span>}
                                    {item.label}
                                  </span>
                                  {parent && (
                                    <span style={{ fontSize: '0.6875rem', background: 'hsl(220, 15%, 92%)', color: 'hsl(220, 25%, 40%)', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>
                                      under {parent.label}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          )
                        })()}
                      </Td>
                      <Td>
                        <code style={{ fontSize: '0.8125rem', background: 'hsl(220, 20%, 95%)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                          {item.url}
                        </code>
                      </Td>
                      <Td>
                        <span style={{ fontSize: '0.8125rem', color: 'hsl(220, 15%, 50%)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                          {item.target === '_blank' ? (
                            <>
                              <ExternalLink size={13} /> New Tab
                            </>
                          ) : (
                            'Same Window'
                          )}
                        </span>
                      </Td>
                      <Td>
                        <button
                          type="button"
                          onClick={() => handleToggleActive(item)}
                          style={{
                            border: 'none',
                            background: 'transparent',
                            cursor: 'pointer',
                            padding: 0,
                          }}
                        >
                          <Badge variant={item.isActive ? 'success' : 'default'}>
                            {item.isActive ? 'Active' : 'Disabled'}
                          </Badge>
                        </button>
                      </Td>
                      <Td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                          <button
                            type="button"
                            onClick={() => openEditModal(item)}
                            title="Edit Menu Item"
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
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(item)}
                            title="Delete Menu Item"
                            style={{
                              border: '1px solid hsl(0, 70%, 90%)',
                              background: 'hsl(0, 80%, 98%)',
                              padding: '0.35rem 0.6rem',
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

      {/* Create / Edit Modal */}
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
            padding: '1rem',
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '12px',
              maxWidth: '480px',
              width: '100%',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
              overflow: 'hidden',
            }}
          >
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid hsl(220, 20%, 90%)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 700, margin: 0, color: 'hsl(220, 35%, 15%)' }}>
                {editingItem ? 'Edit Menu Item' : 'Add Navigation Menu Item'}
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'hsl(220, 15%, 50%)' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Menu Label *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. About Us"
                    value={formData.label}
                    onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                    style={{ width: '100%', height: '40px', padding: '0 0.875rem', borderRadius: '8px', border: '1px solid hsl(220, 20%, 85%)', fontSize: '0.9375rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Target URL *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. /about or https://..."
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    style={{ width: '100%', height: '40px', padding: '0 0.875rem', borderRadius: '8px', border: '1px solid hsl(220, 20%, 85%)', fontSize: '0.9375rem' }}
                  />
                  <span style={{ fontSize: '0.75rem', color: 'hsl(220, 15%, 55%)' }}>
                    Use relative paths for internal pages (e.g. /admissions) or full URLs for external links.
                  </span>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Target Window
                  </label>
                  <select
                    value={formData.target}
                    onChange={(e) => setFormData({ ...formData, target: e.target.value })}
                    style={{ width: '100%', height: '40px', padding: '0 0.875rem', borderRadius: '8px', border: '1px solid hsl(220, 20%, 85%)', fontSize: '0.875rem', background: '#ffffff' }}
                  >
                    <option value="_self">Open in Same Tab (_self)</option>
                    <option value="_blank">Open in New Tab (_blank)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Parent Menu Item (For Dropdown Submenu)
                  </label>
                  <select
                    value={formData.parentId}
                    onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                    style={{ width: '100%', height: '40px', padding: '0 0.875rem', borderRadius: '8px', border: '1px solid hsl(220, 20%, 85%)', fontSize: '0.875rem', background: '#ffffff' }}
                  >
                    <option value="">None (Top-Level Menu Item)</option>
                    {items
                      .filter((it) => !it.parentId && (!editingItem || it.id !== editingItem.id))
                      .map((parent) => (
                        <option key={parent.id} value={parent.id}>
                          Dropdown under &ldquo;{parent.label}&rdquo;
                        </option>
                      ))}
                  </select>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingTop: '0.25rem' }}>
                  <input
                    type="checkbox"
                    id="isActiveNav"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    style={{ width: '16px', height: '16px', accentColor: 'hsl(220, 70%, 35%)' }}
                  />
                  <label htmlFor="isActiveNav" style={{ fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}>
                    Visible in public navigation
                  </label>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.75rem' }}>
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
                    padding: '0.625rem 1.25rem',
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
                  <span>{editingItem ? 'Update Menu Item' : 'Add Menu Item'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete Navigation Item"
        message={`Are you sure you want to delete "${deleteTarget?.label}"? This will immediately remove it from the school navigation menu.`}
        confirmText="Delete Item"
        isDestructive={true}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
