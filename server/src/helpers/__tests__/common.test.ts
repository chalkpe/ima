import { combination, combinations, partition } from '@ima/server/helpers/common'

describe('common', () => {
  describe('partition', () => {
    test('should return the partitioned array', () => {
      expect(partition([1, 2, 3, 4, 5], (t) => t % 2 === 0)).toEqual([
        [2, 4],
        [1, 3, 5],
      ])
    })
  })

  describe('combination', () => {
    test('should return the combinations of the array', () => {
      expect(combination([1, 2, 3, 4])).toEqual([
        [1, 2],
        [1, 3],
        [1, 4],
        [2, 3],
        [2, 4],
        [3, 4],
      ])
    })
  })

  describe('combinations', () => {
    test('should return the combinations of the sets', () => {
      expect(
        combinations([
          [1, 2],
          [3, 4],
        ])
      ).toEqual([
        [1, 3],
        [1, 4],
        [2, 3],
        [2, 4],
      ])
    })
  })
})
