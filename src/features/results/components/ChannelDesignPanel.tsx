import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { StatusBanner } from '@/components/ui/StatusBanner'
import type { ChannelDesignResults } from '@/core/types/results'
import { fmt, velocityLabel, regimeLabel, manningsLabel } from '../formatters'

interface Props {
  channelDesign: ChannelDesignResults
}

export function ChannelDesignPanel({ channelDesign }: Props) {
  const {
    flowDepth,
    baseWidth,
    velocity,
    froudeNumber,
    freeboard,
    totalDepth,
    manningsN,
    flowArea,
    hydraulicRadius,
    wettedPerimeter,
    topWidth,
    velocityStatus,
    flowRegime,
  } = channelDesign

  // ── Primary metrics (top 6 — most important) ───────────────────────────
  const primary = [
    { label: 'Flow Depth (D)',    value: fmt(flowDepth, 3),    unit: 'm' },
    { label: 'Base Width (B)',    value: fmt(baseWidth, 3),    unit: 'm' },
    { label: 'Velocity (V)',      value: fmt(velocity, 3),     unit: 'm/s' },
    { label: 'Froude Number (Fr)',value: fmt(froudeNumber, 3), unit: '' },
    { label: 'Freeboard',         value: fmt(freeboard, 2),    unit: 'm' },
    { label: 'Total Depth',       value: fmt(totalDepth, 3),   unit: 'm' },
  ]

  // ── Secondary metrics (hydraulic geometry) ─────────────────────────────
  const secondary = [
    { label: 'Flow Area',          value: fmt(flowArea, 4),        unit: 'm²' },
    { label: 'Top Width',          value: fmt(topWidth, 3),         unit: 'm' },
    { label: 'Wetted Perimeter',   value: fmt(wettedPerimeter, 3),  unit: 'm' },
    { label: 'Hydraulic Radius',   value: fmt(hydraulicRadius, 4),  unit: 'm' },
  ]

  // ── Status logic ───────────────────────────────────────────────────────
  const velocityBadgeVariant =
    velocityStatus === 'acceptable' ? 'validated'
    : velocityStatus === 'erosion_risk' ? 'check'
    : 'warning'

  const regimeBadgeVariant =
    flowRegime === 'subcritical' ? 'info'
    : flowRegime === 'critical' ? 'warning'
    : 'check'

  const showVelocityWarning = velocityStatus !== 'acceptable'
  const showRegimeWarning   = flowRegime !== 'subcritical'

  return (
    <Card title="Channel Design" subtitle={`Manning's n = ${manningsN} — ${manningsLabel(manningsN)}`}>

      {/* ── Warning banners ──────────────────────────────────────────── */}
      {(showVelocityWarning || showRegimeWarning) && (
        <div className="space-y-2 mb-5">
          {velocityStatus === 'erosion_risk' && (
            <StatusBanner
              variant="danger"
              title="Erosion Risk — Velocity Exceeds 3.0 m/s"
              message={`Computed velocity is ${fmt(velocity, 3)} m/s. Consider increasing channel cross-section or adding lining protection.`}
            />
          )}
          {velocityStatus === 'sedimentation_risk' && (
            <StatusBanner
              variant="warning"
              title="Sedimentation Risk — Velocity Below 0.6 m/s"
              message={`Computed velocity is ${fmt(velocity, 3)} m/s. Consider reducing channel cross-section or steepening the slope.`}
            />
          )}
          {flowRegime === 'supercritical' && (
            <StatusBanner
              variant="danger"
              title="Supercritical Flow — Fr > 1"
              message={`Froude number is ${fmt(froudeNumber, 3)}. Energy dissipation structures may be required at channel transitions.`}
            />
          )}
          {flowRegime === 'critical' && (
            <StatusBanner
              variant="warning"
              title="Critical Flow — Fr ≈ 1"
              message={`Froude number is ${fmt(froudeNumber, 3)}. Flow is at the critical depth boundary — minor disturbances may cause regime switching.`}
            />
          )}
        </div>
      )}

      {/* ── Primary metrics grid ─────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-x-8 gap-y-6">
        {primary.map(({ label, value, unit }) => (
          <div key={label}>
            <span className="label">{label}</span>
            <p className="result-value">
              {value}{' '}
              {unit && (
                <span className="text-text-muted text-xs font-sans font-normal">
                  {unit}
                </span>
              )}
            </p>
          </div>
        ))}
      </div>

      {/* ── Secondary hydraulic geometry ─────────────────────────────── */}
      <div className="mt-5 pt-5 border-t border-border">
        <p className="label mb-3">Hydraulic Geometry</p>
        <div className="grid grid-cols-2 gap-x-8 gap-y-4">
          {secondary.map(({ label, value, unit }) => (
            <div key={label}>
              <span className="label">{label}</span>
              <p className="font-mono text-text-primary text-sm font-medium">
                {value}{' '}
                <span className="text-text-muted text-xs font-sans font-normal">
                  {unit}
                </span>
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Status badges ─────────────────────────────────────────────── */}
      <div className="mt-5 pt-4 border-t border-border flex flex-wrap gap-2">
        <Badge variant={velocityBadgeVariant}>
          {velocityLabel(velocityStatus)}
        </Badge>
        <Badge variant={regimeBadgeVariant}>
          {regimeLabel(flowRegime)}
        </Badge>
        <Badge variant="default">
          Fr = {fmt(froudeNumber, 3)}
        </Badge>
      </div>
    </Card>
  )
}