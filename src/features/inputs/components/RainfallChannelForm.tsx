import { useFormContext } from 'react-hook-form'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { MANNINGS_OPTIONS } from '@/core/constants/mannings'
import type { DesignInputFormValues } from '../schemas/designInputSchema'

export function RainfallChannelForm() {
  const {
    register,
    formState: { errors },
  } = useFormContext<DesignInputFormValues>()

  return (
    <Card title="Rainfall & Channel Parameters" subtitle="Step 2 of 2">
      {/* ── Rainfall Statistics ─────────────────────────────────────────── */}
      <p className="label mb-3">Annual Rainfall Statistics</p>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Mean Annual Max Rainfall (μ)"
            unit="mm"
            inputMode="decimal"
            placeholder="e.g. 80"
            error={errors.meanAnnualMaxRainfall?.message}
            {...register('meanAnnualMaxRainfall')}
          />
          <Input
            label="Std Deviation (σ)"
            unit="mm"
            inputMode="decimal"
            placeholder="e.g. 15"
            error={errors.stdDeviation?.message}
            {...register('stdDeviation')}
          />
        </div>

        <Input
          label="Storm Duration Override"
          unit="min"
          inputMode="decimal"
          placeholder="Leave blank to use tc"
          hint="Optional — defaults to computed time of concentration"
          error={errors.stormDurationOverride?.message}
          {...register('stormDurationOverride')}
        />
      </div>

      {/* ── Divider ─────────────────────────────────────────────────────── */}
      <div className="border-t border-border my-5" />

      {/* ── Channel Parameters ──────────────────────────────────────────── */}
      <p className="label mb-3">Channel Design Parameters</p>
      <div className="space-y-4">
        <Select
          label="Channel Lining (Manning's n)"
          error={errors.manningsN?.message}
          {...register('manningsN')}
        >
          {MANNINGS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </Select>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Side Slope (z)"
            unit="H:V"
            inputMode="decimal"
            placeholder="e.g. 1.0"
            hint="0 = rectangular, 1 = 45°"
            error={errors.sideSlope?.message}
            {...register('sideSlope')}
          />
          <Input
            label="Channel Slope"
            unit="m/m"
            inputMode="decimal"
            placeholder="e.g. 0.005"
            hint="Longitudinal bed slope"
            error={errors.channelSlope?.message}
            {...register('channelSlope')}
          />
        </div>
      </div>
    </Card>
  )
}