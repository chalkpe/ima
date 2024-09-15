import { codeSyntaxToHand } from '@ima/server/helpers/code'
import { simpleTileToRiverTile, simpleTileToTile } from '@ima/server/helpers/tile'
import {
  createInitialState,
  getActiveMe,
  getAvailableTiles,
  getClosedHand,
  getNextWind,
  getOpponent,
  getRiverEnd,
  isKuikae,
} from '@ima/server/helpers/game'
import { c } from '@ima/server/helpers/__utils__/tile'
import type { Hand, Player, Room, Rule } from '@ima/server/types/game'

describe('helpers/game', () => {
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

  describe('getNextWind', () => {
    const ss = (length: Rule['length']) => {
      const state = createInitialState()
      state.rule.length = length
      return state
    }

    test('should return the next wind (east)', () => {
      expect(getNextWind(ss('east'), 'east')).toBeUndefined()
      expect(getNextWind(ss('south'), 'east')).toBe('south')
      expect(getNextWind(ss('north'), 'east')).toBe('south')
    })
    test('should return the next wind (south)', () => {
      expect(getNextWind(ss('east'), 'south')).toBeUndefined()
      expect(getNextWind(ss('south'), 'south')).toBeUndefined()
      expect(getNextWind(ss('north'), 'south')).toBe('west')
    })
    test('should return the next wind (west)', () => {
      expect(getNextWind(ss('east'), 'west')).toBeUndefined()
      expect(getNextWind(ss('south'), 'west')).toBeUndefined()
      expect(getNextWind(ss('north'), 'west')).toBe('north')
    })
    test('should return the next wind (north)', () => {
      expect(getNextWind(ss('east'), 'north')).toBeUndefined()
      expect(getNextWind(ss('south'), 'north')).toBeUndefined()
      expect(getNextWind(ss('north'), 'north')).toBeUndefined()
    })
  })

  describe('getAvailableTiles', () => {
    test('should return the available tiles', () => {
      const s = createInitialState()
      expect(getAvailableTiles(s)).toHaveLength(80)
    })

    test('should return transparent tiles', () => {
      const s = createInitialState()
      s.rule.transparentMode = true
      expect(getAvailableTiles(s).filter((s) => s.background === 'transparent')).toHaveLength(60)
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
      i.guest.jun = 3
      i.host.hand.closed = c('4m')

      const tiles = c('456m')
      i.host.hand.called = [{ type: 'chi', tiles, calledTile: tiles[0], jun: 1 }]
      expect(isKuikae(i, 'host', i.host.hand.closed[0])).toBe(false)
    })

    test('should return false if call does not have calledTile', () => {
      const i = createInitialState()
      i.guest.jun = 1
      i.host.hand.closed = c('4m')

      const tiles = c('444m')
      i.host.hand.called = [{ type: 'pon', tiles, jun: 1 }]
      expect(isKuikae(i, 'host', i.host.hand.closed[0])).toBe(false)
    })

    test('should return false if call is not pon chi', () => {
      const i = createInitialState()
      i.guest.jun = 1
      i.host.hand.closed = c('4m')

      const tiles = c('4444m')
      i.host.hand.called = [{ type: 'gakan', tiles, calledTile: tiles[3], jun: 1 }]
      expect(isKuikae(i, 'host', i.host.hand.closed[0])).toBe(false)
    })

    test('should return true if discard same tile (chi)', () => {
      const i = createInitialState()
      i.guest.jun = 1
      i.host.hand.closed = c('4m')

      const tiles = c('456m')
      i.host.hand.called = [{ type: 'chi', tiles, calledTile: tiles[0], jun: 1 }]
      expect(isKuikae(i, 'host', i.host.hand.closed[0])).toBe(true)
    })

    test('should return true if discard same tile (pon)', () => {
      const i = createInitialState()
      i.guest.jun = 1
      i.host.hand.closed = c('4m')

      const tiles = c('444m')
      i.host.hand.called = [{ type: 'pon', tiles, calledTile: tiles[0], jun: 1 }]
      expect(isKuikae(i, 'host', i.host.hand.closed[0])).toBe(true)
    })

    test('should return true if discard suji tile', () => {
      const i = createInitialState()
      i.guest.jun = 1
      i.host.hand.closed = c('7m')

      const tiles = c('456m')
      i.host.hand.called = [{ type: 'chi', tiles, calledTile: tiles[0], jun: 1 }]
      expect(isKuikae(i, 'host', i.host.hand.closed[0])).toBe(true)
    })
  })
})
