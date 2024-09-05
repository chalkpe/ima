import { createInitialState } from '@ima/server/helpers/game'
import type { GameState } from '@ima/server/types/game'
import { codeSyntaxToHand } from '@ima/server/helpers/code'
import { simpleTileToRiverTile, simpleTileToTile } from '@ima/server/helpers/tile'
import {
  calculateAnkanDecisions,
  calculateChiDecisions,
  calculateGakanDecisions,
  calculatePonDaiminkanDecisions,
  calculateRonDecisions,
} from '@ima/server/helpers/decision'
import { combinations } from '@ima/server/helpers/common'

describe('decision', () => {
  const i = createInitialState()
  const c = (tiles: string) => codeSyntaxToHand(tiles).map(simpleTileToTile)
  const r = (tiles: string) => codeSyntaxToHand(tiles).map(simpleTileToRiverTile)

  const s = (hand: string, river: string, riichi = false): GameState => ({
    ...i,
    guest: { ...i.guest, river: r(river) },
    host: { ...i.host, riichi: riichi ? 2 : null, hand: { ...i.host.hand, closed: c(hand) } },
  })

  describe('calculateChiDecisions', () => {
    test('returns empty array if riichi', () => {
      expect(calculateChiDecisions(s('1255p', '3p', true), 'host')).toEqual([])
    })
    test('returns empty array if no tiles in opponent river', () => {
      expect(calculateChiDecisions(s('1255p', ''), 'host')).toEqual([])
    })
    test('returns empty array if no tiles will left after call', () => {
      expect(calculateChiDecisions(s('12p', '3p'), 'host')).toEqual([])
    })
    test('returns chi decisions', () => {
      expect(calculateChiDecisions(s('1255p', '3p'), 'host')).toEqual([
        { type: 'chi', tile: c('3p')[0], otherTiles: c('12p') },
      ])
    })
    test('returns multiple chi decisions', () => {
      expect(calculateChiDecisions(s('1234567p', '4p'), 'host')).toEqual([
        { type: 'chi', tile: c('4p')[0], otherTiles: c('23p') },
        { type: 'chi', tile: c('4p')[0], otherTiles: c('35p') },
        { type: 'chi', tile: c('4p')[0], otherTiles: c('56p') },
      ])
    })
    test('returns every possible combinations of chi decisions', () => {
      const state = s('5556667p', '4p')

      const five = state.host.hand.closed.filter((t) => t.value === 5)
      five[0].attribute = 'red'

      const six = state.host.hand.closed.filter((t) => t.value === 6)
      six[0].attribute = 'red'

      expect(calculateChiDecisions(state, 'host')).toEqual(
        combinations([
          [five[0], five[1]],
          [six[0], six[1]],
        ]).map((otherTiles) => ({ type: 'chi', tile: c('4p')[0], otherTiles }))
      )
    })
  })

  describe('calculatePonDaiminkanDecisions', () => {
    test('returns empty array if riichi', () => {
      expect(calculatePonDaiminkanDecisions(s('1155p', '1p', true), 'host')).toEqual([])
    })
    test('returns empty array if no tiles in opponent river', () => {
      expect(calculatePonDaiminkanDecisions(s('1255p', ''), 'host')).toEqual([])
    })
    test('returns empty array if no tiles will left after call', () => {
      expect(calculatePonDaiminkanDecisions(s('11p', '1p'), 'host')).toEqual([])
      expect(calculatePonDaiminkanDecisions(s('111p', '1p'), 'host')).toEqual([])
    })
    test('returns pon and daiminkan decisions', () => {
      expect(calculatePonDaiminkanDecisions(s('1115p', '1p'), 'host')).toEqual([
        { type: 'daiminkan', tile: c('1p')[0], otherTiles: c('111p') },
        { type: 'pon', tile: c('1p')[0], otherTiles: c('11p') },
      ])
    })
    test('returns pon decisions', () => {
      expect(calculatePonDaiminkanDecisions(s('1155p', '1p'), 'host')).toEqual([
        { type: 'pon', tile: c('1p')[0], otherTiles: c('11p') },
      ])
    })
  })

  describe('calculateGakanDecisions', () => {
    const ss = (hand: string, tsumo: string, pon?: string, riichi = false): GameState => {
      const state = s(hand, '', riichi)
      state.host.hand.tsumo = c(tsumo)[0]
      if (pon) state.host.hand.called.push({ type: 'pon', tiles: c(pon), calledTile: c(pon)[0], jun: 1 })
      return state
    }

    test('returns empty array if riichi', () => {
      expect(calculateGakanDecisions(ss('55p', '1p', '111p', true), 'host')).toEqual([])
    })

    test('returns empty array if no pon call', () => {
      expect(calculateGakanDecisions(ss('55p', '5p'), 'host')).toEqual([])
    })

    test('returns gakan decisions', () => {
      expect(calculateGakanDecisions(ss('55p', '5p', '111p'), 'host')).toEqual([])
      expect(calculateGakanDecisions(ss('55p', '1p', '111p'), 'host')).toEqual([{ type: 'gakan', tile: c('1p')[0] }])
    })
  })

  describe('calculateAnkanDecisions', () => {
    const cc = (tile: string, index?: number) => {
      const t = c(tile)
      if (index) t[0].index = index
      return t[0]
    }

    const ss = (hand: string, tsumo: string, riichi = false): GameState => {
      const state = s(hand, '', riichi)
      state.host.hand.tsumo = cc(tsumo, riichi ? 1234 : undefined)
      return state
    }

    test('returns empty array if no kantsu', () => {
      expect(calculateAnkanDecisions(ss('1112p', '2p'), 'host')).toEqual([])
    })

    test('returns empty array if riichi and kantsu not includes tsumo', () => {
      expect(calculateAnkanDecisions(ss('111m222234p777s1z', '1p', true), 'host')).toEqual([])
    })

    test('returns ankan decisions if riichi and ankan will not change tenpai form', () => {
      expect(calculateAnkanDecisions(ss('23456789m111p11s', '1p', true), 'host')).toEqual([
        { type: 'ankan', tile: cc('1p', 1234), otherTiles: c('111p') },
      ])
    })

    test('returns empty array if riichi and ankan will change tenpai form', () => {
      expect(calculateAnkanDecisions(ss('111m222234p777s1z', '5p', true), 'host')).toEqual([])
      expect(calculateAnkanDecisions(ss('1112p', '1p', true), 'host')).toEqual([])
      expect(calculateAnkanDecisions(ss('2224p', '2p', true), 'host')).toEqual([])
    })

    test('returns ankan decisions', () => {
      expect(calculateAnkanDecisions(ss('1112p', '1p'), 'host')).toEqual([
        { type: 'ankan', tile: c('1p')[0], otherTiles: c('111p') },
      ])
    })

    test('returns multiple ankan decisions', () => {
      expect(calculateAnkanDecisions(ss('1111p111s', '1s'), 'host')).toEqual([
        { type: 'ankan', tile: c('1p')[0], otherTiles: c('111p') },
        { type: 'ankan', tile: c('1s')[0], otherTiles: c('111s') },
      ])
    })
  })

  describe('calculateRonDecisions', () => {
    const ss = (hand: string, opponentRiver: string, meRiver?: string): GameState => {
      const state = s(hand, opponentRiver, false)
      if (meRiver) state.host.river = r(meRiver)
      return state
    }

    test('returns empty array if no tiles in opponent river', () => {
      expect(calculateRonDecisions(ss('1p', ''), 'host')).toEqual([])
    })

    test('returns empty array if not agari', () => {
      expect(calculateRonDecisions(ss('1p', '2p'), 'host')).toEqual([])
    })

    test('returns empty array if furiten', () => {
      expect(calculateRonDecisions(ss('1p', '1p', '1p'), 'host')).toEqual([])
    })

    test('returns empty array if no yaku', () => {
      // TODO
    })

    test('returns ron decisions', () => {
      expect(calculateRonDecisions(ss('1112345678999p', '1p'), 'host')).toEqual([{ type: 'ron', tile: c('1p')[0] }])
    })
  })
})
