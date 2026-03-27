import { StatusBanner } from '@/components/ui/StatusBanner'

interface Props {
  calculationTimeMs: number
}

export function TimeBanner({ calculationTimeMs }: Props) {
  return (
    <StatusBanner
      variant="success"
      title={`Calculation completed in ${calculationTimeMs.toFixed(2)} ms`}
      message="Equivalent manual process: 3–5 working days. Automated: under 2 seconds."
    />
  )
}