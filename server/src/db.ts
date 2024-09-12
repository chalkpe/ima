/* eslint-disable @typescript-eslint/no-namespace */

import { Redis } from 'iovalkey'
import { PrismaClient } from '@prisma/client'
import { GameState } from '@ima/server/types/game'

export const pub = new Redis()
export const sub = new Redis()
export const prisma = new PrismaClient()

declare global {
  namespace PrismaJson {
    type RoomState = GameState
  }
}
