import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import type { ManualInputs } from '@/core/types/validation'

// ── Schema — all optional, must be positive if provided ───────────────────
const schema = z.object({
  tc:           z.preprocess((v) => (v === '' ? undefined : Number(v)), z.number().positive().optional()),
  intensity:    z.preprocess((v) => (v === '' ? undefined : Number(v)), z.number().positive().optional()),
  discharge:    z.preprocess((v) => (v === '' ? undefined : Number(v)), z.number().positive().optional()),
  flowDepth:    z.preprocess((v) => (v === '' ? undefined : Number(v)), z.number().positive().optional()),
  baseWidth:    z.preprocess((v) => (v === '' ? undefined : Number(v)), z.number().positive().optional()),
  rainfallDepth:z.preprocess((v) => (v === '' ? undefined : Number(v)), z.number().positive().optional()),
})

type FormValues = z.infer<typeof schema>

interface Props {
  onCompare: (manual: ManualInputs) => void
  isLoading?: boolean
}

export function ManualInputForm({ onCompare, isLoading }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const onSubmit = (data: FormValues) => {
    // Strip undefined — only pass fields the user actually filled in
    const manual: ManualInputs = Object.fromEntries(
      Object.entries(data).filter(([, v]) => v !== undefined)
    )
    onCompare(manual)
  }

  const fields: {
    name: keyof FormValues
    label: string
    unit: string
    hint: string
    step: string
  }[] = [
    { name: 'tc',            label: 'Time of Concentration',   unit: 'min',   hint: 'Kirpich tc from manual calc', step: '0.01' },
    { name: 'intensity',     label: 'Design Intensity (i)',     unit: 'mm/hr', hint: 'i at design duration',        step: '0.01' },
    { name: 'discharge',     label: 'Peak Discharge (Q)',       unit: 'm³/s',  hint: 'Rational Method Q',           step: '0.0001' },
    { name: 'flowDepth',     label: 'Flow Depth (D)',           unit: 'm',     hint: "Manning's normal depth",      step: '0.001' },
    { name: 'baseWidth',     label: 'Base Width (B)',           unit: 'm',     hint: 'Channel base width',          step: '0.001' },
    { name: 'rainfallDepth', label: 'Rainfall Depth (XT)',      unit: 'mm',    hint: 'Gumbel T-year depth',         step: '0.01' },
  ]

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <p
        style={{
          fontSize: '0.8rem',
          color: 'var(--color-text-muted)',
          marginBottom: '1.25rem',
          lineHeight: 1.6,
        }}
      >
        Enter your hand-calculated values below. Leave any field blank to skip
        that parameter. The tool will compute the percentage difference against
        the automated results and flag parameters outside ±10%.
      </p>

      {/* ── 2-col grid of inputs ───────────────────────────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '1rem 2rem',
          marginBottom: '1.5rem',
        }}
      >
        {fields.map(({ name, label, unit, hint, step }) => (
          <Input
            key={name}
            type="number"
            step={step}
            min="0"
            label={label}
            unit={unit}
            hint={hint}
            error={errors[name]?.message}
            {...register(name)}
          />
        ))}
      </div>

      <Button
        type="submit"
        variant="secondary"
        size="md"
        loading={isLoading}
      >
        Compare Results
      </Button>
    </form>
  )
}