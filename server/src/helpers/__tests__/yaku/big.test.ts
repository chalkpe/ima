import { codeSyntaxToHand } from '@ima/server/helpers/code'
import { createInitialState } from '@ima/server/helpers/game'
import { isSyuntsu, simpleTileToTile } from '@ima/server/helpers/tile'
import { calculateYaku } from '@ima/server/helpers/yaku'
import type { GameState } from '@ima/server/types/game'
import type { Syuntsu } from '@ima/server/types/tile'
import type { AgariType } from '@ima/server/types/yaku'

describe('yaku', () => {
  describe('calculateYaku (value: 3+)', () => {
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

    test.concurrent('honitsu', () => {
      expect(calc('111234567m3444z3z', [], 'ron')).toMatchObject([{ name: '혼일색', han: 3 }])
      expect(calc('234555m3444z3z', ['111m'], 'ron')).toMatchObject([{ name: '혼일색', han: 2 }])
    })

    test.concurrent('chinitsu', () => {
      expect(calc('1112345553456m3m', [], 'ron')).toMatchObject([{ name: '청일색', han: 6 }])
      expect(calc('2345553444m3m', ['111m'], 'ron')).toMatchObject([{ name: '청일색', han: 5 }])
    })

    test.concurrent('ryanpeikou', () => {
      expect(calc('11223344556677m', [], 'ron')).toMatchObject([
        { name: '핑후', han: 1 },
        { name: '청일색', han: 6 },
        { name: '량페코', han: 3 },
      ])
    })

    test.concurrent('yaochuuhai (junchan)', () => {
      expect(calc('123789m123789p11s', [], 'ron')).toMatchObject([{ name: '준찬타', han: 3 }])
      expect(calc('789m123789p11s', ['123m'], 'ron')).toMatchObject([{ name: '준찬타', han: 2 }])
    })
  })
})
