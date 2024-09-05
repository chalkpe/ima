import { codeSyntaxToHand } from '@ima/server/helpers/code'
import { createInitialState } from '@ima/server/helpers/game'
import { isSyuntsu, simpleTileToTile } from '@ima/server/helpers/tile'
import { calculateYaku } from '@ima/server/helpers/yaku'
import type { GameState } from '@ima/server/types/game'
import type { Syuntsu } from '@ima/server/types/tile'
import type { AgariType } from '@ima/server/types/yaku'

describe('yaku', () => {
  describe('calculateYaku (yakuman)', () => {
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

    test.concurrent('tenhou', () => {
      expect(
        calc('234m345p23344s11z5s', [], 'tsumo', { ...initialState, host: { ...initialState.host, jun: 1 } })
      ).toMatchObject([{ name: '천화', han: 13, isYakuman: true }])
    })

    test.concurrent('chiihou', () => {
      expect(
        calc('234m345p23344s11z5s', [], 'tsumo', {
          ...initialState,
          host: { ...initialState.host, jun: 1, wind: 'west' },
        })
      ).toMatchObject([{ name: '지화', han: 13, isYakuman: true }])
    })

    test.concurrent('kokushi', () => {
      expect(calc('9m119p19s1234567z1m', [], 'ron')).toMatchObject([{ name: '국사무쌍', han: 13, isYakuman: true }])
      expect(calc('19m19p19s1234567z4z', [], 'ron')).toMatchObject([
        { name: '국사무쌍 13면 대기', han: 26, isYakuman: true },
      ])
    })

    test.concurrent('ryuuiisou', () => {
      expect(calc('33344466688s', ['222s'], 'ron')).toMatchObject([{ name: '녹일색', han: 13, isYakuman: true }])
      expect(calc('22334466688s666z', [], 'ron')).toMatchObject([{ name: '녹일색', han: 13, isYakuman: true }])
    })

    test.concurrent('suuankou', () => {
      expect(calc('222m333p22233s44z4z', [], 'tsumo')).toMatchObject([{ name: '스안커', han: 13, isYakuman: true }])
      expect(calc('222m333p222333s44z', [], 'tsumo')).toMatchObject([{ name: '스안커단기', han: 26, isYakuman: true }])
    })

    test.concurrent('tsuuiisou', () => {
      expect(calc('11122233366776z', [], 'ron')).toMatchObject([{ name: '자일색', han: 13, isYakuman: true }])
    })

    test.concurrent('chinroutou', () => {
      expect(calc('111999m11199p11s9p', [], 'ron')).toMatchObject([{ name: '청노두', han: 13, isYakuman: true }])
    })

    test.concurrent('suukantsu', () => {
      expect(calc('55m', ['1111m', '1111p', '2222p', '33333p'], 'ron')).toMatchObject([
        { name: '스깡쯔', han: 13, isYakuman: true },
      ])
    })

    test.concurrent('daisangen', () => {
      expect(calc('123p44s555666777z', [], 'ron')).toMatchObject([{ name: '대삼원', han: 13, isYakuman: true }])
    })

    test.concurrent('tsuuiisou daisangen', () => {
      expect(calc('55566677722z', ['111z'], 'ron')).toMatchObject([
        { name: '자일색', han: 13, isYakuman: true },
        { name: '대삼원', han: 13, isYakuman: true },
      ])
    })

    test.concurrent('daisuushii', () => {
      expect(calc('1s111333444z1s', ['2222z'], 'ron')).toMatchObject([{ name: '대사희', han: 26, isYakuman: true }])
    })

    test.concurrent('shousuushii', () => {
      expect(calc('11s11122233344z1s', [], 'ron')).toMatchObject([{ name: '소사희', han: 13, isYakuman: true }])
    })

    test.concurrent('chuuren poutou', () => {
      expect(calc('11223456789991s', [], 'ron')).toMatchObject([{ name: '구련보등', han: 13, isYakuman: true }])
    })

    test.concurrent('junsei chuuren poutou', () => {
      expect(calc('11123456789999m', [], 'ron')).toMatchObject([{ name: '순정구련보등', han: 26, isYakuman: true }])
    })
  })
})
