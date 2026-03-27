/** Format a number to fixed decimal places, stripping trailing zeros */
export function fmt(value: number, decimals: number): string {
  return value.toFixed(decimals)
}

/** Format with a unit suffix — returns { value, unit } for separate rendering */
export function fmtUnit(
  value: number,
  decimals: number,
  unit: string
): { value: string; unit: string } {
  return { value: value.toFixed(decimals), unit }
}

/** Map VelocityStatus to human-readable label */
export function velocityLabel(status: string): string {
  switch (status) {
    case 'acceptable':        return 'Velocity Acceptable'
    case 'sedimentation_risk': return 'Sedimentation Risk'
    case 'erosion_risk':      return 'Erosion Risk'
    default:                  return status
  }
}

/** Map FlowRegime to human-readable label */
export function regimeLabel(regime: string): string {
  switch (regime) {
    case 'subcritical':   return 'Subcritical Flow'
    case 'critical':      return 'Critical Flow'
    case 'supercritical': return 'Supercritical Flow'
    default:              return regime
  }
}

/** Manning's n → material description */
export function manningsLabel(n: number): string {
  const map: Record<number, string> = {
    0.013: 'Smooth concrete',
    0.015: 'Finished concrete',
    0.017: 'Unfinished concrete',
    0.022: 'Excavated earth, clean',
    0.025: 'Gravel',
    0.030: 'Natural channel',
  }
  return map[n] ?? `n = ${n}`
}