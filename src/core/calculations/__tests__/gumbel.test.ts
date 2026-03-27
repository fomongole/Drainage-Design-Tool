import { describe, it, expect } from 'vitest'
import {
  calculateGumbelReducedVariate,
  calculateGumbelFrequencyFactor,
  calculateGumbelRainfall,
} from '../gumbel'

describe('calculateGumbelReducedVariate', () => {
  it('computes yT for T=10 correctly', () => {
    // yT = -ln(-ln(1 - 1/10)) = -ln(-ln(0.9)) ≈ 2.2504
    const yT = calculateGumbelReducedVariate(10)
    expect(yT).toBeCloseTo(2.2504, 3)
  })

  it('computes yT for T=100 correctly', () => {
    const yT = calculateGumbelReducedVariate(100)
    expect(yT).toBeCloseTo(4.6001, 3)
  })

  it('throws for T <= 1', () => {
    expect(() => calculateGumbelReducedVariate(1)).toThrow()
  })
})

describe('calculateGumbelFrequencyFactor', () => {
  it('KT for T=2 is near zero (close to mean)', () => {
    const KT = calculateGumbelFrequencyFactor(2)
    expect(Math.abs(KT)).toBeLessThan(0.2)
  })

  it('KT increases with return period', () => {
    const KT10 = calculateGumbelFrequencyFactor(10)
    const KT100 = calculateGumbelFrequencyFactor(100)
    expect(KT100).toBeGreaterThan(KT10)
  })
})

describe('calculateGumbelRainfall', () => {
  it('computes XT correctly for known inputs', () => {
    // μ=80mm, σ=15mm, T=10yr → KT≈1.3046 → XT≈80+1.3046×15≈99.6mm
    const XT = calculateGumbelRainfall(80, 15, 10)
    expect(XT).toBeCloseTo(99.6, 0)
  })

  it('higher return period gives higher rainfall', () => {
    const X10 = calculateGumbelRainfall(80, 15, 10)
    const X100 = calculateGumbelRainfall(80, 15, 100)
    expect(X100).toBeGreaterThan(X10)
  })

  it('throws for zero mean', () => {
    expect(() => calculateGumbelRainfall(0, 15, 10)).toThrow()
  })
})