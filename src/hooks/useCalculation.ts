import { useCallback } from 'react'
import { useCalculationStore } from '@/store/calculationStore'
import type { DesignInputs } from '@/core/types/inputs'
import type { ManualInputs } from '@/core/types/validation'
import { calculateGumbelRainfall } from '@/core/calculations/gumbel'
import { calculateDesignIntensity, generateIDFTable } from '@/core/calculations/idf'
import { runHydrologyCalculations } from '@/core/calculations/hydrology'
import { runChannelDesign } from '@/core/calculations/channel'
import { runValidation } from '@/core/calculations/validation'
import { calculateTimeOfConcentration } from '@/core/calculations/hydrology'
import { solveTRRL } from '@/core/calculations/trrl'

export function useCalculation() {
  const {
    setInputs,
    setResults,
    setIsCalculating,
    setError,
    clearResults,
    results,
  } = useCalculationStore()

  const runCalculations = useCallback(
    (inputs: DesignInputs) => {
      setIsCalculating(true)
      clearResults()
      setInputs(inputs)

      try {
        const startTime = performance.now()

        const { catchment, rainfall, channel } = inputs

        // Step 1: Time of concentration (Kirpich)
        const tc = calculateTimeOfConcentration(
          catchment.flowPathLength,
          catchment.slope
        )

        // Step 2: Design duration — use override if provided, else tc
        const designDuration =
          rainfall.stormDurationOverride && rainfall.stormDurationOverride > 0
            ? rainfall.stormDurationOverride
            : tc

        // Step 3: Gumbel T-year rainfall depth
        const XT = calculateGumbelRainfall(
          rainfall.meanAnnualMaxRainfall,
          rainfall.stdDeviation,
          catchment.returnPeriod
        )

        // Step 4: Design intensity at design duration
        const designIntensity = calculateDesignIntensity(XT, designDuration)

        // Step 5: IDF table (13 durations)
        const idfTable = generateIDFTable(XT, designDuration)

        // Step 6: Full hydrology results (Rational Method)
        const hydrology = runHydrologyCalculations(
          catchment,
          designIntensity,
          designDuration,
          XT
        )

        // Step 7: TRRL East African Flood Model
        // R₂₄ = XT (Gumbel T-year daily max rainfall depth in mm)
        const trrl = solveTRRL(
          catchment.area,           // ha — converted to km² inside solveTRRL
          XT,                       // R₂₄ = Gumbel XT (mm)
          catchment.trrlCa,         // Cₐ coefficient
          hydrology.peakDischarge,  // Rational Q for % comparison
        )

        // Step 8: Channel design (Manning's + safety checks)
        // Channel is sized for the TRRL discharge (primary method for large catchments)
        const channelDesign = runChannelDesign(trrl.Q, channel)

        const calculationTimeMs = performance.now() - startTime

        setResults({
          hydrology,
          idfTable,
          channelDesign,
          trrl,
          calculationTimeMs,
        })
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'An unexpected error occurred during calculations.'
        )
      } finally {
        setIsCalculating(false)
      }
    },
    [setInputs, setResults, setIsCalculating, setError, clearResults]
  )

  const runValidationComparison = useCallback(
    (manual: ManualInputs) => {
      if (!results) return
      const { setValidationSummary } = useCalculationStore.getState()
      const summary = runValidation(results, manual)
      setValidationSummary(summary)
    },
    [results]
  )

  return { runCalculations, runValidationComparison }
}