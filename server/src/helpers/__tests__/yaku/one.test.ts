import { codeSyntaxToHand } from '@ima/server/helpers/code'
import { createInitialState } from '@ima/server/helpers/game'
import { isSyuntsu, simpleTileToTile } from '@ima/server/helpers/tile'
import { calculateYaku } from '@ima/server/helpers/yaku'
import type { GameState } from '@ima/server/types/game'
import type { Syuntsu } from '@ima/server/types/tile'
import type { AgariType } from '@ima/server/types/yaku'

describe('yaku', () => {
  describe('calculateYaku (value: 1)', () => {
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

    test.concurrent('menzen tsumo', () => {
      expect(calc('234m345p23344s55z5s', [], 'tsumo')).toMatchObject([{ name: '멘젠쯔모', han: 1 }])
      expect(calc('234p23344s55z5s', ['22222m'], 'tsumo')).toMatchObject([{ name: '멘젠쯔모', han: 1 }])
      expect(calc('234p23344s55z5s', ['345m'], 'tsumo')).toMatchObject([])
    })

    test.concurrent('tanyao', () => {
      expect(calc('2346m678p345678s6m', [], 'ron')).toMatchObject([{ name: '탕야오', han: 1 }])
      expect(calc('6m345678s6m', ['234m', '678p'], 'ron')).toMatchObject([{ name: '탕야오', han: 1 }])
    })

    test.concurrent('men pin', () => {
      expect(calc('345m234p23344s44z5s', [], 'tsumo')).toMatchObject([
        { name: '멘젠쯔모', han: 1 },
        { name: '핑후', han: 1 },
      ])
    })

    test.concurrent('men pin tan', () => {
      expect(calc('345m234p2334466s5s', [], 'tsumo')).toMatchObject([
        { name: '멘젠쯔모', han: 1 },
        { name: '핑후', han: 1 },
        { name: '탕야오', han: 1 },
      ])
    })

    test.concurrent('riichi', () => {
      expect(
        calc('234m345p23344s11z5s', [], 'ron', { ...initialState, host: { ...initialState.host, riichi: 2, jun: 5 } })
      ).toMatchObject([{ name: '리치', han: 1 }])
    })

    test.concurrent('ippatsu', () => {
      expect(
        calc('234m345p23344s11z5s', [], 'ron', {
          ...initialState,
          host: { ...initialState.host, riichi: 2, jun: 3 },
        })
      ).toMatchObject([
        { name: '리치', han: 1 },
        { name: '일발', han: 1 },
      ])
      expect(
        calc('234m345p23344s11z5s', [], 'ron', {
          ...initialState,
          host: { ...initialState.host, riichi: 2, jun: 3 },
          guest: {
            ...initialState.guest,
            hand: { ...initialState.guest.hand, called: [{ type: 'pon', tiles: c('111p'), jun: 2 }] },
          },
        })
      ).toMatchObject([{ name: '리치', han: 1 }])
      expect(
        calc('234m345p23344s11z5s', [], 'ron', {
          ...initialState,
          host: { ...initialState.host, riichi: 2, jun: 4 },
        })
      ).toMatchObject([{ name: '리치', han: 1 }])
    })

    test.concurrent('iipeikou', () => {
      expect(calc('112233444m555p66z', [], 'ron')).toMatchObject([{ name: '이페코', han: 1 }])
    })

    test.concurrent('yakuhai (dragon)', () => {
      expect(calc('123m234555p33s555z', [], 'ron')).toMatchObject([{ name: '역패: 백', han: 1 }])
      expect(calc('123m234555p33s666z', [], 'ron')).toMatchObject([{ name: '역패: 발', han: 1 }])
      expect(calc('123m234555p33s777z', [], 'ron')).toMatchObject([{ name: '역패: 중', han: 1 }])
    })

    test.concurrent('yakuhai (wind)', () => {
      expect(calc('123m234555p33s111z', [], 'ron')).toMatchObject([
        { name: '장풍: 동', han: 1 },
        { name: '자풍: 동', han: 1 },
      ])
      expect(
        calc('123m234555p33s111z', [], 'ron', {
          ...initialState,
          round: { ...initialState.round, wind: 'east' },
          host: { ...initialState.host, wind: 'west' },
        })
      ).toMatchObject([{ name: '장풍: 동', han: 1 }])
      expect(
        calc('123m234555p33s333z', [], 'ron', {
          ...initialState,
          round: { ...initialState.round, wind: 'east' },
          host: { ...initialState.host, wind: 'west' },
        })
      ).toMatchObject([{ name: '자풍: 서', han: 1 }])
    })
  })
})
