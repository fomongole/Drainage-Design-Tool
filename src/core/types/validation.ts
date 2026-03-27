// Types for the validation panel (manual vs automated comparison)

export type ValidatedParameter = 'tc' | 'intensity' | 'discharge' | 'flowDepth' | 'baseWidth' | 'rainfallDepth'

export interface ManualEntry {
  /** Parameter being validated */
  parameter: ValidatedParameter
  /** Value entered manually by the engineer */
  manualValue: number
}

export interface ValidationResult {
  parameter: ValidatedParameter
  label: string
  unit: string
  automatedValue: number
  manualValue: number
  percentageDifference: number
  /** VALIDATED if ≤10%, CHECK if >10% */
  status: ValidationStatus
}

export type ValidationStatus = 'validated' | 'check' | 'na'

export interface ValidationSummary {
  results: ValidationResult[]
  allValidated: boolean
  validatedCount: number
  totalEntered: number
}

export interface ManualInputs {
  tc?: number
  intensity?: number
  discharge?: number
  flowDepth?: number
  baseWidth?: number
  rainfallDepth?: number
}