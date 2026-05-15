import { describe, expect, it } from 'vitest'
import { sortByAvalanche, sortBySnowball } from '@/lib/calculations/payoff-strategy'

describe('lib/calculations/payoff-strategy', () => {
  it('TC-U-013 (AC-5.4): avalanche sorts by descending APR', () => {
    const input = [
      { id: 'a', apr: 18, balance: 500_000 },
      { id: 'b', apr: 36, balance: 200_000 },
      { id: 'c', apr: 12, balance: 800_000 },
    ]
    expect(sortByAvalanche(input).map((d) => d.id)).toEqual(['b', 'a', 'c'])
  })

  it('TC-U-014 (AC-5.5): snowball sorts by ascending balance', () => {
    const input = [
      { id: 'a', apr: 18, balance: 500_000 },
      { id: 'b', apr: 36, balance: 200_000 },
      { id: 'c', apr: 12, balance: 800_000 },
    ]
    expect(sortBySnowball(input).map((d) => d.id)).toEqual(['b', 'a', 'c'])
  })

  it('AC-5.4: avalanche does not mutate the input array', () => {
    const input = [
      { id: 'a', apr: 18, balance: 500_000 },
      { id: 'b', apr: 36, balance: 200_000 },
    ]
    const snapshot = [...input]
    sortByAvalanche(input)
    expect(input).toEqual(snapshot)
  })

  it('AC-5.5: snowball does not mutate the input array', () => {
    const input = [
      { id: 'a', apr: 18, balance: 500_000 },
      { id: 'b', apr: 36, balance: 200_000 },
    ]
    const snapshot = [...input]
    sortBySnowball(input)
    expect(input).toEqual(snapshot)
  })
})
