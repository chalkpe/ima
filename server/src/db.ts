import { EventEmitter } from 'events'
import type { Room } from './types/game'

interface Database {
  rooms: Room[]
  lastPing: Map<string, number>
}

export const database: Database = {
  rooms: [],
  lastPing: new Map(),
}

export const ee = new EventEmitter()