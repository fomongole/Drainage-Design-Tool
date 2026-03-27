import type { ReturnPeriod } from '@/core/types/inputs'
import {
  GUMBEL_REDUCED_MEAN,
  GUMBEL_REDUCED_STD,
} from '@/core/constants/engineering'

/**
 * Gumbel reduced variate yT for a given return period T.
 *
 * yT = -ln(-ln(1 - 1/T))
 *
 * @param T - Return period in years
 * @returns Gumbel reduced variate
 */
export function calculateGumbelReducedVariate(T: number): number {
  if (T <= 1) throw new Error('Return period must be greater than 1 year')
  const exceedanceProbability = 1 / T
  return -Math.log(-Math.log(1 - exceedanceProbability))
}

/**
 * Gumbel frequency factor KT.
 *
 * KT = (yT - yn) / sn
 *
 * @param T - Return period in years
 * @returns Gumbel frequency factor
 */
export function calculateGumbelFrequencyFactor(T: number): number {
  const yT = calculateGumbelReducedVariate(T)
  return (yT - GUMBEL_REDUCED_MEAN) / GUMBEL_REDUCED_STD
}

/**
 * T-year design rainfall depth using Gumbel EV-I distribution.
 *
 * XT = μ + KT × σ
 *
 * @param mean - Mean of annual maximum daily rainfall series (mm)
 * @param stdDev - Standard deviation of the series (mm)
 * @param returnPeriod - Design return period (years)
 * @returns T-year design rainfall depth in mm
 */
export function calculateGumbelRainfall(
  mean: number,
  stdDev: number,
  returnPeriod: ReturnPeriod
): number {
  if (mean <= 0) throw new Error('Mean rainfall must be greater than zero')
  if (stdDev <= 0) throw new Error('Standard deviation must be greater than zero')

  const KT = calculateGumbelFrequencyFactor(returnPeriod)
  return mean + KT * stdDev
}