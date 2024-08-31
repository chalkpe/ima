import { codeSyntaxToHand } from '../code'
import { countTiles, getLowerTile, getUpperTile, isEqualTile, removeTileFromHand, removeTilesFromHand, syuupaiTypes, zihaiTypes } from '../tile'

describe('tile', () => {
  describe('countTiles', () => {
    test('should return the count of tiles', () => {
      expect(countTiles(codeSyntaxToHand('11123456789999m'))).toEqual({
        '1m': 3,
        '2m': 1,
        '3m': 1,
        '4m': 1,
        '5m': 1,
        '6m': 1,
        '7m': 1,
        '8m': 1,
        '9m': 4,
      })
    })
  })

  describe('isEqualTile', () => {
    test('should return true if the tiles are same', () => {
      expect(isEqualTile({ type: 'man', value: 1 }, { type: 'man', value: 1 })).toBeTruthy()
    })
    test('should return false if the tile type is different', () => {
      expect(isEqualTile({ type: 'dragon', value: 1 }, { type: 'sou', value: 1 })).toBeFalsy()
    })
    test('should return false if the tile value is different', () => {
      expect(isEqualTile({ type: 'pin', value: 1 }, { type: 'pin', value: 9 })).toBeFalsy()
    })
    test('should return false if the tiles are different', () => {
      expect(isEqualTile({ type: 'wind', value: 1 }, { type: 'back', value: 0 })).toBeFalsy()
    })
  })

  describe('removeTileFromHand', () => {
    test('should return the removed tiles', () => {
      const hand = codeSyntaxToHand('11123456789999m')
      const target = codeSyntaxToHand('1m')[0]

      const [remain, removed] = removeTileFromHand(hand, target, 2)
      expect(remain).toEqual(codeSyntaxToHand('123456789999m'))
      expect(removed).toEqual(codeSyntaxToHand('11m'))
    })
  })

  describe('removeTilesFromHand', () => {
    test('should return the removed tiles', () => {
      const hand = codeSyntaxToHand('11123456789999m')
      const targets = [[codeSyntaxToHand('1m')[0], 2], [codeSyntaxToHand('9m')[0], 5]] as const

      const [remain, removed] = removeTilesFromHand(hand, targets)
      expect(remain).toEqual(codeSyntaxToHand('12345678m'))
      expect(removed).toEqual([codeSyntaxToHand('11m'), codeSyntaxToHand('9999m')])
    })
    test('should return the removed tiles (syuntsu)', () => {
      const hand = codeSyntaxToHand('11123456789999m')
      const targets = [[codeSyntaxToHand('2m')[0], 1], [codeSyntaxToHand('3m')[0], 1], [codeSyntaxToHand('4m')[0], 1]] as const

      const [remain, removed] = removeTilesFromHand(hand, targets)
      expect(remain).toEqual(codeSyntaxToHand('11156789999m'))
      expect(removed).toEqual([codeSyntaxToHand('2m'), codeSyntaxToHand('3m'), codeSyntaxToHand('4m')])
    })
    test('should return the removed tiles with duplicated target', () => {
      const hand = codeSyntaxToHand('11123456789999m')
      const targets = [[codeSyntaxToHand('9m')[0], 3], [codeSyntaxToHand('9m')[0], 2 ]] as const

      const [remain, removed] = removeTilesFromHand(hand, targets)
      expect(remain).toEqual(codeSyntaxToHand('1112345678m'))
      expect(removed).toEqual([codeSyntaxToHand('999m'), codeSyntaxToHand('9m')])
    })
    test('should return the empty array if there is no target', () => {
      const hand = codeSyntaxToHand('11123456789999m')
      const targets = [[codeSyntaxToHand('1s')[0], 2], [codeSyntaxToHand('2s')[0], 3]] as const

      const [remain, removed] = removeTilesFromHand(hand, targets)
      expect(remain).toEqual(codeSyntaxToHand('11123456789999m'))
      expect(removed).toEqual([[], []])
    })
  })

  describe('getLowerTile', () => {
    test.each(syuupaiTypes)('should return undefined if the tile is 1 (%s)', (type) => {
      expect(getLowerTile({ type, value: 1 })).toBeUndefined()
    })

    test('should return undefined if the tile is invalid value', () => {
      expect(getLowerTile({ type: 'man', value: 0 })).toBeUndefined()
    })

    test.each([2, 3, 4, 5, 6, 7, 8, 9])('should return the lower tile (%d)', (value) => {
      expect(getLowerTile({ type: 'man', value })).toEqual({ type: 'man', value: value - 1 })
    })

    test.each(zihaiTypes)('should return undefined if the tile is not syuupai (%s)', (type) => {
      expect(getLowerTile({ type, value: 2 })).toBeUndefined()
    })
  })

  describe('getUpperTile', () => {
    test.each(syuupaiTypes)('should return undefined if the tile is 9 (%s)', (type) => {
      expect(getUpperTile({ type, value: 9 })).toBeUndefined()
    })

    test('should return undefined if the tile is invalid value', () => {
      expect(getUpperTile({ type: 'man', value: 10 })).toBeUndefined()
    })

    test.each([1, 2, 3, 4, 5, 6, 7, 8])('should return the upper tile (%d)', (value) => {
      expect(getUpperTile({ type: 'man', value })).toEqual({ type: 'man', value: value + 1 })
    })

    test.each(zihaiTypes)('should return undefined if the tile is not syuupai (%s)', (type) => {
      expect(getUpperTile({ type, value: 2 })).toBeUndefined()
    })
  })
})
