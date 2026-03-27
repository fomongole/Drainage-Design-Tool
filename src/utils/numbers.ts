/**
 * Round a number to a given number of decimal places.
 */
export function round(value: number, decimals: number): number {
  const factor = Math.pow(10, decimals)
  return Math.round(value * factor) / factor
}

/**
 * Format a number for display with fixed decimal places.
 */
export function formatFixed(value: number, decimals: number): string {
  return value.toFixed(decimals)
}

/**
 * Format a number in scientific notation for very small/large values.
 */
export function formatScientific(value: number, significantFigures = 3): string {
  return value.toPrecision(significantFigures)
}

/**
 * Clamp a value between min and max.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/**
 * Check if a number is a valid finite positive number.
 */
export function isValidPositive(value: unknown): value is number {
  return typeof value === 'number' && isFinite(value) && value > 0
}