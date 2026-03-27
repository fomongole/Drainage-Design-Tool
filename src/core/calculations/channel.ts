import type { ChannelParams } from '@/core/types/inputs'
import type { ChannelDesignResults } from '@/core/types/results'
import {
  NR_MAX_ITERATIONS,
  NR_CONVERGENCE,
  GRAVITY,
  getFreeboardForDischarge,
  classifyFlowRegime,
  classifyVelocity,
} from '@/core/constants/engineering'

/**
 * Trapezoidal channel cross-sectional area.
 * A = (B + z·D) · D
 */
export function trapezoidalArea(B: number, z: number, D: number): number {
  return (B + z * D) * D
}

/**
 * Trapezoidal channel wetted perimeter.
 * P = B + 2D√(1 + z²)
 */
export function trapezoidalWettedPerimeter(B: number, z: number, D: number): number {
  return B + 2 * D * Math.sqrt(1 + z * z)
}

/**
 * Trapezoidal channel top width at water surface.
 * Tw = B + 2zD
 */
export function trapezoidalTopWidth(B: number, z: number, D: number): number {
  return B + 2 * z * D
}

/**
 * Manning's equation — compute discharge for a given depth.
 *
 * Q = (1/n) × A × R^(2/3) × S^(1/2)
 *
 * @param n - Manning's roughness coefficient
 * @param A - Cross-sectional area (m²)
 * @param R - Hydraulic radius A/P (m)
 * @param S - Channel bed slope (m/m)
 * @returns Discharge (m³/s)
 */
export function manningsDischarge(
  n: number,
  A: number,
  R: number,
  S: number
): number {
  return (1 / n) * A * Math.pow(R, 2 / 3) * Math.pow(S, 0.5)
}

/**
 * Solve for normal flow depth D using iterative Newton-Raphson method.
 *
 * Starting assumption: B = 2D (proportionate, hydraulically efficient section).
 * Iterates up to 200 times, convergence criterion |Qcalc - Q| < 0.0001 m³/s.
 *
 * @param Q - Design discharge (m³/s)
 * @param n - Manning's n
 * @param S - Channel bed slope (m/m)
 * @param z - Side slope H:1V
 * @returns Solved flow depth D (m)
 */
export function solveFlowDepth(
  Q: number,
  n: number,
  S: number,
  z: number
): number {
  if (Q <= 0) throw new Error('Design discharge must be greater than zero')
  if (n <= 0) throw new Error('Manning\'s n must be greater than zero')
  if (S <= 0) throw new Error('Channel slope must be greater than zero')

  // Initial estimate using proportionate section B = 2D
  // Rearranging Manning's for D with B=2D gives approximate D
  let D = Math.pow((Q * n) / (Math.pow(S, 0.5) * 4), 3 / 8)
  if (D <= 0 || !isFinite(D)) D = 0.5 // fallback seed

  for (let i = 0; i < NR_MAX_ITERATIONS; i++) {
    const B = 2 * D
    const A = trapezoidalArea(B, z, D)
    const P = trapezoidalWettedPerimeter(B, z, D)
    const R = A / P
    const Qcalc = manningsDischarge(n, A, R, S)
    const error = Qcalc - Q

    if (Math.abs(error) < NR_CONVERGENCE) return D

    // Derivative dQ/dD (numerical, small step)
    const dD = D * 1e-6
    const Bplus = 2 * (D + dD)
    const Aplus = trapezoidalArea(Bplus, z, D + dD)
    const Pplus = trapezoidalWettedPerimeter(Bplus, z, D + dD)
    const Rplus = Aplus / Pplus
    const Qplus = manningsDischarge(n, Aplus, Rplus, S)
    const dQdD = (Qplus - Qcalc) / dD

    if (Math.abs(dQdD) < 1e-12) break // avoid division by near-zero

    D = D - error / dQdD
    if (D <= 0) D = 0.001 // keep positive
  }

  return D
}

/**
 * Run the complete channel design calculation.
 *
 * @param Q - Design peak discharge (m³/s)
 * @param channel - Channel parameters (n, z, slope)
 * @returns Full channel design results
 */
export function runChannelDesign(
  Q: number,
  channel: ChannelParams
): ChannelDesignResults {
  const { manningsN: n, sideSlope: z, channelSlope: S } = channel

  const D = solveFlowDepth(Q, n, S, z)
  const B = 2 * D

  const A = trapezoidalArea(B, z, D)
  const P = trapezoidalWettedPerimeter(B, z, D)
  const R = A / P
  const Tw = trapezoidalTopWidth(B, z, D)
  const V = Q / A

  // Hydraulic depth for Froude number
  const Dh = A / Tw
  const Fr = V / Math.sqrt(GRAVITY * Dh)

  const freeboard = getFreeboardForDischarge(Q)
  const totalDepth = D + freeboard

  return {
    flowDepth: D,
    baseWidth: B,
    freeboard,
    totalDepth,
    velocity: V,
    manningsN: n,
    froudeNumber: Fr,
    flowRegime: classifyFlowRegime(Fr),
    velocityStatus: classifyVelocity(V),
    topWidth: Tw,
    wettedPerimeter: P,
    hydraulicRadius: R,
    flowArea: A,
    crossSection: {
      baseWidth: B,
      flowDepth: D,
      freeboard,
      sideSlope: z,
      totalDepth,
      topWidth: Tw,
    },
  }
}