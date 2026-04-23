import { useFormContext } from 'react-hook-form'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import type { DesignInputFormValues } from '../schemas/designInputSchema'

const RETURN_PERIODS = [2, 5, 10, 25, 50, 100] as const

export function CatchmentForm() {
  const {
    register,
    formState: { errors },
  } = useFormContext<DesignInputFormValues>()

  return (
    <Card title="Catchment Parameters" subtitle="Step 1 of 2">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Catchment Area"
            unit="ha"
            inputMode="decimal"
            placeholder="e.g. 10"
            error={errors.area?.message}
            {...register('area')}
          />
          <Input
            label="Flow Path Length"
            unit="m"
            inputMode="decimal"
            placeholder="e.g. 500"
            error={errors.flowPathLength?.message}
            {...register('flowPathLength')}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Channel Slope"
            unit="m/m"
            inputMode="decimal"
            placeholder="e.g. 0.005"
            hint="Rise over run (0 – 1)"
            error={errors.slope?.message}
            {...register('slope')}
          />
          <Input
            label="Runoff Coefficient"
            unit="C"
            inputMode="decimal"
            placeholder="e.g. 0.7"
            hint="0.1 (rural) – 0.95 (paved)"
            error={errors.runoffCoefficient?.message}
            {...register('runoffCoefficient')}
          />
        </div>

        <Select
          label="Return Period"
          error={errors.returnPeriod?.message}
          {...register('returnPeriod')}
        >
          {RETURN_PERIODS.map((t) => (
            <option key={t} value={t}>
              {t}-year storm (AEP {(100 / t).toFixed(0)}%)
            </option>
          ))}
        </Select>

        {/* ── TRRL coefficient ──────────────────────────────────────────── */}
        <div className="pt-1">
          <p className="label mb-3">TRRL East African Model</p>
          <Input
            label="Contributing Area Coefficient (Cₐ)"
            unit=""
            inputMode="decimal"
            placeholder="e.g. 0.13"
            hint="Typical range 0.05 – 0.25 · Namatala default: 0.13"
            error={errors.trrlCa?.message}
            {...register('trrlCa')}
          />
        </div>
      </div>
    </Card>
  )
}