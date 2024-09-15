import { c } from '@ima/server/helpers/__utils__/tile'
import { calc as originalCalc } from '@ima/server/helpers/__utils__/yaku'

const calc: typeof originalCalc = (h, c, t, s) =>
  originalCalc(h, c, t, (state) => {
    state.rule.localYaku = true
    s?.(state)
  })

describe('yaku', () => {
  describe('calculateYaku (local)', () => {
    test.concurrent('renhou', () => {
      expect(
        calc('234m345p23344s11z5s', [], 'ron', (state) => {
          state.guest.jun = 1
          state.host.jun = 0
        })
      ).toMatchObject([{ name: '인화', han: 13, isYakuman: true }])
    })

    test.concurrent('kanfuri', () => {
      expect(
        calc('234m345p23344s55z5s', [], 'ron', (state) => {
          state.host.jun = 3
          state.guest.jun = 5
          state.guest.hand.called.push({ type: 'ankan', jun: 5, tiles: c('1111z') })
        })
      ).toMatchObject([{ name: '깡후리', han: 1 }])
      expect(
        calc('234m345p23344s55z5s', [], 'ron', (state) => {
          state.host.jun = 3
          state.guest.jun = 5
          state.guest.hand.called.push({ type: 'gakan', jun: 5, tiles: c('1111z') })
        })
      ).toMatchObject([{ name: '깡후리', han: 1 }])
      expect(
        calc('234m345p23344s55z5s', [], 'ron', (state) => {
          state.host.jun = 3
          state.guest.jun = 5
          state.guest.hand.called.push({ type: 'daiminkan', jun: 3, tiles: c('1111z') })
        })
      ).toMatchObject([{ name: '깡후리', han: 1 }])
      expect(
        calc('234m345p23344s55z5s', [], 'ron', (state) => {
          state.host.jun = 3
          state.guest.jun = 5
          state.guest.hand.called.push({ type: 'pon', jun: 3, tiles: c('111z') })
        })
      ).toMatchObject([])
    })

    test.concurrent('tsubamegaeshi', () => {
      expect(
        calc('234m345p23344s55z5s', [], 'ron', (state) => {
          state.host.jun = 3
          state.guest.jun = 5
          state.guest.riichi = 5
        })
      ).toMatchObject([{ name: '츠바메가에시', han: 1 }])
      expect(
        calc('234m345p23344s55z5s', [], 'tsumo', (state) => {
          state.host.jun = 3
          state.guest.jun = 5
          state.guest.riichi = 5
        })
      ).toMatchObject([{ name: '멘젠쯔모', han: 1 }])
    })

    test.concurrent('uumensai', () => {
      expect(calc('234m345p666s44554z', [], 'ron')).toMatchObject([{ name: '오문제', han: 2 }])
    })

    test.concurrent('sanrenkou', () => {
      expect(calc('111222333m23994p', [], 'ron')).toMatchObject([
        { name: '산안커', han: 2 },
        { name: '삼연각', han: 2 },
      ])
    })

    test.concurrent('isshokusanjun', () => {
      expect(calc('111222333m23991p', [], 'ron')).toMatchObject([
        { name: '핑후', han: 1 },
        { name: '준찬타', han: 3 },
        { name: '일색삼순', han: 3 },
      ])
      expect(calc('112233m23991p', ['123m'], 'ron')).toMatchObject([
        { name: '준찬타', han: 2 },
        { name: '일색삼순', han: 2 },
      ])
    })

    test.concurrent('isshokuyonjun', () => {
      expect(calc('222233334444p11z', [], 'ron')).toMatchObject([{ name: '일색사순', han: 13, isYakuman: true }])
      expect(calc('234p11z', ['234p', '234p', '234p'], 'ron')).toMatchObject([
        { name: '일색사순', han: 13, isYakuman: true },
      ])
    })

    test.concurrent('shiiaruraotai', () => {
      expect(calc('123m11z', ['234p', '345m', '444z'], 'ron')).toMatchObject([])
      expect(calc('11z', ['123m', '234p', '345m', '44444z'], 'ron')).toMatchObject([])
      expect(calc('11z', ['123m', '234p', '345m', '444z'], 'ron')).toMatchObject([{ name: '십이낙태', han: 1 }])
      expect(calc('11z', ['123m', '234p', '345m', '444z'], 'tsumo')).toMatchObject([{ name: '십이낙태', han: 1 }])
    })

    test.concurrent.each([
      { name: '대수린', type: 'm' },
      { name: '대차륜', type: 'p' },
      { name: '대죽림', type: 's' },
    ])('daisharin ($type)', ({ name, type }) => {
      expect(calc(`22334455667788${type}`, [], 'ron')).toMatchObject([{ name, han: 26, isYakuman: true }])
      expect(calc(`11223344556677${type}`, [], 'ron')).not.toMatchObject([{ name, han: 26, isYakuman: true }])
      expect(calc(`33445566778899${type}`, [], 'ron')).not.toMatchObject([{ name, han: 26, isYakuman: true }])
      expect(calc(`11334455667799${type}`, [], 'ron')).not.toMatchObject([{ name, han: 26, isYakuman: true }])
    })

    test.concurrent('daisharin (mixed)', () => {
      expect(calc('2233m445566p7788s', [], 'ron')).toMatchObject([
        { name: '치또이쯔', han: 2 },
        { name: '탕야오', han: 1 },
      ])
    })

    test.concurrent('daichisei', () => {
      expect(calc('11223344556666z', [], 'ron')).toMatchObject([])
      expect(calc('11223344556677z', [], 'ron')).toMatchObject([{ name: '대칠성', han: 26, isYakuman: true }])
    })
  })
})
