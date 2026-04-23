/**
 * TRRL East African Flood Estimation Model (Road Note 5, 1976)
 *
 * Iterative formula:
 *   Q  = Cₐ × A^0.9 × R₂₄^0.75 × (24/tᴄ)^0.25
 *   tᴄ = 0.604 × (A/Q)^0.4
 *
 * Where:
 *   Q   — Peak discharge (m³/s)
 *   Cₐ  — Contributing area coefficient (dimensionless, typically 0.05–0.25)
 *   A   — Catchment area (km²)
 *   R₂₄ — 24-hour design rainfall depth (mm) — same as Gumbel XT
 *   tᴄ  — Time of concentration (hours)
 *
 * Convergence criterion: |Qᵢ − Qᵢ₋₁| < 0.1 m³/s (max 15 iterations)
 * Source: TRRL Overseas Road Note 5 (1976); Namatala calibration Cₐ = 0.13
 */

export interface TRRLIteration {
  iteration: number
  tcIn: number       // tc used in this iteration (hours)
  Q: number          // discharge computed this iteration (m³/s)
  tcOut: number      // updated tc for next iteration (hours)
  delta: number      // |Q − Q_prev| (m³/s)
  converged: boolean
}

export interface TRRLResults {
  /** Converged peak discharge (m³/s) */
  Q: number
  /** Converged time of concentration (hours) */
  tc: number
  /** Full iteration log */
  iterations: TRRLIteration[]
  /** Whether convergence criterion was met */
  converged: boolean
  /** Number of iterations to convergence */
  iterationsToConverge: number
  /** Catchment area in km² (converted from ha for display) */
  areaKm2: number
  /** R₂₄ rainfall depth used (mm) */
  r24Mm: number
  /** Cₐ coefficient used */
  ca: number
  /** How much the Rational Method overestimates TRRL (%) — positive = overestimate */
  vsRationalPercent: number
}

/**
 * Iteratively solve the TRRL East African flood equation.
 *
 * @param areaHa        Catchment area in hectares (converted to km² internally)
 * @param r24Mm         24-hour design rainfall depth in mm (Gumbel XT)
 * @param ca            Contributing area coefficient (default 0.13)
 * @param rationalQ     Rational Method Q for comparison (m³/s)
 */
export function solveTRRL(
  areaHa: number,
  r24Mm: number,
  ca: number,
  rationalQ: number,
): TRRLResults {
  if (areaHa <= 0) throw new Error('Catchment area must be > 0')
  if (r24Mm  <= 0) throw new Error('Design rainfall depth must be > 0')
  if (ca     <= 0) throw new Error('Contributing area coefficient must be > 0')

  const A = areaHa / 100   // hectares → km²

  let tc     = 24          // initial guess: 24 hours
  let Q_prev = 0
  let finalQ = 0
  let finalTc = tc
  let converged    = false
  let convergedAt  = 15
  const iters: TRRLIteration[] = []

  for (let i = 0; i < 15; i++) {
    const Q      = ca * Math.pow(A, 0.9) * Math.pow(r24Mm, 0.75) * Math.pow(24 / tc, 0.25)
    const tc_new = 0.604 * Math.pow(A / Q, 0.4)
    const delta  = Math.abs(Q - Q_prev)
    const iterConverged = delta < 0.1 && i > 0

    iters.push({
      iteration: i + 1,
      tcIn: tc,
      Q,
      tcOut: tc_new,
      delta,
      converged: iterConverged,
    })

    finalQ  = Q
    finalTc = tc_new

    if (iterConverged) {
      converged   = true
      convergedAt = i + 1
      break
    }

    Q_prev = Q
    tc     = tc_new
  }

  // How much does Rational Method overestimate vs TRRL?
  // Positive value = Rational > TRRL (overestimate)
  const vsRationalPercent = finalQ > 0
    ? ((rationalQ - finalQ) / finalQ) * 100
    : 0

  return {
    Q: finalQ,
    tc: finalTc,
    iterations: iters,
    converged,
    iterationsToConverge: convergedAt,
    areaKm2: A,
    r24Mm,
    ca,
    vsRationalPercent,
  }
}