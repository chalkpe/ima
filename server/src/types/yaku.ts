import type { AgariState } from '@ima/server/types/agari'
import type { RiichiState, TileSet, Wind } from '@ima/server/types/game'
import type { Tile, Tsu } from '@ima/server/types/tile'

export interface Yaku {
  name: string
  han: number
  isExtra?: boolean
  isYakuman?: boolean
}

export type AgariType = 'tsumo' | 'ron' | 'test'

export interface YakuPredicateParams {
  agariType: AgariType
  agariTile: Tile
  agariState: AgariState
  agariTsu: Tsu
  jun: number
  bakaze: Wind
  jikaze: Wind
  menzen: boolean
  riichi: RiichiState
  doraTiles: Tile[]
  uraDoraTiles: Tile[]
  called: { me?: TileSet; opponent?: TileSet }
}

type YakuPredicate = (params: YakuPredicateParams) => Yaku | Yaku[] | false

export type YakuValidator = {
  level: 'extra' | 'normal' | 'yakuman'
  predicate: YakuPredicate
}