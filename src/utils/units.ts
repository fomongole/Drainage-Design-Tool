/**
 * Convert hectares to square metres.
 */
export function haToM2(ha: number): number {
  return ha * 10_000
}

/**
 * Convert mm/hr to m/s.
 */
export function mmHrToMs(mmHr: number): number {
  return mmHr / 3_600_000
}

/**
 * Convert minutes to hours.
 */
export function minToHr(minutes: number): number {
  return minutes / 60
}

/**
 * Convert hours to minutes.
 */
export function hrToMin(hours: number): number {
  return hours * 60
}