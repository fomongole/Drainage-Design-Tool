import { Card } from '@/components/ui/Card'
import { useCalculation } from '@/hooks/useCalculation'
import { useCalculationStore } from '@/store/calculationStore'
import { ManualInputForm } from './ManualInputForm'
import { ComparisonTable } from './ComparisonTable'
import type { ManualInputs } from '@/core/types/validation'

export function ValidationPanel() {
  const { runValidationComparison } = useCalculation()
  const { validationSummary } = useCalculationStore()

  const handleCompare = (manual: ManualInputs) => {
    runValidationComparison(manual)
  }

  return (
    <Card
      title="Validation — Manual vs Automated"
      subtitle="Enter hand-calculated values to verify the automated results"
    >
      <ManualInputForm onCompare={handleCompare} />
      {validationSummary && (
        <ComparisonTable summary={validationSummary} />
      )}
    </Card>
  )
}