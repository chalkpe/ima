export type SyuupaiType = 'man' | 'pin' | 'sou'
export type ZihaiType = 'wind' | 'dragon'
export type BackTileType = 'back'

export type TileType = SyuupaiType | ZihaiType | BackTileType
export type TileAttribute = 'normal' | 'red'
export type TileBackground = 'white' | 'transparent'

export interface Tile {
  type: TileType
  value: number
  index: number
  attribute: TileAttribute
  background: TileBackground
}

export type SimpleTile = Pick<Tile, 'type' | 'value'>

export type SyuupaiValue = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9
