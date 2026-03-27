import { describe, it, expect } from 'vitest'
import {
  trapezoidalArea,
  trapezoidalWettedPerimeter,
  trapezoidalTopWidth,
  manningsDischarge,
  solveFlowDepth,
  runChannelDesign,
} from '../channel'

describe('trapezoidalArea', () => {
  it('computes area correctly', () => {
    // B=1, z=1, D=0.5 → A = (1 + 1×0.5)×0.5 = 0.75
    expect(trapezoidalArea(1, 1, 0.5)).toBeCloseTo(0.75, 5)
  })
})

describe('trapezoidalWettedPerimeter', () => {
  it('computes perimeter correctly', () => {
    // B=1, z=1, D=0.5 → P = 1 + 2×0.5×√2 ≈ 2.414
    expect(trapezoidalWettedPerimeter(1, 1, 0.5)).toBeCloseTo(2.414, 2)
  })
})

describe('trapezoidalTopWidth', () => {
  it('computes top width correctly', () => {
    // B=1, z=1, D=0.5 → Tw = 1 + 2×1×0.5 = 2.0
    expect(trapezoidalTopWidth(1, 1, 0.5)).toBeCloseTo(2.0, 5)
  })
})

describe('solveFlowDepth', () => {
  it('converges for a standard design case', () => {
    // Q=1.5 m³/s, n=0.013, S=0.005, z=1
    const D = solveFlowDepth(1.5, 0.013, 0.005, 1)
    expect(D).toBeGreaterThan(0)
    expect(D).toBeLessThan(5)
  })

  it('verifies solution satisfies Manning equation within tolerance', () => {
    const Q = 2.0
    const n = 0.013
    const S = 0.003
    const z = 1.0
    const D = solveFlowDepth(Q, n, S, z)
    const B = 2 * D
    const A = trapezoidalArea(B, z, D)
    const P = trapezoidalWettedPerimeter(B, z, D)
    const R = A / P
    const Qcheck = manningsDischarge(n, A, R, S)
    expect(Math.abs(Qcheck - Q)).toBeLessThan(0.001)
  })

  it('throws for zero discharge', () => {
    expect(() => solveFlowDepth(0, 0.013, 0.005, 1)).toThrow()
  })
})

describe('runChannelDesign', () => {
  it('returns all required fields', () => {
    const result = runChannelDesign(1.0, {
      manningsN: 0.013,
      sideSlope: 1.0,
      channelSlope: 0.005,
    })
    expect(result.flowDepth).toBeGreaterThan(0)
    expect(result.baseWidth).toBeCloseTo(result.flowDepth * 2, 4)
    expect(result.freeboard).toBeGreaterThan(0)
    expect(result.velocity).toBeGreaterThan(0)
    expect(result.froudeNumber).toBeGreaterThan(0)
    expect(['subcritical', 'critical', 'supercritical']).toContain(result.flowRegime)
    expect(['acceptable', 'sedimentation_risk', 'erosion_risk']).toContain(result.velocityStatus)
  })

  it('freeboard is 0.30m for Q < 0.5', () => {
    const result = runChannelDesign(0.3, {
      manningsN: 0.013,
      sideSlope: 1.0,
      channelSlope: 0.005,
    })
    expect(result.freeboard).toBe(0.30)
  })

  it('freeboard is 0.50m for Q between 0.5 and 5.0', () => {
    const result = runChannelDesign(1.5, {
      manningsN: 0.013,
      sideSlope: 1.0,
      channelSlope: 0.005,
    })
    expect(result.freeboard).toBe(0.50)
  })
})