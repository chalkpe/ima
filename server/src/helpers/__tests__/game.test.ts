import { codeSyntaxToHand } from '@ima/server/helpers/code'
import { simpleTileToRiverTile, simpleTileToTile } from '@ima/server/helpers/tile'
import { getActiveMe, getClosedHand, getOpponent, getRiverEnd } from '@ima/server/helpers/game'
import type { Hand, Player, Room } from '@ima/server/types/game'

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
        } as Hand)
      ).toEqual(codeSyntaxToHand('1234m').map(simpleTileToTile))
      expect(
        getClosedHand({
          closed: codeSyntaxToHand('123m').map(simpleTileToTile),
          tsumo: undefined,
        } as Hand)
      ).toEqual(codeSyntaxToHand('123m').map(simpleTileToTile))
    })
  })

  describe('getRiverEnd', () => {
    test('should return the end of the river', () => {
      expect(getRiverEnd({ river: codeSyntaxToHand('123m').map(simpleTileToRiverTile) } as Player)).toEqual(
        codeSyntaxToHand('3m').map(simpleTileToRiverTile)[0]
      )
    })
    test('should return undefined if the river is empty', () => {
      expect(getRiverEnd({ river: [].map(simpleTileToRiverTile) } as Player)).toBeUndefined()
    })
  })

  describe('getActiveMe', () => {
    test('should work on host', () => {
      expect(getActiveMe({ host: 'a', guest: 'b', state: { turn: 'host' } } as Room, 'a')).toBe('host')
      expect(() => getActiveMe({ host: 'a', guest: 'b', state: { turn: 'guest' } } as Room, 'a')).toThrow()
    })
    test('should work on guest', () => {
      expect(() => getActiveMe({ host: 'a', guest: 'b', state: { turn: 'host' } } as Room, 'b')).toThrow()
      expect(getActiveMe({ host: 'a', guest: 'b', state: { turn: 'guest' } } as Room, 'b')).toBe('guest')
    })
  })
})
