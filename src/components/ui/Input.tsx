import { forwardRef, type InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  hint?: string
  error?: string
  unit?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, hint, error, unit, className = '', id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={inputId} className="label">
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            {...props}
            className={[
              'w-full rounded-lg border bg-bg-secondary px-3 py-2',
              'text-sm text-text-primary placeholder:text-text-muted',
              'focus:outline-none transition-colors',
              error
                ? 'border-danger focus:border-danger'
                : 'border-border focus:border-accent',
              unit ? 'pr-12' : '',
              className,
            ].join(' ')}
          />
          {unit && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-muted font-mono pointer-events-none select-none">
              {unit}
            </span>
          )}
        </div>
        {hint && !error && (
          <p className="text-xs text-text-muted">{hint}</p>
        )}
        {error && <p className="text-xs text-danger">{error}</p>}
      </div>
    )
  }
)
Input.displayName = 'Input'