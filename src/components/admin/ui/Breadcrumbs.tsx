'use client'

import React from 'react'
import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'

export interface BreadcrumbItem {
  label: string
  href?: string
}

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav
      aria-label="Breadcrumbs"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        fontSize: '0.8125rem',
        color: 'hsl(220, 15%, 50%)',
        marginBottom: '1rem',
      }}
    >
      <Link
        href="/admin/dashboard"
        style={{
          display: 'flex',
          alignItems: 'center',
          color: 'hsl(220, 15%, 50%)',
          textDecoration: 'none',
        }}
      >
        <Home size={14} />
      </Link>

      {items.map((item, index) => {
        const isLast = index === items.length - 1
        return (
          <React.Fragment key={index}>
            <ChevronRight size={13} style={{ opacity: 0.5 }} />
            {isLast || !item.href ? (
              <span style={{ fontWeight: 600, color: 'hsl(220, 35%, 15%)' }}>
                {item.label}
              </span>
            ) : (
              <Link
                href={item.href}
                style={{
                  color: 'hsl(220, 15%, 50%)',
                  textDecoration: 'none',
                  transition: 'color 0.15s ease',
                }}
              >
                {item.label}
              </Link>
            )}
          </React.Fragment>
        )
      })}
    </nav>
  )
}
