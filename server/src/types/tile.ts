export type TileType = 'man' | 'pin' | 'sou' | 'wind' | 'dragon'

export interface Tile {
  type: TileType | 'back'
  value: number
  attribute: 'normal' | 'red'
  background: 'white' | 'transparent'
  index: number
}

export type SimpleTile = Pick<Tile, 'type' | 'value'>
