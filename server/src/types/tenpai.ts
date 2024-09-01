import type { SimpleTile, Tile } from './tile'

export type TenpaiStatus = 'tenpai' | 'furiten' | 'muyaku'

export interface Tenpai {
  giriTile: Tile | null
  agariTile: SimpleTile
  status: TenpaiStatus
}
