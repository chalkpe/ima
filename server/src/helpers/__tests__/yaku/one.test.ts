import { c } from '@ima/server/helpers/__utils__/tile'
import { calc } from '@ima/server/helpers/__utils__/yaku'
import type { GameState } from '@ima/server/types/game'

describe('yaku', () => {
  describe('calculateYaku (value: 1)', () => {
    test.concurrent('chankan', () => {
      const updater = (called: string) => (state: GameState) => {
        const gakan = c(called.repeat(4))
        state.host.hand.tsumo = gakan[3]

        state.host.hand.closed = c('234m345p23344s11z')
        state.guest.jun = 5
        state.guest.hand.called = [{ type: 'gakan', jun: 5, tiles: gakan, calledTile: gakan[3] }]
      }

      expect(calc('', [], 'ron', updater('5s'))).toMatchObject([{ name: '창깡', han: 1 }])
      expect(calc('', [], 'ron', updater('1s'))).toMatchObject([])
    })

    test.concurrent('rinshan', () => {
      const kingTiles = c('12345s')
      const updater = (state: GameState) => {
        state.wall.kingTiles = kingTiles
        state.wall.firstKingTileIndex = kingTiles[0].index
        state.wall.lastKingTileIndex = kingTiles[kingTiles.length - 1].index

        state.host.hand.closed = c('23344s11z')
        state.host.hand.tsumo = kingTiles[4]
        state.host.hand.called = [
          { type: 'ankan', jun: 2, tiles: c('1111m') },
          { type: 'chi', jun: 3, tiles: c('345m') },
        ]
      }

      expect(calc('', [], 'ron', updater)).toMatchObject([])
      expect(calc('', [], 'tsumo', updater)).toMatchObject([{ name: '영상개화', han: 1 }])
    })

    test.concurrent('haitei or houtei', () => {
      const updater = (state: GameState) => {
        state.wall.tiles = []
      }

      expect(calc('345p23344s11z5s', ['111m'], 'ron', updater)).toMatchObject([{ name: '하저로어', han: 1 }])
      expect(calc('345p23344s11z5s', ['111m'], 'tsumo', updater)).toMatchObject([{ name: '해저로월', han: 1 }])
    })

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
        calc('234m345p23344s11z5s', [], 'ron', (state) => {
          state.host.riichi = 2
          state.host.jun = 5
        })
      ).toMatchObject([{ name: '리치', han: 1 }])
    })

    test.concurrent('ippatsu', () => {
      expect(
        calc('234m345p23344s11z5s', [], 'ron', (state) => {
          state.host.riichi = 2
          state.host.jun = 3
        })
      ).toMatchObject([
        { name: '리치', han: 1 },
        { name: '일발', han: 1 },
      ])
      expect(
        calc('234m345p23344s11z5s', [], 'ron', (state) => {
          state.host.riichi = 2
          state.host.jun = 3
          state.guest.hand.called = [{ type: 'pon', tiles: c('111p'), jun: 2 }]
        })
      ).toMatchObject([{ name: '리치', han: 1 }])
      expect(
        calc('234m345p23344s11z5s', [], 'ron', (state) => {
          state.host.riichi = 2
          state.host.jun = 4
        })
      ).toMatchObject([{ name: '리치', han: 1 }])
      expect(
        calc('345p23344s11z5s', ['11111m'], 'ron', (state) => {
          state.host.riichi = 2
          state.host.jun = 3
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
        calc('123m234555p33s111z', [], 'ron', (state) => {
          state.round.wind = 'east'
          state.host.wind = 'west'
        })
      ).toMatchObject([{ name: '장풍: 동', han: 1 }])
      expect(
        calc('123m234555p33s333z', [], 'ron', (state) => {
          state.round.wind = 'east'
          state.host.wind = 'west'
        })
      ).toMatchObject([{ name: '자풍: 서', han: 1 }])
    })
  })
})
