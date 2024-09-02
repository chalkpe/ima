import type { AgariState } from './agari'
import type { RiichiState, Wind } from './game'
import type { Tile, Tsu } from './tile'

export interface Yaku {
  name: string
  han: number
  isExtra?: boolean
}

export type AgariType = 'tsumo' | 'ron' | 'test'

export interface YakuPredicateParams {
  agariType: AgariType
  agariTile: Tile
  agariState: AgariState
  agariTsu: Tsu
  bakaze: Wind
  jikaze: Wind
  menzen: boolean
  riichi: RiichiState
  doraTiles: Tile[]
  uraDoraTiles: Tile[]
}

export type YakuPredicate = (params: YakuPredicateParams) => Yaku | Yaku[] | false