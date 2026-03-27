import type { FlowRegime, VelocityStatus } from '@/core/types/results'
import type { ReturnPeriod } from '@/core/types/inputs'

// ─── Gumbel Distribution Constants ───────────────────────────────────────────

/** Reduced mean — Euler–Mascheroni constant (large-sample asymptotic limit) */
export const GUMBEL_REDUCED_MEAN = 0.5772

/** Reduced standard deviation (Gumbel scale factor, large-sample limit) */
export const GUMBEL_REDUCED_STD = 1.2825

// ─── IDF Constants ───────────────────────────────────────────────────────────

/**
 * Proportion of daily maximum rainfall occurring in the critical 1-hour
 * duration for East African storm events (Uganda / Kenya calibrated)
 */
export const IDF_HOURLY_FRACTION = 0.70

/** Temporal scaling exponent for IDF power-law relationship */
export const IDF_SCALING_EXPONENT = 0.65

/** Standard storm durations for IDF table (minutes) — 13 values */
export const IDF_DURATIONS_MINUTES = [5, 10, 15, 20, 30, 45, 60, 90, 120, 180, 360, 720, 1440] as const

// ─── Manning's Equation ───────────────────────────────────────────────────────

/** Default side slope ratio H:1V for trapezoidal channels */
export const DEFAULT_SIDE_SLOPE = 1.0

/** Default Manning's n — smooth concrete */
export const DEFAULT_MANNINGS_N = 0.013

/** Newton-Raphson solver: maximum iterations */
export const NR_MAX_ITERATIONS = 200

/** Newton-Raphson solver: convergence criterion (m³/s) */
export const NR_CONVERGENCE = 0.0001

// ─── Freeboard Rules ─────────────────────────────────────────────────────────

export const FREEBOARD_RULES = [
  { maxDischarge: 0.5,  freeboard: 0.30 },
  { maxDischarge: 5.0,  freeboard: 0.50 },
  { maxDischarge: Infinity, freeboard: 0.75 },
] as const

export function getFreeboardForDischarge(Q: number): number {
  for (const rule of FREEBOARD_RULES) {
    if (Q < rule.maxDischarge) return rule.freeboard
  }
  return 0.75
}

// ─── Froude Number Thresholds ─────────────────────────────────────────────────

export function classifyFlowRegime(fr: number): FlowRegime {
  if (fr < 0.99) return 'subcritical'
  if (fr <= 1.01) return 'critical'
  return 'supercritical'
}

// ─── Velocity Erosion Limits ──────────────────────────────────────────────────

/** Minimum acceptable velocity to prevent sedimentation (m/s) */
export const VELOCITY_MIN = 0.6

/** Maximum acceptable velocity for concrete-lined channel (m/s) */
export const VELOCITY_MAX = 3.0

export function classifyVelocity(v: number): VelocityStatus {
  if (v < VELOCITY_MIN) return 'sedimentation_risk'
  if (v > VELOCITY_MAX) return 'erosion_risk'
  return 'acceptable'
}

// ─── Return Periods ───────────────────────────────────────────────────────────

export const RETURN_PERIOD_OPTIONS: ReturnPeriod[] = [2, 5, 10, 25, 50, 100]

// ─── Validation Tolerance ─────────────────────────────────────────────────────

/** Acceptance criterion: ±10% between automated and manual results */
export const VALIDATION_TOLERANCE_PERCENT = 10

// ─── Gravity ─────────────────────────────────────────────────────────────────

export const GRAVITY = 9.81

// ─── Manual Calculation Time Estimate ────────────────────────────────────────

export const MANUAL_CALC_TIME_LABEL = '3–5 days'