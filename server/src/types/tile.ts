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

export type Koritsu = [Tile]
type KoritsuType = 'koritsu' | 'kokushi'
type KoritsuMachiType = 'tanki'
type KoritsuMachi = { type: KoritsuMachiType; tiles: [SimpleTile] }

export type Tatsu = [Tile, Tile]
type TatsuType = 'tatsu' | 'toitsu'
type TatsuMachiType = 'kanchan' | 'penchan' | 'ryanmen' | 'shabo'
export type TatsuMachi = { type: TatsuMachiType; tiles: [SimpleTile] | [SimpleTile, SimpleTile] }

export type MachiType = KoritsuMachiType | TatsuMachiType
export type Machi = KoritsuMachi | TatsuMachi

export type Syuntsu = [Tile, Tile, Tile]
export type Koutsu = [Tile, Tile, Tile]
type Kantsu = [Tile, Tile, Tile, Tile]

export type Mentsu = Syuntsu | Koutsu | Kantsu
type MentsuType = 'shuntsu' | 'koutsu' | 'kantsu'

export type Tsu =
  | { type: KoritsuType; tiles: Koritsu; open?: boolean }
  | { type: TatsuType; tiles: Tatsu; open?: boolean }
  | { type: MentsuType; tiles: Mentsu; open?: boolean }
