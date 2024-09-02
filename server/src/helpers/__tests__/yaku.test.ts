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

    test('noten', () => {
      expect(calc('135m135p135s123z', [], 'ron')).toMatchObject([])
    })

    test('muyaku', () => {
      expect(calc('234m234p23344s11z5s', [], 'ron')).toMatchObject([])
    })

    test('kokushi', () => {
      expect(calc('9m119p19s1234567z1m', [], 'ron')).toMatchObject([{ name: '국사무쌍', han: 13, isYakuman: true }])
      expect(calc('19m19p19s1234567z4z', [], 'ron')).toMatchObject([
        { name: '국사무쌍 13면 대기', han: 26, isYakuman: true },
      ])
    })

    test('menzen tsumo', () => {
      expect(calc('234m234p23344s55z5s', [], 'tsumo')).toMatchObject([{ name: '멘젠쯔모', han: 1 }])
      expect(calc('234p23344s55z5s', ['22222m'], 'tsumo')).toMatchObject([{ name: '멘젠쯔모', han: 1 }])
      expect(calc('234p23344s55z5s', ['234m'], 'tsumo')).toMatchObject([])
    })

    test('pinfu', () => {
      expect(calc('234m234p23344s44z5s', [], 'ron')).toMatchObject([{ name: '핑후', han: 1 }])
      expect(calc('234m234p24567s44z3s', [], 'ron')).toMatchObject([])
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
      expect(calc('22233s44z4z', ['222m', '333p'], 'ron')).toMatchObject([{ name: '또이또이', han: 2 }])
      expect(calc('33s44z3s', ['222m', '333p', '222s'], 'ron')).toMatchObject([{ name: '또이또이', han: 2 }])
    })

    test('chiitoitsu', () => {
      expect(calc('2244m3366p4488s55z', [], 'ron')).toMatchObject([{ name: '치또이쯔', han: 2 }])
    })

    test('itsu', () => {
      expect(calc('111234567m3444z3z', [], 'ron')).toMatchObject([{ name: '혼일색', han: 3 }])
      expect(calc('234555m3444z3z', ['111m'], 'ron')).toMatchObject([{ name: '혼일색', han: 2 }])
      expect(calc('1112345553456m3m', [], 'ron')).toMatchObject([{ name: '청일색', han: 6 }])
      expect(calc('2345553444m3m', ['111m'], 'ron')).toMatchObject([{ name: '청일색', han: 5 }])
    })

    test('iipeikou', () => {
      expect(calc('112233444m555p66z', [], 'ron')).toMatchObject([{ name: '이페코', han: 1 }])
    })

    test('sanshoku', () => {
      expect(calc('333p22233s44z4z', ['222m'], 'ron')).toMatchObject([{ name: '또이또이', han: 2 }])
      expect(calc('333p22233s44z4z', ['222m'], 'tsumo')).toMatchObject([
        { name: '또이또이', han: 2 },
        { name: '산안커', han: 2 },
      ])
      expect(calc('222m333p22233s44z4z', [], 'tsumo')).toMatchObject([{ name: '스안커', han: 13, isYakuman: true }])
      expect(calc('222m333p222333s44z', [], 'tsumo')).toMatchObject([{ name: '스안커단기', han: 26, isYakuman: true }])
    })

    test('yakuhai', () => {
      expect(calc('123m234555p33s555z', [], 'ron')).toMatchObject([{ name: '역패: 백', han: 1 }])
      expect(calc('123m234555p33s666z', [], 'ron')).toMatchObject([{ name: '역패: 발', han: 1 }])
      expect(calc('123m234555p33s777z', [], 'ron')).toMatchObject([{ name: '역패: 중', han: 1 }])
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

    test('dora', () => {
      expect(
        calc('123m234555p11s444z', [], 'ron', {
          ...initialState,
          wall: { ...initialState.wall, kingTiles: c('1234567899s'), doraCount: 1 },
        })
      ).toMatchObject([{ name: '도라', han: 2 }])
      expect(
        calc('123m234555p11s', ['4444z'], 'ron', {
          ...initialState,
          wall: { ...initialState.wall, kingTiles: c('1234567899s'), doraCount: 1 },
        })
      ).toMatchObject([{ name: '도라', han: 2 }])
    })

    test('ura dora', () => {
      expect(
        calc('123m234555p11s444z', [], 'ron', {
          ...initialState,
          host: { ...initialState.host, riichi: 2 },
          wall: { ...initialState.wall, kingTiles: c('1234567899s'), doraCount: 1 },
        })
      ).toMatchObject([
        { name: '리치', han: 1 },
        { name: '도라', han: 2 },
        { name: '뒷도라', han: 2 },
      ])
    })

    test('aka dora', () => {
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
      ).toMatchObject([{ name: '적도라', han: 1 }])
    })

    test('chiitoitsu or ryanpeikou', () => {
      expect(calc('11223344556677m', [], 'ron')).toMatchObject([
        { name: '핑후', han: 1 },
        { name: '청일색', han: 6 },
        { name: '량페코', han: 3 },
      ])
    })
  })
})
