import { describe, expect, it } from 'vitest'
import { classifyQuadrant } from '../keyword-performance'

// posDelta < 0 = อันดับดีขึ้น (เลขน้อยลง) · trafficDelta > 0 = traffic เพิ่ม
describe('classifyQuadrant', () => {
  it('classifies the four quadrants', () => {
    expect(classifyQuadrant(-3, 20)).toBe('rising')
    expect(classifyQuadrant(2, 20)).toBe('hidden')
    expect(classifyQuadrant(-3, -20)).toBe('cooling')
    expect(classifyQuadrant(2, -20)).toBe('falling')
  })

  it('returns stagnant when nothing changed', () => {
    expect(classifyQuadrant(0, 0)).toBe('stagnant')
  })

  it('does not label "rank unchanged, traffic up" as falling', () => {
    expect(classifyQuadrant(0, 15)).toBe('hidden')
  })

  it('does not label "rank improved, traffic unchanged" as falling', () => {
    expect(classifyQuadrant(-4, 0)).toBe('rising')
  })

  it('keeps worsening-or-flat rank with falling/flat traffic as falling', () => {
    expect(classifyQuadrant(0, -15)).toBe('falling')
    expect(classifyQuadrant(4, 0)).toBe('falling')
  })
})
