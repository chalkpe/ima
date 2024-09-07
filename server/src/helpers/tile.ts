import { backTile, codeSyntaxToHand, tileToCode } from '@ima/server/helpers/code'
import type { Code } from '@ima/server/types/code'
import type { RiverTile, Wind } from '@ima/server/types/game'
import type {
  Koutsu,
  Machi,
  MachiType,
  Mentsu,
  SimpleDragonHaiTile,
  SimpleSyuupaiTile,
  SimpleTile,
  SimpleWindHaiTile,
  SimpleZihaiTile,
  Syuntsu,
  SyuupaiType,
  SyuupaiValue,
  Tatsu,
  TatsuMachi,
  Tile,
  TileType,
  Tsu,
  ZihaiType,
} from '@ima/server/types/tile'

export const tileTypes = ['man', 'pin', 'sou', 'wind', 'dragon'] as const satisfies TileType[]

export const countTiles = (hand: SimpleTile[]): Record<Code, number> =>
  hand.map(tileToCode).reduce((r, code) => ({ ...r, [code]: (r[code] || 0) + 1 }), {} as Record<Code, number>)

export const isEqualTile = (a: SimpleTile, b: SimpleTile): boolean => a.type === b.type && a.value === b.value

export const isStrictEqualTile = (a: Tile, b: Tile): boolean =>
  isEqualTile(a, b) && a.attribute === b.attribute && a.background === b.background

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

export const ryuuiisouTiles = codeSyntaxToHand('23468s6z')

export const hideTile = (tile: Tile) => ({ ...simpleTileToTile(backTile), index: tile.index })

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

export const getDoraTile = (tile: SimpleTile, availableTiles: Tile[]): SimpleTile => {
  const next = { type: tile.type, value: tile.value + 1 }
  if (availableTiles.some((t) => isEqualTile(t, next))) return next

  const { type, value } = availableTiles
    .filter((t) => t.type === tile.type && t.value !== tile.value)
    .sort((a, b) => a.value - b.value)[0]
  return { type, value }
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
      allSyuntsu.push([lowerLower, lower, tile].map(simpleTileToTile) as Syuntsu)
    }
  }

  if (upper && lower) {
    allSyuntsu.push([lower, tile, upper].map(simpleTileToTile) as Syuntsu)
  }

  if (upper) {
    const upperUpper = getUpperTile(upper)
    if (upperUpper) {
      allSyuntsu.push([tile, upper, upperUpper].map(simpleTileToTile) as Syuntsu)
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

const machiTypes: string[] = ['tanki', 'kanchan', 'penchan', 'ryanmen', 'shabo'] satisfies MachiType[]

export const isMachiType = (type: string): type is MachiType => machiTypes.includes(type)

export const isMachi = (set: Tsu | Machi): set is Machi => isMachiType(set.type)

export const getMachiTiles = (machi: Machi): SimpleTile[] => {
  const tiles = machi.tiles.sort(compareTile)

  switch (machi.type) {
    case 'tanki': {
      if (tiles.length !== 1) return []
      return [machi.tiles[0]]
    }
    case 'shabo': {
      if (tiles.length !== 2) return []
      const [first, second] = tiles
      return isEqualTile(first, second) ? [first] : []
    }
    case 'kanchan': {
      if (tiles.length !== 2) return []
      const [upper, lower] = [getUpperTile(tiles[0]), getLowerTile(tiles[1])]
      return upper && lower && isEqualTile(upper, lower) ? [upper] : []
    }
    case 'penchan': {
      if (tiles.length !== 2) return []
      const [a, b] = tiles
      const [lower, second, first, upper] = [getLowerTile(a), getUpperTile(a), getLowerTile(b), getUpperTile(b)]
      if (!first || !second || !isEqualTile(first, a) || !isEqualTile(second, b)) return []
      return lower && !upper ? [lower] : upper && !lower ? [upper] : []
    }
    case 'ryanmen': {
      if (tiles.length !== 2) return []
      const [a, b] = tiles
      const [lower, second, first, upper] = [getLowerTile(a), getUpperTile(a), getLowerTile(b), getUpperTile(b)]
      return lower && upper && first && second && isEqualTile(first, a) && isEqualTile(second, b) ? [lower, upper] : []
    }
  }
}

const windMap: Record<number, Wind> = { 1: 'east', 2: 'south', 3: 'west', 4: 'north' }

export const isSyuupai = (tile: SimpleTile): tile is SimpleSyuupaiTile => syuupaiTypes.includes(tile.type)

export const isWindHai = (tile: SimpleTile): tile is SimpleWindHaiTile => tile.type === 'wind'

export const isDragonHai = (tile: SimpleTile): tile is SimpleDragonHaiTile => tile.type === 'dragon'

export const isZihai = (tile: SimpleTile): tile is SimpleZihaiTile => isWindHai(tile) || isDragonHai(tile)

export const isYaochuuhai = (tile: SimpleTile) => isZihai(tile) || tile.value === 1 || tile.value === 9

export const isYakuhai = (tile: SimpleTile, bakaze: Wind, jikaze: Wind) =>
  isDragonHai(tile) || (isWindHai(tile) && [bakaze, jikaze].includes(windMap[tile.value]))

export const getTileWind = (tile: SimpleTile): Wind | undefined => (isWindHai(tile) ? windMap[tile.value] : undefined)

export const getTilesValueString = (tiles: SimpleTile[]) =>
  tiles
    .sort(compareTile)
    .map((tile) => tile.value)
    .join('')

export const tileNames: Record<Code, string> = {
  '1m': '1만',
  '2m': '2만',
  '3m': '3만',
  '4m': '4만',
  '5m': '5만',
  '6m': '6만',
  '7m': '7만',
  '8m': '8만',
  '9m': '9만',
  '1p': '1통',
  '2p': '2통',
  '3p': '3통',
  '4p': '4통',
  '5p': '5통',
  '6p': '6통',
  '7p': '7통',
  '8p': '8통',
  '9p': '9통',
  '1s': '1삭',
  '2s': '2삭',
  '3s': '3삭',
  '4s': '4삭',
  '5s': '5삭',
  '6s': '6삭',
  '7s': '7삭',
  '8s': '8삭',
  '9s': '9삭',
  '0z': '?',
  '1z': '동',
  '2z': '남',
  '3z': '서',
  '4z': '북',
  '5z': '백',
  '6z': '발',
  '7z': '중',
}

export const syuntsuNumbers = ['123', '234', '345', '456', '567', '678', '789'] as const
