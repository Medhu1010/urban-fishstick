import { describe, expect, it } from 'vitest'
import { cryptoIdProvider } from './cryptoIdProvider'

describe('cryptoIdProvider', () => {
  it('returns non-empty ids', () => {
    const id = cryptoIdProvider.nextId()

    expect(id).toBeTypeOf('string')
    expect(id.length).toBeGreaterThan(0)
  })
})
