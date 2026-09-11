'use client'

import React from 'react'
import { Modal } from './Modal'
import { AlertTriangle, Trash2 } from 'lucide-react'

interface ConfirmDialogProps {
  isOpen: boolean
  onClose?: () => void
  onCancel?: () => void
  onConfirm: () => void
  title?: string
  message: string
  confirmText?: string
  cancelText?: string
  danger?: boolean
  isDestructive?: boolean
  isLoading?: boolean
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onCancel,
  onConfirm,
  title = 'Confirm Deletion',
  message,
  confirmText = 'Delete Permanently',
  cancelText = 'Cancel',
  danger,
  isDestructive = true,
  isLoading = false,
}: ConfirmDialogProps) {
  const handleClose = onClose || onCancel || (() => {})
  const isDanger = danger !== undefined ? danger : isDestructive
  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={title} maxWidth="sm">
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '1rem 0' }}>
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: isDanger ? 'hsl(0, 75%, 94%)' : 'hsl(40, 95%, 92%)',
            color: isDanger ? 'hsl(0, 75%, 45%)' : 'hsl(40, 95%, 40%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1.25rem',
          }}
        >
          {isDanger ? <Trash2 size={26} /> : <AlertTriangle size={26} />}
        </div>

        <p style={{ fontSize: '0.9375rem', color: 'hsl(220, 20%, 30%)', lineHeight: 1.6, margin: '0 0 1.75rem 0' }}>
          {message}
        </p>

        <div style={{ display: 'flex', gap: '0.75rem', width: '100%' }}>
          <button
            type="button"
            disabled={isLoading}
            onClick={handleClose}
            style={{
              flex: 1,
              height: '42px',
              borderRadius: '8px',
              border: '1px solid hsl(220, 20%, 85%)',
              background: '#ffffff',
              color: 'hsl(220, 25%, 30%)',
              fontWeight: 600,
              fontSize: '0.875rem',
              cursor: 'pointer',
            }}
          >
            {cancelText}
          </button>

          <button
            type="button"
            disabled={isLoading}
            onClick={() => {
              onConfirm()
            }}
            style={{
              flex: 1,
              height: '42px',
              borderRadius: '8px',
              border: 'none',
              background: isDanger ? 'hsl(0, 75%, 50%)' : 'hsl(220, 70%, 35%)',
              color: '#ffffff',
              fontWeight: 600,
              fontSize: '0.875rem',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.7 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
            }}
          >
            {danger && <Trash2 size={15} />}
            {isLoading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </Modal>
  )
}
