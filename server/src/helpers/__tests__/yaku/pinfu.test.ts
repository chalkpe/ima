import { calc } from '@ima/server/helpers/__utils__/yaku'

describe('helpers/yaku (pinfu)', () => {
  describe('calculateYaku', () => {
    test.concurrent('valid cases', () => {
      expect(calc('234m345p23344s44z5s', [], 'ron')).toMatchObject([{ name: '핑후', han: 1 }])
      expect(
        calc('345m234p23344s11z5s', [], 'ron', (state) => {
          state.round.wind = 'south'
          state.host.wind = 'west'
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
