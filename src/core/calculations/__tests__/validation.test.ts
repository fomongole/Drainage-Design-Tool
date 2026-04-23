import { describe, it, expect } from 'vitest'
import {
  calculatePercentageDifference,
  validateParameter,
  runValidation,
} from '../validation'
import type { CalculationResults } from '@/core/types/results'

describe('calculatePercentageDifference', () => {
  it('returns 0 for identical values', () => {
    expect(calculatePercentageDifference(10, 10)).toBe(0)
  })

  it('computes 5% difference correctly', () => {
    expect(calculatePercentageDifference(100, 95)).toBeCloseTo(5, 5)
  })

  it('computes 10% difference correctly', () => {
    expect(calculatePercentageDifference(100, 90)).toBeCloseTo(10, 5)
  })
})

describe('validateParameter', () => {
  it('status is validated when diff ≤ 10%', () => {
    const result = validateParameter('tc', 20, 19)
    expect(result.status).toBe('validated')
  })

  it('status is check when diff > 10%', () => {
    const result = validateParameter('tc', 20, 16)
    expect(result.status).toBe('check')
  })
})

const mockResults: CalculationResults = {
  hydrology: {
    timeOfConcentration: 20,
    designRainfallDepth: 100,
    designIntensity: 50,
    peakDischarge: 1.5,
    designDuration: 20,
  },
  idfTable: [],
  channelDesign: {
    flowDepth: 0.8,
    baseWidth: 1.6,
    freeboard: 0.5,
    totalDepth: 1.3,
    velocity: 1.2,
    manningsN: 0.013,
    froudeNumber: 0.43,
    flowRegime: 'subcritical',
    velocityStatus: 'acceptable',
    topWidth: 3.2,
    wettedPerimeter: 3.86,
    hydraulicRadius: 0.54,
    flowArea: 2.08,
    crossSection: {
      baseWidth: 1.6,
      flowDepth: 0.8,
      freeboard: 0.5,
      sideSlope: 1.0,
      totalDepth: 1.3,
      topWidth: 3.2,
    },
  },
  // ── Added to satisfy updated CalculationResults type ──────────────────
  trrl: {
    Q: 1.5,
    tc: 0.33,
    iterations: [],
    converged: true,
    iterationsToConverge: 3,
    areaKm2: 0.1,
    r24Mm: 100,
    ca: 0.13,
    vsRationalPercent: 0,
  },
  calculationTimeMs: 1.2,
}

describe('runValidation', () => {
  it('skips parameters not entered', () => {
    const summary = runValidation(mockResults, { tc: 19.5 })
    expect(summary.totalEntered).toBe(1)
  })

  it('marks all as validated when all within tolerance', () => {
    const summary = runValidation(mockResults, {
      tc: 20,
      discharge: 1.5,
      flowDepth: 0.8,
    })
    expect(summary.allValidated).toBe(true)
  })

  it('allValidated is false when any parameter fails', () => {
    const summary = runValidation(mockResults, {
      tc: 20,
      discharge: 2.5,
    })
    expect(summary.allValidated).toBe(false)
  })
})