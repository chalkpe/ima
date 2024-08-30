export type TileType = 'man' | 'pin' | 'sou' | 'wind' | 'dragon'
export const tileTypes = ['man', 'pin', 'sou', 'wind', 'dragon'] as const

export interface Tile {
  type: TileType | 'back'
  value: number
  attribute: 'normal' | 'red'
  background: 'white' | 'transparent'
  index: number
}

export type SimpleTile = Pick<Tile, 'type' | 'value'>

export interface TileSet {
  type: 'pon' | 'chi' | 'gakan' | 'ankan' | 'daiminkan'
  tiles: Tile[]
  calledTile?: Tile
}

export interface Hand {
  closed: Tile[]
  called: TileSet[]
  tsumo?: Tile
  tenpai: SimpleTile[][]
}

export interface RiverTile {
  isTsumogiri: boolean
  isRiichi: boolean
  tile: Tile
}

export interface Decision {
  type:
    | 'tsumo'
    | 'pon'
    | 'chi'
    | 'gakan'
    | 'ankan'
    | 'daiminkan'
    | 'riichi'
    | 'ron'
    | 'nuki'
    | 'skip_and_tsumo'
    | 'skip_chankan'
  tile?: Tile
  otherTiles?: Tile[]
}

export interface Player {
  river: RiverTile[]
  hand: Hand
  decisions: Decision[]
}

export type WallType = 'haiyama' | 'lingshang'

export interface Wall {
  tiles: Tile[]
  firstTileIndex: number
  lastTileIndex: number
  kingTiles: Tile[]
  supplementTiles: Tile[]
  doraCount: number
}

export type PlayerType = 'host' | 'guest'

export interface GameState {
  host: Player
  guest: Player
  wall: Wall
  turn: PlayerType
}

export interface Room {
  host: string
  hostReady: boolean
  guest: string
  guestReady: boolean
  started: boolean
  state: GameState
}

interface Database {
  rooms: Room[]
  lastPing: Map<string, number>
}

export const database: Database = {
  rooms: [],
  lastPing: new Map(),
}

const getAttr = (count: number, value: number) => (count === 1 && value === 5 ? 'red' : 'normal')

export const haipaiCounts = [4, 4, 4, 1]

export const availableTiles: Tile[] = [1, 2, 3, 4].flatMap((count) =>
  [
    [1, 9].flatMap((value) => [
      { type: 'man', value, attribute: getAttr(count, value), background: 'white', index: 0 } as const,
    ]),
    [1, 9].flatMap((value) => [
      { type: 'pin', value, attribute: getAttr(count, value), background: 'white', index: 0 } as const,
    ]),
    [1, 2, 3, 4, 5, 6, 7, 8, 9].flatMap((value) => [
      { type: 'sou', value, attribute: getAttr(count, value), background: 'white', index: 0 } as const,
    ]),
    [1, 2, 3, 4].flatMap(
      (value) => [{ type: 'wind', value, attribute: 'normal', background: 'white', index: 0 }] as const
    ),
    [1, 2, 3].flatMap(
      (value) => [{ type: 'dragon', value, attribute: 'normal', background: 'white', index: 0 }] as const
    ),
  ].flat()
)
