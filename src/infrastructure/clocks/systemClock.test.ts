import { describe, expect, it } from 'vitest'
import { systemClock } from './systemClock'

describe('systemClock', () => {
  it('returns Date instances', () => {
    expect(systemClock.now()).toBeInstanceOf(Date)
  })
})
