import type { IDFRow } from '@/core/types/results'
import {
  IDF_HOURLY_FRACTION,
  IDF_SCALING_EXPONENT,
  IDF_DURATIONS_MINUTES,
} from '@/core/constants/engineering'

/**
 * Rainfall intensity at the 1-hour (60-minute) reference duration.
 *
 * i60 = 0.70 × XT
 *
 * @param rainfallDepthMm - T-year design rainfall depth (mm)
 * @returns 60-minute reference intensity (mm/hr)
 */
export function calculateHourlyReferenceIntensity(rainfallDepthMm: number): number {
  if (rainfallDepthMm <= 0)
    throw new Error('Rainfall depth must be greater than zero')
  return IDF_HOURLY_FRACTION * rainfallDepthMm
}

/**
 * IDF power-law intensity for a given duration.
 *
 * i(t) = i60 × (60 / t)^0.65
 *
 * @param i60 - 60-minute reference intensity (mm/hr)
 * @param durationMinutes - Storm duration (minutes)
 * @returns Rainfall intensity at the given duration (mm/hr)
 */
export function calculateIntensityAtDuration(
  i60: number,
  durationMinutes: number
): number {
  if (durationMinutes <= 0)
    throw new Error('Duration must be greater than zero')
  return i60 * Math.pow(60 / durationMinutes, IDF_SCALING_EXPONENT)
}

/**
 * Design intensity at the time of concentration (or override duration).
 *
 * @param rainfallDepthMm - T-year design rainfall depth (mm)
 * @param durationMinutes - Design storm duration (minutes) — tc or override
 * @returns Design intensity in mm/hr
 */
export function calculateDesignIntensity(
  rainfallDepthMm: number,
  durationMinutes: number
): number {
  const i60 = calculateHourlyReferenceIntensity(rainfallDepthMm)
  return calculateIntensityAtDuration(i60, durationMinutes)
}

/**
 * Generate the full IDF table for all 13 standard durations.
 *
 * The row matching the design duration is flagged as isDesignDuration.
 *
 * @param rainfallDepthMm - T-year design rainfall depth (mm)
 * @param designDurationMinutes - The active design duration (tc or override)
 * @returns Array of 13 IDFRow entries
 */
export function generateIDFTable(
  rainfallDepthMm: number,
  designDurationMinutes: number
): IDFRow[] {
  const i60 = calculateHourlyReferenceIntensity(rainfallDepthMm)

  // Find the closest duration in the table to the design duration
  const closestDuration = IDF_DURATIONS_MINUTES.reduce((prev, curr) =>
    Math.abs(curr - designDurationMinutes) < Math.abs(prev - designDurationMinutes)
      ? curr
      : prev
  )

  return IDF_DURATIONS_MINUTES.map((duration) => ({
    duration,
    intensity: calculateIntensityAtDuration(i60, duration),
    isDesignDuration: duration === closestDuration,
  }))
}