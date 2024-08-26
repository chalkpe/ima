import type { RiverTile, Tile } from '../../../server/src/db'

const tileTypeOrder: Tile['type'][] = ['man', 'pin', 'sou', 'wind', 'dragon']

export const sortTiles = (tiles: Tile[]) => {
  return tiles
    .map((tile, index) => ({ ...tile, index }))
    .sort((a, b) => tileTypeOrder.indexOf(a.type) - tileTypeOrder.indexOf(b.type) || a.value - b.value)
}

export const convertTileToCode = (tile: Tile) => {
  switch (tile.type) {
    case 'man':
      return tile.attribute === 'red' ? '0m' : `${tile.value}m`
    case 'pin':
      return tile.attribute === 'red' ? '0p' : `${tile.value}p`
    case 'sou':
      return tile.attribute === 'red' ? '0s' : `${tile.value}s`
    case 'wind':
      return `${tile.value}z`
    case 'dragon':
      return `${tile.value + 4}z`
    case 'back':
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