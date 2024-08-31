import { partition } from '../common'

describe('common', () => {
  describe('partition', () => {
    test('should return the partitioned array', () => {
      expect(partition([1, 2, 3, 4, 5], (t) => t % 2 === 0)).toEqual([
        [2, 4],
        [1, 3, 5],
      ])
    })
  })
})
