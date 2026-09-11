'use client'

import React, { useEffect } from 'react'
import { X } from 'lucide-react'

interface PublicModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
}

export function PublicModal({ isOpen, onClose, title, children }: PublicModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(6px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          maxWidth: '600px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          position: 'relative',
          padding: '2rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: 'none',
            border: 'none',
            color: 'hsl(220, 15%, 50%)',
            cursor: 'pointer',
            padding: '4px',
            borderRadius: '50%',
          }}
          aria-label="Close modal"
        >
          <X size={20} />
        </button>

        {title && (
          <h2
            style={{
              fontSize: '1.35rem',
              fontWeight: 700,
              color: 'hsl(220, 35%, 15%)',
              margin: '0 0 1.25rem 0',
            }}
          >
            {title}
          </h2>
        )}

        {children}
      </div>
    </div>
  )
}
