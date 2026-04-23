import { useCalculationStore } from '@/store/calculationStore'
import { StatusBanner } from '@/components/ui/StatusBanner'
import { TimeBanner } from './TimeBanner'
import { HydrologyPanel } from './HydrologyPanel'
import { ChannelDesignPanel } from './ChannelDesignPanel'
import { TRRLPanel } from './TRRLPanel'
import { EfficiencyPanel } from './EfficiencyPanel'
import { IDFChart } from '@/features/idf-table/components/IDFChart'
import { IDFTable } from '@/features/idf-table/components/IDFTable'
import { TrapezoidalSection } from '@/features/channel-diagram/components/TrapezoidalSection'
import { ValidationPanel } from '@/features/validation-panel/components/ValidationPanel'

// ── Loading Skeleton ───────────────────────────────────────────────────────
function LoadingSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-12 bg-bg-card rounded-lg w-full border border-border"></div>
      <div className="h-48 bg-bg-card rounded-lg w-full border border-border"></div>
      <div className="h-64 bg-bg-card rounded-lg w-full border border-border"></div>
      <div className="h-48 bg-bg-card rounded-lg w-full border border-border"></div>
    </div>
  )
}

// ── Empty state ────────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[520px] gap-5 text-center px-8">
      <div className="w-20 h-20 rounded-2xl bg-bg-card border border-border flex items-center justify-center">
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--color-text-muted)"
          strokeWidth="1.25"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      </div>
      <div className="space-y-1.5">
        <p className="text-base font-semibold text-text-primary">
          Results will appear here
        </p>
        <p className="text-sm text-text-muted leading-relaxed max-w-xs">
          Fill in the parameters on the left, then click{' '}
          <span className="text-accent font-medium">Run Design Calculation</span>{' '}
          to generate the full hydraulic design.
        </p>
      </div>
      <div className="flex flex-col gap-2 text-xs text-text-muted mt-2 items-center">
        {[
          '① Time of concentration (Kirpich)',
          '② Gumbel frequency analysis',
          '③ IDF curve generation',
          '④ Rational Method discharge',
          '⑤ TRRL East African Model (iterative)',
          "⑥ Manning's iterative solver",
          '⑦ Safety checks & freeboard',
        ].map((step) => (
          <span key={step} className="font-mono">
            {step}
          </span>
        ))}
      </div>
    </div>
  )
}

// ── Root ───────────────────────────────────────────────────────────────────
export function ResultsPanel() {
  const { isCalculating, results, inputs, calculationError } = useCalculationStore()

  if (calculationError) {
    return (
      <div className="p-1">
        <StatusBanner
          variant="danger"
          title="Calculation Error"
          message={calculationError}
        />
      </div>
    )
  }

  if (isCalculating) {
    return <LoadingSkeleton />
  }

  if (!results) {
    return <EmptyState />
  }

  // Edge case check: Duration override < tc
  const stormOverride = inputs?.rainfall.stormDurationOverride
  const tc = results.hydrology.timeOfConcentration
  const showDurationWarning = stormOverride && stormOverride < tc

  return (
    <div className="space-y-4">
      {/* 1 — Time banner */}
      <TimeBanner calculationTimeMs={results.calculationTimeMs} />

      {/* Edge Case Warning */}
      {showDurationWarning && (
        <StatusBanner
          variant="warning"
          title="Storm Duration Warning"
          message={`The overridden storm duration (${stormOverride} min) is shorter than the time of concentration (${tc.toFixed(2)} min). This may result in an underestimation of peak discharge.`}
        />
      )}

      {/* 2 — Efficiency & Cross-Validation Summary (prominent, near top) */}
      <EfficiencyPanel
        trrl={results.trrl}
        hydrology={results.hydrology}
        calculationTimeMs={results.calculationTimeMs}
      />

      {/* 3 — TRRL East African Model detail */}
      <TRRLPanel
        trrl={results.trrl}
        hydrology={results.hydrology}
      />

      {/* 4 — Hydrology: tc, XT, i, Q (Rational) */}
      <HydrologyPanel hydrology={results.hydrology} />

      {/* 5 — IDF Chart (log-scale visual) */}
      <IDFChart idfTable={results.idfTable} />

      {/* 6 — IDF Table (13-row detail) */}
      <IDFTable idfTable={results.idfTable} />

      {/* 7 — Trapezoidal cross-section SVG */}
      <TrapezoidalSection crossSection={results.channelDesign.crossSection} />

      {/* 8 — Channel design metrics */}
      <ChannelDesignPanel channelDesign={results.channelDesign} />

      {/* 9 — Validation: manual vs automated */}
      <ValidationPanel />
    </div>
  )
}