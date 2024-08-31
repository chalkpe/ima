import { codeSyntaxToHand, tileToCode } from './code'
import type { Code } from '../types/code'
import type { SimpleTile, SyuupaiType, SyuupaiValue, Tile, TileType, ZihaiType } from '../types/tile'
import { RiverTile } from '../types/game'

export const tileTypes = ['man', 'pin', 'sou', 'wind', 'dragon'] as const satisfies TileType[]

export const countTiles = (hand: SimpleTile[]): Record<Code, number> =>
  hand.map(tileToCode).reduce((r, code) => ({ ...r, [code]: (r[code] || 0) + 1 }), {} as Record<Code, number>)

export const isEqualTile = (a: SimpleTile, b: SimpleTile): boolean => a.type === b.type && a.value === b.value

export const removeTileFromHand = <T extends SimpleTile>(hand: T[], target: T, count: number): [T[], T[]] => {
  return hand.reduce(
    (res, t) => (isEqualTile(t, target) && res[1].length < count ? [res[0], [...res[1], t]] : [[...res[0], t], res[1]]),
    [[], []] as [T[], T[]]
  )
}

export const removeTilesFromHand = <T extends SimpleTile>(hand: T[], targets: readonly (readonly [T, number])[]): [T[], T[][]] => {
  return targets.reduce((res, [target, count]) => {
    const [remain, removed] = removeTileFromHand(res[0], target, count)
    return [remain, [...res[1], removed]]
  }, [hand, []] as [T[], T[][]])
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
