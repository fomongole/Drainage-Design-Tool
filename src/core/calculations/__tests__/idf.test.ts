import { describe, it, expect } from 'vitest'
import {
  calculateHourlyReferenceIntensity,
  calculateIntensityAtDuration,
  generateIDFTable,
} from '../idf'

describe('calculateHourlyReferenceIntensity', () => {
  it('returns 70% of the rainfall depth', () => {
    expect(calculateHourlyReferenceIntensity(100)).toBeCloseTo(70, 5)
  })

  it('throws for zero depth', () => {
    expect(() => calculateHourlyReferenceIntensity(0)).toThrow()
  })
})

describe('calculateIntensityAtDuration', () => {
  it('returns i60 at exactly 60 minutes', () => {
    const i = calculateIntensityAtDuration(70, 60)
    expect(i).toBeCloseTo(70, 5)
  })

  it('intensity increases as duration decreases', () => {
    const i30 = calculateIntensityAtDuration(70, 30)
    const i60 = calculateIntensityAtDuration(70, 60)
    expect(i30).toBeGreaterThan(i60)
  })
})

describe('generateIDFTable', () => {
  it('returns exactly 13 rows', () => {
    const table = generateIDFTable(100, 30)
    expect(table).toHaveLength(13)
  })

  it('marks exactly one row as design duration', () => {
    const table = generateIDFTable(100, 30)
    const designRows = table.filter((r) => r.isDesignDuration)
    expect(designRows).toHaveLength(1)
  })

  it('intensities decrease as duration increases', () => {
    const table = generateIDFTable(100, 60)
    for (let i = 1; i < table.length; i++) {
      expect(table[i]!.intensity).toBeLessThan(table[i - 1]!.intensity)
    }
  })
})