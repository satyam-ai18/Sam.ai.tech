import React from 'react'
import styles from './Table.module.css'

export function TableContainer({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`${styles.tableWrapper} ${className}`}>{children}</div>
}

export function Table({ children, className = '' }: React.TableHTMLAttributes<HTMLTableElement>) {
  return <table className={`${styles.table} ${className}`}>{children}</table>
}

export function Thead({ children, className = '' }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className={`${styles.thead} ${className}`}>{children}</thead>
}

export function Tbody({ children, className = '' }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={`${styles.tbody} ${className}`}>{children}</tbody>
}

export function Tr({ children, className = '', onClick }: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr className={`${styles.tr} ${onClick ? styles.clickable : ''} ${className}`} onClick={onClick}>
      {children}
    </tr>
  )
}

export function Th({ children, className = '', ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th className={`${styles.th} ${className}`} {...props}>
      {children}
    </th>
  )
}

export function Td({ children, className = '', ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td className={`${styles.td} ${className}`} {...props}>
      {children}
    </td>
  )
}

export function Badge({
  children,
  variant = 'default',
}: {
  children: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info'
}) {
  return <span className={`${styles.badge} ${styles[variant]}`}>{children}</span>
}
