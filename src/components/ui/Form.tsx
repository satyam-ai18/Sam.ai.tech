import React from 'react'

export function FormGroup({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div style={{ marginBottom: '1.25rem' }} className={className}>
      {children}
    </div>
  )
}

export function FormLabel({
  children,
  required,
  htmlFor,
}: {
  children: React.ReactNode
  required?: boolean
  htmlFor?: string
}) {
  return (
    <label
      htmlFor={htmlFor}
      style={{
        display: 'block',
        fontSize: '0.875rem',
        fontWeight: 600,
        color: 'var(--color-text, hsl(220, 20%, 15%))',
        marginBottom: '0.35rem',
      }}
    >
      {children} {required && <span style={{ color: 'hsl(0, 75%, 55%)' }}>*</span>}
    </label>
  )
}

export function FormInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      style={{
        width: '100%',
        height: '44px',
        padding: '0 0.875rem',
        fontSize: '0.9375rem',
        borderRadius: 'var(--radius-md, 8px)',
        border: '1px solid var(--color-border, hsl(220, 20%, 85%))',
        background: '#ffffff',
        color: 'var(--color-text, hsl(220, 20%, 15%))',
        outline: 'none',
        transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
        ...props.style,
      }}
      {...props}
    />
  )
}

export function FormTextarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      style={{
        width: '100%',
        minHeight: '100px',
        padding: '0.75rem 0.875rem',
        fontSize: '0.9375rem',
        borderRadius: 'var(--radius-md, 8px)',
        border: '1px solid var(--color-border, hsl(220, 20%, 85%))',
        background: '#ffffff',
        color: 'var(--color-text, hsl(220, 20%, 15%))',
        outline: 'none',
        resize: 'vertical',
        transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
        ...props.style,
      }}
      {...props}
    />
  )
}

export function FormSelect(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      style={{
        width: '100%',
        height: '44px',
        padding: '0 0.875rem',
        fontSize: '0.9375rem',
        borderRadius: 'var(--radius-md, 8px)',
        border: '1px solid var(--color-border, hsl(220, 20%, 85%))',
        background: '#ffffff',
        color: 'var(--color-text, hsl(220, 20%, 15%))',
        outline: 'none',
        ...props.style,
      }}
      {...props}
    />
  )
}

export function FormError({ children }: { children?: React.ReactNode }) {
  if (!children) return null
  return (
    <p
      style={{
        fontSize: '0.75rem',
        color: 'hsl(0, 75%, 55%)',
        margin: '0.35rem 0 0 0',
        fontWeight: 500,
      }}
    >
      {children}
    </p>
  )
}
