import type { Code } from '@ima/server/types/code'
import type { Machi, Tsu } from '@ima/server/types/tile'

export type AgariState = Tsu[]
export type TenpaiState = (Tsu | Machi)[]

export interface AgariResult {
  status: 'agari' | 'tenpai' | 'noten'
  state: AgariState
  agari: AgariState[]
  tenpai: Record<Code, TenpaiState[]>
}
