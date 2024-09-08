import type { Decision, RiverTile } from '@ima/server/types/game'
import type { SimpleTile, Tile } from '@ima/server/types/tile'

const tileTypeOrder: Tile['type'][] = ['man', 'pin', 'sou', 'wind', 'dragon']
const attributeOrder: Tile['attribute'][] = ['normal', 'red']

export const compareSimpleTile = (a: SimpleTile, b: SimpleTile) =>
  tileTypeOrder.indexOf(a.type) - tileTypeOrder.indexOf(b.type) || a.value - b.value

export const compareTile = (a: Tile, b: Tile) =>
  compareSimpleTile(a, b) || attributeOrder.indexOf(a.attribute) - attributeOrder.indexOf(b.attribute)

export const sortTiles = (tiles: Tile[]) => tiles.map((tile, order) => ({ ...tile, order })).sort(compareTile)

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
