import type { SavedSession } from '@/store/calculationStore'
import { Button } from '@/components/ui/Button'

interface SessionCardProps {
  session: SavedSession
  onLoad: (id: string) => void
  onDelete: (id: string) => void
}

export function SessionCard({ session, onLoad, onDelete }: SessionCardProps) {
  const formattedDate = new Date(session.createdAt).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  const Q  = session.results.hydrology.peakDischarge.toFixed(4)
  const D  = session.results.channelDesign.flowDepth.toFixed(3)
  const B  = session.results.channelDesign.baseWidth.toFixed(3)
  const T  = session.inputs.catchment.returnPeriod

  const handleDelete = () => {
    if (window.confirm(`Delete "${session.name}"? This cannot be undone.`)) {
      onDelete(session.id)
    }
  }

  return (
    <div className="rounded-lg border border-border bg-bg-secondary p-3 space-y-2.5">
      {/* ── Header row ──────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-text-primary truncate leading-tight">
            {session.name}
          </p>
          <p className="text-xs text-text-muted mt-0.5">{formattedDate}</p>
        </div>
        {/* Return period pill */}
        <span
          className="shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full"
          style={{
            background: 'rgba(59,130,246,0.15)',
            color: 'var(--color-info)',
          }}
        >
          {T}-yr
        </span>
      </div>

      {/* ── Mini stats ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-1.5">
        {[
          { label: 'Q', value: Q, unit: 'm³/s' },
          { label: 'D', value: D, unit: 'm'    },
          { label: 'B', value: B, unit: 'm'    },
        ].map(({ label, value, unit }) => (
          <div
            key={label}
            className="rounded-md border border-border bg-bg-card px-2 py-1.5 text-center"
          >
            <p className="text-xs text-text-muted">{label}</p>
            <p className="text-xs font-mono font-semibold text-text-primary mt-0.5">
              {value}
            </p>
            <p className="text-[10px] text-text-muted">{unit}</p>
          </div>
        ))}
      </div>

      {/* ── Actions ─────────────────────────────────────────────────────── */}
      <div className="flex gap-1.5">
        <Button
          type="button"
          size="sm"
          className="flex-1"
          onClick={() => onLoad(session.id)}
        >
          Load
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleDelete}
          style={{ color: 'var(--color-danger)' }}
        >
          Delete
        </Button>
      </div>
    </div>
  )
}