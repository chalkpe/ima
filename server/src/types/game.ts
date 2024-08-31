import type { SimpleTile, Tile } from './tile'

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
