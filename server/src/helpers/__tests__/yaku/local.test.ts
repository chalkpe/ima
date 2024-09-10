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
        { name: '일색삼순', han: 2 },
      ])
    })

    test.concurrent('isshokuyonjun', () => {
      expect(calc('222233334444p11z', [], 'ron')).toMatchObject([{ name: '일색사순', han: 13, isYakuman: true }])
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
      expect(calc(`22334455667788${type}`, [], 'ron')).toMatchObject([{ name, han: 13, isYakuman: true }])
      expect(calc(`11223344556677${type}`, [], 'ron')).not.toMatchObject([{ name, han: 13, isYakuman: true }])
      expect(calc(`33445566778899${type}`, [], 'ron')).not.toMatchObject([{ name, han: 13, isYakuman: true }])
      expect(calc(`11334455667799${type}`, [], 'ron')).not.toMatchObject([{ name, han: 13, isYakuman: true }])
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
