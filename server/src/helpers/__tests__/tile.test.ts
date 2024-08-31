import { codeSyntaxToHand } from '../code'
import { countTiles, isEqualTile, removeTileFromHand } from '../tile'

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
})
