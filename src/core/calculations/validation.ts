import type { CalculationResults } from '@/core/types/results'
import type {
  ManualInputs,
  ValidationResult,
  ValidationSummary,
  ValidatedParameter,
} from '@/core/types/validation'
import { VALIDATION_TOLERANCE_PERCENT } from '@/core/constants/engineering'

const PARAMETER_META: Record<
  ValidatedParameter,
  { label: string; unit: string }
> = {
  tc: { label: 'Time of Concentration', unit: 'min' },
  intensity: { label: 'Design Intensity', unit: 'mm/hr' },
  discharge: { label: 'Peak Discharge', unit: 'm³/s' },
  flowDepth: { label: 'Normal Flow Depth', unit: 'm' },
  baseWidth: { label: 'Base Width', unit: 'm' },
  rainfallDepth: { label: 'T-year Rainfall Depth', unit: 'mm' },
}

/**
 * Compute absolute percentage difference between automated and manual values.
 *
 * % Difference = |( Xauto - Xmanual ) / Xauto| × 100
 */
export function calculatePercentageDifference(
  automated: number,
  manual: number
): number {
  if (automated === 0) return manual === 0 ? 0 : 100
  return (Math.abs(automated - manual) / Math.abs(automated)) * 100
}

/**
 * Validate a single parameter against its automated result.
 */
export function validateParameter(
  parameter: ValidatedParameter,
  automatedValue: number,
  manualValue: number
): ValidationResult {
  const meta = PARAMETER_META[parameter]
  const diff = calculatePercentageDifference(automatedValue, manualValue)

  return {
    parameter,
    label: meta.label,
    unit: meta.unit,
    automatedValue,
    manualValue,
    percentageDifference: diff,
    status: diff <= VALIDATION_TOLERANCE_PERCENT ? 'validated' : 'check',
  }
}

/**
 * Run the full validation comparison between automated results
 * and manually entered values.
 *
 * Parameters left blank (undefined) are excluded from assessment.
 */
export function runValidation(
  results: CalculationResults,
  manual: ManualInputs
): ValidationSummary {
  const { hydrology, channelDesign } = results

  const automatedMap: Record<ValidatedParameter, number> = {
    tc:            hydrology.timeOfConcentration,
    intensity:     hydrology.designIntensity,
    discharge:     hydrology.peakDischarge,
    flowDepth:     channelDesign.flowDepth,
    baseWidth:     channelDesign.baseWidth,
    rainfallDepth: hydrology.designRainfallDepth,
  }

  const validationResults: ValidationResult[] = []

  const parameters: ValidatedParameter[] = [
    'tc',
    'intensity',
    'discharge',
    'flowDepth',
    'baseWidth',
    'rainfallDepth',
  ]

  for (const param of parameters) {
    const manualValue = manual[param]
    if (manualValue === undefined || manualValue === null) continue

    validationResults.push(
      validateParameter(param, automatedMap[param], manualValue)
    )
  }

  const validatedCount = validationResults.filter(
    (r) => r.status === 'validated'
  ).length

  return {
    results: validationResults,
    allValidated:
      validationResults.length > 0 &&
      validatedCount === validationResults.length,
    validatedCount,
    totalEntered: validationResults.length,
  }
}