import type { CatchmentParams } from '@/core/types/inputs'
import type { HydrologyResults } from '@/core/types/results'

/**
 * Kirpich (1940) formula — Time of Concentration
 *
 * tc = 0.0195 × L^0.77 × S^-0.385
 *
 * @param L - Length of the longest flow path (metres)
 * @param S - Average slope of the flow path (m/m, dimensionless)
 * @returns Time of concentration in minutes
 */
export function calculateTimeOfConcentration(L: number, S: number): number {
  if (L <= 0) throw new Error('Flow path length must be greater than zero')
  if (S <= 0) throw new Error('Slope must be greater than zero')
  return 0.0195 * Math.pow(L, 0.77) * Math.pow(S, -0.385)
}

/**
 * Rational Method — Peak Discharge
 *
 * Q = (C × i × A) / 360
 *
 * @param C - Runoff coefficient (dimensionless, 0.1–1.0)
 * @param i - Design rainfall intensity (mm/hr)
 * @param A - Contributing catchment area (hectares)
 * @returns Peak runoff discharge in m³/s
 */
export function calculatePeakDischarge(C: number, i: number, A: number): number {
  if (C <= 0 || C > 1) throw new Error('Runoff coefficient must be between 0 and 1')
  if (i <= 0) throw new Error('Rainfall intensity must be greater than zero')
  if (A <= 0) throw new Error('Catchment area must be greater than zero')
  return (C * i * A) / 360
}

/**
 * Run the complete hydrology calculation chain.
 *
 * @param catchment - Catchment parameters
 * @param designIntensity - Design rainfall intensity at the design duration (mm/hr)
 * @param designDuration - Actual design duration used (minutes)
 * @param designRainfallDepth - T-year design rainfall depth from Gumbel (mm)
 * @returns Full hydrology results
 */
export function runHydrologyCalculations(
  catchment: CatchmentParams,
  designIntensity: number,
  designDuration: number,
  designRainfallDepth: number
): HydrologyResults {
  const tc = calculateTimeOfConcentration(
    catchment.flowPathLength,
    catchment.slope
  )

  const Q = calculatePeakDischarge(
    catchment.runoffCoefficient,
    designIntensity,
    catchment.area
  )

  return {
    timeOfConcentration: tc,
    designRainfallDepth,
    designIntensity,
    peakDischarge: Q,
    designDuration,
  }
}