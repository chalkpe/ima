import z from 'zod'
import { publicProcedure, router } from '@ima/server/trpc'
import { prisma } from '@ima/server/db'
import { TRPCError } from '@trpc/server'
import { createInitialState } from '@ima/server/helpers/game'
import type { Room } from '@ima/server/types/game'

const getRoom = async (username: string, onlyHost = false) => {
  const room = await prisma.room.findFirst({
    where: onlyHost ? { host: username } : { OR: [{ host: username }, { guest: username }] },
  })
  if (!room) throw new TRPCError({ code: 'NOT_FOUND', message: 'Room not found' })
  return room
}

export const lobbyRouter = router({
  list: publicProcedure.query(() =>
    prisma.room.findMany({ where: { NOT: { started: true } }, select: { host: true, guest: true, started: true } })
  ),

  create: publicProcedure.mutation(async (opts) => {
    const { username } = opts.ctx
    if (await prisma.room.findFirst({ where: { host: username } })) {
      throw new TRPCError({ code: 'CONFLICT', message: '이미 호스트가 존재합니다.' })
    }

    const room: Room = {
      host: username,
      hostReady: false,
      guest: '',
      guestReady: false,
      started: false,
      state: createInitialState(),
    }

    await prisma.room.create({ data: room })
  }),

  leave: publicProcedure.mutation(async (opts) => {
    const { username } = opts.ctx
    const room = await getRoom(username)
    if (!room) throw new TRPCError({ code: 'NOT_FOUND', message: '방을 찾을 수 없습니다.' })

    if (room.host === username) {
      room.host = room.guest
      room.guest = ''
    } else {
      room.guest = ''
    }

    if (room.host === '') {
      await prisma.room.delete({ where: { host: username } })
    }
  }),

  join: publicProcedure.input(z.object({ host: z.string() })).mutation(async (opts) => {
    const { username } = opts.ctx
    const { host } = opts.input

    if (host === username) throw new TRPCError({ code: 'BAD_REQUEST', message: '호스트와 같은 이름입니다.' })

    const room = await getRoom(host, true)
    if (!room) throw new TRPCError({ code: 'NOT_FOUND', message: '호스트를 찾을 수 없습니다.' })

    if (room.guest) throw new TRPCError({ code: 'FORBIDDEN', message: '이미 게스트가 존재합니다.' })

    room.guest = username

    await prisma.room.update({ where: { host }, data: room })
    await prisma.room.deleteMany({ where: { host: username } })
  }),

  room: publicProcedure.query((opts) => {
    const { username } = opts.ctx
    return getRoom(username)
  }),

  ready: publicProcedure.input(z.object({ ready: z.boolean() })).mutation(async (opts) => {
    const { username } = opts.ctx
    const room = await getRoom(username)

    if (room.host === username) room.hostReady = opts.input.ready
    else room.guestReady = opts.input.ready

    await prisma.room.update({ where: { host: room.host }, data: room })
  }),

  setLocalYaku: publicProcedure.input(z.object({ value: z.boolean() })).mutation(async (opts) => {
    const { username } = opts.ctx
    const { value } = opts.input

    const room = await getRoom(username, true)
    room.state.rule.localYaku = value

    await prisma.room.update({ where: { host: room.host }, data: room })
  }),

  setManganShibari: publicProcedure.input(z.object({ value: z.boolean() })).mutation(async (opts) => {
    const { username } = opts.ctx
    const { value } = opts.input

    const room = await getRoom(username, true)
    room.state.rule.manganShibari = value

    await prisma.room.update({ where: { host: room.host }, data: room })
  }),

  setLength: publicProcedure.input(z.object({ value: z.enum(['east', 'south', 'north']) })).mutation(async (opts) => {
    const { username } = opts.ctx
    const { value } = opts.input

    const room = await getRoom(username, true)
    room.state.rule.length = value

    await prisma.room.update({ where: { host: room.host }, data: room })
  }),

  setTransparentMode: publicProcedure.input(z.object({ value: z.boolean() })).mutation(async (opts) => {
    const { username } = opts.ctx
    const { value } = opts.input

    const room = await getRoom(username, true)
    room.state.rule.transparentMode = value

    await prisma.room.update({ where: { host: room.host }, data: room })
  }),
})
