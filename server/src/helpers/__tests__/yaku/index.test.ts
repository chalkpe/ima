import { c, r } from '@ima/server/helpers/__utils__/tile'
import { isNagashiMangan, isYakuOverShibari } from '@ima/server/helpers/yaku'
import { createInitialState } from '@ima/server/helpers/game'
import type { TileSet } from '@ima/server/types/game'

describe('yaku', () => {
  describe('isYakuOverShibari', () => {
    const ss = (enabled: boolean) => {
      const state = createInitialState()
      state.rule.manganShibari = enabled
      return state
    }

    test('returns true if extra yaku included', () => {
      expect(
        isYakuOverShibari(ss(true), [
          { name: '리치', han: 1 },
          { name: '도라', han: 3, isExtra: true },
        ])
      ).toBe(true)
    })

    test('returns false if hidden yaku included', () => {
      expect(
        isYakuOverShibari(ss(true), [
          { name: '리치', han: 1 },
          { name: '뒷도라', han: 3, isExtra: true, isHidden: true },
        ])
      ).toBe(false)
    })

    test('returns false if mangan shibari enabled', () => {
      expect(isYakuOverShibari(ss(true), [{ name: '탕야오', han: 1 }])).toBe(false)
    })

    test('returns true if mangan shibari disabled', () => {
      expect(isYakuOverShibari(ss(false), [{ name: '탕야오', han: 1 }])).toBe(true)
    })
  })

  describe('isNagashiMangan', () => {
    const ss = (river: string, called: TileSet[]) => {
      const state = createInitialState()
      state.host.river = r(river)
      state.guest.hand.called = called
      return state
    }

    test('returns false if not all yaochuuhai', () => {
      expect(isNagashiMangan(ss('1234567z2m', []), 'host')).toBe(false)
    })

    test('returns false if called by opponent', () => {
      expect(isNagashiMangan(ss('1234567z1m', [{ type: 'pon', tiles: c('999m'), jun: 3 }]), 'host')).toBe(false)
    })
  })
})
