import { forwardRef, type SelectHTMLAttributes, type ReactNode } from 'react'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  hint?: string
  error?: string
  children: ReactNode
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, hint, error, children, className = '', id, ...props }, ref) => {
    const selectId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={selectId} className="label">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          {...props}
          className={[
            'w-full rounded-lg border bg-bg-secondary px-3 py-2',
            'text-sm text-text-primary',
            'focus:outline-none transition-colors appearance-none cursor-pointer',
            error
              ? 'border-danger focus:border-danger'
              : 'border-border focus:border-accent',
            className,
          ].join(' ')}
        >
          {children}
        </select>
        {hint && !error && (
          <p className="text-xs text-text-muted">{hint}</p>
        )}
        {error && <p className="text-xs text-danger">{error}</p>}
      </div>
    )
  }
)
Select.displayName = 'Select'