import { codeSyntaxToHand } from '@ima/server/helpers/code'
import { simpleTileToRiverTile, simpleTileToTile } from '@ima/server/helpers/tile'
import {
  createInitialState,
  getActiveMe,
  getClosedHand,
  getOpponent,
  getRiverEnd,
  isKuikae,
} from '@ima/server/helpers/game'
import type { Hand, Player, Room } from '@ima/server/types/game'
import { c } from '../__utils__/tile'

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
    test('should throw on scoreboard exists', () => {
      expect(() =>
        getActiveMe({ host: 'a', guest: 'b', state: { turn: 'host', scoreboard: {} } } as Room, 'a')
      ).toThrow()
      expect(() =>
        getActiveMe({ host: 'a', guest: 'b', state: { turn: 'guest', scoreboard: {} } } as Room, 'b')
      ).toThrow()
    })
  })

  describe('isKuikae', () => {
    test('should return false if no call', () => {
      const i = createInitialState()
      i.host.hand.closed = c('4456m')
      expect(isKuikae(i, 'host', i.host.hand.closed[0])).toBe(false)
    })

    test('should return false if no current call', () => {
      const i = createInitialState()
      i.host.jun = 3
      i.host.hand.closed = c('4m')

      const tiles = c('456m')
      i.host.hand.called = [{ type: 'chi', tiles, calledTile: tiles[0], jun: 1 }]
      expect(isKuikae(i, 'host', i.host.hand.closed[0])).toBe(false)
    })

    test('should return true if discard same tile (chi)', () => {
      const i = createInitialState()
      i.host.jun = 1
      i.host.hand.closed = c('4m')

      const tiles = c('456m')
      i.host.hand.called = [{ type: 'chi', tiles, calledTile: tiles[0], jun: 1 }]
      expect(isKuikae(i, 'host', i.host.hand.closed[0])).toBe(true)
    })

    test('should return true if discard same tile (pon)', () => {
      const i = createInitialState()
      i.host.jun = 1
      i.host.hand.closed = c('4m')

      const tiles = c('444m')
      i.host.hand.called = [{ type: 'pon', tiles, calledTile: tiles[0], jun: 1 }]
      expect(isKuikae(i, 'host', i.host.hand.closed[0])).toBe(true)
    })

    test('should return true if discard suji tile', () => {
      const i = createInitialState()
      i.host.jun = 1
      i.host.hand.closed = c('7m')

      const tiles = c('456m')
      i.host.hand.called = [{ type: 'chi', tiles, calledTile: tiles[0], jun: 1 }]
      expect(isKuikae(i, 'host', i.host.hand.closed[0])).toBe(true)
    })
  })
})
