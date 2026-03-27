import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts'
import { Card } from '@/components/ui/Card'
import type { IDFRow } from '@/core/types/results'

interface Props {
  idfTable: IDFRow[]
}

// ── Custom tooltip ────────────────────────────────────────────────────────
function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: Array<{ value: number }>
  label?: number
}) {
  if (!active || !payload?.length) return null
  return (
    <div
      style={{
        background: 'var(--color-bg-card)',
        border: '1px solid var(--color-border)',
        borderRadius: '0.5rem',
        padding: '0.625rem 0.875rem',
      }}
    >
      <p
        style={{
          color: 'var(--color-text-muted)',
          fontSize: '0.7rem',
          fontWeight: 500,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: '0.25rem',
        }}
      >
        Duration
      </p>
      <p
        style={{
          fontFamily: 'var(--font-mono)',
          color: 'var(--color-text-primary)',
          fontSize: '0.8rem',
          marginBottom: '0.375rem',
        }}
      >
        {label} min
      </p>
      <p
        style={{
          fontFamily: 'var(--font-mono)',
          color: 'var(--color-accent)',
          fontSize: '0.875rem',
          fontWeight: 500,
        }}
      >
        {Number(payload[0].value).toFixed(2)}{' '}
        <span
          style={{
            color: 'var(--color-text-muted)',
            fontSize: '0.7rem',
            fontFamily: 'var(--font-sans)',
          }}
        >
          mm/hr
        </span>
      </p>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────
export function IDFChart({ idfTable }: Props) {
  const designRow = idfTable.find((r) => r.isDesignDuration)

  // Tick marks to show on log x-axis
  const xTicks = [5, 10, 30, 60, 120, 360, 720, 1440]

  return (
    <Card
      title="IDF Curve"
      subtitle="Rainfall intensity vs duration — logarithmic scale"
    >
      <ResponsiveContainer width="100%" height={280}>
        <LineChart
          data={idfTable}
          margin={{ top: 12, right: 24, bottom: 32, left: 16 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--color-border)"
            opacity={0.6}
          />

          {/* ── X axis — log scale ──────────────────────────────────── */}
          <XAxis
            dataKey="duration"
            scale="log"
            domain={[5, 1440]}
            type="number"
            ticks={xTicks}
            tickFormatter={(v: number) => (v >= 60 ? `${v / 60}h` : `${v}`)}
            tick={{
              fill: 'var(--color-text-muted)',
              fontSize: 11,
              fontFamily: 'var(--font-mono)',
            }}
            tickLine={{ stroke: 'var(--color-border)' }}
            axisLine={{ stroke: 'var(--color-border)' }}
            label={{
              value: 'Duration (min / hr)',
              position: 'insideBottom',
              offset: -20,
              fill: 'var(--color-text-muted)',
              fontSize: 11,
              fontFamily: 'var(--font-sans)',
            }}
          />

          {/* ── Y axis ─────────────────────────────────────────────── */}
          <YAxis
            tick={{
              fill: 'var(--color-text-muted)',
              fontSize: 11,
              fontFamily: 'var(--font-mono)',
            }}
            tickLine={{ stroke: 'var(--color-border)' }}
            axisLine={{ stroke: 'var(--color-border)' }}
            tickFormatter={(v: number) => `${v}`}
            label={{
              value: 'Intensity (mm/hr)',
              angle: -90,
              position: 'insideLeft',
              offset: 0,
              dy: 60,
              fill: 'var(--color-text-muted)',
              fontSize: 11,
              fontFamily: 'var(--font-sans)',
            }}
          />

          <Tooltip content={<CustomTooltip />} />

          {/* ── Amber reference line at design duration ─────────────── */}
          {designRow && (
            <ReferenceLine
              x={designRow.duration}
              stroke="var(--color-warning)"
              strokeWidth={1.5}
              strokeDasharray="5 3"
              label={{
                value: `tc = ${designRow.duration} min`,
                position: 'top',
                fill: 'var(--color-warning)',
                fontSize: 10,
                fontFamily: 'var(--font-mono)',
              }}
            />
          )}

          {/* ── IDF line ────────────────────────────────────────────── */}
          <Line
            type="monotoneX"
            dataKey="intensity"
            stroke="var(--color-accent)"
            strokeWidth={2.5}
            dot={false}
            activeDot={{
              r: 5,
              fill: 'var(--color-accent)',
              stroke: 'var(--color-bg-card)',
              strokeWidth: 2,
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  )
}