import { type ReactNode } from 'react'

type BadgeVariant = 'validated' | 'check' | 'warning' | 'info' | 'default'

interface BadgeProps {
  variant?: BadgeVariant
  children: ReactNode
}

const variantMap: Record<BadgeVariant, string> = {
  validated: 'status-badge status-validated',
  check:     'status-badge status-check',
  warning:   'status-badge status-warning',
  info:      'status-badge bg-info/15 text-info',
  default:   'status-badge bg-bg-secondary text-text-muted border border-border',
}

export function Badge({ variant = 'default', children }: BadgeProps) {
  return <span className={variantMap[variant]}>{children}</span>
}