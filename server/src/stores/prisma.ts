/* eslint-disable @typescript-eslint/no-namespace */

import { PrismaClient } from '@prisma/client'
import type { GameState } from '@ima/server/types/game'

export default new PrismaClient()

declare global {
  namespace PrismaJson {
    type RoomState = GameState
  }
}
