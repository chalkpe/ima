import z from 'zod'
import { TRPCError } from '@trpc/server'
import { observable } from '@trpc/server/observable'
import { protectedProcedure, router } from '@ima/server/trpc'
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

const getRoom = async (id: string, started?: boolean) => {
  const room = await prisma.room.findFirst({
    where: { OR: [{ host: id }, { guest: id }] },
    select: {
      host: true,
      hostReady: true,
      hostUser: { select: { id: true, displayName: true, nickname: true } },
      guest: true,
      guestReady: true,
      guestUser: { select: { id: true, displayName: true, nickname: true } },
      started: true,
      state: true,
      stopRequestedBy: true,
      remainingTimeToStop: true,
    },
  })
  if (!room) throw new TRPCError({ code: 'NOT_FOUND', message: 'Room not found' })

  const { guest } = room
  if (!guest) throw new TRPCError({ code: 'FORBIDDEN', message: 'Guest not found' })

  if (started === true && !room.started) throw new TRPCError({ code: 'FORBIDDEN', message: 'Game not started' })
  if (started === false && room.started) throw new TRPCError({ code: 'FORBIDDEN', message: 'Game already started' })

  return { ...room, guest }
}

export const gameRouter = router({
  state: protectedProcedure.query(async (opts) => {
    const { id } = opts.ctx
    const room = await getRoom(id)
    const me = room.host === id ? 'host' : 'guest'
    return { ...room, state: getVisibleState(room.state, me) }
  }),

  onStateChange: protectedProcedure.subscription(async (opts) => {
    const { id } = opts.ctx
    const room = await getRoom(id)

    await sub.subscribe(room.host)
    return observable<StateChangeType>((emit) => {
      const listener = (host: string, type: StateChangeType) => {
        if (host === room.host) emit.next(type)
      }
      sub.on('message', listener)
      return () => sub.off('message', listener)
    })
  }),

  start: protectedProcedure.mutation(async (opts) => {
    const { id } = opts.ctx
    const room = await getRoom(id, false)

    initState(room.state)
    room.state.turn = Math.round(Math.random()) ? 'host' : 'guest'
    room.state[room.state.turn].wind = 'east'
    room.state[getOpponent(room.state.turn)].wind = 'west'
    tsumo(room.state, room.state.turn, 'haiyama')

    await prisma.room.update({ where: { host: room.host }, data: { started: true, state: room.state } })
    pub.publish(room.host, 'start')
  }),

  stop: protectedProcedure.mutation(async (opts) => {
    const { id } = opts.ctx
    const room = await getRoom(id, true)

    const check = async () => {
      const r = await prisma.room.findFirst({
        where: { host: room.host },
        select: { remainingTimeToStop: true },
      })
      if (!r || r.remainingTimeToStop === null) return

      const remainingTimeToStop = r.remainingTimeToStop - 1
      if (remainingTimeToStop <= 0) {
        await prisma.room.update({
          where: { host: room.host },
          data: {
            stopRequestedBy: null,
            remainingTimeToStop: null,
            started: false,
            hostReady: false,
            guestReady: false,
            state: { ...createInitialState(), rule: room.state.rule },
          },
        })
        pub.publish(room.host, 'end')
      } else {
        await prisma.room.update({ where: { host: room.host }, data: { remainingTimeToStop } })
        pub.publish(room.host, 'update')
        setTimeout(check, 1000)
      }
    }

    await prisma.room.update({
      where: { host: room.host },
      data: { remainingTimeToStop: 30, stopRequestedBy: room.host === id ? 'HOST' : 'GUEST' },
    })
    pub.publish(room.host, 'stop')
    setTimeout(check, 1000)
  }),

  confirmStop: protectedProcedure.mutation(async (opts) => {
    const { id } = opts.ctx
    const room = await getRoom(id, true)

    const me = room.host === id ? 'HOST' : 'GUEST'
    if (room.stopRequestedBy === me)
      throw new TRPCError({ code: 'FORBIDDEN', message: 'Cannot confirm stop by yourself' })

    await prisma.room.update({
      where: { host: room.host },
      data: {
        stopRequestedBy: null,
        remainingTimeToStop: null,
        started: false,
        hostReady: false,
        guestReady: false,
        state: { ...createInitialState(), rule: room.state.rule },
      },
    })
    pub.publish(room.host, 'end')
  }),

  revertStop: protectedProcedure.mutation(async (opts) => {
    const { id } = opts.ctx
    const room = await getRoom(id, true)

    await prisma.room.update({ where: { host: room.host }, data: { remainingTimeToStop: null } })
    pub.publish(room.host, 'update')
  }),

  getRemainingTileCount: protectedProcedure
    .input(z.object({ type: z.enum(tileTypes), value: z.number() }))
    .query(async (opts) => {
      const { id } = opts.ctx
      const { type, value } = opts.input

      const room = await getRoom(id, true)
      const me = room.host === id ? 'host' : 'guest'
      return getRemainingTileCount(room.state, me, { type, value })
    }),

  pon: protectedProcedure.input(z.object({ tatsu: z.tuple([z.number(), z.number()]) })).mutation(async (opts) => {
    const { id } = opts.ctx
    const { tatsu } = opts.input

    const room = await getRoom(id, true)
    const me = getActiveMe(room, id)
    pon(room.state, me, tatsu)

    await prisma.room.update({ where: { host: room.host }, data: { state: room.state } })
    pub.publish(room.host, 'pon')
  }),

  chi: protectedProcedure.input(z.object({ tatsu: z.tuple([z.number(), z.number()]) })).mutation(async (opts) => {
    const { id } = opts.ctx
    const { tatsu } = opts.input

    const room = await getRoom(id, true)
    const me = getActiveMe(room, id)
    chi(room.state, me, tatsu)

    await prisma.room.update({ where: { host: room.host }, data: { state: room.state } })
    pub.publish(room.host, 'chi')
  }),

  daiminkan: protectedProcedure.mutation(async (opts) => {
    const { id } = opts.ctx

    const room = await getRoom(id, true)
    const me = getActiveMe(room, id)
    daiminkan(room.state, me)

    await prisma.room.update({ where: { host: room.host }, data: { state: room.state } })
    pub.publish(room.host, 'kan')
  }),

  ankan: protectedProcedure.input(z.object({ type: z.enum(tileTypes), value: z.number() })).mutation(async (opts) => {
    const { id } = opts.ctx
    const { type, value } = opts.input

    const room = await getRoom(id, true)
    const me = getActiveMe(room, id)
    ankan(room.state, me, type, value)

    await prisma.room.update({ where: { host: room.host }, data: { state: room.state } })
    pub.publish(room.host, 'kan')
  }),

  gakan: protectedProcedure.input(z.object({ type: z.enum(tileTypes), value: z.number() })).mutation(async (opts) => {
    const { id } = opts.ctx
    const { type, value } = opts.input

    const room = await getRoom(id, true)
    const me = getActiveMe(room, id)
    gakan(room.state, me, type, value)

    await prisma.room.update({ where: { host: room.host }, data: { state: room.state } })
    pub.publish(room.host, 'kan')
  }),

  skipAndTsumo: protectedProcedure.mutation(async (opts) => {
    const { id } = opts.ctx

    const room = await getRoom(id, true)
    const me = getActiveMe(room, id)
    const result = skipAndTsumo(room.state, me)

    await prisma.room.update({ where: { host: room.host }, data: { state: room.state } })
    pub.publish(room.host, result)
  }),

  skipChankan: protectedProcedure.mutation(async (opts) => {
    const { id } = opts.ctx

    const room = await getRoom(id, true)
    const me = getActiveMe(room, id)
    skipChankan(room.state, me)

    await prisma.room.update({ where: { host: room.host }, data: { state: room.state } })
    pub.publish(room.host, 'update')
  }),

  callTsumo: protectedProcedure.mutation(async (opts) => {
    const { id } = opts.ctx

    const room = await getRoom(id, true)
    const me = getActiveMe(room, id)
    callTsumo(room.state, me)

    await prisma.room.update({ where: { host: room.host }, data: { state: room.state } })
    pub.publish(room.host, 'tsumo')
  }),

  callRon: protectedProcedure.mutation(async (opts) => {
    const { id } = opts.ctx

    const room = await getRoom(id, true)
    const me = getActiveMe(room, id)
    callRon(room.state, me)

    await prisma.room.update({ where: { host: room.host }, data: { state: room.state } })
    pub.publish(room.host, 'ron')
  }),

  giri: protectedProcedure.input(z.object({ index: z.number() })).mutation(async (opts) => {
    const { id } = opts.ctx
    const { index } = opts.input

    const room = await getRoom(id, true)
    const me = getActiveMe(room, id)
    const result = giri(room.state, me, index)

    await prisma.room.update({ where: { host: room.host }, data: { state: room.state } })
    pub.publish(room.host, result)
  }),

  riichi: protectedProcedure.input(z.object({ index: z.number() })).mutation(async (opts) => {
    const { id } = opts.ctx
    const { index } = opts.input

    const room = await getRoom(id, true)
    const me = getActiveMe(room, id)
    const result = riichi(room.state, me, index)

    await prisma.room.update({ where: { host: room.host }, data: { state: room.state } })
    pub.publish(room.host, result)
  }),

  confirmScoreboard: protectedProcedure.mutation(async (opts) => {
    const { id } = opts.ctx

    const room = await getRoom(id, true)
    const result = confirmScoreboard(room.state, room.host === id ? 'host' : 'guest')

    if (result === 'end') {
      await prisma.room.update({
        where: { host: room.host },
        data: {
          started: false,
          hostReady: false,
          guestReady: false,
          state: { ...createInitialState(), rule: room.state.rule },
        },
      })
    } else {
      await prisma.room.update({ where: { host: room.host }, data: { state: room.state } })
    }
    pub.publish(room.host, result)
  }),
})
