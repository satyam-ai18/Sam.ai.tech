import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
  fullWidth?: boolean
  className?: string
}

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  className = '',
  disabled,
  style,
  ...props
}: ButtonProps) {
  const baseStyles: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    fontWeight: 600,
    borderRadius: 'var(--radius-lg, 10px)',
    transition: 'all 0.2s ease',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.6 : 1,
    border: 'none',
    textDecoration: 'none',
    fontFamily: 'inherit',
    width: fullWidth ? '100%' : 'auto',
    ...style,
  }

  const sizeStyles: Record<string, React.CSSProperties> = {
    sm: { padding: '0.375rem 0.875rem', fontSize: '0.8125rem', height: '34px' },
    md: { padding: '0.625rem 1.25rem', fontSize: '0.9375rem', height: '44px' },
    lg: { padding: '0.875rem 1.75rem', fontSize: '1.0625rem', height: '52px' },
  }

  const variantStyles: Record<string, React.CSSProperties> = {
    primary: {
      background: 'var(--color-primary, hsl(220, 65%, 28%))',
      color: '#ffffff',
      boxShadow: '0 2px 4px rgba(26, 54, 93, 0.2)',
    },
    secondary: {
      background: 'var(--color-secondary, hsl(160, 50%, 35%))',
      color: '#ffffff',
    },
    accent: {
      background: 'var(--color-accent, hsl(40, 92%, 50%))',
      color: 'hsl(220, 35%, 12%)',
      fontWeight: 700,
      boxShadow: '0 2px 6px rgba(245, 158, 11, 0.3)',
    },
    outline: {
      background: 'transparent',
      color: 'var(--color-primary, hsl(220, 65%, 28%))',
      border: '1.5px solid var(--color-primary, hsl(220, 65%, 28%))',
    },
    ghost: {
      background: 'transparent',
      color: 'var(--color-text, hsl(220, 20%, 15%))',
    },
  }

  return (
    <button
      style={{
        ...baseStyles,
        ...sizeStyles[size],
        ...variantStyles[variant],
      }}
      disabled={disabled}
      className={className}
      {...props}
    >
      {icon && iconPosition === 'left' && icon}
      {children}
      {icon && iconPosition === 'right' && icon}
    </button>
  )
}
