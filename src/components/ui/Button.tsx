import { type ButtonHTMLAttributes, type ReactNode } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  children: ReactNode
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-accent text-white hover:bg-brand-600 active:bg-brand-700 disabled:opacity-50',
  secondary:
    'bg-bg-secondary text-text-primary border border-border hover:bg-bg-card disabled:opacity-50',
  danger:
    'bg-danger text-white hover:bg-red-600 active:bg-red-700 disabled:opacity-50',
  ghost:
    'bg-transparent text-text-muted hover:text-text-primary hover:bg-bg-secondary disabled:opacity-50',
}

const sizeClasses: Record<ButtonSize, string> = {
  // min-h-[2.75rem] = 44 px — meets mobile touch-target guidelines
  sm: 'px-3 py-1.5 text-xs  min-h-[2.75rem]',
  md: 'px-4 py-2   text-sm  min-h-[2.75rem]',
  lg: 'px-6 py-3   text-base',          // py-3 already ≥ 44 px
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  children,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={[
        'inline-flex items-center justify-center gap-2 rounded-lg font-medium',
        'transition-colors cursor-pointer disabled:cursor-not-allowed',
        variantClasses[variant],
        sizeClasses[size],
        className,
      ].join(' ')}
    >
      {loading && (
        <svg
          className="animate-spin h-4 w-4 shrink-0"
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8H4z"
          />
        </svg>
      )}
      {children}
    </button>
  )
}