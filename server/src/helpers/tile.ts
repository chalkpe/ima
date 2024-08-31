import { codeSyntaxToHand, tileToCode } from './code'
import type { Code } from '../types/code'
import type { RiverTile } from '../types/game'
import type { Koutsu, Mentsu, SimpleTile, Syuntsu, SyuupaiType, SyuupaiValue, Tatsu, TatsuMachi, Tile, TileType, ZihaiType } from '../types/tile'

export const tileTypes = ['man', 'pin', 'sou', 'wind', 'dragon'] as const satisfies TileType[]

export const countTiles = (hand: SimpleTile[]): Record<Code, number> =>
  hand.map(tileToCode).reduce((r, code) => ({ ...r, [code]: (r[code] || 0) + 1 }), {} as Record<Code, number>)

export const isEqualTile = (a: SimpleTile, b: SimpleTile): boolean => a.type === b.type && a.value === b.value

export const isStrictEqualTile = (a: Tile, b: Tile): boolean => isEqualTile(a, b) && a.attribute === b.attribute && a.background === b.background

export const removeTileFromHand = <T extends SimpleTile>(hand: T[], target: T, count: number): [T[], T[]] => {
  return hand.reduce(
    (res, t) => (isEqualTile(t, target) && res[1].length < count ? [res[0], [...res[1], t]] : [[...res[0], t], res[1]]),
    [[], []] as [T[], T[]]
  )
}

export const removeTilesFromHand = <T extends SimpleTile>(
  hand: T[],
  targets: readonly (readonly [T, number])[]
): [T[], T[][]] => {
  return targets.reduce(
    (res, [target, count]) => {
      const [remain, removed] = removeTileFromHand(res[0], target, count)
      return [remain, [...res[1], removed]]
    },
    [hand, []] as [T[], T[][]]
  )
}

export const simpleTileToTile = (tile: SimpleTile): Tile => ({
  ...tile,
  ...{ attribute: 'normal', background: 'white', index: -1 },
})

export const simpleTileToRiverTile = (tile: SimpleTile): RiverTile => ({
  tile: simpleTileToTile(tile),
  ...{ isRiichi: false, isTsumogiri: false },
})

export const kokushiTiles = codeSyntaxToHand('19m19p19s1234567z')

export const syuupaiTypes: SimpleTile['type'][] = ['man', 'pin', 'sou'] satisfies SyuupaiType[]
export const syuupaiValues: SimpleTile['value'][] = [1, 2, 3, 4, 5, 6, 7, 8, 9] satisfies SyuupaiValue[]

export const zihaiTypes: SimpleTile['type'][] = ['wind', 'dragon'] satisfies ZihaiType[]

export const getLowerTile = (tile: SimpleTile): SimpleTile | undefined => {
  if (!syuupaiTypes.includes(tile.type)) return
  if (!syuupaiValues.includes(tile.value)) return
  if (tile.value === syuupaiValues[0]) return

  return { type: tile.type, value: tile.value - 1 }
}

export const getUpperTile = (tile: SimpleTile): SimpleTile | undefined => {
  if (!syuupaiTypes.includes(tile.type)) return
  if (!syuupaiValues.includes(tile.value)) return
  if (tile.value === syuupaiValues[syuupaiValues.length - 1]) return

  return { type: tile.type, value: tile.value + 1 }
}

export const tileTypeOrder: SimpleTile['type'][] = ['man', 'pin', 'sou', 'wind', 'dragon', 'back']

export const compareTile = (a: SimpleTile, b: SimpleTile): number => {
  return tileTypeOrder.indexOf(a.type) - tileTypeOrder.indexOf(b.type) || a.value - b.value
}

export const compareTiles = (a: SimpleTile[], b: SimpleTile[]): number => {
  return a.length - b.length || a.reduce((res, tile, index) => res || compareTile(tile, b[index]), 0)
}

export const isKoutsu = (tiles: Koutsu): boolean => {
  return tiles.every((tile) => isEqualTile(tile, tiles[0]))
}

export const isSyuntsu = (tiles: Syuntsu): boolean => {
  const [a, b, c] = tiles.sort(compareTile)

  const bb = getUpperTile(a)
  const cc = getUpperTile(b)
  if (!bb || !cc) return false

  return isEqualTile(b, bb) && isEqualTile(c, cc)
}

export const getAllSyuntsu = (tile: SimpleTile): Mentsu[] => {
  const allSyuntsu: Mentsu[] = []

  const lower = getLowerTile(tile)
  const upper = getUpperTile(tile)

  if (lower) {
    const lowerLower = getLowerTile(lower)
    if (lowerLower) {
      allSyuntsu.push([lowerLower, lower, tile])
    }
  }

  if (upper && lower) {
    allSyuntsu.push([lower, tile, upper])
  }

  if (upper) {
    const upperUpper = getUpperTile(upper)
    if (upperUpper) {
      allSyuntsu.push([tile, upper, upperUpper])
    }
  }

  return allSyuntsu
}

export const getTatsuMachi = (tatsu: Tatsu): TatsuMachi | undefined => {
  const [a, b] = tatsu
  if (a.type !== b.type || a.value === b.value) return

  const [first, second] = a.value < b.value ? [a, b] : [b, a]
  const diff = second.value - first.value

  if (diff === 2) {
    const upper = getUpperTile(first)
    const lower = getLowerTile(second)

    if (!upper || !lower || !isEqualTile(upper, lower)) return
    return { type: 'kanchan', tiles: [upper] }
  }

  if (diff === 1) {
    const lower = getLowerTile(first)
    const upper = getUpperTile(second)

    if (lower && upper) return { type: 'ryanmen', tiles: [lower, upper] }
    if (lower) return { type: 'penchan', tiles: [lower] }
    if (upper) return { type: 'penchan', tiles: [upper] }
  }
}
