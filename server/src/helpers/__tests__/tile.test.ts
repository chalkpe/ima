import { Koritsu, Koutsu, Tatsu } from '../../types/tile'
import { codeSyntaxToHand as c } from '../code'
import { availableTiles } from '../game'
import {
  countTiles,
  getAllSyuntsu,
  getDoraTile,
  getLowerTile,
  getMachiTiles,
  getTatsuMachi,
  getUpperTile,
  isEqualTile,
  isKoutsu,
  isStrictEqualTile,
  isSyuntsu,
  removeTileFromHand,
  removeTilesFromHand,
  simpleTileToTile,
  syuupaiTypes,
  zihaiTypes,
} from '../tile'

describe('tile', () => {
  describe('countTiles', () => {
    test('should return the count of tiles', () => {
      expect(countTiles(c('11123456789999m'))).toEqual({
        '1m': 3,
        '2m': 1,
        '3m': 1,
        '4m': 1,
        '5m': 1,
        '6m': 1,
        '7m': 1,
        '8m': 1,
        '9m': 4,
      })
    })
  })

  describe('isEqualTile', () => {
    test('should return true if the tiles are same', () => {
      expect(isEqualTile({ type: 'man', value: 1 }, { type: 'man', value: 1 })).toBeTruthy()
    })
    test('should return false if the tile type is different', () => {
      expect(isEqualTile({ type: 'dragon', value: 1 }, { type: 'sou', value: 1 })).toBeFalsy()
    })
    test('should return false if the tile value is different', () => {
      expect(isEqualTile({ type: 'pin', value: 1 }, { type: 'pin', value: 9 })).toBeFalsy()
    })
    test('should return false if the tiles are different', () => {
      expect(isEqualTile({ type: 'wind', value: 1 }, { type: 'back', value: 0 })).toBeFalsy()
    })
  })

  describe('isStrictEqualTile', () => {
    test('should return true if the tiles are same', () => {
      expect(
        isStrictEqualTile(
          { type: 'man', value: 5, attribute: 'red', background: 'white', index: 1 },
          { type: 'man', value: 5, attribute: 'red', background: 'white', index: 2 }
        )
      ).toBeTruthy()
    })
    test('should return false if the tile type is different', () => {
      expect(
        isStrictEqualTile(
          { type: 'dragon', value: 1, attribute: 'normal', background: 'white', index: 1 },
          { type: 'sou', value: 1, attribute: 'normal', background: 'white', index: 2 }
        )
      ).toBeFalsy()
    })
    test('should return false if the tile value is different', () => {
      expect(
        isStrictEqualTile(
          { type: 'pin', value: 1, attribute: 'normal', background: 'white', index: 1 },
          { type: 'pin', value: 9, attribute: 'normal', background: 'white', index: 2 }
        )
      ).toBeFalsy()
    })
    test('should return false if the tiles are different', () => {
      expect(
        isStrictEqualTile(
          { type: 'wind', value: 1, attribute: 'normal', background: 'white', index: 1 },
          { type: 'back', value: 0, attribute: 'normal', background: 'white', index: 2 }
        )
      ).toBeFalsy()
    })
    test('should return false if the red dora are different', () => {
      expect(
        isStrictEqualTile(
          { type: 'man', value: 5, attribute: 'red', background: 'white', index: 1 },
          { type: 'man', value: 5, attribute: 'normal', background: 'white', index: 2 }
        )
      ).toBeFalsy()
    })
  })

  describe('removeTileFromHand', () => {
    test('should return the removed tiles', () => {
      const hand = c('11123456789999m')
      const target = c('1m')[0]

      const [remain, removed] = removeTileFromHand(hand, target, 2)
      expect(remain).toEqual(c('123456789999m'))
      expect(removed).toEqual(c('11m'))
    })
  })

  describe('removeTilesFromHand', () => {
    test('should return the removed tiles', () => {
      const hand = c('11123456789999m')
      const targets = [
        [c('1m')[0], 2],
        [c('9m')[0], 5],
      ] as const

      const [remain, removed] = removeTilesFromHand(hand, targets)
      expect(remain).toEqual(c('12345678m'))
      expect(removed).toEqual([c('11m'), c('9999m')])
    })
    test('should return the removed tiles (syuntsu)', () => {
      const hand = c('11123456789999m')
      const targets = [
        [c('2m')[0], 1],
        [c('3m')[0], 1],
        [c('4m')[0], 1],
      ] as const

      const [remain, removed] = removeTilesFromHand(hand, targets)
      expect(remain).toEqual(c('11156789999m'))
      expect(removed).toEqual([c('2m'), c('3m'), c('4m')])
    })
    test('should return the removed tiles with duplicated target', () => {
      const hand = c('11123456789999m')
      const targets = [
        [c('9m')[0], 3],
        [c('9m')[0], 2],
      ] as const

      const [remain, removed] = removeTilesFromHand(hand, targets)
      expect(remain).toEqual(c('1112345678m'))
      expect(removed).toEqual([c('999m'), c('9m')])
    })
    test('should return the empty array if there is no target', () => {
      const hand = c('11123456789999m')
      const targets = [
        [c('1s')[0], 2],
        [c('2s')[0], 3],
      ] as const

      const [remain, removed] = removeTilesFromHand(hand, targets)
      expect(remain).toEqual(c('11123456789999m'))
      expect(removed).toEqual([[], []])
    })
  })

  describe('getLowerTile', () => {
    test.each(syuupaiTypes)('should return undefined if the tile is 1 (%s)', (type) => {
      expect(getLowerTile({ type, value: 1 })).toBeUndefined()
    })

    test('should return undefined if the tile is invalid value', () => {
      expect(getLowerTile({ type: 'man', value: 0 })).toBeUndefined()
    })

    test.each([2, 3, 4, 5, 6, 7, 8, 9])('should return the lower tile (%d)', (value) => {
      expect(getLowerTile({ type: 'man', value })).toEqual({ type: 'man', value: value - 1 })
    })

    test.each(zihaiTypes)('should return undefined if the tile is not syuupai (%s)', (type) => {
      expect(getLowerTile({ type, value: 2 })).toBeUndefined()
    })
  })

  describe('getUpperTile', () => {
    test.each(syuupaiTypes)('should return undefined if the tile is 9 (%s)', (type) => {
      expect(getUpperTile({ type, value: 9 })).toBeUndefined()
    })

    test('should return undefined if the tile is invalid value', () => {
      expect(getUpperTile({ type: 'man', value: 10 })).toBeUndefined()
    })

    test.each([1, 2, 3, 4, 5, 6, 7, 8])('should return the upper tile (%d)', (value) => {
      expect(getUpperTile({ type: 'man', value })).toEqual({ type: 'man', value: value + 1 })
    })

    test.each(zihaiTypes)('should return undefined if the tile is not syuupai (%s)', (type) => {
      expect(getUpperTile({ type, value: 2 })).toBeUndefined()
    })
  })

  describe('isKoutsu', () => {
    test('should return true if the tiles are koutsu', () => {
      expect(isKoutsu(c('111m') as Koutsu)).toBeTruthy()
    })
    test('should return false if the tiles are not koutsu', () => {
      expect(isKoutsu(c('123m') as Koutsu)).toBeFalsy()
    })
  })

  describe('isSyuntsu', () => {
    test('should return true if the tiles are syuntsu', () => {
      expect(
        isSyuntsu([
          simpleTileToTile({ type: 'man', value: 1 }),
          simpleTileToTile({ type: 'man', value: 2 }),
          simpleTileToTile({ type: 'man', value: 3 }),
        ])
      ).toBeTruthy()
      expect(
        isSyuntsu([
          simpleTileToTile({ type: 'pin', value: 3 }),
          simpleTileToTile({ type: 'pin', value: 2 }),
          simpleTileToTile({ type: 'pin', value: 1 }),
        ])
      ).toBeTruthy()
      expect(
        isSyuntsu([
          simpleTileToTile({ type: 'sou', value: 2 }),
          simpleTileToTile({ type: 'sou', value: 1 }),
          simpleTileToTile({ type: 'sou', value: 3 }),
        ])
      ).toBeTruthy()
    })
    test('should return false if the tiles are not syuntsu', () => {
      expect(
        isSyuntsu([
          simpleTileToTile({ type: 'man', value: 9 }),
          simpleTileToTile({ type: 'man', value: 1 }),
          simpleTileToTile({ type: 'man', value: 2 }),
        ])
      ).toBeFalsy()
      expect(
        isSyuntsu([
          simpleTileToTile({ type: 'man', value: 8 }),
          simpleTileToTile({ type: 'man', value: 9 }),
          simpleTileToTile({ type: 'man', value: 1 }),
        ])
      ).toBeFalsy()
      expect(
        isSyuntsu([
          simpleTileToTile({ type: 'man', value: 1 }),
          simpleTileToTile({ type: 'man', value: 2 }),
          simpleTileToTile({ type: 'man', value: 4 }),
        ])
      ).toBeFalsy()
      expect(
        isSyuntsu([
          simpleTileToTile({ type: 'man', value: -2 }),
          simpleTileToTile({ type: 'man', value: -1 }),
          simpleTileToTile({ type: 'man', value: 0 }),
        ])
      ).toBeFalsy()
      expect(
        isSyuntsu([
          simpleTileToTile({ type: 'man', value: 9 }),
          simpleTileToTile({ type: 'man', value: 10 }),
          simpleTileToTile({ type: 'man', value: 11 }),
        ])
      ).toBeFalsy()
      expect(
        isSyuntsu([
          simpleTileToTile({ type: 'wind', value: 1 }),
          simpleTileToTile({ type: 'wind', value: 2 }),
          simpleTileToTile({ type: 'wind', value: 3 }),
        ])
      ).toBeFalsy()
    })
  })

  describe('getTatsuMachi', () => {
    test('should return undefined if the tiles are not tatsu', () => {
      expect(
        getTatsuMachi([simpleTileToTile({ type: 'man', value: 1 }), simpleTileToTile({ type: 'pin', value: 1 })])
      ).toBeUndefined()
      expect(
        getTatsuMachi([simpleTileToTile({ type: 'man', value: 1 }), simpleTileToTile({ type: 'man', value: 1 })])
      ).toBeUndefined()
    })

    test('should return undefined if the tiles are invalid', () => {
      expect(
        getTatsuMachi([simpleTileToTile({ type: 'man', value: 0 }), simpleTileToTile({ type: 'man', value: 2 })])
      ).toBeUndefined()
      expect(
        getTatsuMachi([simpleTileToTile({ type: 'man', value: 8 }), simpleTileToTile({ type: 'man', value: 10 })])
      ).toBeUndefined()
    })

    test('should return kanchan if the tiles are kanchan', () => {
      expect(
        getTatsuMachi([simpleTileToTile({ type: 'man', value: 1 }), simpleTileToTile({ type: 'man', value: 3 })])
      ).toEqual({ type: 'kanchan', tiles: [{ type: 'man', value: 2 }] })
      expect(
        getTatsuMachi([simpleTileToTile({ type: 'pin', value: 3 }), simpleTileToTile({ type: 'pin', value: 1 })])
      ).toEqual({ type: 'kanchan', tiles: [{ type: 'pin', value: 2 }] })
    })

    test('should return ryanmen if the tiles are ryanmen', () => {
      expect(
        getTatsuMachi([simpleTileToTile({ type: 'pin', value: 2 }), simpleTileToTile({ type: 'pin', value: 3 })])
      ).toEqual({
        type: 'ryanmen',
        tiles: [
          { type: 'pin', value: 1 },
          { type: 'pin', value: 4 },
        ],
      })
    })

    test('should return penchan if the tiles are penchan', () => {
      expect(
        getTatsuMachi([simpleTileToTile({ type: 'sou', value: 1 }), simpleTileToTile({ type: 'sou', value: 2 })])
      ).toEqual({ type: 'penchan', tiles: [{ type: 'sou', value: 3 }] })
      expect(
        getTatsuMachi([simpleTileToTile({ type: 'sou', value: 8 }), simpleTileToTile({ type: 'sou', value: 9 })])
      ).toEqual({ type: 'penchan', tiles: [{ type: 'sou', value: 7 }] })
    })
  })

  describe('getAllSyuntsu', () => {
    test('should return all syuntsu (one)', () => {
      expect(getAllSyuntsu({ type: 'man', value: 1 })).toEqual([
        [
          simpleTileToTile({ type: 'man', value: 1 }),
          simpleTileToTile({ type: 'man', value: 2 }),
          simpleTileToTile({ type: 'man', value: 3 }),
        ],
      ])
      expect(getAllSyuntsu({ type: 'man', value: 9 })).toEqual([
        [
          simpleTileToTile({ type: 'man', value: 7 }),
          simpleTileToTile({ type: 'man', value: 8 }),
          simpleTileToTile({ type: 'man', value: 9 }),
        ],
      ])
    })
    test('should return all syuntsu (two)', () => {
      expect(getAllSyuntsu({ type: 'man', value: 2 })).toEqual([
        [
          simpleTileToTile({ type: 'man', value: 1 }),
          simpleTileToTile({ type: 'man', value: 2 }),
          simpleTileToTile({ type: 'man', value: 3 }),
        ],
        [
          simpleTileToTile({ type: 'man', value: 2 }),
          simpleTileToTile({ type: 'man', value: 3 }),
          simpleTileToTile({ type: 'man', value: 4 }),
        ],
      ])
      expect(getAllSyuntsu({ type: 'man', value: 8 })).toEqual([
        [
          simpleTileToTile({ type: 'man', value: 6 }),
          simpleTileToTile({ type: 'man', value: 7 }),
          simpleTileToTile({ type: 'man', value: 8 }),
        ],
        [
          simpleTileToTile({ type: 'man', value: 7 }),
          simpleTileToTile({ type: 'man', value: 8 }),
          simpleTileToTile({ type: 'man', value: 9 }),
        ],
      ])
    })
    test('should return all syuntsu (three)', () => {
      expect(getAllSyuntsu({ type: 'man', value: 3 })).toEqual([
        [
          simpleTileToTile({ type: 'man', value: 1 }),
          simpleTileToTile({ type: 'man', value: 2 }),
          simpleTileToTile({ type: 'man', value: 3 }),
        ],
        [
          simpleTileToTile({ type: 'man', value: 2 }),
          simpleTileToTile({ type: 'man', value: 3 }),
          simpleTileToTile({ type: 'man', value: 4 }),
        ],
        [
          simpleTileToTile({ type: 'man', value: 3 }),
          simpleTileToTile({ type: 'man', value: 4 }),
          simpleTileToTile({ type: 'man', value: 5 }),
        ],
      ])
      expect(getAllSyuntsu({ type: 'man', value: 7 })).toEqual([
        [
          simpleTileToTile({ type: 'man', value: 5 }),
          simpleTileToTile({ type: 'man', value: 6 }),
          simpleTileToTile({ type: 'man', value: 7 }),
        ],
        [
          simpleTileToTile({ type: 'man', value: 6 }),
          simpleTileToTile({ type: 'man', value: 7 }),
          simpleTileToTile({ type: 'man', value: 8 }),
        ],
        [
          simpleTileToTile({ type: 'man', value: 7 }),
          simpleTileToTile({ type: 'man', value: 8 }),
          simpleTileToTile({ type: 'man', value: 9 }),
        ],
      ])
    })
  })

  describe('getMachiTiles', () => {
    test('should return the machi tiles (tanki)', () => {
      expect(getMachiTiles({ type: 'tanki', tiles: c('4z') as Koritsu })).toEqual(c('4z'))
      expect(getMachiTiles({ type: 'tanki', tiles: c('44z') as Koritsu })).toEqual([]) // invalid
    })
    test('should return the machi tiles (shabo)', () => {
      expect(getMachiTiles({ type: 'shabo', tiles: c('11s') as Tatsu })).toEqual(c('1s'))
      expect(getMachiTiles({ type: 'shabo', tiles: c('12s') as Tatsu })).toEqual([]) // invalid
      expect(getMachiTiles({ type: 'shabo', tiles: c('1s') as Tatsu })).toEqual([]) // invalid
    })
    test('should return the machi tiles (kanchan)', () => {
      expect(getMachiTiles({ type: 'kanchan', tiles: c('24m') as Tatsu })).toEqual(c('3m'))
      expect(getMachiTiles({ type: 'kanchan', tiles: c('23m') as Tatsu })).toEqual([]) // invalid
      expect(getMachiTiles({ type: 'kanchan', tiles: c('2m') as Tatsu })).toEqual([]) // invalid
    })
    test('should return the machi tiles (penchan)', () => {
      expect(getMachiTiles({ type: 'penchan', tiles: c('12m') as Tatsu })).toEqual(c('3m'))
      expect(getMachiTiles({ type: 'penchan', tiles: c('89m') as Tatsu })).toEqual(c('7m'))
      expect(getMachiTiles({ type: 'penchan', tiles: c('18m') as Tatsu })).toEqual([]) // invalid
      expect(getMachiTiles({ type: 'penchan', tiles: c('29m') as Tatsu })).toEqual([]) // invalid
      expect(getMachiTiles({ type: 'penchan', tiles: c('23m') as Tatsu })).toEqual([]) // invalid
      expect(getMachiTiles({ type: 'penchan', tiles: c('1m') as Tatsu })).toEqual([]) // invalid
    })
    test('should return the machi tiles (ryanmen)', () => {
      expect(getMachiTiles({ type: 'ryanmen', tiles: c('23m') as Tatsu })).toEqual(c('14m'))
      expect(getMachiTiles({ type: 'ryanmen', tiles: c('78m') as Tatsu })).toEqual(c('69m'))
      expect(getMachiTiles({ type: 'ryanmen', tiles: c('12m') as Tatsu })).toEqual([]) // invalid
      expect(getMachiTiles({ type: 'ryanmen', tiles: c('22m') as Tatsu })).toEqual([]) // invalid
      expect(getMachiTiles({ type: 'ryanmen', tiles: c('24m') as Tatsu })).toEqual([]) // invalid
      expect(getMachiTiles({ type: 'ryanmen', tiles: c('1m') as Tatsu })).toEqual([]) // invalid
    })
  })

  describe('getDoraTile', () => {
    test('should return the dora tile', () => {
      expect(getDoraTile(c('1m')[0], availableTiles)).toEqual(c('9m')[0])
      expect(getDoraTile(c('9m')[0], availableTiles)).toEqual(c('1m')[0])
      expect(getDoraTile(c('1p')[0], availableTiles)).toEqual(c('9p')[0])
      expect(getDoraTile(c('9p')[0], availableTiles)).toEqual(c('1p')[0])
      expect(getDoraTile(c('1s')[0], availableTiles)).toEqual(c('2s')[0])
      expect(getDoraTile(c('9s')[0], availableTiles)).toEqual(c('1s')[0])
      expect(getDoraTile(c('1z')[0], availableTiles)).toEqual(c('2z')[0])
      expect(getDoraTile(c('4z')[0], availableTiles)).toEqual(c('1z')[0])
      expect(getDoraTile(c('5z')[0], availableTiles)).toEqual(c('6z')[0])
      expect(getDoraTile(c('7z')[0], availableTiles)).toEqual(c('5z')[0])
    })
  })
})
