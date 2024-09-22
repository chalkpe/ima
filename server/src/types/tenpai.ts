import type { SimpleTile, Tile } from '@ima/server/types/tile'

export type TenpaiStatus = 'tenpai' | 'furiten' | 'muyaku'

export interface Tenpai {
  giriTile: Tile | null
  agariTile: SimpleTile
  status: TenpaiStatus
  han?: { tsumo: number; ron: number }
}
