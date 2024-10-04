import z from 'zod'
import { protectedProcedure, router } from '@ima/server/trpc'
import { prisma } from '@ima/server/db'
import { TRPCError } from '@trpc/server'
import { createInitialState } from '@ima/server/helpers/game'
import type { LobbyRoom } from '@ima/server/types/game'

const getRoom = async (id: string, onlyHost = false) => {
  const room = await prisma.room.findFirst({
    where: onlyHost ? { host: id } : { OR: [{ host: id }, { guest: id }] },
    select: {
      host: true,
      hostReady: true,
      hostUser: { select: { id: true, displayName: true, nickname: true } },
      guest: true,
      guestReady: true,
      guestUser: { select: { id: true, displayName: true, nickname: true } },
      started: true,
      state: true,
    },
  })
  if (!room) throw new TRPCError({ code: 'NOT_FOUND', message: 'Room not found' })
  return room
}

export const lobbyRouter = router({
  list: protectedProcedure.query<LobbyRoom[]>(async () => {
    await prisma.room.deleteMany({
      where: {
        AND: [{ started: false }, { guest: null }, { updatedAt: { lte: new Date(Date.now() - 1000 * 60 * 60) } }],
      },
    })

    return await prisma.room.findMany({
      where: { started: false },
      orderBy: { updatedAt: 'desc' },
      select: {
        host: true,
        hostUser: { select: { id: true, displayName: true, nickname: true } },
        guest: true,
        guestUser: { select: { id: true, displayName: true, nickname: true } },
      },
    })
  }),

  create: protectedProcedure.mutation(async (opts) => {
    const { id } = opts.ctx
    if (await prisma.room.findFirst({ where: { host: id } })) {
      throw new TRPCError({ code: 'CONFLICT', message: '이미 호스트가 존재합니다.' })
    }

    await prisma.room.create({
      data: {
        hostUser: { connect: { id } },
        state: createInitialState(),
      },
    })
  }),

  leave: protectedProcedure.mutation(async (opts) => {
    const { id } = opts.ctx
    const room = await getRoom(id)
    if (!room) throw new TRPCError({ code: 'NOT_FOUND', message: '방을 찾을 수 없습니다.' })

    if (room.host === id) {
      if (room.guest) {
        await prisma.room.update({
          where: { host: id },
          data: {
            guestUser: { disconnect: true },
            guestReady: false,
            hostUser: { connect: { id: room.guest } },
            hostReady: room.guestReady,
          },
        })
      } else {
        await prisma.room.delete({ where: { host: id } })
      }
    } else {
      await prisma.room.update({
        where: { host: room.host },
        data: {
          guestUser: { disconnect: true },
          guestReady: false,
        },
      })
    }
  }),

  join: protectedProcedure.input(z.object({ host: z.string() })).mutation(async (opts) => {
    const { id } = opts.ctx
    const { host } = opts.input

    if (host === id) throw new TRPCError({ code: 'BAD_REQUEST', message: '호스트와 같은 이름입니다.' })

    const room = await getRoom(host, true)
    if (!room) throw new TRPCError({ code: 'NOT_FOUND', message: '호스트를 찾을 수 없습니다.' })

    if (room.guest) throw new TRPCError({ code: 'FORBIDDEN', message: '이미 게스트가 존재합니다.' })

    await prisma.room.update({ where: { host }, data: { guestUser: { connect: { id } } } })
    await prisma.room.deleteMany({ where: { host: id } })
  }),

  room: protectedProcedure.query(async (opts) => {
    const { id } = opts.ctx

    try {
      const room = await getRoom(id)
      return { ...room, state: { rule: room.state.rule } }
    } catch (err: unknown) {
      if (err instanceof TRPCError && err.code === 'NOT_FOUND') return null
    }
  }),

  ready: protectedProcedure.input(z.object({ ready: z.boolean() })).mutation(async (opts) => {
    const { id } = opts.ctx
    const room = await getRoom(id)

    if (room.host === id) room.hostReady = opts.input.ready
    else room.guestReady = opts.input.ready

    await prisma.room.update({
      where: { host: room.host },
      data: { hostReady: room.hostReady, guestReady: room.guestReady },
    })
  }),

  setLocalYaku: protectedProcedure.input(z.object({ value: z.boolean() })).mutation(async (opts) => {
    const { id } = opts.ctx
    const { value } = opts.input

    const room = await getRoom(id, true)
    room.state.rule.localYaku = value

    await prisma.room.update({ where: { host: room.host }, data: { state: room.state } })
  }),

  setManganShibari: protectedProcedure.input(z.object({ value: z.boolean() })).mutation(async (opts) => {
    const { id } = opts.ctx
    const { value } = opts.input

    const room = await getRoom(id, true)
    room.state.rule.manganShibari = value

    await prisma.room.update({ where: { host: room.host }, data: { state: room.state } })
  }),

  setLength: protectedProcedure
    .input(z.object({ value: z.enum(['east', 'south', 'north']) }))
    .mutation(async (opts) => {
      const { id } = opts.ctx
      const { value } = opts.input

      const room = await getRoom(id, true)
      room.state.rule.length = value

      await prisma.room.update({ where: { host: room.host }, data: { state: room.state } })
    }),

  setTransparentMode: protectedProcedure.input(z.object({ value: z.boolean() })).mutation(async (opts) => {
    const { id } = opts.ctx
    const { value } = opts.input

    const room = await getRoom(id, true)
    room.state.rule.transparentMode = value

    await prisma.room.update({ where: { host: room.host }, data: { state: room.state } })
  }),

  names: protectedProcedure.query(async (opts) => {
    const { id } = opts.ctx
    return await prisma.user.findFirst({
      where: { id },
      select: { id: true, username: true, displayName: true, nickname: true },
    })
  }),

  nickname: protectedProcedure.input(z.object({ nickname: z.string() })).mutation(async (opts) => {
    const { id } = opts.ctx
    const { nickname } = opts.input
    await prisma.user.update({ where: { id }, data: { nickname } })
  }),
})
