import z from 'zod'
import { TRPCError } from '@trpc/server'
import { observable } from '@trpc/server/observable'
import { publicProcedure, router } from '@ima/server/trpc'
import { prisma, pub, sub } from '@ima/server/db'

import {
  confirmScoreboard,
  getRemainingTileCount,
  getVisibleState,
  initState,
} from '@ima/server/controllers/game/state'
import {
  ankan,
  callRon,
  callTsumo,
  chi,
  daiminkan,
  gakan,
  giri,
  pon,
  riichi,
  skipAndTsumo,
  skipChankan,
  tsumo,
} from '@ima/server/controllers/game/action'
import { tileTypes } from '@ima/server/helpers/tile'
import { createInitialState, getActiveMe, getOpponent } from '@ima/server/helpers/game'
import type { StateChangeType } from '@ima/server/types/game'

const getRoom = async (username: string, started?: boolean) => {
  const room = await prisma.room.findFirst({ where: { OR: [{ host: username }, { guest: username }] } })
  if (!room) throw new TRPCError({ code: 'NOT_FOUND', message: 'Room not found' })
  if (started === true && !room.started) throw new TRPCError({ code: 'FORBIDDEN', message: 'Game not started' })
  if (started === false && room.started) throw new TRPCError({ code: 'FORBIDDEN', message: 'Game already started' })
  return room
}

