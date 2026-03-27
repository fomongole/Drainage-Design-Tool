import { Card } from '@/components/ui/Card'
import type { HydrologyResults } from '@/core/types/results'
import { fmt } from '../formatters'

interface Props {
  hydrology: HydrologyResults
}

interface ResultRow {
  label: string
  value: string
  unit: string
  hint?: string
}

export function HydrologyPanel({ hydrology }: Props) {
  const rows: ResultRow[] = [
    {
      label: 'Time of Concentration',
      value: fmt(hydrology.timeOfConcentration, 2),
      unit: 'min',
      hint: 'Kirpich (1940)',
    },
    {
      label: 'Design Rainfall Depth (XT)',
      value: fmt(hydrology.designRainfallDepth, 2),
      unit: 'mm',
      hint: 'Gumbel EV-I',
    },
    {
      label: 'Design Intensity (i)',
      value: fmt(hydrology.designIntensity, 2),
      unit: 'mm/hr',
      hint: `at ${fmt(hydrology.designDuration, 1)} min`,
    },
    {
      label: 'Peak Discharge (Q)',
      value: fmt(hydrology.peakDischarge, 4),
      unit: 'm³/s',
      hint: 'Rational Method',
    },
  ]

  return (
    <Card title="Hydrology Results">
      <div className="grid grid-cols-2 gap-x-8 gap-y-6">
        {rows.map(({ label, value, unit, hint }) => (
          <div key={label}>
            <span className="label">{label}</span>
            <p className="result-value">
              {value}{' '}
              <span className="text-text-muted text-xs font-sans font-normal">
                {unit}
              </span>
            </p>
            {hint && (
              <p className="text-xs text-text-muted mt-0.5">{hint}</p>
            )}
          </div>
        ))}
      </div>
    </Card>
  )
}