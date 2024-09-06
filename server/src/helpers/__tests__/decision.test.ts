import { createInitialState } from '@ima/server/helpers/game'
import {
  calculateAnkanDecisions,
  calculateChankanDecisions,
  calculateChiDecisions,
  calculateGakanDecisions,
  calculatePonDaiminkanDecisions,
  calculateRiichiDecisions,
  calculateRonDecisions,
  calculateTsumoDecisions,
} from '@ima/server/helpers/decision'
import { combinations } from '@ima/server/helpers/common'
import { c, r } from '@ima/server/helpers/__utils__/tile'
import type { GameState, TileSet } from '@ima/server/types/game'

describe('decision', () => {
  const s = (hand: string, river: string, riichi = false): GameState => {
    const i = createInitialState()
    return {
      ...i,
      wall: { ...i.wall, tiles: c('1234567z') },
      guest: { ...i.guest, river: r(river) },
      host: { ...i.host, riichi: riichi ? 2 : null, hand: { ...i.host.hand, closed: c(hand) } },
    }
  }

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
      const state = s('1255p', '3p')
      expect(calculateChiDecisions(state, 'host')).toEqual([
        {
          type: 'chi',
          tile: state.guest.river[0].tile,
          otherTiles: [state.host.hand.closed[0], state.host.hand.closed[1]], // 12p
        },
      ])
    })
    test('returns multiple chi decisions', () => {
      const state = s('1234567p', '4p')
      expect(calculateChiDecisions(state, 'host')).toEqual([
        {
          type: 'chi',
          tile: state.guest.river[0].tile,
          otherTiles: [state.host.hand.closed[1], state.host.hand.closed[2]], // 23p
        },
        {
          type: 'chi',
          tile: state.guest.river[0].tile,
          otherTiles: [state.host.hand.closed[2], state.host.hand.closed[4]], // 35p
        },
        {
          type: 'chi',
          tile: state.guest.river[0].tile,
          otherTiles: [state.host.hand.closed[4], state.host.hand.closed[5]], // 56p
        },
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
        ]).map((otherTiles) => ({ type: 'chi', tile: state.guest.river[0].tile, otherTiles }))
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
      const state = s('1115p', '1p')
      expect(calculatePonDaiminkanDecisions(state, 'host')).toEqual([
        {
          type: 'daiminkan',
          tile: state.guest.river[0].tile,
          otherTiles: [state.host.hand.closed[0], state.host.hand.closed[1], state.host.hand.closed[2]], // 111p
        },
        {
          type: 'pon',
          tile: state.guest.river[0].tile,
          otherTiles: [state.host.hand.closed[0], state.host.hand.closed[1]], // 11p
        },
      ])
    })
    test('returns pon decisions', () => {
      const state = s('1155p', '1p')
      expect(calculatePonDaiminkanDecisions(state, 'host')).toEqual([
        {
          type: 'pon',
          tile: state.guest.river[0].tile,
          otherTiles: [state.host.hand.closed[0], state.host.hand.closed[1]], // 11p
        },
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
      expect(calculateGakanDecisions(ss('55p', '5p', '111p'), 'host')).toEqual([])
    })

    test('returns gakan decisions', () => {
      const state = ss('55p', '1p', '111p')
      expect(calculateGakanDecisions(state, 'host')).toEqual([{ type: 'gakan', tile: state.host.hand.tsumo }])
    })
  })

  describe('calculateAnkanDecisions', () => {
    const ss = (hand: string, tsumo: string, riichi = false): GameState => {
      const state = s(hand, '', riichi)
      state.host.hand.tsumo = c(tsumo)[0]
      return state
    }

    test('returns empty array if no kantsu', () => {
      expect(calculateAnkanDecisions(ss('1112p', '2p'), 'host')).toEqual([])
    })

    test('returns empty array if riichi and kantsu not includes tsumo', () => {
      expect(calculateAnkanDecisions(ss('111m222234p777s1z', '1p', true), 'host')).toEqual([])
    })

    test('returns empty array if riichi and ankan will change tenpai form', () => {
      expect(calculateAnkanDecisions(ss('111m222234p777s1z', '5p', true), 'host')).toEqual([])
      expect(calculateAnkanDecisions(ss('1112p', '1p', true), 'host')).toEqual([])
      expect(calculateAnkanDecisions(ss('2224p', '2p', true), 'host')).toEqual([])
    })

    test('returns ankan decisions if riichi and ankan will not change tenpai form', () => {
      const state = ss('23456789m111p11s', '1p', true)
      expect(calculateAnkanDecisions(state, 'host')).toEqual([
        {
          type: 'ankan',
          tile: state.host.hand.tsumo,
          otherTiles: [state.host.hand.closed[8], state.host.hand.closed[9], state.host.hand.closed[10]],
        },
      ])
    })

    test('returns ankan decisions', () => {
      const state = ss('1112p', '1p')
      expect(calculateAnkanDecisions(state, 'host')).toEqual([
        {
          type: 'ankan',
          tile: state.host.hand.tsumo,
          otherTiles: state.host.hand.closed.filter((t) => t.value === 1),
        },
      ])
    })

    test('returns multiple ankan decisions', () => {
      const state = ss('1111p111s', '1s')
      const sou = state.host.hand.closed.filter((t) => t.type === 'sou').sort((a, b) => a.index - b.index)
      const pin = state.host.hand.closed.filter((t) => t.type === 'pin').sort((a, b) => a.index - b.index)

      expect(calculateAnkanDecisions(state, 'host')).toEqual([
        { type: 'ankan', tile: pin[pin.length - 1], otherTiles: pin.slice(0, -1) },
        { type: 'ankan', tile: state.host.hand.tsumo, otherTiles: sou },
      ])
    })
  })

  describe('calculateRiichiDecisions', () => {
    const ss = (hand: string, tsumo: string, called?: TileSet[]): GameState => {
      const state = s(hand, '', false)
      state.host.hand.tsumo = c(tsumo)[0]
      if (called) state.host.hand.called = called
      return state
    }

    test('returns empty array if riichi', () => {
      expect(calculateRiichiDecisions(s('1122p', '', true), 'host')).toEqual([])
    })

    test('returns empty array if no tsumo', () => {
      expect(calculateRiichiDecisions(ss('1122p', ''), 'host')).toEqual([])
    })

    test('returns empty array if not menzen', () => {
      expect(calculateRiichiDecisions(ss('1122p', '1p', [{ type: 'chi', tiles: c('123p'), jun: 3 }]), 'host')).toEqual(
        []
      )
    })

    test('returns empty array if no tenpai', () => {
      expect(calculateRiichiDecisions(ss('1357p', '9p'), 'host')).toEqual([])
    })

    test('returns riichi decisions', () => {
      const state = ss('19m19p19s1234566z', '5m')
      expect(calculateRiichiDecisions(state, 'host')).toEqual([{ type: 'riichi', tile: state.host.hand.tsumo }])
    })

    test('returns multiple riichi decisions', () => {
      const state = ss('19m19p19s1234567z', '7z')
      expect(calculateRiichiDecisions(state, 'host')).toEqual(
        state.host.hand.closed.map((tile) => ({ type: 'riichi', tile }))
      )
    })
  })

  describe('calculateTsumoDecisions', () => {
    const ss = (hand: string, tsumo: string, called?: TileSet[]): GameState => {
      const state = s(hand, '')
      state.host.hand.tsumo = c(tsumo)[0]
      if (called) state.host.hand.called = called
      return state
    }

    test('returns empty array if no tsumo', () => {
      expect(calculateTsumoDecisions(ss('1234p', ''), 'host')).toEqual([])
    })

    test('returns empty array if not agari', () => {
      expect(calculateTsumoDecisions(ss('1234p', '2p'), 'host')).toEqual([])
    })

    test('returns empty array if no yaku', () => {
      expect(
        calculateTsumoDecisions(ss('234p345s1444z', '1z', [{ type: 'pon', tiles: c('111m'), jun: 3 }]), 'host')
      ).toEqual([])
    })

    test('returns empty array if under shibari', () => {
      expect(calculateTsumoDecisions(ss('111m234p345s1444z', '1z'), 'host')).toEqual([])
    })

    test('returns decisions', () => {
      const state = ss('111m111p111s1444z', '1z')
      expect(calculateTsumoDecisions(state, 'host')).toEqual([{ type: 'tsumo', tile: state.host.hand.tsumo }])
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
      expect(calculateRonDecisions(ss('111m234p345s1444z', '1z'), 'host')).toEqual([])
    })

    test('returns empty array if under shibari', () => {
      expect(calculateRonDecisions(ss('111m234p345s1444z', '1z'), 'host')).toEqual([])
    })

    test('returns ron decisions', () => {
      const state = ss('1112345678999p', '1p')
      expect(calculateRonDecisions(state, 'host')).toEqual([{ type: 'ron', tile: state.guest.river[0].tile }])
    })
  })

  describe('calculateChankanDecisions', () => {
    const ss = (hand: string, set?: { type: 'pon' | 'gakan' | 'ankan'; tile: string }): GameState => {
      const state = s(hand, '', false)
      if (set) {
        const { type, tile } = set
        const calledTile = c(tile)[0]
        const tiles = [...c(tile.repeat(type === 'pon' ? 2 : 3)), calledTile]
        state.guest.hand.called.push({ type, tiles, calledTile, jun: 3 })
      }
      return state
    }

    test('returns empty array if no opponent call', () => {
      expect(calculateChankanDecisions(ss('1123p'), 'host')).toEqual([])
    })

    test('returns empty array if not kan', () => {
      expect(calculateChankanDecisions(ss('1123p', { type: 'pon', tile: '4p' }), 'host')).toEqual([])
    })

    test('returns empty array if not agari', () => {
      expect(calculateChankanDecisions(ss('1123p', { type: 'gakan', tile: '5p' }), 'host')).toEqual([])
    })

    test('returns empty array if ankan and not kokushi', () => {
      expect(calculateChankanDecisions(ss('1123p', { type: 'ankan', tile: '4p' }), 'host')).toEqual([])
    })

    test('returns decisions', () => {
      const state = ss('1123p', { type: 'gakan', tile: '4p' })
      expect(calculateChankanDecisions(state, 'host')).toEqual([
        { type: 'ron', tile: state.guest.hand.called[0].calledTile },
        { type: 'skip_chankan' },
      ])
    })
  })
})
