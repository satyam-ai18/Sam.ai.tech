import React from 'react'
import styles from './Card.module.css'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  className?: string
}

export function Card({ children, className = '', ...props }: CardProps) {
  return (
    <div className={`${styles.card} ${className}`} {...props}>
      {children}
    </div>
  )
}

export function CardHeader({ children, className = '', ...props }: CardProps) {
  return (
    <div className={`${styles.cardHeader} ${className}`} {...props}>
      {children}
    </div>
  )
}

export function CardTitle({ children, className = '', ...props }: CardProps) {
  return (
    <h3 className={`${styles.cardTitle} ${className}`} {...props}>
      {children}
    </h3>
  )
}

export function CardDescription({ children, className = '', ...props }: CardProps) {
  return (
    <p className={`${styles.cardDescription} ${className}`} {...props}>
      {children}
    </p>
  )
}

export function CardContent({ children, className = '', ...props }: CardProps) {
  return (
    <div className={`${styles.cardContent} ${className}`} {...props}>
      {children}
    </div>
  )
}

export function CardFooter({ children, className = '', ...props }: CardProps) {
  return (
    <div className={`${styles.cardFooter} ${className}`} {...props}>
      {children}
    </div>
  )
}

interface StatCardProps {
  title: string
  value: string | number
  icon?: React.ReactNode
  description?: string
  trend?: string
  trendUp?: boolean
}

export function StatCard({ title, value, icon, description, trend, trendUp }: StatCardProps) {
  return (
    <Card className={styles.statCard}>
      <div className={styles.statCardInner}>
        <div>
          <span className={styles.statTitle}>{title}</span>
          <div className={styles.statValue}>{value}</div>
          {description && <div className={styles.statDescription}>{description}</div>}
          {trend && (
            <div className={`${styles.statTrend} ${trendUp ? styles.trendUp : styles.trendDown}`}>
              {trend}
            </div>
          )}
        </div>
        {icon && <div className={styles.statIcon}>{icon}</div>}
      </div>
    </Card>
  )
}
