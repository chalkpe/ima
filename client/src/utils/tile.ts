import { byOrder } from '@ima/client/utils/comparator'
import type { RiverTile, TileSet } from '@ima/server/types/game'
import type { SimpleTile, Tile } from '@ima/server/types/tile'

const tileTypeOrder: Tile['type'][] = ['man', 'pin', 'sou', 'wind', 'dragon']
const attributeOrder: Tile['attribute'][] = ['normal', 'red']

export const ankanAttributeOrder: Tile['attribute'][] = ['red', 'normal']
export const ankanBackgroundOrder: Tile['background'][] = ['transparent', 'white']

export const compareSimpleTile = (a: SimpleTile, b: SimpleTile) =>
  byOrder(a.type, b.type, tileTypeOrder) || a.value - b.value

export const compareTile = (a: Tile, b: Tile) =>
  compareSimpleTile(a, b) || byOrder(a.attribute, b.attribute, attributeOrder)

export const sortTiles = (tiles: Tile[]) => [...tiles].sort(compareTile)

export const reorderCalledTiles = (tileSet: TileSet) => {
  const { tiles, calledTile } = tileSet
  if (!calledTile) return tiles

  const [otherTile, ...otherTiles] = tiles.filter((tile) => tile.index !== calledTile.index)
  return [otherTile, calledTile, ...otherTiles]
}

export const backTile: Tile = { type: 'back', value: 0, attribute: 'normal', background: 'white', index: -1 }

export const convertTileToCode = (tile: Tile | SimpleTile) => {
  const suffix = 'attribute' in tile && tile.attribute === 'red' ? 'r' : ''

  switch (tile.type) {
    case 'man':
      return `${tile.value}m${suffix}`
    case 'pin':
      return `${tile.value}p${suffix}`
    case 'sou':
      return `${tile.value}s${suffix}`
    case 'wind':
      return `${tile.value}z`
    case 'dragon':
      return `${tile.value + 4}z`
    case 'back':
    default:
      return '0z'
  }
}

export const getBackground = (tile: Tile | SimpleTile) => {
  if (tile.type === 'back') return 'yellow'
  if ('background' in tile && tile.background === 'transparent') return 'transparent'
  return 'foreground'
}

export const chunk = (river: RiverTile[], size: number) => {
  const result: RiverTile[][] = []
  for (let i = 0; i < river.length; i += size) {
    result.push(river.slice(i, i + size))
  }
  return result
}
