export function Header() {
  return (
    <header className="h-14 shrink-0 border-b border-border bg-bg-secondary flex items-center px-6 gap-3">
      {/* Logo mark */}
      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-accent/15 border border-accent/30 shrink-0">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path
            d="M2 12 L5 7 L8 9.5 L11 4 L14 7.5"
            stroke="#16b36e"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M2 14 L14 14"
            stroke="#16b36e"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Title */}
      <div className="flex flex-col leading-none">
        <span className="text-sm font-semibold text-text-primary tracking-tight">
          Drainage Design Tool
        </span>
        <span className="text-xs text-text-muted hidden sm:block">
          Urban Hydraulic &amp; Hydrological Analysis
        </span>
      </div>

      {/* Right side */}
      <div className="ml-auto flex items-center gap-3">
        <span className="text-xs text-text-muted font-mono hidden sm:block">
          Uganda / East Africa
        </span>
        <span className="status-badge status-validated">v1.0</span>
      </div>
    </header>
  )
}