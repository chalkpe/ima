import { codeSyntaxToHand } from '@ima/server/helpers/code'
import { createInitialState } from '@ima/server/helpers/game'
import { calculateFuriten, calculateTenpai } from '@ima/server/helpers/tenpai'
import { simpleTileToRiverTile, simpleTileToTile } from '@ima/server/helpers/tile'
import type { TenpaiState } from '@ima/server/types/agari'
import type { Koritsu, Syuntsu, Tatsu } from '@ima/server/types/tile'
import type { TileSet } from '@ima/server/types/game'

describe('helpers/tenpai', () => {
  const i = createInitialState()
  const c = (tiles: string) => codeSyntaxToHand(tiles)
  const t = (tiles: string) => codeSyntaxToHand(tiles).map(simpleTileToTile)
  const h = (tiles: string, called: TileSet[] = []) => ({
    ...i.host.hand,
    closed: codeSyntaxToHand(tiles).map(simpleTileToTile),
    called,
  })
  const s = (river: string) => ({
    ...i,
    host: { ...i.host, river: codeSyntaxToHand(river).map(simpleTileToRiverTile) },
  })

  describe('calculateFuriten', () => {
    test('returns false if machi is not found', () => {
      const state = s('1s')
      const tenpai: TenpaiState = [{ type: 'shuntsu', tiles: t('123p') as Syuntsu }]
      expect(calculateFuriten(state, 'host', tenpai, null)).toBe(false)
    })
    test('returns false if machi is invalid', () => {
      const state = s('1s')
      const tenpai: TenpaiState = [{ type: 'ryanmen', tiles: t('13p') as Tatsu }]
      expect(calculateFuriten(state, 'host', tenpai, null)).toBe(false)
    })
    test('returns false if giri tile is equal to machi tile', () => {
      const state = s('1s')
      const tenpai: TenpaiState = [{ type: 'tanki', tiles: t('1p') as Koritsu }]
      const giriTile = t('1p')[0]
      expect(calculateFuriten(state, 'host', tenpai, giriTile)).toBe(false)
    })
    test('returns true if river tile has machi tile', () => {
      const state = s('123p')
      const tenpai: TenpaiState = [{ type: 'tanki', tiles: t('1p') as Koritsu }]
      expect(calculateFuriten(state, 'host', tenpai, null)).toBe(false)
    })
    test('returns true if not furiten', () => {
      const state = s('1s')
      const tenpai: TenpaiState = [{ type: 'tanki', tiles: t('1p') as Koritsu }]
      expect(calculateFuriten(state, 'host', tenpai, null)).toBe(true)
    })
  })

  describe('calculateTenpai', () => {
    test('returns undefined if agari', () => {
      expect(calculateTenpai(s('1s'), 'host', h('123p'), null)).toBeUndefined()
    })
    test('returns undefined if noten', () => {
      expect(calculateTenpai(s('1s'), 'host', h('135p'), null)).toBeUndefined()
    })
    test('returns result if tenpai but furiten (nobetan)', () => {
      expect(calculateTenpai(s('1p'), 'host', h('1234p'), null)).toMatchObject([
        { agariTile: c('1p')[0], giriTile: null, status: 'furiten' },
        { agariTile: c('4p')[0], giriTile: null, status: 'furiten' },
      ])
    })
    test('returns result if tenpai but muyaku', () => {
      expect(
        calculateTenpai(s('1s'), 'host', h('234m123555p5z', [{ type: 'pon', tiles: t('444z'), jun: 1 }]), null)
      ).toMatchObject([{ agariTile: c('5z')[0], giriTile: null, status: 'muyaku' }])
    })
    test('returns result if tenpai but furiten (shabo)', () => {
      expect(calculateTenpai(s('6z'), 'host', h('678s5566z'), null)).toMatchObject([
        { agariTile: c('5z')[0], giriTile: null, status: 'furiten' },
        { agariTile: c('6z')[0], giriTile: null, status: 'furiten' },
      ])
    })
    test('returns result if tenpai but furiten (multiple)', () => {
      expect(calculateTenpai(s('1p'), 'host', h('1234445556778s'), t('6s')[0])).toMatchObject([
        { agariTile: c('6s')[0], giriTile: t('6s')[0], status: 'furiten' },
        { agariTile: c('7s')[0], giriTile: t('6s')[0], status: 'furiten' },
        { agariTile: c('9s')[0], giriTile: t('6s')[0], status: 'furiten' },
      ])
    })
    test('returns result if tenpai but furiten (kokushi musou juusanmen)', () => {
      expect(calculateTenpai(s('1p'), 'host', h('19m19p19s1234567z'), t('6s')[0])).toMatchObject([
        { agariTile: c('1m')[0], giriTile: t('6s')[0], status: 'furiten' },
        { agariTile: c('9m')[0], giriTile: t('6s')[0], status: 'furiten' },
        { agariTile: c('1p')[0], giriTile: t('6s')[0], status: 'furiten' },
        { agariTile: c('9p')[0], giriTile: t('6s')[0], status: 'furiten' },
        { agariTile: c('1s')[0], giriTile: t('6s')[0], status: 'furiten' },
        { agariTile: c('9s')[0], giriTile: t('6s')[0], status: 'furiten' },
        { agariTile: c('1z')[0], giriTile: t('6s')[0], status: 'furiten' },
        { agariTile: c('2z')[0], giriTile: t('6s')[0], status: 'furiten' },
        { agariTile: c('3z')[0], giriTile: t('6s')[0], status: 'furiten' },
        { agariTile: c('4z')[0], giriTile: t('6s')[0], status: 'furiten' },
        { agariTile: c('5z')[0], giriTile: t('6s')[0], status: 'furiten' },
        { agariTile: c('6z')[0], giriTile: t('6s')[0], status: 'furiten' },
        { agariTile: c('7z')[0], giriTile: t('6s')[0], status: 'furiten' },
      ])
    })
    test('returns result if tenpai and not furiten (kokushi musou juusanmen)', () => {
      expect(calculateTenpai(s('5p'), 'host', h('19m19p19s1234567z'), t('6s')[0])).toMatchObject([
        { agariTile: c('1m')[0], giriTile: t('6s')[0], status: 'tenpai' },
        { agariTile: c('9m')[0], giriTile: t('6s')[0], status: 'tenpai' },
        { agariTile: c('1p')[0], giriTile: t('6s')[0], status: 'tenpai' },
        { agariTile: c('9p')[0], giriTile: t('6s')[0], status: 'tenpai' },
        { agariTile: c('1s')[0], giriTile: t('6s')[0], status: 'tenpai' },
        { agariTile: c('9s')[0], giriTile: t('6s')[0], status: 'tenpai' },
        { agariTile: c('1z')[0], giriTile: t('6s')[0], status: 'tenpai' },
        { agariTile: c('2z')[0], giriTile: t('6s')[0], status: 'tenpai' },
        { agariTile: c('3z')[0], giriTile: t('6s')[0], status: 'tenpai' },
        { agariTile: c('4z')[0], giriTile: t('6s')[0], status: 'tenpai' },
        { agariTile: c('5z')[0], giriTile: t('6s')[0], status: 'tenpai' },
        { agariTile: c('6z')[0], giriTile: t('6s')[0], status: 'tenpai' },
        { agariTile: c('7z')[0], giriTile: t('6s')[0], status: 'tenpai' },
      ])
    })
    test('returns result if tenpai and not furiten (kokushi musou)', () => {
      expect(calculateTenpai(s('9m9p36z'), 'host', h('19m119p19s123467z'), null)).toMatchObject([
        { agariTile: c('5z')[0], giriTile: null, status: 'tenpai' },
      ])
    })
    test('returns result if tenpai and not furiten', () => {
      expect(calculateTenpai(s('1s'), 'host', h('1234p'), null)).toMatchObject([
        { agariTile: c('1p')[0], giriTile: null, status: 'tenpai' },
        { agariTile: c('4p')[0], giriTile: null, status: 'tenpai' },
      ])
    })
  })
})
