import type { Code } from "./code"
import type { Machi, Tsu } from './tile'

export type AgariState = Tsu[]
export type TenpaiState = (Tsu | Machi)[]

export interface AgariResult {
  status: 'agari' | 'tenpai' | 'noten'
  state: AgariState
  agari: AgariState[]
  tenpai: Map<Code, TenpaiState[]>
}
