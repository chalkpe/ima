import { codeSyntaxToHand, tileToCode } from './code'
import type { Code } from '../types/code'
import type { SimpleTile, Tile, TileType } from '../types/tile'

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

export const simpleTileToTile = (tile: SimpleTile): Tile => ({
  ...tile,
  ...{ attribute: 'normal', background: 'white', index: -1 },
})

export const kokushiTiles = codeSyntaxToHand('19m19p19s1234567z')
