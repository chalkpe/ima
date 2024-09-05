import { codeSyntaxToHand } from '@ima/server/helpers/code'
import { createInitialState } from '@ima/server/helpers/game'
import { isSyuntsu, simpleTileToTile } from '@ima/server/helpers/tile'
import { calculateYaku } from '@ima/server/helpers/yaku'
import type { GameState } from '@ima/server/types/game'
import type { Syuntsu } from '@ima/server/types/tile'
import type { AgariType } from '@ima/server/types/yaku'

describe('yaku', () => {
  describe('calculateYaku (pinfu)', () => {
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

    test.concurrent('valid cases', () => {
      expect(calc('234m345p23344s44z5s', [], 'ron')).toMatchObject([{ name: '핑후', han: 1 }])
      expect(
        calc('345m234p23344s11z5s', [], 'ron', {
          ...initialState,
          round: { ...initialState.round, wind: 'south' },
          host: { ...initialState.host, wind: 'west' },
        })
      ).toMatchObject([{ name: '핑후', han: 1 }])
    })

    test.concurrent('invalid case (has koutsu', () => {
      expect(calc('222m345p23344s44z5s', [], 'ron')).toMatchObject([])
    })

    test.concurrent('invalid case (kanchan machi)', () => {
      expect(calc('234m345p24567s44z3s', [], 'ron')).toMatchObject([])
    })

    test.concurrent('invalid case (not menzen)', () => {
      expect(calc('234p23344s44z5s', ['345m'], 'ron')).toMatchObject([])
    })

    test.concurrent('invalid case (toitsu is yakuhai)', () => {
      expect(calc('234m345p23344s11z5s', [], 'ron')).toMatchObject([])
      expect(calc('234m345p23344s55z5s', [], 'ron')).toMatchObject([])
    })
  })
})
