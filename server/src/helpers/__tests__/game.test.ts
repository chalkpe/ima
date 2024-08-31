import { codeSyntaxToHand } from '../code'
import { getClosedHand, getOpponent } from '../game'
import { simpleTileToTile } from '../tile'

describe('game', () => {
  describe('getOpponent', () => {
    test('should return the opponent', () => {
      expect(getOpponent('host')).toBe('guest')
      expect(getOpponent('guest')).toBe('host')
    })
  })

  describe('getClosedHand', () => {
    test('should return the closed hand', () => {
      expect(
        getClosedHand({
          closed: codeSyntaxToHand('123m').map(simpleTileToTile),
          tsumo: codeSyntaxToHand('4m').map(simpleTileToTile)[0],
          called: [],
          tenpai: [],
        })
      ).toEqual(codeSyntaxToHand('1234m').map(simpleTileToTile))
      expect(
        getClosedHand({
          closed: codeSyntaxToHand('123m').map(simpleTileToTile),
          tsumo: undefined,
          called: [],
          tenpai: [],
        })
      ).toEqual(codeSyntaxToHand('123m').map(simpleTileToTile))
    })
  })
})
