import type { RiverTile } from '../../../server/src/types/game'
import type { SimpleTile, Tile } from '../../../server/src/types/tile'

const tileTypeOrder: Tile['type'][] = ['man', 'pin', 'sou', 'wind', 'dragon']
const attributeOrder: Tile['attribute'][] = ['normal', 'red']

export const sortTiles = (tiles: Tile[]) => {
  return tiles
    .map((tile, order) => ({ ...tile, order }))
    .sort(
      (a, b) =>
        tileTypeOrder.indexOf(a.type) - tileTypeOrder.indexOf(b.type) ||
        a.value - b.value ||
        attributeOrder.indexOf(a.attribute) - attributeOrder.indexOf(b.attribute)
    )
}

export const convertTileToCode = (tile: Tile | SimpleTile) => {
  switch (tile.type) {
    case 'man':
      return 'attribute' in tile && tile.attribute === 'red' ? '0m' : `${tile.value}m`
    case 'pin':
      return 'attribute' in tile && tile.attribute === 'red' ? '0p' : `${tile.value}p`
    case 'sou':
      return 'attribute' in tile && tile.attribute === 'red' ? '0s' : `${tile.value}s`
    case 'wind':
      return `${tile.value}z`
    case 'dragon':
      return `${tile.value + 4}z`
    case 'back':
    default:
      return '0z'
  }
}

export const convertRiverTileToCode = (river: RiverTile) => {
  const code = convertTileToCode(river.tile)

  if (river.isTsumogiri && river.isRiichi) return `v${code}`
  if (river.isTsumogiri) return `^${code}`
  if (river.isRiichi) return `_${code}`
  return code
}

export const chunk = (river: RiverTile[], size: number) => {
  const result: RiverTile[][] = []
  for (let i = 0; i < river.length; i += size) {
    result.push(river.slice(i, i + size))
  }
  return result
}
