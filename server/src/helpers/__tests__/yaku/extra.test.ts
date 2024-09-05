import { codeSyntaxToHand } from '@ima/server/helpers/code'
import { createInitialState } from '@ima/server/helpers/game'
import { isSyuntsu, simpleTileToTile } from '@ima/server/helpers/tile'
import { calculateYaku } from '@ima/server/helpers/yaku'
import type { GameState } from '@ima/server/types/game'
import type { Syuntsu } from '@ima/server/types/tile'
import type { AgariType } from '@ima/server/types/yaku'

describe('yaku', () => {
  describe('calculateYaku (extra)', () => {
    let index = 0
    const initialState = createInitialState()

    const c = (code: string) =>
      codeSyntaxToHand(code)
        .map(simpleTileToTile)
        .map((tile) => ({ ...tile, index: index++ }))

    const calc = (closedhand: string, calledHands: string[], type: AgariType, state: GameState = initialState) => {
      const agari = c(closedhand)

      const s = { ...state }
      s.host.hand.closed = agari.slice(0, -1)
      s.host.hand.called = calledHands.map(c).map((hand) => {
        if (hand.length === 5) return { type: 'ankan', tiles: [hand[0], hand[1], hand[2], hand[3]], jun: 0 }
        if (hand.length === 4) return { type: 'gakan', tiles: [hand[0], hand[1], hand[2], hand[3]], jun: 0 }
        if (hand.length === 3) {
          const tsu = [hand[0], hand[1], hand[2]] as Syuntsu
          return isSyuntsu(tsu) ? { type: 'chi', tiles: tsu, jun: 0 } : { type: 'pon', tiles: tsu, jun: 0 }
        }
        throw new Error('invalid hand')
      })

      return calculateYaku(state, 'host', state.host.hand, type, agari.slice(-1)[0])
    }

    test.concurrent('noten', () => {
      expect(calc('135m135p135s123z', [], 'ron')).toMatchObject([])
    })

    test.concurrent('muyaku', () => {
      expect(calc('234m345p23344s11z5s', [], 'ron')).toMatchObject([])
    })

    test.concurrent('dora', () => {
      expect(
        calc('123m234555p11s444z', [], 'ron', {
          ...initialState,
          wall: { ...initialState.wall, kingTiles: c('1234567899s'), doraCount: 1 },
        })
      ).toMatchObject([{ name: '도라', han: 2, isExtra: true }])
      expect(
        calc('123m234555p11s', ['4444z'], 'ron', {
          ...initialState,
          wall: { ...initialState.wall, kingTiles: c('1234567899s'), doraCount: 1 },
        })
      ).toMatchObject([{ name: '도라', han: 2, isExtra: true }])
    })

    test.concurrent('ura dora', () => {
      expect(
        calc('123m234555p11s444z', [], 'ron', {
          ...initialState,
          host: { ...initialState.host, riichi: 2 },
          wall: { ...initialState.wall, kingTiles: c('1234567899s'), doraCount: 1 },
        })
      ).toMatchObject([
        { name: '리치', han: 1 },
        { name: '도라', han: 2, isExtra: true },
        { name: '뒷도라', han: 2, isExtra: true },
      ])
    })

    test.concurrent('aka dora', () => {
      expect(
        calculateYaku(
          initialState,
          'host',
          {
            ...initialState.host.hand,
            closed: c('123m234555p444z').concat({
              type: 'sou',
              value: 5,
              attribute: 'red',
              background: 'white',
              index: index++,
            }),
          },
          'ron',
          c('5s')[0]
        )
      ).toMatchObject([{ name: '적도라', han: 1, isExtra: true }])
    })
  })
})
