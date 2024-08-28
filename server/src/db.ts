export type TileType = 'man' | 'pin' | 'sou' | 'wind' | 'dragon'
export const tileTypes = ['man', 'pin', 'sou', 'wind', 'dragon'] as const

export interface Tile {
  type: TileType | 'back'
  value: number
  attribute: 'normal' | 'red'
  background: 'white' | 'transparent'
}

export interface TileSet {
  type: 'pon' | 'chi' | 'gakan' | 'ankan' | 'daiminkan'
  tiles: Tile[]
  calledTile?: Tile
}

export interface Hand {
  closed: Tile[]
  called: TileSet[]
  tsumo?: Tile
}

export interface RiverTile {
  isTsumogiri: boolean
  isRiichi: boolean
  tile: Tile
}

export interface Decision {
  type: 'tsumo' | 'pon' | 'chi' | 'kan' | 'riichi' | 'ron' | 'nuki'
  tile: Tile
  otherTiles: Tile[]
}

export interface Player {
  river: RiverTile[]
  hand: Hand
  decisions: Decision[]
}

export interface Wall {
  tiles: Tile[]
  kingTiles: Tile[]
  supplementTiles: Tile[]
  doraCount: number
}

export interface GameState {
  host: Player
  guest: Player
  wall: Wall
  turn: 'host' | 'guest'
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

export const availableTiles: Tile[] = [1, 2, 3, 4].flatMap((count) =>
  [
    [1, 9].flatMap((value) => [{ type: 'man', value, attribute: getAttr(count, value), background: 'white' } as const]),
    [1, 9].flatMap((value) => [{ type: 'pin', value, attribute: getAttr(count, value), background: 'white' } as const]),
    [1, 2, 3, 4, 5, 6, 7, 8, 9].flatMap((value) => [
      { type: 'sou', value, attribute: getAttr(count, value), background: 'white' } as const,
    ]),
    [1, 2, 3, 4].flatMap((value) => [{ type: 'wind', value, attribute: 'normal', background: 'white' }] as const),
    [1, 2, 3].flatMap((value) => [{ type: 'dragon', value, attribute: 'normal', background: 'white' }] as const),
  ].flat()
)
