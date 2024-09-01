import type { AgariState } from './agari'
import type { GameState, Hand, PlayerType } from './game'
import type { Tile, Tsu } from './tile'

export interface Yaku {
  name: string
  han: number
  isExtra?: boolean
}

export type AgariType = 'tsumo' | 'ron' | 'test'

export interface YakuPredicateParams {
  state: GameState
  me: PlayerType
  hand: Hand
  agariType: AgariType
  agariTile: Tile
  agariState: AgariState
  agariTsu: Tsu
}

export type YakuPredicate = (params: YakuPredicateParams) => Yaku | Yaku[] | false