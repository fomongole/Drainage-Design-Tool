import { useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CatchmentForm } from './CatchmentForm'
import { RainfallChannelForm } from './RainfallChannelForm'
import { Button } from '@/components/ui/Button'
import { useCalculation } from '@/hooks/useCalculation'
import { useCalculationStore } from '@/store/calculationStore'
import { useSavedCalculations } from '@/hooks/useSavedCalculations'
import { exportToPDF } from '@/services/pdf-export'
import {
  designInputSchema,
  type DesignInputFormValues,
} from '../schemas/designInputSchema'
import type { DesignInputs } from '@/core/types/inputs'
import type { ReturnPeriod } from '@/core/types/inputs'
import type { ManningsN } from '@/core/types/inputs'

const DEFAULT_VALUES: Partial<DesignInputFormValues> = {
  area: 10,
  flowPathLength: 500,
  slope: 0.005,
  runoffCoefficient: 0.7,
  returnPeriod: 10,
  meanAnnualMaxRainfall: 80,
  stdDeviation: 15,
  stormDurationOverride: undefined,
  manningsN: 0.013,
  sideSlope: 1.0,
  channelSlope: 0.005,
}

export function InputPanel() {
  const { runCalculations }  = useCalculation()
  const { isCalculating, inputs: storeInputs, results, validationSummary } = useCalculationStore()
  const { canSave }          = useSavedCalculations()
  const [isExporting, setIsExporting] = useState(false)

  const methods = useForm<DesignInputFormValues>({
    resolver: zodResolver(designInputSchema),
    defaultValues: DEFAULT_VALUES,
  })

  const onSubmit = (data: DesignInputFormValues) => {
    const inputs: DesignInputs = {
      catchment: {
        area: data.area,
        flowPathLength: data.flowPathLength,
        slope: data.slope,
        runoffCoefficient: data.runoffCoefficient,
        returnPeriod: data.returnPeriod as ReturnPeriod,
      },
      rainfall: {
        meanAnnualMaxRainfall: data.meanAnnualMaxRainfall,
        stdDeviation: data.stdDeviation,
        stormDurationOverride: data.stormDurationOverride,
      },
      channel: {
        manningsN: data.manningsN as ManningsN,
        sideSlope: data.sideSlope,
        channelSlope: data.channelSlope,
      },
    }
    runCalculations(inputs)
  }

  const handleExportPDF = async () => {
    if (!storeInputs || !results) return
    setIsExporting(true)
    try {
      await exportToPDF(storeInputs, results, validationSummary)
    } catch (err) {
      console.error('PDF export failed:', err)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} noValidate>
        <div className="space-y-4">
          <CatchmentForm />
          <RainfallChannelForm />

          {/* ── Primary action row ─────────────────────────────────────── */}
          <div className="flex gap-2">
            <Button
              type="submit"
              loading={isCalculating}
              size="lg"
              className="flex-1"
            >
              {isCalculating ? 'Calculating…' : 'Run Design Calculation'}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="lg"
              onClick={() => methods.reset(DEFAULT_VALUES)}
              title="Reset to default values"
            >
              ↺
            </Button>
          </div>

          {/* ── Export PDF (enabled once results exist) ────────────────── */}
          <Button
            type="button"
            variant="secondary"
            size="lg"
            className="w-full"
            onClick={handleExportPDF}
            loading={isExporting}
            disabled={!canSave || isExporting}
          >
            {isExporting ? 'Exporting PDF…' : '↓ Export PDF Report'}
          </Button>
        </div>
      </form>
    </FormProvider>
  )
}