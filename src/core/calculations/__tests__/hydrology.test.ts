import { describe, it, expect } from 'vitest'
import {
  calculateTimeOfConcentration,
  calculatePeakDischarge,
} from '../hydrology'

describe('calculateTimeOfConcentration (Kirpich)', () => {
  it('computes tc correctly for known values', () => {
    // L=500m, S=0.005 → tc = 0.0195 × 500^0.77 × 0.005^-0.385 ≈ 17.95 min
    const tc = calculateTimeOfConcentration(500, 0.005)
    expect(tc).toBeCloseTo(17.95, 1)
  })

  it('produces higher tc for longer flow paths', () => {
    const tc1 = calculateTimeOfConcentration(300, 0.01)
    const tc2 = calculateTimeOfConcentration(600, 0.01)
    expect(tc2).toBeGreaterThan(tc1)
  })

  it('produces lower tc for steeper slopes', () => {
    const tc1 = calculateTimeOfConcentration(500, 0.005)
    const tc2 = calculateTimeOfConcentration(500, 0.02)
    expect(tc2).toBeLessThan(tc1)
  })

  it('throws for zero length', () => {
    expect(() => calculateTimeOfConcentration(0, 0.01)).toThrow()
  })

  it('throws for zero slope', () => {
    expect(() => calculateTimeOfConcentration(500, 0)).toThrow()
  })
})

describe('calculatePeakDischarge (Rational Method)', () => {
  it('computes Q correctly for known values', () => {
    // C=0.7, i=50mm/hr, A=10ha → Q = (0.7×50×10)/360 ≈ 0.972 m³/s
    const Q = calculatePeakDischarge(0.7, 50, 10)
    expect(Q).toBeCloseTo(0.972, 2)
  })

  it('scales linearly with area', () => {
    const Q1 = calculatePeakDischarge(0.6, 40, 5)
    const Q2 = calculatePeakDischarge(0.6, 40, 10)
    expect(Q2).toBeCloseTo(Q1 * 2, 5)
  })

  it('throws for runoff coefficient > 1', () => {
    expect(() => calculatePeakDischarge(1.1, 50, 10)).toThrow()
  })

  it('throws for zero intensity', () => {
    expect(() => calculatePeakDischarge(0.7, 0, 10)).toThrow()
  })
})