import { calc } from '@ima/server/helpers/__utils__/yaku'

describe('helpers/yaku (value: 2)', () => {
  describe('calculateYaku', () => {
    test.concurrent('double riichi', () => {
      expect(
        calc('234m345p23344s11z5s', [], 'ron', (state) => {
          state.host.riichi = 1
          state.host.jun = 3
        })
      ).toMatchObject([{ name: '더블 리치', han: 2 }])
    })

    test.concurrent('toitoi', () => {
      expect(calc('22233s44z4z', ['222m', '333p'], 'ron')).toMatchObject([{ name: '또이또이', han: 2 }])
      expect(calc('33s44z3s', ['222m', '333p', '222s'], 'ron')).toMatchObject([{ name: '또이또이', han: 2 }])
    })

    test.concurrent('chiitoitsu', () => {
      expect(calc('2244m3366p4488s55z', [], 'ron')).toMatchObject([{ name: '치또이쯔', han: 2 }])
    })

    test.concurrent('sanankou', () => {
      expect(calc('333p22233s44z4z', ['222m'], 'ron')).toMatchObject([{ name: '또이또이', han: 2 }])
      expect(calc('333p22233s44z4z', ['222m'], 'tsumo')).toMatchObject([
        { name: '또이또이', han: 2 },
        { name: '산안커', han: 2 },
      ])
    })

    test.concurrent('ittsuu', () => {
      expect(calc('123456789m11p444z', [], 'ron')).toMatchObject([{ name: '일기통관', han: 2 }])
      expect(calc('123456789p11m444z', [], 'ron')).toMatchObject([{ name: '일기통관', han: 2 }])
      expect(calc('123456789s11m444z', [], 'ron')).toMatchObject([{ name: '일기통관', han: 2 }])
      expect(calc('456789m11p444z', ['123m'], 'ron')).toMatchObject([{ name: '일기통관', han: 1 }])
      expect(calc('456789p11m444z', ['123p'], 'ron')).toMatchObject([{ name: '일기통관', han: 1 }])
      expect(calc('456789s11m444z', ['123s'], 'ron')).toMatchObject([{ name: '일기통관', han: 1 }])
    })

    test.concurrent('sanshoku doujun', () => {
      expect(calc('234m234p234s44422z', [], 'ron')).toMatchObject([{ name: '삼색동순', han: 2 }])
      expect(calc('234s44422z', ['234m', '234p'], 'ron')).toMatchObject([{ name: '삼색동순', han: 1 }])
    })

    test.concurrent('sanshoku doukou', () => {
      expect(calc('222m222p22345s22z2s', [], 'ron')).toMatchObject([{ name: '삼색동각', han: 2 }])
      expect(calc('222345s22z', ['222m', '222p'], 'ron')).toMatchObject([{ name: '삼색동각', han: 2 }])
    })

    test.concurrent('yaochuuhai (honroutou)', () => {
      expect(calc('999m11199p11z9p', ['111m'], 'ron')).toMatchObject([
        { name: '또이또이', han: 2 },
        { name: '혼노두', han: 2 },
      ])
    })

    test.concurrent('yaochuuhai (chanta)', () => {
      expect(calc('123789m123789p11z', [], 'ron')).toMatchObject([{ name: '찬타', han: 2 }])
      expect(calc('789m123789p11z', ['123m'], 'ron')).toMatchObject([{ name: '찬타', han: 1 }])
    })

    test.concurrent('sankantsu', () => {
      expect(calc('12355m', ['1111p', '2222p', '33333p'], 'ron')).toMatchObject([{ name: '산깡쯔', han: 2 }])
    })

    test.concurrent('shousangen', () => {
      expect(calc('123p456s55566677z', [], 'ron')).toMatchObject([
        { name: '역패: 백', han: 1 },
        { name: '역패: 발', han: 1 },
        { name: '소삼원', han: 2 },
      ])
      expect(calc('123p456s55577766z', [], 'ron')).toMatchObject([
        { name: '역패: 백', han: 1 },
        { name: '역패: 중', han: 1 },
        { name: '소삼원', han: 2 },
      ])
      expect(calc('123p456s56667775z', [], 'ron')).toMatchObject([
        { name: '역패: 발', han: 1 },
        { name: '역패: 중', han: 1 },
        { name: '소삼원', han: 2 },
      ])
    })
  })
})
