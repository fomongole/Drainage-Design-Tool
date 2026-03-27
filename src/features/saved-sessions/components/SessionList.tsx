import { useState } from 'react'
import { useSavedCalculations } from '@/hooks/useSavedCalculations'
import { SessionCard } from './SessionCard'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

export function SessionList() {
  const {
    savedSessions,
    canSave,
    saveSession,
    loadSession,
    deleteSession,
  } = useSavedCalculations()

  const [sessionName, setSessionName]   = useState('')
  const [isSaving, setIsSaving]         = useState(false)

  const handleSave = () => {
    if (!canSave) return
    setIsSaving(true)

    // Tiny timeout so the button state is visible
    setTimeout(() => {
      saveSession(sessionName.trim())
      setSessionName('')
      setIsSaving(false)
    }, 120)
  }

  const subtitle =
    savedSessions.length === 0
      ? 'No saved sessions'
      : `${savedSessions.length} session${savedSessions.length !== 1 ? 's' : ''} saved`

  return (
    <Card title="Saved Sessions" subtitle={subtitle}>
      {/* ── Save form (only when a calculation exists) ─────────────────── */}
      {canSave && (
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={sessionName}
            onChange={(e) => setSessionName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !isSaving && handleSave()}
            placeholder="Session name (optional)"
            maxLength={60}
            className="min-w-0 flex-1 h-9 rounded-md border border-border bg-bg-primary
                       px-3 text-sm text-text-primary placeholder:text-text-muted
                       focus:outline-none focus:ring-1"
            style={{ focusRingColor: 'var(--color-accent)' } as React.CSSProperties}
          />
          <Button
            type="button"
            size="sm"
            loading={isSaving}
            disabled={isSaving}
            onClick={handleSave}
          >
            Save
          </Button>
        </div>
      )}

      {/* ── Empty state ─────────────────────────────────────────────────── */}
      {savedSessions.length === 0 ? (
        <div className="py-7 flex flex-col items-center gap-2 text-center">
          <div
            className="w-10 h-10 rounded-xl border border-border flex items-center justify-center"
            style={{ background: 'var(--color-bg-card)' }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--color-text-muted)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
              <polyline points="17 21 17 13 7 13 7 21" />
              <polyline points="7 3 7 8 15 8" />
            </svg>
          </div>
          <p className="text-sm font-medium text-text-primary">No saved sessions yet</p>
          <p className="text-xs text-text-muted leading-relaxed max-w-[220px]">
            {canSave
              ? 'Give your calculation a name above and hit Save to store it here.'
              : 'Run a calculation first, then save it here to revisit later.'}
          </p>
        </div>
      ) : (
        /* ── Session list ─────────────────────────────────────────────── */
        <div className="space-y-2">
          {savedSessions.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              onLoad={loadSession}
              onDelete={deleteSession}
            />
          ))}
        </div>
      )}
    </Card>
  )
}