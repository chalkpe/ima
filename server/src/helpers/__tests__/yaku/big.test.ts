import { calc } from '@ima/server/helpers/__utils__/yaku'

describe('yaku', () => {
  describe('calculateYaku (value: 3+)', () => {
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
