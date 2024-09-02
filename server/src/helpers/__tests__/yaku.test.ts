import type { GameState } from '../../types/game'
import type { Syuntsu } from '../../types/tile'
import type { AgariType } from '../../types/yaku'
import { codeSyntaxToHand } from '../code'
import { initialState } from '../game'
import { isSyuntsu, simpleTileToTile } from '../tile'
import { calculateYaku } from '../yaku'

describe('yaku', () => {
  describe('calculateYaku', () => {
    let index = 0
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

    test('muyaku', () => {
      expect(calc('234m234p23344s11z5s', [], 'ron')).toMatchObject([])
    })

    test('menzen tsumo', () => {
      expect(calc('234m234p23344s55z5s', [], 'tsumo')).toMatchObject([{ name: '멘젠쯔모', han: 1 }])
      expect(calc('234p23344s55z5s', ['22222m'], 'tsumo')).toMatchObject([{ name: '멘젠쯔모', han: 1 }])
      expect(calc('234p23344s55z5s', ['234m'], 'tsumo')).toMatchObject([])
    })

    test('pinfu', () => {
      expect(calc('234m234p23344s44z5s', [], 'ron')).toMatchObject([{ name: '핑후', han: 1 }])
      expect(calc('234m234p22344s44z3s', [], 'ron')).toMatchObject([])
      expect(calc('222m234p23344s44z5s', [], 'ron')).toMatchObject([])
      expect(calc('234p23344s44z5s', ['234m'], 'ron')).toMatchObject([])
      expect(calc('234m234p23344s11z5s', [], 'ron')).toMatchObject([])
      expect(
        calc('234m234p23344s11z5s', [], 'ron', {
          ...initialState,
          round: { ...initialState.round, wind: 'south' },
          host: { ...initialState.host, wind: 'west' },
        })
      ).toMatchObject([{ name: '핑후', han: 1 }])
    })

    test('tanyao', () => {
      expect(calc('2346m567p345678s6m', [], 'ron')).toMatchObject([{ name: '탕야오', han: 1 }])
      expect(calc('6m345678s6m', ['234m', '567p'], 'ron')).toMatchObject([{ name: '탕야오', han: 1 }])
    })

    test('men pin', () => {
      expect(calc('234m234p23344s44z5s', [], 'tsumo')).toMatchObject([
        { name: '멘젠쯔모', han: 1 },
        { name: '핑후', han: 1 },
      ])
    })

    test('men pin tan', () => {
      expect(calc('234m234p2334466s5s', [], 'tsumo')).toMatchObject([
        { name: '멘젠쯔모', han: 1 },
        { name: '핑후', han: 1 },
        { name: '탕야오', han: 1 },
      ])
    })

    test('riichi', () => {
      expect(
        calc('234m234p23344s11z5s', [], 'ron', { ...initialState, host: { ...initialState.host, riichi: 1 } })
      ).toMatchObject([{ name: '더블리치', han: 2 }])
      expect(
        calc('234m234p23344s11z5s', [], 'ron', { ...initialState, host: { ...initialState.host, riichi: 2 } })
      ).toMatchObject([{ name: '리치', han: 1 }])
    })

    test('toitoi', () => {
      expect(calc('222m333p22233s44z4z', [], 'ron')).toMatchObject([{ name: '또이또이', han: 2 }])
      expect(calc('33s44z3s', ['222m', '333p', '222s'], 'ron')).toMatchObject([{ name: '또이또이', han: 2 }])
    })

    test('chiitoitsu', () => {
      expect(calc('2244m3366p4488s55z', [], 'ron')).toMatchObject([{ name: '치또이쯔', han: 2 }])
    })

    test('itsu', () => {
      expect(calc('111234555m3444z3z', [], 'ron')).toMatchObject([{ name: '혼일색', han: 3 }])
      expect(calc('234555m3444z3z', ['111m'], 'ron')).toMatchObject([{ name: '혼일색', han: 2 }])
      expect(calc('1112345553444m3m', [], 'ron')).toMatchObject([{ name: '청일색', han: 6 }])
      expect(calc('2345553444m3m', ['111m'], 'ron')).toMatchObject([{ name: '청일색', han: 5 }])
    })

    test('yakuhai', () => {
      expect(calc('111m234555p33s555z', [], 'ron')).toMatchObject([
        { name: '역패: 백', han: 1 },
      ])
      expect(calc('111m234555p33s666z', [], 'ron')).toMatchObject([
        { name: '역패: 발', han: 1 },
      ])
      expect(calc('111m234555p33s777z', [], 'ron')).toMatchObject([
        { name: '역패: 중', han: 1 },
      ])
      expect(calc('111m234555p33s111z', [], 'ron')).toMatchObject([
        { name: '장풍: 동', han: 1 },
        { name: '자풍: 동', han: 1 },
      ])
      expect(
        calc('111m234555p33s111z', [], 'ron', {
          ...initialState,
          round: { ...initialState.round, wind: 'east' },
          host: { ...initialState.host, wind: 'west' },
        })
      ).toMatchObject([{ name: '장풍: 동', han: 1 }])
      expect(
        calc('111m234555p33s333z', [], 'ron', {
          ...initialState,
          round: { ...initialState.round, wind: 'east' },
          host: { ...initialState.host, wind: 'west' },
        })
      ).toMatchObject([{ name: '자풍: 서', han: 1 }])
    })
  })
})
