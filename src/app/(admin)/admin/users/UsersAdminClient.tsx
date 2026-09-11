'use client'

import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/admin/ui/Card'
import { TableContainer, Table, Thead, Tbody, Tr, Th, Td, Badge } from '@/components/admin/ui/Table'
import { ConfirmDialog } from '@/components/admin/ui/ConfirmDialog'
import { useToast } from '@/components/admin/ui/Toast'
import { getRoleBadge } from '@/lib/permissions'
import {
  Users as UsersIcon,
  UserPlus,
  Search,
  Edit2,
  Key,
  Trash2,
  Shield,
  Clock,
  CheckCircle,
  XCircle,
  X,
  Loader2,
} from 'lucide-react'

interface UserItem {
  id: string
  name: string
  email: string
  role: string
  status: string
  isActive: boolean
  lastLogin?: string | null
  createdAt: string
}

interface UsersAdminClientProps {
  initialUsers: UserItem[]
  currentUserId?: string
}

export function UsersAdminClient({ initialUsers, currentUserId }: UsersAdminClientProps) {
  const { success, error: showError } = useToast()
  const [users, setUsers] = useState<UserItem[]>(initialUsers)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<UserItem | null>(null)
  const [passwordTarget, setPasswordTarget] = useState<UserItem | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<UserItem | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Forms
  const [createForm, setCreateForm] = useState({
    name: '',
    email: '',
    role: 'EDITOR',
    password: '',
  })

  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    role: 'EDITOR',
    status: 'ACTIVE',
  })

  const [newPassword, setNewPassword] = useState('')

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createForm),
      })
      const json = await res.json()
      if (json.success) {
        setUsers((prev) => [json.data, ...prev])
        success(`Created user ${json.data.name}`)
        setIsCreateOpen(false)
        setCreateForm({ name: '', email: '', role: 'EDITOR', password: '' })
      } else {
        showError(json.error?.message || 'Failed to create user')
      }
    } catch {
      showError('Network error while creating user')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingUser) return
    setIsSubmitting(true)
    try {
      const res = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      })
      const json = await res.json()
      if (json.success) {
        setUsers((prev) =>
          prev.map((u) => (u.id === editingUser.id ? { ...u, ...json.data } : u))
        )
        success(`Updated user ${json.data.name}`)
        setEditingUser(null)
      } else {
        showError(json.error?.message || 'Failed to update user')
      }
    } catch {
      showError('Network error while updating user')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!passwordTarget) return
    setIsSubmitting(true)
    try {
      const res = await fetch(`/api/admin/users/${passwordTarget.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: newPassword }),
      })
      const json = await res.json()
      if (json.success) {
        success(`Password updated for ${passwordTarget.name}`)
        setPasswordTarget(null)
        setNewPassword('')
      } else {
        showError(json.error?.message || 'Failed to reset password')
      }
    } catch {
      showError('Network error while resetting password')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      const res = await fetch(`/api/admin/users/${deleteTarget.id}`, {
        method: 'DELETE',
      })
      const json = await res.json()
      if (json.success) {
        setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id))
        success(`Deleted user ${deleteTarget.name}`)
        setDeleteTarget(null)
      } else {
        showError(json.error?.message || 'Failed to delete user')
      }
    } catch {
      showError('Network error while deleting user')
    }
  }

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    const matchesRole = roleFilter === 'all' || u.role === roleFilter
    return matchesSearch && matchesRole
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'hsl(220, 35%, 15%)', margin: 0 }}>
            User & Role Management
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'hsl(220, 15%, 50%)', margin: '0.25rem 0 0 0' }}>
            Manage staff accounts, assign granular role permissions, and control administrative system access
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
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
          <UserPlus size={16} />
          <span>Add New User</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1 1 240px' }}>
          <Search
            size={16}
            style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'hsl(220, 15%, 50%)' }}
          />
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              height: '40px',
              paddingLeft: '2.5rem',
              paddingRight: '1rem',
              borderRadius: '8px',
              border: '1px solid hsl(220, 20%, 88%)',
              background: '#ffffff',
              fontSize: '0.875rem',
              outline: 'none',
            }}
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          style={{
            height: '40px',
            padding: '0 1rem',
            borderRadius: '8px',
            border: '1px solid hsl(220, 20%, 88%)',
            background: '#ffffff',
            fontSize: '0.875rem',
            fontWeight: 500,
            color: 'hsl(220, 35%, 20%)',
            cursor: 'pointer',
          }}
        >
          <option value="all">All Roles</option>
          <option value="SUPER_ADMIN">Super Admin</option>
          <option value="CONTENT_ADMIN">Content Admin</option>
          <option value="ADMISSION_ADMIN">Admission Admin</option>
          <option value="EDITOR">Editor</option>
        </select>
      </div>

      {/* Users Table */}
      <Card>
        <TableContainer>
          <Table>
            <Thead>
              <Tr>
                <Th>User</Th>
                <Th>Role</Th>
                <Th>Status</Th>
                <Th>Last Login</Th>
                <Th>Created</Th>
                <Th style={{ textAlign: 'right' }}>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredUsers.length === 0 ? (
                <Tr>
                  <Td colSpan={6} style={{ textAlign: 'center', padding: '3rem 1rem', color: 'hsl(220, 15%, 50%)' }}>
                    No users found matching your search.
                  </Td>
                </Tr>
              ) : (
                filteredUsers.map((u) => {
                  const roleBadge = getRoleBadge(u.role)
                  const isCurrent = u.id === currentUserId

                  return (
                    <Tr key={u.id}>
                      <Td>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: 700, color: 'hsl(220, 35%, 15%)' }}>
                            {u.name} {isCurrent && <span style={{ fontSize: '0.75rem', color: 'hsl(220, 70%, 45%)' }}>(You)</span>}
                          </span>
                          <span style={{ fontSize: '0.8125rem', color: 'hsl(220, 15%, 50%)' }}>{u.email}</span>
                        </div>
                      </Td>
                      <Td>
                        <span
                          style={{
                            padding: '0.25rem 0.65rem',
                            borderRadius: '12px',
                            background: roleBadge.bg,
                            color: roleBadge.color,
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            letterSpacing: '0.02em',
                          }}
                        >
                          {roleBadge.label}
                        </span>
                      </Td>
                      <Td>
                        <Badge variant={u.status === 'ACTIVE' ? 'success' : 'default'}>
                          {u.status}
                        </Badge>
                      </Td>
                      <Td>
                        <span style={{ fontSize: '0.8125rem', color: 'hsl(220, 15%, 45%)' }}>
                          {u.lastLogin
                            ? new Date(u.lastLogin).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                            : 'Never'}
                        </span>
                      </Td>
                      <Td>
                        <span style={{ fontSize: '0.8125rem', color: 'hsl(220, 15%, 45%)' }}>
                          {new Date(u.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </Td>
                      <Td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                          <button
                            type="button"
                            title="Edit User"
                            onClick={() => {
                              setEditingUser(u)
                              setEditForm({
                                name: u.name,
                                email: u.email,
                                role: u.role,
                                status: u.status,
                              })
                            }}
                            style={{
                              padding: '0.35rem',
                              borderRadius: '6px',
                              border: '1px solid hsl(220, 20%, 88%)',
                              background: '#fff',
                              color: 'hsl(220, 30%, 25%)',
                              cursor: 'pointer',
                            }}
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            type="button"
                            title="Reset Password"
                            onClick={() => {
                              setPasswordTarget(u)
                              setNewPassword('')
                            }}
                            style={{
                              padding: '0.35rem',
                              borderRadius: '6px',
                              border: '1px solid hsl(220, 20%, 88%)',
                              background: '#fff',
                              color: 'hsl(40, 92%, 35%)',
                              cursor: 'pointer',
                            }}
                          >
                            <Key size={14} />
                          </button>
                          {!isCurrent && (
                            <button
                              type="button"
                              title="Delete User"
                              onClick={() => setDeleteTarget(u)}
                              style={{
                                padding: '0.35rem',
                                borderRadius: '6px',
                                border: '1px solid hsl(220, 20%, 88%)',
                                background: '#fff',
                                color: 'hsl(0, 75%, 45%)',
                                cursor: 'pointer',
                              }}
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </Td>
                    </Tr>
                  )
                })
              )}
            </Tbody>
          </Table>
        </TableContainer>
      </Card>

      {/* Create Modal */}
      {isCreateOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1500,
            background: 'rgba(15, 23, 42, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
          }}
        >
          <div style={{ background: '#fff', borderRadius: '12px', width: '100%', maxWidth: '480px', padding: '1.75rem', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: 'hsl(220, 35%, 15%)' }}>Add New User</h2>
              <button type="button" onClick={() => setIsCreateOpen(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'hsl(220, 25%, 30%)', marginBottom: '0.35rem' }}>Full Name *</label>
                <input
                  type="text"
                  required
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  style={{ width: '100%', height: '38px', padding: '0 0.75rem', borderRadius: '6px', border: '1px solid hsl(220, 20%, 85%)' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'hsl(220, 25%, 30%)', marginBottom: '0.35rem' }}>Email Address *</label>
                <input
                  type="email"
                  required
                  value={createForm.email}
                  onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                  style={{ width: '100%', height: '38px', padding: '0 0.75rem', borderRadius: '6px', border: '1px solid hsl(220, 20%, 85%)' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'hsl(220, 25%, 30%)', marginBottom: '0.35rem' }}>Role *</label>
                <select
                  value={createForm.role}
                  onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}
                  style={{ width: '100%', height: '38px', padding: '0 0.75rem', borderRadius: '6px', border: '1px solid hsl(220, 20%, 85%)' }}
                >
                  <option value="EDITOR">Editor (News, Events, Notices, Media, Gallery)</option>
                  <option value="CONTENT_ADMIN">Content Admin (Full Website, Academics, Facilities, Faculty)</option>
                  <option value="ADMISSION_ADMIN">Admission Admin (Admissions & Complaints)</option>
                  <option value="SUPER_ADMIN">Super Admin (Full System Control)</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'hsl(220, 25%, 30%)', marginBottom: '0.35rem' }}>Password (min 8 characters) *</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={createForm.password}
                  onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                  style={{ width: '100%', height: '38px', padding: '0 0.75rem', borderRadius: '6px', border: '1px solid hsl(220, 20%, 85%)' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid hsl(220, 20%, 85%)', background: '#fff', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{ padding: '0.5rem 1.25rem', borderRadius: '6px', border: 'none', background: 'hsl(220, 70%, 35%)', color: '#fff', fontWeight: 600, cursor: 'pointer' }}
                >
                  {isSubmitting ? 'Creating...' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingUser && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1500,
            background: 'rgba(15, 23, 42, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
          }}
        >
          <div style={{ background: '#fff', borderRadius: '12px', width: '100%', maxWidth: '480px', padding: '1.75rem', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: 'hsl(220, 35%, 15%)' }}>Edit User</h2>
              <button type="button" onClick={() => setEditingUser(null)} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleEdit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'hsl(220, 25%, 30%)', marginBottom: '0.35rem' }}>Full Name *</label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  style={{ width: '100%', height: '38px', padding: '0 0.75rem', borderRadius: '6px', border: '1px solid hsl(220, 20%, 85%)' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'hsl(220, 25%, 30%)', marginBottom: '0.35rem' }}>Email Address *</label>
                <input
                  type="email"
                  required
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  style={{ width: '100%', height: '38px', padding: '0 0.75rem', borderRadius: '6px', border: '1px solid hsl(220, 20%, 85%)' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'hsl(220, 25%, 30%)', marginBottom: '0.35rem' }}>Role *</label>
                <select
                  value={editForm.role}
                  disabled={editingUser.id === currentUserId}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                  style={{ width: '100%', height: '38px', padding: '0 0.75rem', borderRadius: '6px', border: '1px solid hsl(220, 20%, 85%)' }}
                >
                  <option value="EDITOR">Editor</option>
                  <option value="CONTENT_ADMIN">Content Admin</option>
                  <option value="ADMISSION_ADMIN">Admission Admin</option>
                  <option value="SUPER_ADMIN">Super Admin</option>
                </select>
                {editingUser.id === currentUserId && (
                  <span style={{ fontSize: '0.75rem', color: 'hsl(40, 92%, 35%)' }}>You cannot change your own role.</span>
                )}
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'hsl(220, 25%, 30%)', marginBottom: '0.35rem' }}>Status *</label>
                <select
                  value={editForm.status}
                  disabled={editingUser.id === currentUserId}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  style={{ width: '100%', height: '38px', padding: '0 0.75rem', borderRadius: '6px', border: '1px solid hsl(220, 20%, 85%)' }}
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive / Suspended</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid hsl(220, 20%, 85%)', background: '#fff', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{ padding: '0.5rem 1.25rem', borderRadius: '6px', border: 'none', background: 'hsl(220, 70%, 35%)', color: '#fff', fontWeight: 600, cursor: 'pointer' }}
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {passwordTarget && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1500,
            background: 'rgba(15, 23, 42, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
          }}
        >
          <div style={{ background: '#fff', borderRadius: '12px', width: '100%', maxWidth: '440px', padding: '1.75rem', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: 'hsl(220, 35%, 15%)' }}>Reset Password</h2>
              <button type="button" onClick={() => setPasswordTarget(null)} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: '0.875rem', color: 'hsl(220, 15%, 45%)', marginBottom: '1.25rem' }}>
              Set a new secure password for <strong>{passwordTarget.name}</strong> ({passwordTarget.email}).
            </p>

            <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'hsl(220, 25%, 30%)', marginBottom: '0.35rem' }}>New Password (min 8 chars) *</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={{ width: '100%', height: '38px', padding: '0 0.75rem', borderRadius: '6px', border: '1px solid hsl(220, 20%, 85%)' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setPasswordTarget(null)}
                  style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid hsl(220, 20%, 85%)', background: '#fff', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{ padding: '0.5rem 1.25rem', borderRadius: '6px', border: 'none', background: 'hsl(40, 92%, 35%)', color: '#fff', fontWeight: 600, cursor: 'pointer' }}
                >
                  {isSubmitting ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete User"
        message={`Are you sure you want to delete user ${deleteTarget?.name}? This action cannot be undone.`}
        confirmText="Delete User"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
