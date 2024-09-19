import z from 'zod'
import { protectedProcedure, router } from '@ima/server/trpc'
import { prisma } from '@ima/server/db'
import { TRPCError } from '@trpc/server'
import { createInitialState } from '@ima/server/helpers/game'
import type { GameState, LobbyRoom } from '@ima/server/types/game'

const getRoom = async (username: string, onlyHost = false) => {
  const room = await prisma.room.findFirst({
    where: onlyHost ? { host: username } : { OR: [{ host: username }, { guest: username }] },
    select: {
      host: true,
      hostReady: true,
      hostUser: { select: { username: true, displayName: true } },
      guest: true,
      guestReady: true,
      guestUser: { select: { username: true, displayName: true } },
      started: true,
      state: true,
    },
  })
  if (!room) throw new TRPCError({ code: 'NOT_FOUND', message: 'Room not found' })
  return room
}

export const lobbyRouter = router({
  list: protectedProcedure.query<LobbyRoom[]>(() =>
    prisma.room.findMany({
      where: { NOT: { started: true } },
      select: {
        host: true,
        hostUser: { select: { username: true, displayName: true } },
        guest: true,
        guestUser: { select: { username: true, displayName: true } },
      },
    })
  ),

  create: protectedProcedure.mutation(async (opts) => {
    const { username } = opts.ctx
    if (await prisma.room.findFirst({ where: { host: username } })) {
      throw new TRPCError({ code: 'CONFLICT', message: '이미 호스트가 존재합니다.' })
    }

    await prisma.room.create({
      data: {
        hostUser: { connect: { username } },
        state: createInitialState(),
      },
    })
  }),

  leave: protectedProcedure.mutation(async (opts) => {
    const { username } = opts.ctx
    const room = await getRoom(username)
    if (!room) throw new TRPCError({ code: 'NOT_FOUND', message: '방을 찾을 수 없습니다.' })

    if (room.host === username) {
      if (room.guest) {
        await prisma.room.update({
          where: { host: username },
          data: {
            guestUser: { disconnect: true },
            guestReady: false,
            hostUser: { connect: { username: room.guest } },
            hostReady: room.guestReady,
          },
        })
      } else {
        await prisma.room.delete({ where: { host: username } })
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
    const { username } = opts.ctx
    const { host } = opts.input

    if (host === username) throw new TRPCError({ code: 'BAD_REQUEST', message: '호스트와 같은 이름입니다.' })

    const room = await getRoom(host, true)
    if (!room) throw new TRPCError({ code: 'NOT_FOUND', message: '호스트를 찾을 수 없습니다.' })

    if (room.guest) throw new TRPCError({ code: 'FORBIDDEN', message: '이미 게스트가 존재합니다.' })

    await prisma.room.update({ where: { host }, data: { guestUser: { connect: { username } } } })
    await prisma.room.deleteMany({ where: { host: username } })
  }),

  room: protectedProcedure.query(async (opts) => {
    const { username } = opts.ctx
    const room = await getRoom(username)
    room.state = { rule: room.state.rule } as GameState
    return { ...room }
  }),

  ready: protectedProcedure.input(z.object({ ready: z.boolean() })).mutation(async (opts) => {
    const { username } = opts.ctx
    const room = await getRoom(username)

    if (room.host === username) room.hostReady = opts.input.ready
    else room.guestReady = opts.input.ready

    await prisma.room.update({
      where: { host: room.host },
      data: { hostReady: room.hostReady, guestReady: room.guestReady },
    })
  }),

  setLocalYaku: protectedProcedure.input(z.object({ value: z.boolean() })).mutation(async (opts) => {
    const { username } = opts.ctx
    const { value } = opts.input

    const room = await getRoom(username, true)
    room.state.rule.localYaku = value

    await prisma.room.update({ where: { host: room.host }, data: { state: room.state } })
  }),

  setManganShibari: protectedProcedure.input(z.object({ value: z.boolean() })).mutation(async (opts) => {
    const { username } = opts.ctx
    const { value } = opts.input

    const room = await getRoom(username, true)
    room.state.rule.manganShibari = value

    await prisma.room.update({ where: { host: room.host }, data: { state: room.state } })
  }),

  setLength: protectedProcedure
    .input(z.object({ value: z.enum(['east', 'south', 'north']) }))
    .mutation(async (opts) => {
      const { username } = opts.ctx
      const { value } = opts.input

      const room = await getRoom(username, true)
      room.state.rule.length = value

      await prisma.room.update({ where: { host: room.host }, data: { state: room.state } })
    }),

  setTransparentMode: protectedProcedure.input(z.object({ value: z.boolean() })).mutation(async (opts) => {
    const { username } = opts.ctx
    const { value } = opts.input

    const room = await getRoom(username, true)
    room.state.rule.transparentMode = value

    await prisma.room.update({ where: { host: room.host }, data: { state: room.state } })
  }),
})
