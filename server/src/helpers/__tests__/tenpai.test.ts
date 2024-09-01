import { codeSyntaxToHand } from '../code'
import { simpleTileToRiverTile, simpleTileToTile } from '../tile'
import { calculateFuriten, calculateTenpai } from '../tenpai'
import type { TenpaiState } from '../../types/agari'
import type { Koritsu, Syuntsu, Tatsu } from '../../types/tile'

describe('tenpai', () => {
  const c = (tiles: string) => codeSyntaxToHand(tiles)
  const t = (tiles: string) => codeSyntaxToHand(tiles).map(simpleTileToTile)
  const r = (river: string) => codeSyntaxToHand(river).map(simpleTileToRiverTile)

  describe('calculateFuriten', () => {
    test('returns false if machi is not found', () => {
      const state: TenpaiState = [{ type: 'shuntsu', tiles: t('123p') as Syuntsu }]
      const river = r('1s')
      expect(calculateFuriten(state, river, null)).toBe(false)
    })
    test('returns false if machi is invalid', () => {
      const state: TenpaiState = [{ type: 'ryanmen', tiles: t('13p') as Tatsu }]
      const river = r('1s')
      expect(calculateFuriten(state, river, null)).toBe(false)
    })
    test('returns false if giri tile is equal to machi tile', () => {
      const state: TenpaiState = [{ type: 'tanki', tiles: t('1p') as Koritsu }]
      const river = r('1s')
      const giriTile = t('1p')[0]
      expect(calculateFuriten(state, river, giriTile)).toBe(false)
    })
    test('returns true if river tile has machi tile', () => {
      const state: TenpaiState = [{ type: 'tanki', tiles: t('1p') as Koritsu }]
      const river = r('123p')
      expect(calculateFuriten(state, river, null)).toBe(false)
    })
    test('returns true if not furiten', () => {
      const state: TenpaiState = [{ type: 'tanki', tiles: t('1p') as Koritsu }]
      const river = r('1s')
      expect(calculateFuriten(state, river, null)).toBe(true)
    })
  })

  describe('calculateTenpai', () => {
    test('returns undefined if agari', () => {
      expect(calculateTenpai(t('123p'), r('1s'), null)).toBeUndefined()
    })
    test('returns undefined if noten', () => {
      expect(calculateTenpai(t('135p'), r('1s'), null)).toBeUndefined()
    })
    test('returns result if tenpai but furiten (nobetan)', () => {
      expect(calculateTenpai(t('1234p'), r('1p'), null)).toMatchObject([
        { agariTile: c('1p')[0], giriTile: null, status: 'furiten' },
        { agariTile: c('4p')[0], giriTile: null, status: 'furiten' },
      ])
    })
    test('returns result if tenpai but furiten (shabo)', () => {
      expect(calculateTenpai(t('678s5566z'), r('6z'), null)).toMatchObject([
        { agariTile: c('5z')[0], giriTile: null, status: 'furiten' },
        { agariTile: c('6z')[0], giriTile: null, status: 'furiten' },
      ])
    })
    test('returns result if tenpai but furiten (multiple)', () => {
      expect(calculateTenpai(t('1234445556778s'), r('1p'), t('6s')[0])).toMatchObject([
        { agariTile: c('6s')[0], giriTile: t('6s')[0], status: 'furiten' },
        { agariTile: c('7s')[0], giriTile: t('6s')[0], status: 'furiten' },
        { agariTile: c('9s')[0], giriTile: t('6s')[0], status: 'furiten' },
      ])
    })
    test('returns result if tenpai but furiten (kokushi musou juusanmen)', () => {
      expect(calculateTenpai(t('19m19p19s1234567z'), r('1p'), t('6s')[0])).toMatchObject([
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
    test('returns result if tenpai and not furiten (kokushi musou)', () => {
      expect(calculateTenpai(t('19m119p19s123467z'), r('9m9p36z'), null)).toMatchObject([
        { agariTile: c('5z')[0], giriTile: null, status: 'tenpai' },
      ])
    })
    test('returns result if tenpai and not furiten', () => {
      expect(calculateTenpai(t('1234p'), r('1s'), null)).toMatchObject([
        { agariTile: c('1p')[0], giriTile: null, status: 'tenpai' },
        { agariTile: c('4p')[0], giriTile: null, status: 'tenpai' },
      ])
    })
  })
})
