import { type ReactNode } from 'react'

type BannerVariant = 'success' | 'warning' | 'danger' | 'info'

interface StatusBannerProps {
  variant: BannerVariant
  title: string
  message?: string
  children?: ReactNode
}

const styles: Record<BannerVariant, { wrapper: string; icon: string }> = {
  success: {
    wrapper: 'bg-accent/10 border-accent/30 text-accent',
    icon: '✓',
  },
  warning: {
    wrapper: 'bg-warning/10 border-warning/30 text-warning',
    icon: '⚠',
  },
  danger: {
    wrapper: 'bg-danger/10 border-danger/30 text-danger',
    icon: '✕',
  },
  info: {
    wrapper: 'bg-info/10 border-info/30 text-info',
    icon: 'ℹ',
  },
}

export function StatusBanner({
  variant,
  title,
  message,
  children,
}: StatusBannerProps) {
  const { wrapper, icon } = styles[variant]
  return (
    <div
      className={`rounded-lg px-4 py-3 border flex gap-3 items-start text-sm ${wrapper}`}
    >
      <span className="mt-0.5 shrink-0 font-bold">{icon}</span>
      <div className="min-w-0">
        <p className="font-semibold leading-snug">{title}</p>
        {message && (
          <p className="opacity-80 mt-0.5 text-xs leading-relaxed">{message}</p>
        )}
        {children}
      </div>
    </div>
  )
}