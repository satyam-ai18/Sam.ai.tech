import React from 'react'

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  className?: string
}

export function Container({
  children,
  size = 'lg',
  className = '',
  style,
  ...props
}: ContainerProps) {
  const maxDimensions: Record<string, string> = {
    sm: '640px',
    md: '768px',
    lg: '1140px',
    xl: '1280px',
    full: '100%',
  }

  return (
    <div
      style={{
        maxWidth: maxDimensions[size],
        margin: '0 auto',
        paddingLeft: 'clamp(1rem, 4vw, 2rem)',
        paddingRight: 'clamp(1rem, 4vw, 2rem)',
        width: '100%',
        ...style,
      }}
      className={className}
      {...props}
    >
      {children}
    </div>
  )
}
