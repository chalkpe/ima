import { EventEmitter } from 'tseep'
import type { Room, StateChangeType } from '@ima/server/types/game'

interface Database {
  rooms: Room[]
  lastPing: Map<string, number>
}

export const database: Database = {
  rooms: [],
  lastPing: new Map(),
}

export const ee = new EventEmitter<{
  update: (host: string, type: StateChangeType) => void
}>()
