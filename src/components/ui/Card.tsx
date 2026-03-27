import { type ReactNode, type HTMLAttributes } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  title?: string
  subtitle?: string
  children: ReactNode
  accent?: boolean
}

export function Card({
  title,
  subtitle,
  children,
  accent = false,
  className = '',
  ...props
}: CardProps) {
  return (
    <div
      {...props}
      className={`card ${accent ? 'border-accent/30' : ''} ${className}`}
    >
      {(title || subtitle) && (
        <div className="mb-4 pb-3 border-b border-border">
          {title && (
            <h2 className="text-xs font-semibold text-text-primary uppercase tracking-widest">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="text-xs text-text-muted mt-0.5">{subtitle}</p>
          )}
        </div>
      )}
      {children}
    </div>
  )
}