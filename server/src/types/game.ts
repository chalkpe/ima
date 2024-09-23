import type { Tenpai } from '@ima/server/types/tenpai'
import type { Tile } from '@ima/server/types/tile'
import type { AgariType, Yaku } from '@ima/server/types/yaku'

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
  banned: number[]
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

export type StateChangeType =
  | 'update'
  | 'start'
  | 'stop'
  | 'end'
  | 'tsumo'
  | 'ron'
  | 'riichi'
  | 'nuki'
  | 'kan'
  | 'pon'
  | 'chi'

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
  firstKingTileIndex: number
  lastKingTileIndex: number
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

interface BaseScoreboard {
  hostConfirmed: boolean
  guestConfirmed: boolean
}

export interface AgariScoreboard extends BaseScoreboard {
  type: 'agari'
  winner: PlayerType
  hand: Hand
  agariType: AgariType
  score: number
  han: number
  yakuman: number
  yaku: Yaku[]
  doraTiles: Tile[]
  uraDoraTiles: Tile[]
}

export type RyuukyokuType = 'ryuukyoku' | 'suukaikan'

export interface RyuukyokuScoreboard extends BaseScoreboard {
  type: 'ryuukyoku'
  tenpai: PlayerType[]
  ryuukyokuType: RyuukyokuType
  hostHand?: Hand
  guestHand?: Hand
}

export interface FinalScoreboard extends BaseScoreboard {
  type: 'final'
  hostScore: number
  guestScore: number
}

export type Scoreboard = AgariScoreboard | RyuukyokuScoreboard | FinalScoreboard

export interface Rule {
  localYaku: boolean
  manganShibari: boolean
  length: 'east' | 'south' | 'north'
  transparentMode: boolean
}

export interface GameState {
  rule: Rule
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
  hostUser?: { username: string; displayName: string } | null
  guest: string
  guestReady: boolean
  guestUser?: { username: string; displayName: string } | null
  started: boolean
  state: GameState
  stopRequestedBy: 'HOST' | 'GUEST' | null
  remainingTimeToStop: number | null
}

export interface LobbyRoom {
  host: string
  hostUser?: { username: string; displayName: string } | null
  guest: string | null
  guestUser?: { username: string; displayName: string } | null
}