export const gameRouter = router({
  state: publicProcedure.query(async (opts) => {
    const { username } = opts.ctx
    const room = await getRoom(username)
    const me = room.host === username ? 'host' : 'guest'
    return { ...room, state: getVisibleState(room.state, me) }
  }),

  onStateChange: publicProcedure.subscription(async (opts) => {
    const { username } = opts.ctx
    const room = await getRoom(username)

    return observable<StateChangeType>((emit) => {
      const listener = (host: string, type: StateChangeType) => host === room.host && emit.next(type)

      sub.subscribe(room.host)
      sub.on('message', listener)
      return () => {
        sub.unsubscribe(room.host)
        sub.off('message', listener)
      }
    })
  }),

  start: publicProcedure.mutation(async (opts) => {
    const { username } = opts.ctx
    const room = await getRoom(username, false)

    initState(room.state)
    room.state.turn = Math.round(Math.random()) ? 'host' : 'guest'
    room.state[room.state.turn].wind = 'east'
    room.state[getOpponent(room.state.turn)].wind = 'west'
    tsumo(room.state, room.state.turn, 'haiyama')

    await prisma.room.update({ where: { host: room.host }, data: { started: true, state: room.state } })
    pub.publish(room.host, 'start')
  }),

  getRemainingTileCount: publicProcedure
    .input(z.object({ type: z.enum(tileTypes), value: z.number() }))
    .query(async (opts) => {
      const { username } = opts.ctx
      const { type, value } = opts.input

      const room = await getRoom(username, true)
      const me = room.host === username ? 'host' : 'guest'
      return getRemainingTileCount(room.state, me, { type, value })
    }),

  pon: publicProcedure.input(z.object({ tatsu: z.tuple([z.number(), z.number()]) })).mutation(async (opts) => {
    const { username } = opts.ctx
    const { tatsu } = opts.input

    const room = await getRoom(username, true)
    const me = getActiveMe(room, username)
    pon(room.state, me, tatsu)

    await prisma.room.update({ where: { host: room.host }, data: { state: room.state } })
    pub.publish(room.host, 'pon')
  }),

  chi: publicProcedure.input(z.object({ tatsu: z.tuple([z.number(), z.number()]) })).mutation(async (opts) => {
    const { username } = opts.ctx
    const { tatsu } = opts.input

    const room = await getRoom(username, true)
    const me = getActiveMe(room, username)
    chi(room.state, me, tatsu)

    await prisma.room.update({ where: { host: room.host }, data: { state: room.state } })
    pub.publish(room.host, 'chi')
  }),

  daiminkan: publicProcedure.mutation(async (opts) => {
    const { username } = opts.ctx

    const room = await getRoom(username, true)
    const me = getActiveMe(room, username)
    daiminkan(room.state, me)

    await prisma.room.update({ where: { host: room.host }, data: { state: room.state } })
    pub.publish(room.host, 'kan')
  }),

  ankan: publicProcedure.input(z.object({ type: z.enum(tileTypes), value: z.number() })).mutation(async (opts) => {
    const { username } = opts.ctx
    const { type, value } = opts.input

    const room = await getRoom(username, true)
    const me = getActiveMe(room, username)
    ankan(room.state, me, type, value)

    await prisma.room.update({ where: { host: room.host }, data: { state: room.state } })
    pub.publish(room.host, 'kan')
  }),

  gakan: publicProcedure.input(z.object({ type: z.enum(tileTypes), value: z.number() })).mutation(async (opts) => {
    const { username } = opts.ctx
    const { type, value } = opts.input

    const room = await getRoom(username, true)
    const me = getActiveMe(room, username)
    gakan(room.state, me, type, value)

    await prisma.room.update({ where: { host: room.host }, data: { state: room.state } })
    pub.publish(room.host, 'kan')
  }),

  skipAndTsumo: publicProcedure.mutation(async (opts) => {
    const { username } = opts.ctx

    const room = await getRoom(username, true)
    const me = getActiveMe(room, username)
    const result = skipAndTsumo(room.state, me)

    await prisma.room.update({ where: { host: room.host }, data: { state: room.state } })
    pub.publish(room.host, result)
  }),

  skipChankan: publicProcedure.mutation(async (opts) => {
    const { username } = opts.ctx

    const room = await getRoom(username, true)
    const me = getActiveMe(room, username)
    skipChankan(room.state, me)

    await prisma.room.update({ where: { host: room.host }, data: { state: room.state } })
    pub.publish(room.host, 'update')
  }),

  callTsumo: publicProcedure.mutation(async (opts) => {
    const { username } = opts.ctx

    const room = await getRoom(username, true)
    const me = getActiveMe(room, username)
    callTsumo(room.state, me)

    await prisma.room.update({ where: { host: room.host }, data: { state: room.state } })
    pub.publish(room.host, 'tsumo')
  }),

  callRon: publicProcedure.mutation(async (opts) => {
    const { username } = opts.ctx

    const room = await getRoom(username, true)
    const me = getActiveMe(room, username)
    callRon(room.state, me)

    await prisma.room.update({ where: { host: room.host }, data: { state: room.state } })
    pub.publish(room.host, 'ron')
  }),

  giri: publicProcedure.input(z.object({ index: z.number() })).mutation(async (opts) => {
    const { username } = opts.ctx
    const { index } = opts.input

    const room = await getRoom(username, true)
    const me = getActiveMe(room, username)
    const result = giri(room.state, me, index)

    await prisma.room.update({ where: { host: room.host }, data: { state: room.state } })
    pub.publish(room.host, result)
  }),

  riichi: publicProcedure.input(z.object({ index: z.number() })).mutation(async (opts) => {
    const { username } = opts.ctx
    const { index } = opts.input

    const room = await getRoom(username, true)
    const me = getActiveMe(room, username)
    const result = riichi(room.state, me, index)

    await prisma.room.update({ where: { host: room.host }, data: { state: room.state } })
    pub.publish(room.host, result)
  }),

  confirmScoreboard: publicProcedure.mutation(async (opts) => {
    const { username } = opts.ctx

    const room = await getRoom(username, true)
    const result = confirmScoreboard(room.state, room.host === username ? 'host' : 'guest')

    if (result === 'end') {
      room.started = false
      room.hostReady = false
      room.guestReady = false
      room.state = createInitialState()
    }

    await prisma.room.update({ where: { host: room.host }, data: room })
    pub.publish(room.host, result)
  }),
})
