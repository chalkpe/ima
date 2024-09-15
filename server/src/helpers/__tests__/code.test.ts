import { backTile, backTileCode, codeSyntaxToHand, codeToTile, tileToCode } from '@ima/server/helpers/code'

describe('helpers/code', () => {
  describe('tileToCode', () => {
    test('should return the tile', () => {
      expect(tileToCode({ type: 'man', value: 1 })).toEqual('1m')
      expect(tileToCode({ type: 'pin', value: 2 })).toEqual('2p')
      expect(tileToCode({ type: 'sou', value: 3 })).toEqual('3s')
      expect(tileToCode({ type: 'wind', value: 1 })).toEqual('1z')
      expect(tileToCode({ type: 'dragon', value: 1 })).toEqual('5z')
      expect(tileToCode(backTile)).toEqual(backTileCode)
    })
  })

  describe('codeToTile', () => {
    test('should return the tile', () => {
      expect(codeToTile('1m')).toEqual({ type: 'man', value: 1 })
      expect(codeToTile('2p')).toEqual({ type: 'pin', value: 2 })
      expect(codeToTile('3s')).toEqual({ type: 'sou', value: 3 })
      expect(codeToTile('1z')).toEqual({ type: 'wind', value: 1 })
      expect(codeToTile('5z')).toEqual({ type: 'dragon', value: 1 })
      expect(codeToTile(backTileCode)).toEqual(backTile)
    })
  })

  describe('codeSyntaxToHand', () => {
    test('should return the hand', () => {
      expect(codeSyntaxToHand('123m456p789s01234567z')).toEqual([
        { type: 'man', value: 1 },
        { type: 'man', value: 2 },
        { type: 'man', value: 3 },
        { type: 'pin', value: 4 },
        { type: 'pin', value: 5 },
        { type: 'pin', value: 6 },
        { type: 'sou', value: 7 },
        { type: 'sou', value: 8 },
        { type: 'sou', value: 9 },
        { type: 'back', value: 0 },
        { type: 'wind', value: 1 },
        { type: 'wind', value: 2 },
        { type: 'wind', value: 3 },
        { type: 'wind', value: 4 },
        { type: 'dragon', value: 1 },
        { type: 'dragon', value: 2 },
        { type: 'dragon', value: 3 },
      ])
    })
  })
})
