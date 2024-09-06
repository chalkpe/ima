import { c } from '@ima/server/helpers/__utils__/tile'
import { calc } from '@ima/server/helpers/__utils__/yaku'

describe('yaku', () => {
  describe('calculateYaku (extra)', () => {
    test.concurrent('noten', () => {
      expect(calc('135m135p135s123z', [], 'ron')).toMatchObject([])
    })

    test.concurrent('muyaku', () => {
      expect(calc('234m345p23344s11z5s', [], 'ron')).toMatchObject([])
    })

    test.concurrent('dora', () => {
      expect(
        calc('123m234555p11s444z', [], 'ron', (state) => {
          state.wall.kingTiles = c('1234567899s')
          state.wall.doraCount = 1
        })
      ).toMatchObject([{ name: '도라', han: 2, isExtra: true }])
      expect(
        calc('123m234555p11s', ['4444z'], 'ron', (state) => {
          state.wall.kingTiles = c('1234567899s')
          state.wall.doraCount = 1
        })
      ).toMatchObject([{ name: '도라', han: 2, isExtra: true }])
    })

    test.concurrent('ura dora', () => {
      expect(
        calc('123m234555p11s444z', [], 'ron', (state) => {
          state.host.riichi = 2
          state.host.jun = 4
          state.wall.kingTiles = c('1234567899s')
          state.wall.doraCount = 1
        })
      ).toMatchObject([
        { name: '리치', han: 1 },
        { name: '도라', han: 2, isExtra: true },
        { name: '뒷도라', han: 2, isExtra: true },
      ])
    })

    test.concurrent('aka dora', () => {
      expect(
        calc('', [], 'ron', (state) => {
          state.host.hand.closed = c('123m234555p555s1z')
          state.host.hand.closed.forEach((tile) => tile.value === 5 && (tile.attribute = 'red'))
          state.host.hand.tsumo = c('1z')[0]
        })
      ).toMatchObject([{ name: '적도라', han: 6, isExtra: true }])
    })
  })
})
