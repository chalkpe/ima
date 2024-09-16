/* eslint-disable @typescript-eslint/no-namespace */

import { Redis } from 'iovalkey'
import { PrismaClient } from '@prisma/client'
import { GameState } from '@ima/server/types/game'

export const redis = process.env.REDIS_HOST ? new Redis(6379, process.env.REDIS_HOST) : new Redis()
redis.on('connect', () => console.info('✅ Redis connected to', `${redis.options.host}:${redis.options.port}`))
redis.on('error', (err) => console.error('❌ Redis error', err))

export const pub = process.env.REDIS_HOST ? new Redis(6379, process.env.REDIS_HOST) : new Redis()
pub.on('connect', () => console.info('✅ Redis Pub connected to', `${pub.options.host}:${pub.options.port}`))
pub.on('error', (err) => console.error('❌ Redis Pub error', err))

export const sub = process.env.REDIS_HOST ? new Redis(6379, process.env.REDIS_HOST) : new Redis()
sub.on('connect', () => console.info('✅ Redis Sub connected to', `${sub.options.host}:${sub.options.port}`))
sub.on('error', (err) => console.error('❌ Redis Sub error', err))

export const prisma = new PrismaClient()

declare global {
  namespace PrismaJson {
    type RoomState = GameState
  }
}
