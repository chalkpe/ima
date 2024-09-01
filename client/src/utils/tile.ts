import type { Decision, RiverTile } from '../../../server/src/types/game'
import type { SimpleTile, Tile } from '../../../server/src/types/tile'

const tileTypeOrder: Tile['type'][] = ['man', 'pin', 'sou', 'wind', 'dragon']
const attributeOrder: Tile['attribute'][] = ['normal', 'red']

export const compareSimpleTile = (a: SimpleTile, b: SimpleTile) =>
  tileTypeOrder.indexOf(a.type) - tileTypeOrder.indexOf(b.type) || a.value - b.value

export const compareTile = (a: Tile, b: Tile) =>
  compareSimpleTile(a, b) || attributeOrder.indexOf(a.attribute) - attributeOrder.indexOf(b.attribute)

export const sortTiles = (tiles: Tile[]) => tiles.map((tile, order) => ({ ...tile, order })).sort(compareTile)

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

const decisionTypeOrder: Decision['type'][] = [
  'ankan',
  'gakan',
  'daiminkan',
  'pon',
  'chi',
  'nuki',
  'riichi',
  'tsumo',
  'ron',
  'skip_chankan',
  'skip_and_tsumo',
]

export const compareDecisions = (a: Decision, b: Decision) => {
  return (
    decisionTypeOrder.indexOf(a.type) - decisionTypeOrder.indexOf(b.type) ||
    (a.tile && !b.tile ? -1 : !a.tile && b.tile ? 1 : a.tile && b.tile ? compareTile(a.tile, b.tile) : 0)
  )
}
