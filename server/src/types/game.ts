import type { Tenpai } from './tenpai'
import type { Tile } from './tile'
import type { Yaku } from './yaku'

export interface TileSet {
  type: 'pon' | 'chi' | 'gakan' | 'ankan' | 'daiminkan'
  jun: number
  tiles: Tile[]
  calledTile?: Tile
}

export interface Hand {
  closed: Tile[]
  called: TileSet[]
  tsumo?: Tile
  tenpai: Tenpai[]
  giriMap: boolean[]
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

export type RiichiState = number | null

export interface Player {
  wind: Wind
  river: RiverTile[]
  hand: Hand
  decisions: Decision[]
  jun: number
  riichi: RiichiState
  score: number
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

export type Wind = 'east' | 'south' | 'west' | 'north'

export interface Round {
  wind: Wind
  kyoku: number
  honba: number
  riichiSticks: number
}

export interface Scoreboard {
  winner: PlayerType
  score: number
  fu: number
  han: number
  yakuman: number
  yaku: Yaku[]
  hostConfirmed: boolean
  guestConfirmed: boolean
}

export interface GameState {
  host: Player
  guest: Player
  wall: Wall
  turn: PlayerType
  round: Round
  scoreboard?: Scoreboard
}

export interface Room {
  host: string
  hostReady: boolean
  guest: string
  guestReady: boolean
  started: boolean
  state: GameState
}
